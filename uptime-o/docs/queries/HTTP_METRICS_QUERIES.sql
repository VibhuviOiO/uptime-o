-- ============================================================================
-- HTTP Metrics Feature - PostgreSQL Query Examples
-- ============================================================================
-- These queries demonstrate the aggregation logic used by the HTTP Metrics Service
-- All queries fetch the latest HTTP heartbeat data for each monitor with agent, 
-- datacenter, and region information.

-- ============================================================================
-- QUERY 1: Get ALL HTTP Metrics (No Filters)
-- This is the primary query executed when fetching all metrics
-- ============================================================================
SELECT DISTINCT
    h.id,
    h.monitor_id,
    m.name as monitor_name,
    h.success,
    h.agent_id,
    a.name as agent_name,
    a.datacenter_id,
    dc.name as datacenter_name,
    dc.region_id,
    r.name as region_name,
    h.executed_at as last_checked_time,
    h.response_time_ms as latency_ms,
    h.response_status_code,
    h.error_type,
    h.error_message
FROM
    api_heartbeats h
    LEFT JOIN api_http_monitor m ON h.monitor_id = m.id
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
WHERE
    h.monitor_id IN (
        -- Get the most recent heartbeat for each monitor
        SELECT DISTINCT ON (monitor_id) monitor_id
        FROM api_heartbeats
        ORDER BY monitor_id, executed_at DESC
    )
ORDER BY
    h.monitor_id,
    h.executed_at DESC;

