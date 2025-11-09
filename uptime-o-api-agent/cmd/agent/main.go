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
	startHealthServer(healthPort)

	// Start collector
	go collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()

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
						go collector.NewAPIHeartbeatCollector(ctx, *agent, cfg, apiClient).Start()
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
