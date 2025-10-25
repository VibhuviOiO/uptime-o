package config

import (
	"UptimeOAgent/internal/models"
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
)

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
		if err := rows.Scan(&s.ID, &s.Name, &s.Interval, &s.IncludeResponseBody, &s.ThresholdsWarning, &s.ThresholdsCritical); err != nil {
			return nil, err
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
		if err := rows.Scan(&r.ID, &r.Name, &r.RegionCode, &r.Group); err != nil {
			return nil, err
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
		var regionID int
		if err := rows.Scan(&d.ID, &d.Code, &d.Name, &regionID); err != nil {
			return nil, err
		}
		d.Region = regions[regionID]
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
		var datacenterID int
		if err := rows.Scan(&a.ID, &a.Name, &datacenterID); err != nil {
			return nil, err
		}
		a.Datacenter = datacenters[datacenterID]
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
			var headers, body *string
			if err := rows.Scan(&mon.ID, &mon.Name, &mon.Method, &mon.Type, &mon.URL, &mon.ScheduleID, &headers, &body); err != nil {
				return nil, err
			}
			if headers != nil {
				// Parse headers if needed, but for simplicity, assume JSON string
				mon.Headers = make(map[string]string) // Implement parsing if necessary
			}
			if body != nil {
				mon.Body = *body
			}
			cfg.Agents[i].Monitors = append(cfg.Agents[i].Monitors, mon)
		}
	}

	return cfg, nil
}
