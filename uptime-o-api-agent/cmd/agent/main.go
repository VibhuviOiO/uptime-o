package main

import (
	"UptimeOAgent/internal/api"
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

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

func startHealthServer(port string) {
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
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
	logrus.SetLevel(logrus.InfoLevel)
	logrus.Info("application started")
	logrus.Info("application logging level: info")

	// Get required environment variables for API mode
	apiBaseURL := os.Getenv("API_BASE_URL")
	if apiBaseURL == "" {
		logrus.Fatal("API_BASE_URL not set (e.g., http://localhost:8080)")
	}

	apiKey := os.Getenv("API_KEY")
	if apiKey == "" {
		logrus.Fatal("API_KEY not set")
	}

	agentIDStr := os.Getenv("AGENT_ID")
	if agentIDStr == "" {
		logrus.Fatal("AGENT_ID not set")
	}
	agentID, errParse := strconv.Atoi(agentIDStr)
	if errParse != nil {
		logrus.Fatal("Invalid AGENT_ID:", errParse)
	}

	datacenterIDStr := os.Getenv("DATACENTER_ID")
	if datacenterIDStr == "" {
		logrus.Fatal("DATACENTER_ID not set")
	}
	datacenterID, errParse := strconv.Atoi(datacenterIDStr)
	if errParse != nil {
		logrus.Fatal("Invalid DATACENTER_ID:", errParse)
	}

	// Get health server port (default to 9090 to avoid conflict with main app on 8080)
	healthPort := os.Getenv("HEALTH_PORT")
	if healthPort == "" {
		healthPort = "9090"
	}

	// Get config reload interval (supports formats like: 1m, 5m, 1h, 24h)
	configReloadInterval := 24 * time.Hour // Default: 24 hours
	if reloadIntervalStr := os.Getenv("CONFIG_RELOAD_INTERVAL"); reloadIntervalStr != "" {
		if parsedInterval, err := time.ParseDuration(reloadIntervalStr); err == nil {
			configReloadInterval = parsedInterval
			logrus.Infof("CONFIG_RELOAD_INTERVAL set to: %v", configReloadInterval)
		} else {
			logrus.Warnf("Invalid CONFIG_RELOAD_INTERVAL '%s': %v. Using default: 24h", reloadIntervalStr, err)
		}
	}

	logrus.Infof("application configuration: agentId=%d, datacenterId=%d, apiBaseUrl=%s, healthPort=%s, configReloadInterval=%v", agentID, datacenterID, apiBaseURL, healthPort, configReloadInterval)

	// Create API client
	apiClient := api.NewClient(apiBaseURL, apiKey)

	// Load configuration from API with retry logic
	var cfg *models.Config
	var agent *models.Agent
	var err error

	// Try to load config with retries
	maxAttempts := 10
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		cfg, agent, err = config.LoadFromAPI(apiClient, agentID, datacenterID)
		if err == nil {
			break
		}

		if attempt < maxAttempts {
			waitTime := time.Duration(attempt*5) * time.Second
			if waitTime > 60*time.Second {
				waitTime = 60 * time.Second
			}
			logrus.Warnf("Failed to load config from API (attempt %d/%d): %v. Retrying in %v...", attempt, maxAttempts, err, waitTime)
			time.Sleep(waitTime)
		} else {
			// After all retries, start with empty config
			logrus.Errorf("Failed to load initial config after %d attempts: %v", maxAttempts, err)
			logrus.Warn("Starting with empty configuration. Will retry loading config periodically.")

			// Create minimal empty agent config
			agent = &models.Agent{
				ID:               agentID,
				Name:             "API-Agent",
				GlobalThresholds: models.Thresholds{Warning: 300, Critical: 800},
				GlobalSchedules:  []models.Schedule{},
				Monitors:         []models.Monitor{},
				Datacenter: models.Datacenter{
					ID: datacenterID,
				},
			}
			cfg = &models.Config{
				Schedules: []models.Schedule{},
				Agents:    []models.Agent{*agent},
			}
		}
	}

	if len(agent.Monitors) > 0 {
		logrus.Infof("application found the count of monitoring: %d, generating the monitor config", len(agent.Monitors))
	} else {
		logrus.Warn("No monitors configured yet. Agent will retry loading configuration periodically.")
	}
	for _, mon := range agent.Monitors {
		schedule := findSchedule(agent.GlobalSchedules, mon.ScheduleID)
		if schedule != nil {
			logrus.Infof("monitor: id=%d, name=%s, method=%s, url=%s, schedule: id=%d, name=%s, interval=%ds, warning=%dms, critical=%dms", mon.ID, mon.Name, mon.Method, mon.URL, schedule.ID, schedule.Name, schedule.Interval, schedule.ThresholdsWarning, schedule.ThresholdsCritical)
		} else {
			logrus.Infof("monitor: id=%d, name=%s, method=%s, url=%s, scheduleId=%d", mon.ID, mon.Name, mon.Method, mon.URL, mon.ScheduleID)
		}
	}

	// Optional: Connect to DB only for distributed locking if needed
	connString := os.Getenv("DB_CONN_STRING")
	var dbConn *pgxpool.Pool
	var hasLocking bool
	if connString != "" {
		conn, err := db.Connect(connString)
		if err != nil {
			logrus.WithError(err).Warn("Failed to connect to DB for locking, will run without distributed lock")
			hasLocking = false
		} else {
			dbConn = conn
			defer conn.Close()
			logrus.Info("application postgres connection: successful (for locking)")
			hasLocking = true
		}
	} else {
		logrus.Info("DB_CONN_STRING not set, running without distributed lock")
		hasLocking = false
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start health server
	startHealthServer(healthPort)

	// If we have locking, use it; otherwise run directly
	if hasLocking {
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
						collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()
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
	} else {
		// Run directly without locking
		go collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()
	}

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Use shorter interval if no monitors configured (for faster discovery)
	getReloadInterval := func() time.Duration {
		if len(agent.Monitors) == 0 {
			return 5 * time.Minute // Check every 5 minutes when no monitors
		}
		return configReloadInterval // Use configured interval when monitors exist
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
			newCfg, newAgent, err := config.LoadFromAPI(apiClient, agentID, datacenterID)
			if err != nil {
				logrus.Warnf("Failed to reload config from API: %v. Will retry later.", err)
			} else {
				oldMonitorCount := len(agent.Monitors)
				cfg = newCfg
				agent = newAgent
				logrus.Info("Config reloaded from API")
				logrus.Infof("Reloaded %d monitors", len(agent.Monitors))

				// Adjust reload frequency based on whether we have monitors
				newInterval := getReloadInterval()
				configReloadTicker.Reset(newInterval)

				if oldMonitorCount == 0 && len(agent.Monitors) > 0 {
					logrus.Info("Monitors now available! Starting collector...")
					// Restart collector with new monitors
					cancel()
					ctx, cancel = context.WithCancel(context.Background())
					go collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()
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