-- ============================================================================
-- QUERY 2: Get Aggregated HTTP Metrics (One row per monitor with latest data)
-- This is closer to what the service returns
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    (SELECT success FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_success,
    (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count,
    r.name as region_name,
    dc.name as datacenter_name,
    (SELECT a.name FROM api_heartbeats h LEFT JOIN api_agent a ON h.agent_id = a.id WHERE h.monitor_id = m.id ORDER BY h.executed_at DESC LIMIT 1) as agent_name,
    (SELECT executed_at FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_checked_time,
    (SELECT response_time_ms FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_latency_ms
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id AND h.executed_at = (
        SELECT MAX(executed_at) FROM api_heartbeats WHERE monitor_id = m.id
    )
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
GROUP BY
    m.id,
    m.name,
    r.name,
    dc.name
ORDER BY
    m.name;

-- ============================================================================
-- QUERY 3: Filter by Monitor Name (Search)
-- Returns metrics for monitors matching the search term
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    (SELECT success FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_success,
    (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count,
    r.name as region_name,
    dc.name as datacenter_name,
    (SELECT a.name FROM api_heartbeats h LEFT JOIN api_agent a ON h.agent_id = a.id WHERE h.monitor_id = m.id ORDER BY h.executed_at DESC LIMIT 1) as agent_name,
    (SELECT executed_at FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_checked_time,
    (SELECT response_time_ms FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_latency_ms
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id AND h.executed_at = (
        SELECT MAX(executed_at) FROM api_heartbeats WHERE monitor_id = m.id
    )
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
WHERE
    LOWER(m.name) LIKE LOWER('%' || 'google' || '%')  -- Replace 'google' with search term
GROUP BY
    m.id,
    m.name,
    r.name,
    dc.name
ORDER BY
    m.name;

-- ============================================================================
-- QUERY 4: Filter by Region
-- Returns metrics for monitors in a specific region
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    (SELECT success FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_success,
    (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count,
    r.name as region_name,
    dc.name as datacenter_name,
    (SELECT a.name FROM api_heartbeats h LEFT JOIN api_agent a ON h.agent_id = a.id WHERE h.monitor_id = m.id ORDER BY h.executed_at DESC LIMIT 1) as agent_name,
    (SELECT executed_at FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_checked_time,
    (SELECT response_time_ms FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_latency_ms
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id AND h.executed_at = (
        SELECT MAX(executed_at) FROM api_heartbeats WHERE monitor_id = m.id
    )
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
WHERE
    r.name = 'US-East'  -- Replace 'US-East' with desired region name
GROUP BY
    m.id,
    m.name,
    r.name,
    dc.name
ORDER BY
    m.name;

-- ============================================================================
-- QUERY 5: Filter by Datacenter
-- Returns metrics for monitors in a specific datacenter
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    (SELECT success FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_success,
    (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count,
    r.name as region_name,
    dc.name as datacenter_name,
    (SELECT a.name FROM api_heartbeats h LEFT JOIN api_agent a ON h.agent_id = a.id WHERE h.monitor_id = m.id ORDER BY h.executed_at DESC LIMIT 1) as agent_name,
    (SELECT executed_at FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_checked_time,
    (SELECT response_time_ms FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_latency_ms
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id AND h.executed_at = (
        SELECT MAX(executed_at) FROM api_heartbeats WHERE monitor_id = m.id
    )
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
WHERE
    dc.name = 'DC-1'  -- Replace 'DC-1' with desired datacenter name
GROUP BY
    m.id,
    m.name,
    r.name,
    dc.name
ORDER BY
    m.name;

-- ============================================================================
-- QUERY 6: Filter by Agent Name
-- Returns metrics for monitors checked by a specific agent
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    (SELECT success FROM api_heartbeats WHERE monitor_id = m.id AND agent_id = a.id ORDER BY executed_at DESC LIMIT 1) as last_success,
    (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count,
    r.name as region_name,
    dc.name as datacenter_name,
    a.name as agent_name,
    (SELECT executed_at FROM api_heartbeats WHERE monitor_id = m.id AND agent_id = a.id ORDER BY executed_at DESC LIMIT 1) as last_checked_time,
    (SELECT response_time_ms FROM api_heartbeats WHERE monitor_id = m.id AND agent_id = a.id ORDER BY executed_at DESC LIMIT 1) as last_latency_ms
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id AND h.agent_id IN (
        SELECT id FROM api_agent WHERE LOWER(name) LIKE LOWER('%' || 'agent' || '%')  -- Replace 'agent' with agent name
    )
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
WHERE
    a.id IS NOT NULL
GROUP BY
    m.id,
    m.name,
    r.name,
    dc.name,
    a.id,
    a.name
ORDER BY
    m.name;

-- ============================================================================
-- QUERY 7: Combined Filter - Region AND Datacenter
-- Returns metrics filtered by both region and datacenter
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    (SELECT success FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_success,
    (SELECT COUNT(DISTINCT agent_id) FROM api_heartbeats WHERE monitor_id = m.id) as agent_count,
    r.name as region_name,
    dc.name as datacenter_name,
    (SELECT a.name FROM api_heartbeats h LEFT JOIN api_agent a ON h.agent_id = a.id WHERE h.monitor_id = m.id ORDER BY h.executed_at DESC LIMIT 1) as agent_name,
    (SELECT executed_at FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_checked_time,
    (SELECT response_time_ms FROM api_heartbeats WHERE monitor_id = m.id ORDER BY executed_at DESC LIMIT 1) as last_latency_ms
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id AND h.executed_at = (
        SELECT MAX(executed_at) FROM api_heartbeats WHERE monitor_id = m.id
    )
    LEFT JOIN api_agent a ON h.agent_id = a.id
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
WHERE
    r.name = 'US-East'  -- Replace with desired region
    AND dc.name = 'DC-1'  -- Replace with desired datacenter
GROUP BY
    m.id,
    m.name,
    r.name,
    dc.name
ORDER BY
    m.name;

-- ============================================================================
-- QUERY 8: Get Distinct Values for Filter Dropdowns
-- ============================================================================

-- Get all unique regions with monitors
SELECT DISTINCT r.name as region_name
FROM api_region r
INNER JOIN api_datacenter dc ON r.id = dc.region_id
INNER JOIN api_agent a ON dc.id = a.datacenter_id
INNER JOIN api_heartbeats h ON a.id = h.agent_id
INNER JOIN api_http_monitor m ON h.monitor_id = m.id
ORDER BY r.name;

-- Get all unique datacenters with monitors
SELECT DISTINCT dc.name as datacenter_name
FROM api_datacenter dc
INNER JOIN api_agent a ON dc.id = a.datacenter_id
INNER JOIN api_heartbeats h ON a.id = h.agent_id
INNER JOIN api_http_monitor m ON h.monitor_id = m.id
ORDER BY dc.name;

-- Get all unique agents with monitored data
SELECT DISTINCT a.name as agent_name
FROM api_agent a
INNER JOIN api_heartbeats h ON a.id = h.agent_id
INNER JOIN api_http_monitor m ON h.monitor_id = m.id
ORDER BY a.name;

-- ============================================================================
-- QUERY 9: Statistics - Monitor Health Summary
-- Count of successful vs failed monitors
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    COUNT(h.id) as total_checks,
    SUM(CASE WHEN h.success = true THEN 1 ELSE 0 END) as successful_checks,
    SUM(CASE WHEN h.success = false THEN 1 ELSE 0 END) as failed_checks,
    ROUND(SUM(CASE WHEN h.success = true THEN 1 ELSE 0 END)::numeric / COUNT(h.id) * 100, 2) as success_rate,
    MIN(h.executed_at) as first_check,
    MAX(h.executed_at) as last_check
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id
GROUP BY
    m.id,
    m.name
ORDER BY
    success_rate DESC;

-- ============================================================================
-- QUERY 10: Latency Analysis - Average, Min, Max response times per monitor
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    COUNT(h.id) as check_count,
    ROUND(AVG(h.response_time_ms)::numeric, 2) as avg_latency_ms,
    MIN(h.response_time_ms) as min_latency_ms,
    MAX(h.response_time_ms) as max_latency_ms,
    ROUND(STDDEV(h.response_time_ms)::numeric, 2) as stddev_latency_ms,
    MAX(h.executed_at) as last_check
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id
WHERE
    h.response_time_ms IS NOT NULL
GROUP BY
    m.id,
    m.name
ORDER BY
    avg_latency_ms DESC;

-- ============================================================================
-- QUERY 11: Recent Issues - Monitors with recent failures
-- Shows monitors that had failures in the last 24 hours
-- ============================================================================
SELECT
    m.id as monitor_id,
    m.name as monitor_name,
    a.name as agent_name,
    h.success,
    h.error_type,
    h.error_message,
    h.response_status_code,
    h.executed_at,
    NOW() - h.executed_at as time_ago
FROM
    api_http_monitor m
    LEFT JOIN api_heartbeats h ON m.id = h.monitor_id
    LEFT JOIN api_agent a ON h.agent_id = a.id
WHERE
    h.success = false
    AND h.executed_at > NOW() - INTERVAL '24 hours'
ORDER BY
    h.executed_at DESC;

-- ============================================================================
-- QUERY 12: Agent Performance - Which agents are checking which monitors
-- ============================================================================
SELECT
    a.id as agent_id,
    a.name as agent_name,
    dc.name as datacenter_name,
    r.name as region_name,
    COUNT(DISTINCT h.monitor_id) as monitor_count,
    COUNT(h.id) as total_checks,
    SUM(CASE WHEN h.success = true THEN 1 ELSE 0 END) as successful_checks,
    ROUND(SUM(CASE WHEN h.success = true THEN 1 ELSE 0 END)::numeric / COUNT(h.id) * 100, 2) as success_rate
FROM
    api_agent a
    LEFT JOIN api_datacenter dc ON a.datacenter_id = dc.id
    LEFT JOIN api_region r ON dc.region_id = r.id
    LEFT JOIN api_heartbeats h ON a.id = h.agent_id
GROUP BY
    a.id,
    a.name,
    dc.name,
    r.name
ORDER BY
    a.name;

-- ============================================================================
-- Notes for Testing:
-- ============================================================================
-- 1. Replace placeholder values (e.g., 'google', 'US-East', 'DC-1', 'agent') 
--    with actual values from your database
-- 2. Use \d to describe table structures: \d api_heartbeats, \d api_http_monitor, etc.
-- 3. Use EXPLAIN ANALYZE to check query performance
-- 4. Add LIMIT clause for pagination: LIMIT 20 OFFSET 0
-- 5. The service internally uses these principles but with eager loading via JOIN FETCH
