package collector

import (
	"UptimeOAgent/internal/db"
	"UptimeOAgent/internal/models"
	"UptimeOAgent/internal/monitor"
	"context"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

type APIHeartbeatCollector struct {
	Agent  models.Agent
	Config *models.Config
	DBPool *pgxpool.Pool
	Ctx    context.Context
}

func NewAPIHeartbeatCollector(ctx context.Context, agent models.Agent, cfg *models.Config, pool *pgxpool.Pool) *APIHeartbeatCollector {
	return &APIHeartbeatCollector{
		Agent:  agent,
		Config: cfg,
		DBPool: pool,
		Ctx:    ctx,
	}
}

func (c *APIHeartbeatCollector) Start() {
	for _, mon := range c.Agent.Monitors {
		schedule := findSchedule(c.Agent.GlobalSchedules, mon.ScheduleID)
		if schedule == nil {
			logrus.Warnf("Schedule not found for monitor %d", mon.ID)
			continue
		}
		go func(mon models.Monitor, schedule models.Schedule) {
			ticker := time.NewTicker(time.Duration(schedule.Interval) * time.Second)
			defer ticker.Stop()
			for {
				select {
				case <-ticker.C:
					logrus.Infof("Ticker fired for monitor %d (%s)", mon.ID, mon.Name)
					hb, err := monitor.ExecuteHttpMonitor(c.Agent, mon, schedule)
					if err != nil {
						logrus.Error("Monitor execution failed for monitor %d (%s): %v", mon.ID, mon.Name, err)
						if hb != nil {
							if err := db.InsertHeartbeat(c.Ctx, c.DBPool, hb); err != nil {
								logrus.Error("Failed to save failed heartbeat for monitor %d (%s): %v", mon.ID, mon.Name, err)
							} else {
								logrus.Infof("Failed heartbeat inserted for monitor %d (%s)", mon.ID, mon.Name)
							}
						}
						continue
					}
					logrus.Infof("Executing monitor %d (%s)", mon.ID, mon.Name)
					if err := db.InsertHeartbeat(c.Ctx, c.DBPool, hb); err != nil {
						logrus.Error("Failed to save heartbeat:", err)
					} else {
						logrus.Infof("Heartbeat inserted for monitor %d (%s)", mon.ID, mon.Name)
					}
				case <-c.Ctx.Done():
					return
				}
			}
		}(mon, *schedule)
	}
	<-c.Ctx.Done()
}

func findSchedule(schedules []models.Schedule, id int) *models.Schedule {
	for _, s := range schedules {
		if s.ID == id {
			return &s
		}
	}
	return nil
}
