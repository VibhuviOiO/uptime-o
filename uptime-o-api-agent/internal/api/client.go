package api

import (
	"UptimeOAgent/internal/models"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/sirupsen/logrus"
)

type Client struct {
	BaseURL string
	APIKey  string
	client  *http.Client
}

// MonitorResponse represents the API response for a monitor
type MonitorResponse struct {
	ID       int              `json:"id"`
	Name     string           `json:"name"`
	Method   string           `json:"method"`
	Type     string           `json:"type"`
	URL      string           `json:"url"`
	Headers  *json.RawMessage `json:"headers"`
	Body     *json.RawMessage `json:"body"`
	Schedule ScheduleResponse `json:"schedule"`
}

type ScheduleResponse struct {
	ID                  int    `json:"id"`
	Name                string `json:"name"`
	Interval            int    `json:"interval"`
	IncludeResponseBody bool   `json:"includeResponseBody"`
	ThresholdsWarning   int    `json:"thresholdsWarning"`
	ThresholdsCritical  int    `json:"thresholdsCritical"`
}

// IDReference represents a reference to an entity by ID
type IDReference struct {
	ID int `json:"id"`
}

// HeartbeatRequest represents the structure for submitting heartbeats
type HeartbeatRequest struct {
	Monitor             *IDReference      `json:"monitor"`
	Agent               *IDReference      `json:"agent"`
	ExecutedAt          string            `json:"executedAt"`
	Success             bool              `json:"success"`
	ResponseTimeMs      int64             `json:"responseTimeMs,omitempty"`
	ResponseSizeBytes   int               `json:"responseSizeBytes,omitempty"`
	ResponseStatusCode  int               `json:"responseStatusCode,omitempty"`
	ResponseContentType string            `json:"responseContentType,omitempty"`
	ResponseServer      string            `json:"responseServer,omitempty"`
	ResponseCacheStatus string            `json:"responseCacheStatus,omitempty"`
	DNSLookupMs         int64             `json:"dnsLookupMs,omitempty"`
	TCPConnectMs        int64             `json:"tcpConnectMs,omitempty"`
	TLSHandshakeMs      int64             `json:"tlsHandshakeMs,omitempty"`
	TimeToFirstByteMs   int64             `json:"timeToFirstByteMs,omitempty"`
	WarningThresholdMs  int               `json:"warningThresholdMs,omitempty"`
	CriticalThresholdMs int               `json:"criticalThresholdMs,omitempty"`
	ErrorType           *string           `json:"errorType,omitempty"`
	ErrorMessage        *string           `json:"errorMessage,omitempty"`
	RawRequestHeaders   map[string]string `json:"rawRequestHeaders,omitempty"`
	RawResponseHeaders  map[string]string `json:"rawResponseHeaders,omitempty"`
	RawResponseBody     *json.RawMessage  `json:"rawResponseBody,omitempty"`
}

func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		BaseURL: baseURL,
		APIKey:  apiKey,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// retryWithBackoff retries an operation with exponential backoff
func (c *Client) retryWithBackoff(operation func() error, maxRetries int, operationName string) error {
	var lastErr error
	backoff := 2 * time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := operation()
		if err == nil {
			if attempt > 1 {
				logrus.Infof("%s succeeded after %d attempts", operationName, attempt)
			}
			return nil
		}

		lastErr = err
		if attempt < maxRetries {
			logrus.Warnf("%s failed (attempt %d/%d): %v. Retrying in %v...", operationName, attempt, maxRetries, err, backoff)
			time.Sleep(backoff)
			backoff *= 2 // Exponential backoff
			if backoff > 60*time.Second {
				backoff = 60 * time.Second // Cap at 60 seconds
			}
		}
	}

	logrus.Errorf("%s failed after %d attempts: %v", operationName, maxRetries, lastErr)
	return fmt.Errorf("%s failed after %d attempts: %w", operationName, maxRetries, lastErr)
}

// GetMonitors fetches monitors assigned to the agent with retry logic
func (c *Client) GetMonitors(agentID int) ([]models.Monitor, []models.Schedule, error) {
	url := fmt.Sprintf("%s/api/public/monitors?agentId=%d", c.BaseURL, agentID)

	var apiMonitors []MonitorResponse

	operation := func() error {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("X-API-Key", c.APIKey)
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to fetch monitors: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
		}

		if err := json.NewDecoder(resp.Body).Decode(&apiMonitors); err != nil {
			return fmt.Errorf("failed to decode response: %w", err)
		}

		return nil
	}

	// Retry up to 5 times
	if err := c.retryWithBackoff(operation, 5, "GetMonitors"); err != nil {
		return nil, nil, err
	}

	logrus.Infof("Fetched %d monitors from API", len(apiMonitors))

	// Convert API response to internal models
	monitors := make([]models.Monitor, 0, len(apiMonitors))
	schedules := make([]models.Schedule, 0)
	scheduleMap := make(map[int]bool)

	for _, apiMon := range apiMonitors {
		// Parse headers if present
		var headers map[string]string
		if apiMon.Headers != nil {
			if err := json.Unmarshal(*apiMon.Headers, &headers); err != nil {
				logrus.Warnf("Failed to parse headers for monitor %d: %v", apiMon.ID, err)
			}
		}

		// Parse body if present
		var body string
		if apiMon.Body != nil {
			bodyBytes, err := apiMon.Body.MarshalJSON()
			if err == nil {
				body = string(bodyBytes)
			}
		}

		monitor := models.Monitor{
			ID:         apiMon.ID,
			Name:       apiMon.Name,
			Method:     apiMon.Method,
			Type:       apiMon.Type,
			URL:        apiMon.URL,
			ScheduleID: apiMon.Schedule.ID,
			Headers:    headers,
			Body:       body,
		}
		monitors = append(monitors, monitor)

		// Add schedule if not already added
		if !scheduleMap[apiMon.Schedule.ID] {
			schedule := models.Schedule{
				ID:                  apiMon.Schedule.ID,
				Name:                apiMon.Schedule.Name,
				Interval:            apiMon.Schedule.Interval,
				IncludeResponseBody: apiMon.Schedule.IncludeResponseBody,
				ThresholdsWarning:   apiMon.Schedule.ThresholdsWarning,
				ThresholdsCritical:  apiMon.Schedule.ThresholdsCritical,
			}
			schedules = append(schedules, schedule)
			scheduleMap[apiMon.Schedule.ID] = true
		}
	}

	return monitors, schedules, nil
}

