package collector

import (
	"UptimeOAgent/internal/db"
	"UptimeOAgent/internal/models"
	"UptimeOAgent/internal/monitor"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

type APIHeartbeatCollector struct {
	Agent          models.Agent
	Config         *models.Config
	DBPool         *pgxpool.Pool
	Ctx            context.Context
	heartbeatQueue []*models.Heartbeat
	queueMutex     sync.Mutex
	maxQueueSize   int
	queueFilePath  string
}

func NewAPIHeartbeatCollector(ctx context.Context, agent models.Agent, cfg *models.Config, pool *pgxpool.Pool) *APIHeartbeatCollector {
	queuePath := os.Getenv("QUEUE_PATH")
	if queuePath == "" {
		queuePath = "./data/queue"
	}

	queueDir := filepath.Dir(queuePath)
	if err := os.MkdirAll(queueDir, 0755); err != nil {
		logrus.Warnf("Failed to create queue directory %s: %v. Using in-memory only.", queueDir, err)
		queuePath = ""
	}

	if queuePath != "" {
		queueFileName := filepath.Base(queuePath)
		if queueFileName == "queue" || queueFileName == "." {
			queueFileName = ""
		}
		if queueFileName == "" {
			queuePath = filepath.Join(queueDir, "heartbeat_queue_agent_"+fmt.Sprintf("%d", agent.ID)+".json")
		}
	}

	collector := &APIHeartbeatCollector{
		Agent:          agent,
		Config:         cfg,
		DBPool:         pool,
		Ctx:            ctx,
		heartbeatQueue: make([]*models.Heartbeat, 0),
		maxQueueSize:   1000,
		queueFilePath:  queuePath,
	}

	if queuePath != "" {
		collector.loadQueueFromDisk()
	}

	go collector.queueFlusher()

	return collector
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
					hb, err := monitor.ExecuteHttpMonitor(c.Agent, mon, schedule)
					if err != nil {
						logrus.Errorf("Monitor execution failed for monitor %d (%s): %v", mon.ID, mon.Name, err)
						if hb != nil {
							c.submitHeartbeatWithFallback(hb)
						}
						continue
					}
					c.submitHeartbeatWithFallback(hb)
				case <-c.Ctx.Done():
					return
				}
			}
		}(mon, *schedule)
	}
	<-c.Ctx.Done()
}

func (c *APIHeartbeatCollector) loadQueueFromDisk() {
	if c.queueFilePath == "" {
		return
	}

	data, err := os.ReadFile(c.queueFilePath)
	if err != nil {
		if !os.IsNotExist(err) {
			logrus.Warnf("Failed to read queue file %s: %v", c.queueFilePath, err)
		}
		return
	}

	var queue []*models.Heartbeat
	if err := json.Unmarshal(data, &queue); err != nil {
		logrus.Errorf("Failed to parse queue file %s: %v. Starting with empty queue.", c.queueFilePath, err)
		return
	}

	c.queueMutex.Lock()
	c.heartbeatQueue = queue
	c.queueMutex.Unlock()

	if len(queue) > 0 {
		logrus.Infof("Loaded %d queued heartbeats from disk", len(queue))
	}
}

func (c *APIHeartbeatCollector) saveQueueToDisk() {
	if c.queueFilePath == "" {
		return
	}

	c.queueMutex.Lock()
	queue := c.heartbeatQueue
	c.queueMutex.Unlock()

	data, err := json.MarshalIndent(queue, "", "  ")
	if err != nil {
		logrus.Errorf("Failed to marshal queue: %v", err)
		return
	}

	tempFile := c.queueFilePath + ".tmp"
	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		logrus.Errorf("Failed to write queue file %s: %v", tempFile, err)
		return
	}

	if err := os.Rename(tempFile, c.queueFilePath); err != nil {
		logrus.Errorf("Failed to rename queue file from %s to %s: %v", tempFile, c.queueFilePath, err)
		os.Remove(tempFile)
	}
}

func (c *APIHeartbeatCollector) queueFlusher() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.flushQueue()
		case <-c.Ctx.Done():
			c.flushQueue()
			return
		}
	}
}

func (c *APIHeartbeatCollector) flushQueue() {
	c.queueMutex.Lock()
	if len(c.heartbeatQueue) == 0 {
		c.queueMutex.Unlock()
		return
	}

	heartbeats := make([]*models.Heartbeat, len(c.heartbeatQueue))
	copy(heartbeats, c.heartbeatQueue)
	queueSize := len(heartbeats)
	c.queueMutex.Unlock()

	for _, hb := range heartbeats {
		if err := db.InsertHeartbeat(c.Ctx, c.DBPool, hb); err != nil {
			logrus.Warnf("Failed to flush heartbeat queue: %v. Will retry later.", err)
			return
		}
	}

	c.queueMutex.Lock()
	c.heartbeatQueue = make([]*models.Heartbeat, 0)
	c.queueMutex.Unlock()

	c.saveQueueToDisk()

	logrus.Infof("Successfully flushed %d queued heartbeats", queueSize)
}

func (c *APIHeartbeatCollector) queueHeartbeat(hb *models.Heartbeat) {
	c.queueMutex.Lock()

	if len(c.heartbeatQueue) >= c.maxQueueSize {
		logrus.Warnf("Heartbeat queue full (%d), dropping oldest heartbeat", c.maxQueueSize)
		c.heartbeatQueue = c.heartbeatQueue[1:]
	}

	c.heartbeatQueue = append(c.heartbeatQueue, hb)
	c.queueMutex.Unlock()

	c.saveQueueToDisk()
}

func (c *APIHeartbeatCollector) submitHeartbeatWithFallback(hb *models.Heartbeat) {
	if err := db.InsertHeartbeat(c.Ctx, c.DBPool, hb); err != nil {
		logrus.Warnf("Failed to save heartbeat for monitor %d: %v. Queuing for later.", hb.MonitorID, err)
		c.queueHeartbeat(hb)
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
