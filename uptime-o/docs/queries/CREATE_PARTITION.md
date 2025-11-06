
# HTTP Metrics & Heartbeat Partitioning Strategy

## Table Partitioning for api_heartbeats

### Daily Partition Creation

Create daily partitions for the `api_heartbeats` table to improve query performance and manage large datasets:

```sql
CREATE TABLE IF NOT EXISTS api_heartbeats_2025_11_03
PARTITION OF api_heartbeats
FOR VALUES FROM ('2025-11-03 00:00:00') TO ('2025-11-04 00:00:00');
```

### Automated Partition Management Script

Create a daily partition automatically:

```bash
#!/bin/bash
# create_daily_partition.sh

TODAY=$(date +%Y_%m_%d)
NEXT_DAY=$(date -d "tomorrow" +%Y-%m-%d)

psql -U your_db_user -d your_db_name <<EOF
CREATE TABLE IF NOT EXISTS api_heartbeats_${TODAY}
PARTITION OF api_heartbeats
FOR VALUES FROM ('${NEXT_DAY} 00:00:00') TO ('$(date -d "tomorrow + 1 day" +%Y-%m-%d) 00:00:00');
EOF
```

## HTTP Metrics Feature Overview

The HTTP Metrics feature provides aggregated HTTP heartbeat data with filtering capabilities.

### Feature Endpoints

- **GET /api/http-metrics/aggregated** - Fetch aggregated HTTP metrics
  - Query parameters: `searchName`, `regionName`, `datacenterName`, `agentName`
  - Returns: `List<HttpMetricsDTO>`

### UI Component Location

- **Route**: `/http-metrics`
- **Component**: `src/main/webapp/app/entities/http-metrics/http-metrics.tsx`
- **Menu**: Monitoring > HTTP(s) Metrics

### DTO Structure (HttpMetricsDTO)

```java
{
  monitorId: Long,
  monitorName: String,
  lastSuccess: Boolean,
  agentCount: Integer,
  regionName: String,
  datacenterName: String,
  agentName: String,
  lastCheckedTime: Instant,
  lastLatencyMs: Integer
}
```

## Backend Implementation

### Service: HttpMetricsService

Location: `src/main/java/uptime/observability/service/HttpMetricsService.java`

Method: `getAggregatedMetrics(searchName, regionName, datacenterName, agentName)`

**Key Features:**
- Aggregates latest heartbeat per monitor
- Counts distinct agents checking each monitor
- Supports filtering by name, region, datacenter, and agent
- Uses JOIN FETCH to prevent LazyInitializationException

### Repository: HttpHeartbeatRepository

Key Query Method:

```java
@Query("SELECT DISTINCT h FROM HttpHeartbeat h " +
       "LEFT JOIN FETCH h.agent a " +
       "LEFT JOIN FETCH a.datacenter dc " +
       "LEFT JOIN FETCH dc.region " +
       "WHERE h.monitor.id = :monitorId " +
       "ORDER BY h.executedAt DESC")
List<HttpHeartbeat> findByMonitorIdOrderByExecutedAtDesc(Long monitorId);
```

This query eagerly loads all related data to prevent lazy loading errors.

### REST Controller: HttpMetricsResource

Location: `src/main/java/uptime/observability/web/rest/HttpMetricsResource.java`

Endpoint: `GET /api/http-metrics/aggregated`

## Key Database Tables

### api_heartbeats (Partitioned)

Primary table for HTTP health check records.

**Columns:**
- `id` - Primary key
- `monitor_id` - Foreign key to api_http_monitor
- `agent_id` - Foreign key to api_agent
- `executed_at` - When the check was performed (Partition key)
- `success` - Boolean: true if check succeeded
- `response_time_ms` - Latency in milliseconds
- `response_status_code` - HTTP status code
- `error_type` - Type of error (if failed)
- `error_message` - Error details
- `dns_lookup_ms` - DNS resolution time
- `tcp_connect_ms` - TCP connection time
- `tls_handshake_ms` - TLS handshake time
- `time_to_first_byte_ms` - TTFB measurement

### api_http_monitor

HTTP monitors configuration.

**Columns:**
- `id` - Primary key
- `name` - Monitor name
- `url` - Target URL
- `method` - HTTP method (GET, POST, etc.)
- `type` - Monitor type

### api_agent

Monitoring agents.

**Columns:**
- `id` - Primary key
- `name` - Agent name
- `datacenter_id` - Foreign key to api_datacenter

### api_datacenter

Data center locations.

**Columns:**
- `id` - Primary key
- `name` - Datacenter name
- `region_id` - Foreign key to api_region

### api_region

Geographic regions.

**Columns:**
- `id` - Primary key
- `name` - Region name

## Performance Considerations

### Indexing Strategy

```sql
-- Index for quick lookups by monitor and execution time
CREATE INDEX idx_heartbeats_monitor_executed 
ON api_heartbeats(monitor_id, executed_at DESC);

-- Index for filtering by agent
CREATE INDEX idx_heartbeats_agent_executed 
ON api_heartbeats(agent_id, executed_at DESC);

-- Index for filtering by success status
CREATE INDEX idx_heartbeats_success_executed 
ON api_heartbeats(success, executed_at DESC);

-- Composite index for common queries
CREATE INDEX idx_heartbeats_monitor_agent_executed 
ON api_heartbeats(monitor_id, agent_id, executed_at DESC);
```

### Query Optimization Tips

1. **Always use partitioning** - Filter by date range in WHERE clause
2. **Use EXPLAIN ANALYZE** - Verify query plans before running on large data
3. **Pagination** - Add LIMIT/OFFSET for large result sets
4. **Batch operations** - Group multiple checks together

## Testing the HTTP Metrics Feature

### Manual API Testing

```bash
# All metrics
curl http://localhost:8080/api/http-metrics/aggregated

# Filter by name
curl http://localhost:8080/api/http-metrics/aggregated?searchName=google

# Filter by region
curl http://localhost:8080/api/http-metrics/aggregated?regionName=US-East

# Filter by datacenter
curl http://localhost:8080/api/http-metrics/aggregated?datacenterName=DC-1

# Filter by agent
curl http://localhost:8080/api/http-metrics/aggregated?agentName=agent-1

# Multiple filters
curl http://localhost:8080/api/http-metrics/aggregated?regionName=US-East&datacenterName=DC-1
```

### Database Testing

See `HTTP_METRICS_QUERIES.sql` for comprehensive SQL query examples:
- All data aggregation queries
- Filter-based queries
- Statistics and analysis queries
- Dropdown data queries

## Troubleshooting

### Issue: LazyInitializationException

**Cause:** Agent, Datacenter, or Region loaded lazily outside transaction context

**Solution:** Use JOIN FETCH in repository queries to eagerly load relationships

### Issue: ClassNotFoundException: HttpHeartbeatDTO

**Cause:** Stale classloader cache from development restart

**Solution:** Run `mvn clean compile` before restarting application

### Issue: No data in UI

**Cause:** 
1. No heartbeat data in database
2. Monitors not configured
3. Agents not monitoring the monitors

**Solution:** 
1. Check heartbeat table population: `SELECT COUNT(*) FROM api_heartbeats;`
2. Verify monitor configuration: `SELECT COUNT(*) FROM api_http_monitor;`
3. Check agent-datacenter setup: `SELECT * FROM api_agent;`