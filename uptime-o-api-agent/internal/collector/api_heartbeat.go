package collector

import (
	"UptimeOAgent/internal/api"
	"UptimeOAgent/internal/models"
	"UptimeOAgent/internal/monitor"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

type APIHeartbeatCollector struct {
	Agent          models.Agent
	Config         *models.Config
	APIClient      *api.Client
	Ctx            context.Context
	heartbeatQueue []*models.Heartbeat
	queueMutex     sync.Mutex
	maxQueueSize   int
	queueFilePath  string
	// Batch processing
	batchQueue     []*models.Heartbeat
	batchMutex     sync.Mutex
	batchSize      int
	batchTimeout   time.Duration
}

func NewAPIHeartbeatCollector(ctx context.Context, agent models.Agent, cfg *models.Config, apiClient *api.Client) *APIHeartbeatCollector {
	// Get queue file path from environment or use default
	queuePath := os.Getenv("QUEUE_PATH")
	if queuePath == "" {
		queuePath = "./tmp/data/queue"
	}

	// Ensure directory exists
	queueDir := filepath.Dir(queuePath)
	if err := os.MkdirAll(queueDir, 0755); err != nil {
		logrus.Warnf("Failed to create queue directory %s: %v. Using in-memory only.", queueDir, err)
		queuePath = "" // Disable file persistence
	}

	// Add agent ID to queue file path to avoid conflicts
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
		APIClient:      apiClient,
		Ctx:            ctx,
		heartbeatQueue: make([]*models.Heartbeat, 0),
		maxQueueSize:   1000, // Store up to 1000 heartbeats when API is down
		queueFilePath:  queuePath,
		// Batch processing
		batchQueue:   make([]*models.Heartbeat, 0),
		batchSize:    50,                    // Max heartbeats per batch
		batchTimeout: 5 * time.Second,       // Max wait time before sending batch
	}

	// Load existing queue from disk if available
	if queuePath != "" {
		collector.loadQueueFromDisk()
	}

	// Start background processors
	go collector.queueFlusher()
	go collector.batchProcessor()

	return collector
}

// loadQueueFromDisk loads the queue from disk file
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

// saveQueueToDisk saves the queue to disk file
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

	// Write to temp file first, then rename (atomic operation)
	tempFile := c.queueFilePath + ".tmp"
	if err := os.WriteFile(tempFile, data, 0644); err != nil {
		logrus.Errorf("Failed to write queue file %s: %v", tempFile, err)
		return
	}

	if err := os.Rename(tempFile, c.queueFilePath); err != nil {
		logrus.Errorf("Failed to rename queue file from %s to %s: %v", tempFile, c.queueFilePath, err)
		os.Remove(tempFile)
		return
	}
} // queueFlusher periodically tries to flush queued heartbeats
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
			// Try one last flush before exiting
			c.flushQueue()
			return
		}
	}
}

// flushQueue attempts to send all queued heartbeats
func (c *APIHeartbeatCollector) flushQueue() {
	c.queueMutex.Lock()
	if len(c.heartbeatQueue) == 0 {
		c.queueMutex.Unlock()
		return
	}

	// Take a copy of the queue
	heartbeats := make([]*models.Heartbeat, len(c.heartbeatQueue))
	copy(heartbeats, c.heartbeatQueue)
	queueSize := len(heartbeats)
	c.queueMutex.Unlock()

	// Try to submit in batch
	if err := c.APIClient.SubmitHeartbeatBatch(heartbeats); err != nil {
		logrus.Warnf("Failed to flush heartbeat queue: %v. Will retry later.", err)
		return
	}

	// Success - clear the queue
	c.queueMutex.Lock()
	c.heartbeatQueue = make([]*models.Heartbeat, 0)
	c.queueMutex.Unlock()

	// Save empty queue to disk
	c.saveQueueToDisk()

	logrus.Infof("Successfully flushed %d queued heartbeats", queueSize)
}

// queueHeartbeat adds a heartbeat to the queue
func (c *APIHeartbeatCollector) queueHeartbeat(hb *models.Heartbeat) {
	c.queueMutex.Lock()

	if len(c.heartbeatQueue) >= c.maxQueueSize {
		// Queue is full, remove oldest to make room
		logrus.Warnf("Heartbeat queue full (%d), dropping oldest heartbeat", c.maxQueueSize)
		c.heartbeatQueue = c.heartbeatQueue[1:]
	}

	c.heartbeatQueue = append(c.heartbeatQueue, hb)
	c.queueMutex.Unlock()

	// Save queue to disk after releasing mutex
	c.saveQueueToDisk()
}

// batchProcessor handles batch submission of heartbeats
func (c *APIHeartbeatCollector) batchProcessor() {
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("Panic in batch processor: %v", r)
		}
	}()

	ticker := time.NewTicker(c.batchTimeout)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.flushBatch()
		case <-c.Ctx.Done():
			// Flush remaining batch before exiting
			c.flushBatch()
			return
		}
	}
}

// flushBatch sends all batched heartbeats
func (c *APIHeartbeatCollector) flushBatch() {
	c.batchMutex.Lock()
	if len(c.batchQueue) == 0 {
		c.batchMutex.Unlock()
		return
	}

	// Take a copy of the batch
	heartbeats := make([]*models.Heartbeat, len(c.batchQueue))
	copy(heartbeats, c.batchQueue)
	batchSize := len(heartbeats)
	c.batchQueue = make([]*models.Heartbeat, 0) // Clear batch
	c.batchMutex.Unlock()

	// Try to submit batch
	if err := c.APIClient.SubmitHeartbeatBatch(heartbeats); err != nil {
		logrus.Warnf("Failed to submit heartbeat batch (%d items): %v. Queuing for later.", batchSize, err)
		// Add failed batch to persistent queue
		for _, hb := range heartbeats {
			c.queueHeartbeat(hb)
		}
		return
	}

	logrus.Debugf("Successfully submitted batch of %d heartbeats", batchSize)
}

// addToBatch adds a heartbeat to the batch queue
func (c *APIHeartbeatCollector) addToBatch(hb *models.Heartbeat) {
	c.batchMutex.Lock()
	c.batchQueue = append(c.batchQueue, hb)
	batchSize := len(c.batchQueue)
	c.batchMutex.Unlock()

	// If batch is full, flush immediately
	if batchSize >= c.batchSize {
		c.flushBatch()
	}
}

// submitHeartbeatWithFallback adds heartbeat to batch for efficient submission
func (c *APIHeartbeatCollector) submitHeartbeatWithFallback(hb *models.Heartbeat) {
	c.addToBatch(hb)
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

func findSchedule(schedules []models.Schedule, id int) *models.Schedule {
	for _, s := range schedules {
		if s.ID == id {
			return &s
		}
	}
	return nil
}
