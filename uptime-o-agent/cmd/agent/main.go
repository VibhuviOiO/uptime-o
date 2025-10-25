package main

import (
	"UptimeOAgent/internal/collector"
	"UptimeOAgent/internal/config"
	"UptimeOAgent/internal/db"
	"UptimeOAgent/internal/models"
	"context"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/sirupsen/logrus"
)

func startHealthServer() {
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	go func() {
		if err := http.ListenAndServe(":8080", nil); err != nil {
			logrus.Error("Health server error: ", err)
		}
	}()
}

func main() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.SetLevel(logrus.InfoLevel)
	logrus.Info("application started")
	logrus.Info("application logging level: info")

	connString := os.Getenv("DB_CONN_STRING")
	if connString == "" {
		logrus.Fatal("DB_CONN_STRING not set")
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

	datacenterIDStr := os.Getenv("DATACENTER_ID")
	if datacenterIDStr == "" {
		logrus.Fatal("DATACENTER_ID not set")
	}
	datacenterID, err := strconv.Atoi(datacenterIDStr)
	if err != nil {
		logrus.Fatal("Invalid DATACENTER_ID:", err)
	}
	logrus.Infof("application found the datacenterId: %d", datacenterID)

	var agents []models.Agent
	for _, a := range cfg.Agents {
		if a.Datacenter.ID == datacenterID {
			agents = append(agents, a)
			break
		}
	}
	if len(agents) == 0 {
		logrus.Fatal("No agents found for DATACENTER_ID:", datacenterID)
	}
	agent := agents[0]

	logrus.Infof("application found the count of monitoring: %d, generating the monitor config", len(agent.Monitors))
	for _, mon := range agent.Monitors {
		schedule := findSchedule(agent.GlobalSchedules, mon.ScheduleID)
		if schedule != nil {
			logrus.Infof("monitor: id=%d, name=%s, method=%s, url=%s, schedule: id=%d, name=%s, interval=%ds, warning=%dms, critical=%dms", mon.ID, mon.Name, mon.Method, mon.URL, schedule.ID, schedule.Name, schedule.Interval, schedule.ThresholdsWarning, schedule.ThresholdsCritical)
		} else {
			logrus.Infof("monitor: id=%d, name=%s, method=%s, url=%s, scheduleId=%d", mon.ID, mon.Name, mon.Method, mon.URL, mon.ScheduleID)
		}
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		rand.Seed(time.Now().UnixNano())
		for {
			select {
			case <-ctx.Done():
				return
			default:
				acquired, err := db.AcquireLock(ctx, dbConn, datacenterID)
				if err != nil {
					logrus.Error("Failed to acquire lock:", err)
					time.Sleep(10 * time.Second)
					continue
				}
				if acquired {
					logrus.Info("Acquired lock for datacenter:", datacenterID)
					collector.NewAPIHeartbeatCollector(ctx, agent, cfg, dbConn).Start()
					if err := db.ReleaseLock(ctx, dbConn, datacenterID); err != nil {
						logrus.Error("Failed to release lock:", err)
					}
					logrus.Info("Released lock for datacenter:", datacenterID)
				} else {
					jitter := time.Duration(rand.Intn(10)) * time.Second
					time.Sleep(60*time.Second + jitter)
				}
			}
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	configReloadTicker := time.NewTicker(24 * time.Hour)
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
				logrus.Error("Failed to reload config:", err)
			} else {
				cfg = newCfg
				logrus.Info("Config reloaded")
				for _, a := range cfg.Agents {
					if a.Datacenter.ID == datacenterID {
						agent = a
						break
					}
				}
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
