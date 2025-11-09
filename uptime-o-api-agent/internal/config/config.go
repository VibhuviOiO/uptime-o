package config

import (
	"UptimeOAgent/internal/api"
	"UptimeOAgent/internal/models"
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

// LoadFromAPI loads configuration from the API instead of database
func LoadFromAPI(apiClient *api.Client, agentID int, datacenterID int) (*models.Config, *models.Agent, error) {
	// Fetch monitors and schedules from API
	monitors, schedules, err := apiClient.GetMonitors(agentID)
	if err != nil {
		return nil, nil, err
	}

	// Extract monitor IDs for logging
	monitorIDs := make([]int, len(monitors))
	for i, m := range monitors {
		monitorIDs[i] = m.ID
	}
	logrus.Infof("Loaded monitors: %v", monitorIDs)

	// Create agent with fetched data
	agent := &models.Agent{
		ID:               agentID,
		Name:             "API-Agent",
		GlobalThresholds: models.Thresholds{Warning: 300, Critical: 800},
		GlobalSchedules:  schedules,
		Monitors:         monitors,
		Datacenter: models.Datacenter{
			ID: datacenterID,
		},
	}

	cfg := &models.Config{
		Schedules: schedules,
		Agents:    []models.Agent{*agent},
	}

	return cfg, agent, nil
}

// Load loads configuration from database (kept for backward compatibility if needed)
func Load(pool *pgxpool.Pool) (*models.Config, error) {
	cfg := &models.Config{}

	// Load schedules
	rows, err := pool.Query(context.Background(), "SELECT id, name, interval, include_response_body, thresholds_warning, thresholds_critical FROM schedules")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var s models.Schedule
		var thresholdsWarning, thresholdsCritical *int
		if err := rows.Scan(&s.ID, &s.Name, &s.Interval, &s.IncludeResponseBody, &thresholdsWarning, &thresholdsCritical); err != nil {
			return nil, err
		}
		// Handle NULL values by setting to 0 or a default value
		if thresholdsWarning != nil {
			s.ThresholdsWarning = *thresholdsWarning
		}
		if thresholdsCritical != nil {
			s.ThresholdsCritical = *thresholdsCritical
		}
		cfg.Schedules = append(cfg.Schedules, s)
	}

	// Load regions
	rows, err = pool.Query(context.Background(), "SELECT id, name, region_code, group_name FROM regions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	regions := make(map[int]models.Region)
	for rows.Next() {
		var r models.Region
		var regionCode, groupName *string
		if err := rows.Scan(&r.ID, &r.Name, &regionCode, &groupName); err != nil {
			return nil, err
		}
		// Handle NULL values
		if regionCode != nil {
			r.RegionCode = *regionCode
		}
		if groupName != nil {
			r.Group = *groupName
		}
		regions[r.ID] = r
	}

	// Load datacenters
	rows, err = pool.Query(context.Background(), "SELECT id, code, name, region_id FROM datacenters")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	datacenters := make(map[int]models.Datacenter)
	for rows.Next() {
		var d models.Datacenter
		var regionID *int
		if err := rows.Scan(&d.ID, &d.Code, &d.Name, &regionID); err != nil {
			return nil, err
		}
		// Handle NULL region_id
		if regionID != nil {
			d.Region = regions[*regionID]
		}
		datacenters[d.ID] = d
	}

	// Load agents
	rows, err = pool.Query(context.Background(), "SELECT id, name, datacenter_id FROM agents")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var a models.Agent
		var datacenterID *int
		if err := rows.Scan(&a.ID, &a.Name, &datacenterID); err != nil {
			return nil, err
		}
		// Handle NULL datacenter_id
		if datacenterID != nil {
			a.Datacenter = datacenters[*datacenterID]
		}
		a.GlobalThresholds = models.Thresholds{Warning: 300, Critical: 800} // Assuming default
		a.GlobalSchedules = cfg.Schedules
		cfg.Agents = append(cfg.Agents, a)
	}

	// Load monitors for each agent (assuming all monitors per agent as per datacenter_monitors)
	for i := range cfg.Agents {
		rows, err := pool.Query(context.Background(), "SELECT m.id, m.name, m.method, m.type, m.url, m.schedule_id, m.headers, m.body FROM api_monitors m JOIN datacenter_monitors dm ON m.id = dm.monitor_id WHERE dm.datacenter_id = $1", cfg.Agents[i].Datacenter.ID)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var mon models.Monitor
			var scheduleID *int
			var headers, body []byte
			if err := rows.Scan(&mon.ID, &mon.Name, &mon.Method, &mon.Type, &mon.URL, &scheduleID, &headers, &body); err != nil {
				return nil, err
			}
			// Handle NULL schedule_id
			if scheduleID != nil {
				mon.ScheduleID = *scheduleID
			}
			// Parse JSONB headers into map[string]string
			if len(headers) > 0 {
				if err := json.Unmarshal(headers, &mon.Headers); err == nil {
					// Successfully parsed headers
				}
			}
			// Parse JSONB body - it could be an object or string
			if len(body) > 0 {
				// Try to unmarshal as string first
				var bodyStr string
				if err := json.Unmarshal(body, &bodyStr); err == nil {
					mon.Body = bodyStr
				} else {
					// If it's not a string, convert the JSON object to string
					mon.Body = string(body)
				}
			}
			cfg.Agents[i].Monitors = append(cfg.Agents[i].Monitors, mon)
		}
	}

	return cfg, nil
}
