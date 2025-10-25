package monitor

import (
	"UptimeOAgent/internal/db"
	"UptimeOAgent/internal/models"
	"context"
	"crypto/tls"
	"io"
	"net/http"
	"net/http/httptrace"
	"strings"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

func StartAgent(ctx context.Context, agent models.Agent, cfg *models.Config, pool *pgxpool.Pool) {
	for _, mon := range agent.Monitors {
		schedule := findSchedule(agent.GlobalSchedules, mon.ScheduleID)
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
					hb, err := ExecuteHttpMonitor(agent, mon, schedule)
					if err != nil {
						logrus.Error("Monitor execution failed:", err)
						continue
					}
					logrus.Infof("Executing monitor %d (%s)", mon.ID, mon.Name)
					if err := db.InsertHeartbeat(ctx, pool, hb); err != nil {
						logrus.Error("Failed to save heartbeat:", err)
					} else {
						logrus.Infof("Heartbeat inserted for monitor %d (%s)", mon.ID, mon.Name)
					}
				case <-ctx.Done():
					return
				}
			}
		}(mon, *schedule)
	}
	<-ctx.Done()
}

func findSchedule(schedules []models.Schedule, id int) *models.Schedule {
	for _, s := range schedules {
		if s.ID == id {
			return &s
		}
	}
	return nil
}

func ExecuteHttpMonitor(agent models.Agent, mon models.Monitor, schedule models.Schedule) (*models.Heartbeat, error) {
	executedAt := time.Now()
	var dnsStart, tcpStart, tlsStart, ttfbStart time.Time
	var dnsLookupMs, tcpConnectMs, tlsHandshakeMs, timeToFirstByteMs int64

	req, err := http.NewRequest(mon.Method, mon.URL, strings.NewReader(mon.Body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "CustomMonitor/1.0")
	for k, v := range mon.Headers {
		req.Header.Set(k, v)
	}

	trace := &httptrace.ClientTrace{
		DNSStart:     func(info httptrace.DNSStartInfo) { dnsStart = time.Now() },
		DNSDone:      func(info httptrace.DNSDoneInfo) { dnsLookupMs = time.Since(dnsStart).Milliseconds() },
		ConnectStart: func(network, addr string) { tcpStart = time.Now() },
		ConnectDone: func(network, addr string, err error) {
			if err == nil {
				tcpConnectMs = time.Since(tcpStart).Milliseconds()
			}
		},
		TLSHandshakeStart: func() { tlsStart = time.Now() },
		TLSHandshakeDone: func(cs tls.ConnectionState, err error) {
			if err == nil {
				tlsHandshakeMs = time.Since(tlsStart).Milliseconds()
			}
		},
		GotFirstResponseByte: func() { timeToFirstByteMs = time.Since(ttfbStart).Milliseconds() },
	}
	req = req.WithContext(httptrace.WithClientTrace(context.Background(), trace))

	client := &http.Client{Timeout: time.Duration(schedule.Interval) * time.Second}
	ttfbStart = time.Now()
	resp, err := client.Do(req)
	responseTimeMs := time.Since(ttfbStart).Milliseconds()

	hb := &models.Heartbeat{
		MonitorID:           mon.ID,
		MonitorName:         mon.Name,
		Method:              mon.Method,
		Type:                mon.Type,
		URL:                 mon.URL,
		ScheduleID:          schedule.ID,
		ScheduleName:        schedule.Name,
		Interval:            schedule.Interval,
		ThresholdsWarning:   schedule.ThresholdsWarning,
		ThresholdsCritical:  schedule.ThresholdsCritical,
		AgentID:             agent.Datacenter.ID,
		AgentName:           agent.Name,
		DatacenterID:        agent.Datacenter.ID,
		DatacenterName:      agent.Datacenter.Name,
		RegionID:            agent.Datacenter.Region.ID,
		RegionName:          agent.Datacenter.Region.Name,
		ExecutedAt:          executedAt,
		Success:             err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300,
		ResponseTimeMs:      responseTimeMs,
		DNSLookupMs:         dnsLookupMs,
		TCPConnectMs:        tcpConnectMs,
		TLSHandshakeMs:      tlsHandshakeMs,
		TimeToFirstByteMs:   timeToFirstByteMs,
		WarningThresholdMs:  agent.GlobalThresholds.Warning,
		CriticalThresholdMs: agent.GlobalThresholds.Critical,
		RawRequestHeaders:   map[string]string{"User-Agent": "CustomMonitor/1.0"},
	}

	if err != nil {
		errorType := "HTTP_ERROR"
		hb.ErrorType = &errorType
		errorMsg := err.Error()
		hb.ErrorMessage = &errorMsg
		return hb, nil
	}
	defer resp.Body.Close()

	hb.ResponseStatusCode = resp.StatusCode
	hb.ResponseContentType = resp.Header.Get("Content-Type")
	hb.ResponseServer = resp.Header.Get("Server")
	hb.ResponseCacheStatus = resp.Header.Get("CF-Cache-Status")

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		errorType := "READ_ERROR"
		hb.ErrorType = &errorType
		errorMsg := err.Error()
		hb.ErrorMessage = &errorMsg
		return hb, nil
	}
	hb.ResponseSizeBytes = len(body)

	headers := make(map[string]string)
	for k, v := range resp.Header {
		headers[k] = strings.Join(v, ", ")
	}
	hb.RawResponseHeaders = headers

	if schedule.IncludeResponseBody {
		bodyStr := string(body)
		hb.RawResponseBody = &bodyStr
	}

	return hb, nil
}