// SubmitHeartbeat submits a single heartbeat to the API with retry logic
func (c *Client) SubmitHeartbeat(hb *models.Heartbeat) error {
	url := fmt.Sprintf("%s/api/public/heartbeats", c.BaseURL)

	// Convert heartbeat to request format
	req := c.convertHeartbeatToRequest(hb)

	operation := func() error {
		body, err := json.Marshal(req)
		if err != nil {
			return fmt.Errorf("failed to marshal heartbeat: %w", err)
		}

		httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		httpReq.Header.Set("X-API-Key", c.APIKey)
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := c.client.Do(httpReq)
		if err != nil {
			return fmt.Errorf("failed to submit heartbeat: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
			respBody, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(respBody))
		}

		return nil
	}

	// Retry up to 3 times for heartbeat submission
	return c.retryWithBackoff(operation, 3, fmt.Sprintf("SubmitHeartbeat (monitor %d)", hb.MonitorID))
}

// SubmitHeartbeatBatch submits multiple heartbeats in a single request with retry logic
func (c *Client) SubmitHeartbeatBatch(heartbeats []*models.Heartbeat) error {
	if len(heartbeats) == 0 {
		return nil
	}

	url := fmt.Sprintf("%s/api/public/heartbeats/batch", c.BaseURL)

	// Convert heartbeats to request format
	requests := make([]HeartbeatRequest, len(heartbeats))
	for i, hb := range heartbeats {
		requests[i] = c.convertHeartbeatToRequest(hb)
	}

	operation := func() error {
		body, err := json.Marshal(requests)
		if err != nil {
			return fmt.Errorf("failed to marshal heartbeats: %w", err)
		}

		httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
		if err != nil {
			return fmt.Errorf("failed to create request: %w", err)
		}

		httpReq.Header.Set("X-API-Key", c.APIKey)
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := c.client.Do(httpReq)
		if err != nil {
			return fmt.Errorf("failed to submit heartbeat batch: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			respBody, _ := io.ReadAll(resp.Body)
			return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(respBody))
		}

		return nil
	}

	// Retry up to 3 times for batch submission
	err := c.retryWithBackoff(operation, 3, fmt.Sprintf("SubmitHeartbeatBatch (%d heartbeats)", len(heartbeats)))
	if err == nil {
		logrus.Infof("Successfully submitted batch of %d heartbeats", len(heartbeats))
	}
	return err
}

func (c *Client) convertHeartbeatToRequest(hb *models.Heartbeat) HeartbeatRequest {
	req := HeartbeatRequest{
		Monitor:             &IDReference{ID: hb.MonitorID},
		Agent:               &IDReference{ID: hb.AgentID},
		ExecutedAt:          hb.ExecutedAt.Format(time.RFC3339),
		Success:             hb.Success,
		ResponseTimeMs:      hb.ResponseTimeMs,
		ResponseSizeBytes:   hb.ResponseSizeBytes,
		ResponseStatusCode:  hb.ResponseStatusCode,
		ResponseContentType: hb.ResponseContentType,
		ResponseServer:      hb.ResponseServer,
		ResponseCacheStatus: hb.ResponseCacheStatus,
		DNSLookupMs:         hb.DNSLookupMs,
		TCPConnectMs:        hb.TCPConnectMs,
		TLSHandshakeMs:      hb.TLSHandshakeMs,
		TimeToFirstByteMs:   hb.TimeToFirstByteMs,
		WarningThresholdMs:  hb.WarningThresholdMs,
		CriticalThresholdMs: hb.CriticalThresholdMs,
		ErrorType:           hb.ErrorType,
		ErrorMessage:        hb.ErrorMessage,
		RawRequestHeaders:   hb.RawRequestHeaders,
		RawResponseHeaders:  hb.RawResponseHeaders,
	}

	// Convert string response body to json.RawMessage
	if hb.RawResponseBody != nil {
		// Marshal the string to ensure it's properly JSON-encoded
		encoded, err := json.Marshal(*hb.RawResponseBody)
		if err == nil {
			rawJSON := json.RawMessage(encoded)
			req.RawResponseBody = &rawJSON
		}
	}

	return req
}
