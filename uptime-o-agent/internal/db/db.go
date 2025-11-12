package db

import (
	"UptimeOAgent/internal/models"
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

func Connect(connString string) (*pgxpool.Pool, error) {
	return pgxpool.Connect(context.Background(), connString)
}

func InsertHeartbeat(ctx context.Context, pool *pgxpool.Pool, hb *models.Heartbeat) error {
	var reqHeaders, respHeaders []byte
	var err error
	
	if hb.RawRequestHeaders != nil {
		reqHeaders, err = json.Marshal(hb.RawRequestHeaders)
		if err != nil {
			logrus.Error("Failed to marshal request headers:", err)
			return err
		}
	}
	
	if hb.RawResponseHeaders != nil {
		respHeaders, err = json.Marshal(hb.RawResponseHeaders)
		if err != nil {
			logrus.Error("Failed to marshal response headers:", err)
			return err
		}
	}
	
	query := `
		INSERT INTO api_heartbeats (
			monitor_id, agent_id, executed_at, success, response_time_ms, response_size_bytes,
			response_status_code, response_content_type, response_server, response_cache_status,
			dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, time_to_first_byte_ms, warning_threshold_ms,
			critical_threshold_ms, error_type, error_message, raw_request_headers, raw_response_headers, raw_response_body
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`
	_, err = pool.Exec(ctx, query,
		hb.MonitorID, hb.AgentID, hb.ExecutedAt, hb.Success, hb.ResponseTimeMs, hb.ResponseSizeBytes,
		hb.ResponseStatusCode, hb.ResponseContentType, hb.ResponseServer, hb.ResponseCacheStatus,
		hb.DNSLookupMs, hb.TCPConnectMs, hb.TLSHandshakeMs, hb.TimeToFirstByteMs, hb.WarningThresholdMs,
		hb.CriticalThresholdMs, hb.ErrorType, hb.ErrorMessage, reqHeaders, respHeaders, hb.RawResponseBody)
	if err != nil {
		logrus.Error("Failed to insert heartbeat:", err)
	}
	return err
}

func AcquireLock(ctx context.Context, pool *pgxpool.Pool, agentID int) (bool, error) {
	var acquired bool
	err := pool.QueryRow(ctx, "SELECT pg_try_advisory_lock($1)", agentID).Scan(&acquired)
	return acquired, err
}

func ReleaseLock(ctx context.Context, pool *pgxpool.Pool, agentID int) error {
	_, err := pool.Exec(ctx, "SELECT pg_advisory_unlock($1)", agentID)
	return err
}
