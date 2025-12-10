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
		
		// Collect all URLs to monitor (primary + additional)
		urls := []string{mon.URL}
		if len(mon.AdditionalUrls) > 0 {
			urls = append(urls, mon.AdditionalUrls...)
		}
		
		// Start monitoring for each URL
		logrus.Infof("Starting monitor %d (%s) for %d URLs (interval: %ds, calls: %dx)", mon.ID, mon.Name, len(urls), schedule.Interval, mon.CallsPerInterval)
		for _, targetUrl := range urls {
			go func(mon models.Monitor, schedule models.Schedule, url string) {
				defer func() {
					if r := recover(); r != nil {
						logrus.Errorf("Panic in monitor %d (%s) for URL %s: %v", mon.ID, mon.Name, url, r)
					}
				}()
				ticker := time.NewTicker(time.Duration(schedule.Interval) * time.Second)
				defer ticker.Stop()
				for {
					select {
					case <-ticker.C:
						// Use monitor-level callsPerInterval if set, otherwise use schedule-level
						callsPerInterval := mon.CallsPerInterval
						if callsPerInterval <= 0 {
							callsPerInterval = schedule.CallsPerInterval
						}
						if callsPerInterval <= 0 {
							callsPerInterval = 1
						}
						
						for i := 0; i < callsPerInterval; i++ {
							go func() {
								defer func() {
									if r := recover(); r != nil {
										logrus.Errorf("Panic in monitor call %d (%s) for URL %s: %v", mon.ID, mon.Name, url, r)
									}
								}()
								// Create a copy of monitor with the target URL
								monCopy := mon
								monCopy.URL = url
								hb, err := monitor.ExecuteHttpMonitor(c.Agent, monCopy, schedule)
								if err != nil {
									logrus.Errorf("Monitor execution failed for monitor %d (%s) URL %s: %v", mon.ID, mon.Name, url, err)
									if hb != nil {
										c.submitHeartbeatWithFallback(hb)
									}
									return
								}
								c.submitHeartbeatWithFallback(hb)
							}()
						}
					case <-c.Ctx.Done():
						return
					}
				}
			}(mon, *schedule, targetUrl)
		}
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
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("Panic in queue flusher: %v", r)
		}
	}()
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
