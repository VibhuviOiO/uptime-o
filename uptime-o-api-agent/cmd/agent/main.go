package main

import (
	"UptimeOAgent/internal/api"
	"UptimeOAgent/internal/collector"
	"UptimeOAgent/internal/config"
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

func startHealthServer(port string, apiClient *api.Client, agentID int) {
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	
	http.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) {
		_, _, err := config.LoadFromAPI(apiClient, agentID)
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("api unavailable"))
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

	logrus.Infof("application configuration: agentId=%d, apiBaseUrl=%s, healthPort=%s, configReloadInterval=%v", agentID, apiBaseURL, healthPort, configReloadInterval)

	// Create API client
	apiClient := api.NewClient(apiBaseURL, apiKey)

	// Load configuration from API with retry logic
	var cfg *models.Config
	var agent *models.Agent
	var err error

	// Try to load config with retries
	maxAttempts := 10
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		cfg, agent, err = config.LoadFromAPI(apiClient, agentID)
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
				Datacenter:       models.Datacenter{}, // Empty datacenter (not used by API)
			}
			cfg = &models.Config{
				Schedules: []models.Schedule{},
				Agents:    []models.Agent{*agent},
			}
		}
	}

	if len(agent.Monitors) == 0 {
		logrus.Warn("No monitors configured yet. Agent will retry loading configuration periodically.")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start health server
	startHealthServer(healthPort, apiClient, agentID)

	// Start collector with HA via API-based locking
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
				acquired, err := apiClient.AcquireLock(agentID)
				if err != nil {
					logrus.Warnf("Failed to acquire lock: %v. Retrying...", err)
					time.Sleep(10 * time.Second)
					continue
				}
				if acquired {
					logrus.Infof("Acquired leadership lock for agent %d", agentID)
					if len(agent.Monitors) > 0 {
						collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()
					} else {
						<-ctx.Done()
					}
					if err := apiClient.ReleaseLock(agentID); err != nil {
						logrus.Warnf("Failed to release lock: %v", err)
					}
					logrus.Infof("Released leadership lock for agent %d", agentID)
				} else {
					logrus.Info("Another instance is active. Waiting...")
					time.Sleep(30 * time.Second)
				}
			}
		}
	}()

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
			newCfg, newAgent, err := config.LoadFromAPI(apiClient, agentID)
			if err != nil {
				logrus.Warnf("Failed to reload config from API: %v. Will retry later.", err)
			} else {
				oldMonitorIDs := getMonitorIDs(agent.Monitors)

				cfg = newCfg
				agent = newAgent

				// Adjust reload frequency based on whether we have monitors
				newInterval := getReloadInterval()
				configReloadTicker.Reset(newInterval)

				// Check if monitors changed (by comparing IDs)
				newMonitorIDs := getMonitorIDs(agent.Monitors)
				monitorsChanged := !monitorIDsEqual(oldMonitorIDs, newMonitorIDs)

				// Restart collector if monitors changed
				if monitorsChanged {
					if len(agent.Monitors) > 0 {
						logrus.Infof("Monitoring: %v", newMonitorIDs)
						// Cancel existing collector to stop all monitor goroutines
						cancel()
						// Create new context and start fresh collector with updated monitors
						ctx, cancel = context.WithCancel(context.Background())
						go func() {
							defer func() {
								if r := recover(); r != nil {
									logrus.Errorf("Panic in collector: %v", r)
								}
							}()
							collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()
						}()
					} else {
						logrus.Info("No monitors assigned. Stopping collector.")
						cancel()
						ctx, cancel = context.WithCancel(context.Background())
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

// getMonitorIDs extracts and returns sorted monitor IDs for comparison
func getMonitorIDs(monitors []models.Monitor) []int {
	ids := make([]int, len(monitors))
	for i, m := range monitors {
		ids[i] = m.ID
	}
	return ids
}

// monitorIDsEqual checks if two monitor ID lists are identical
func monitorIDsEqual(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	// Create maps for O(1) lookup - still O(n) overall but simpler
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
