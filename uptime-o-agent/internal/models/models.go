package models

import "time"

type Config struct {
	DBConnString string     `yaml:"dbConnString"`
	Schedules    []Schedule `yaml:"schedules"`
	Agents       []Agent    `yaml:"agents"`
}

type Agent struct {
	ID               int        `yaml:"id"`
	Name             string     `yaml:"name"`
	AgentApiKey      string     `yaml:"agentApiKey"`
	Datacenter       Datacenter `yaml:"datacenter"`
	GlobalThresholds Thresholds `yaml:"globalThresholds"`
	GlobalSchedules  []Schedule `yaml:"globalSchedules"`
	Monitors         []Monitor  `yaml:"monitors"`
}

type Datacenter struct {
	ID     int    `yaml:"id"`
	Code   string `yaml:"code"`
	Name   string `yaml:"name"`
	Region Region `yaml:"region"`
}

type Region struct {
	ID         int    `yaml:"id"`
	Name       string `yaml:"name"`
	RegionCode string `yaml:"regionCode"`
	Group      string `yaml:"group"`
}

type Thresholds struct {
	Warning  int `yaml:"warning"`
	Critical int `yaml:"critical"`
}

type Schedule struct {
	ID                  int    `yaml:"id"`
	Name                string `yaml:"name"`
	Interval            int    `yaml:"interval"`
	IncludeResponseBody bool   `yaml:"include_response_body"`
	ThresholdsWarning   int    `yaml:"thresholds_warning,omitempty"`
	ThresholdsCritical  int    `yaml:"thresholds_critical,omitempty"`
}

type Monitor struct {
	ID         int               `yaml:"id"`
	Name       string            `yaml:"name"`
	Method     string            `yaml:"method"`
	Type       string            `yaml:"type"`
	URL        string            `yaml:"url"`
	ScheduleID int               `yaml:"scheduleId"`
	Headers    map[string]string `yaml:"headers,omitempty"`
	Body       string            `yaml:"body,omitempty"`
}

type Heartbeat struct {
	ID                  int               `json:"id"`
	MonitorID           int               `json:"monitorId"`
	MonitorName         string            `json:"monitorName"`
	Method              string            `json:"method"`
	Type                string            `json:"type"`
	URL                 string            `json:"url"`
	ScheduleID          int               `json:"scheduleId"`
	ScheduleName        string            `json:"scheduleName"`
	Interval            int               `json:"interval"`
	ThresholdsWarning   int               `json:"thresholdsWarning"`
	ThresholdsCritical  int               `json:"thresholdsCritical"`
	AgentID             int               `json:"agentId"`
	AgentName           string            `json:"agentName"`
	DatacenterID        int               `json:"datacenterId"`
	DatacenterName      string            `json:"datacenterName"`
	RegionID            int               `json:"regionId"`
	RegionName          string            `json:"regionName"`
	ExecutedAt          time.Time         `json:"executedAt"`
	Success             bool              `json:"success"`
	ResponseTimeMs      int64             `json:"responseTimeMs"`
	ResponseSizeBytes   int               `json:"responseSizeBytes"`
	ResponseStatusCode  int               `json:"responseStatusCode"`
	ResponseContentType string            `json:"responseContentType"`
	ResponseServer      string            `json:"responseServer"`
	ResponseCacheStatus string            `json:"responseCacheStatus"`
	DNSLookupMs         int64             `json:"dnsLookupMs"`
	TCPConnectMs        int64             `json:"tcpConnectMs"`
	TLSHandshakeMs      int64             `json:"tlsHandshakeMs"`
	TimeToFirstByteMs   int64             `json:"timeToFirstByteMs"`
	WarningThresholdMs  int               `json:"warningThresholdMs"`
	CriticalThresholdMs int               `json:"criticalThresholdMs"`
	ErrorType           *string           `json:"errorType"`
	ErrorMessage        *string           `json:"errorMessage"`
	RawRequestHeaders   map[string]string `json:"rawRequestHeaders"`
	RawResponseHeaders  map[string]string `json:"rawResponseHeaders"`
	RawResponseBody     *string           `json:"rawResponseBody"`
}

type MonitorInterface interface {
	Execute(agent Agent, schedule Schedule) (*Heartbeat, error)
}
