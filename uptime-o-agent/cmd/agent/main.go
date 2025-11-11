package main

import (
	"UptimeOAgent/internal/collector"
	"UptimeOAgent/internal/config"
	"UptimeOAgent/internal/db"
	"UptimeOAgent/internal/models"
	"context"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/sirupsen/logrus"
)

func startHealthServer(port string, pool *pgxpool.Pool) {
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	
	http.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) {
		if err := pool.Ping(context.Background()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("database unavailable"))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ready"))
	})
	
	go func() {
		addr := ":" + port
		logrus.Infof("Starting health server on %s", addr)
		if err := http.ListenAndServe(addr, nil); err != nil {
			logrus.Error("Health server error: ", err)
		}
	}()
}

func main() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
	
	// Set log level from environment variable
	logLevel := os.Getenv("LOG_LEVEL")
	switch logLevel {
	case "DEBUG":
		logrus.SetLevel(logrus.DebugLevel)
	case "WARN":
		logrus.SetLevel(logrus.WarnLevel)
	case "ERROR":
		logrus.SetLevel(logrus.ErrorLevel)
	default:
		logrus.SetLevel(logrus.InfoLevel)
		logLevel = "INFO"
	}
	
	logrus.Info("application started")
	logrus.Infof("application logging level: %s", logLevel)

	connString := os.Getenv("DB_CONN_STRING")
	if connString == "" {
		logrus.Fatal("DB_CONN_STRING not set")
	}

	healthPort := os.Getenv("HEALTH_PORT")
	if healthPort == "" {
		healthPort = "8080"
	}

	configReloadInterval := 24 * time.Hour
	if reloadIntervalStr := os.Getenv("CONFIG_RELOAD_INTERVAL"); reloadIntervalStr != "" {
		if parsedInterval, err := time.ParseDuration(reloadIntervalStr); err == nil {
			configReloadInterval = parsedInterval
			logrus.Infof("CONFIG_RELOAD_INTERVAL set to: %v", configReloadInterval)
		} else {
			logrus.Warnf("Invalid CONFIG_RELOAD_INTERVAL '%s': %v. Using default: 24h", reloadIntervalStr, err)
		}
	}

	dbConn, err := db.Connect(connString)
	if err != nil {
		logrus.WithError(err).Fatal("Failed to connect to DB")
	}
	defer dbConn.Close()
	logrus.Info("application postgres connection: successful")

	cfg, err := config.Load(dbConn)
	if err != nil {
		logrus.Fatal("Failed to load config:", err)
	}

	agentIDStr := os.Getenv("AGENT_ID")
	if agentIDStr == "" {
		logrus.Fatal("AGENT_ID not set")
	}
	agentID, err := strconv.Atoi(agentIDStr)
	if err != nil {
		logrus.Fatal("Invalid AGENT_ID:", err)
	}

	var agent *models.Agent
	for _, a := range cfg.Agents {
		if a.ID == agentID {
			agent = &a
			break
		}
	}
	if agent == nil {
		logrus.Fatal("No agent found for AGENT_ID:", agentID)
	}
	logrus.Infof("application configuration: agentId=%d, agentName=%s, datacenter=%s", agent.ID, agent.Name, agent.Datacenter.Name)

	if len(agent.Monitors) == 0 {
		logrus.Warn("No monitors configured yet. Agent will retry loading configuration periodically.")
	} else {
		logrus.Infof("application found the count of monitoring: %d, generating the monitor config", len(agent.Monitors))
		for _, mon := range agent.Monitors {
			schedule := findSchedule(agent.GlobalSchedules, mon.ScheduleID)
			if schedule != nil {
				logrus.Infof("monitor: id=%d, name=%s, method=%s, url=%s, schedule: id=%d, name=%s, interval=%ds, warning=%dms, critical=%dms", mon.ID, mon.Name, mon.Method, mon.URL, schedule.ID, schedule.Name, schedule.Interval, schedule.ThresholdsWarning, schedule.ThresholdsCritical)
			} else {
				logrus.Infof("monitor: id=%d, name=%s, method=%s, url=%s, scheduleId=%d", mon.ID, mon.Name, mon.Method, mon.URL, mon.ScheduleID)
			}
		}
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	startHealthServer(healthPort, dbConn)

	// Start leader election loop
	go func() {
		defer func() {
			if r := recover(); r != nil {
				logrus.Errorf("Panic in leader election: %v", r)
			}
		}()
		for {
			select {
			case <-ctx.Done():
				return
			default:
				acquired, err := db.AcquireLock(ctx, dbConn, agentID)
				if err != nil {
					logrus.Errorf("Failed to acquire lock: %v", err)
					time.Sleep(10 * time.Second)
					continue
				}
				if acquired {
					logrus.Infof("Acquired leadership lock for agent %d", agentID)
					if len(agent.Monitors) > 0 {
						collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, dbConn).Start()
					} else {
						<-ctx.Done()
					}
					if err := db.ReleaseLock(ctx, dbConn, agentID); err != nil {
						logrus.Errorf("Failed to release lock: %v", err)
					}
					logrus.Infof("Released leadership lock for agent %d", agentID)
				} else {
					logrus.Infof("Another instance is active. Waiting...")
					time.Sleep(30 * time.Second)
				}
			}
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	getReloadInterval := func() time.Duration {
		if len(agent.Monitors) == 0 {
			return 5 * time.Minute
		}
		return configReloadInterval
	}

	configReloadTicker := time.NewTicker(getReloadInterval())
	defer configReloadTicker.Stop()

	for {
		select {
		case <-sigChan:
			logrus.Info("Shutdown signal received")
			cancel()
			time.Sleep(2 * time.Second)
			logrus.Info("Application shut down")
			return
		case <-configReloadTicker.C:
			newCfg, err := config.Load(dbConn)
			if err != nil {
				logrus.Warnf("Failed to reload config: %v. Will retry later.", err)
			} else {
				oldMonitorIDs := getMonitorIDs(agent.Monitors)
				cfg = newCfg
				for _, a := range cfg.Agents {
					if a.ID == agentID {
						agent = &a
						break
					}
				}
				newMonitorIDs := getMonitorIDs(agent.Monitors)
				if !monitorIDsEqual(oldMonitorIDs, newMonitorIDs) {
					if len(newMonitorIDs) > 0 {
						logrus.Infof("Monitors changed. Restarting collector. Monitoring: %v", newMonitorIDs)
					} else {
						logrus.Info("No monitors assigned. Stopping collector.")
					}
					cancel()
					ctx, cancel = context.WithCancel(context.Background())
					if len(newMonitorIDs) > 0 {
						go collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, dbConn).Start()
					}
				}
				configReloadTicker.Reset(getReloadInterval())
			}
		}
	}
}

func findSchedule(schedules []models.Schedule, id int) *models.Schedule {
	for _, s := range schedules {
		if s.ID == id {
			return &s
		}
	}
	return nil
}

func getMonitorIDs(monitors []models.Monitor) []int {
	ids := make([]int, len(monitors))
	for i, m := range monitors {
		ids[i] = m.ID
	}
	return ids
}

func monitorIDsEqual(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	aMap := make(map[int]bool, len(a))
	for _, id := range a {
		aMap[id] = true
	}
	for _, id := range b {
		if !aMap[id] {
			return false
		}
	}
	return true
}
