-- ✅ Base Tables

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    interval INT NOT NULL,
    include_response_body BOOLEAN DEFAULT FALSE,
    thresholds_warning INT,
    thresholds_critical INT
);

CREATE TABLE api_monitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    schedule_id INT REFERENCES schedules(id),
    headers JSONB,
    body JSONB
);

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    region_code VARCHAR(20),
    group_name VARCHAR(20)
);

CREATE TABLE datacenters (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    region_id INT REFERENCES regions(id)
);

CREATE TABLE datacenter_monitors (
    datacenter_id INT REFERENCES datacenters(id) ON DELETE CASCADE,
    monitor_id INT REFERENCES api_monitors(id) ON DELETE CASCADE,
    PRIMARY KEY (datacenter_id, monitor_id)
);

CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    datacenter_id INT REFERENCES datacenters(id)
);

-- ✅ Partitioned heartbeat table
CREATE TABLE api_heartbeats (
    id BIGSERIAL,
    monitor_id INT REFERENCES api_monitors(id),
    agent_id INT REFERENCES agents(id),
    executed_at TIMESTAMP NOT NULL,
    success BOOLEAN,
    response_time_ms INT,
    response_size_bytes INT,
    response_status_code INT,
    response_content_type VARCHAR(50),
    response_server VARCHAR(50),
    response_cache_status VARCHAR(50),
    dns_lookup_ms INT,
    tcp_connect_ms INT,
    tls_handshake_ms INT,
    time_to_first_byte_ms INT,
    warning_threshold_ms INT,
    critical_threshold_ms INT,
    error_type VARCHAR(50),
    error_message TEXT,
    raw_request_headers JSONB,
    raw_response_headers JSONB,
    raw_response_body JSONB,
    PRIMARY KEY (id, executed_at)
) PARTITION BY RANGE (executed_at);


-- ✅ Today Partition (boot-strap)
CREATE TABLE IF NOT EXISTS api_heartbeats_today
PARTITION OF api_heartbeats
FOR VALUES FROM (CURRENT_DATE) TO (CURRENT_DATE + INTERVAL '1 day');


-- ✅ Auto-Create Daily Partitions
CREATE OR REPLACE FUNCTION create_daily_partition()
RETURNS void AS $$
DECLARE
    dt date := CURRENT_DATE;
    pname text := 'api_heartbeats_' || to_char(dt, 'YYYY_MM_DD');
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF api_heartbeats
         FOR VALUES FROM (%L) TO (%L)',
         pname, dt, dt + 1
    );
END;
$$ LANGUAGE plpgsql;


-- ✅ Indexes (parent only → applied to all partitions)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_agents_datacenter_id ON agents (datacenter_id);
CREATE INDEX idx_datacenters_region_id ON datacenters (region_id);
CREATE INDEX idx_api_monitors_name_trgm ON api_monitors USING GIN (name gin_trgm_ops);
CREATE INDEX idx_api_monitors_schedule_id ON api_monitors (schedule_id);
CREATE INDEX idx_datacenter_monitors_monitor_id
    ON datacenter_monitors (monitor_id, datacenter_id);

-- ✅ Recency index (query booster)
CREATE INDEX idx_hb_recent_exec ON api_heartbeats (executed_at DESC);
