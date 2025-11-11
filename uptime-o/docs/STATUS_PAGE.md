# Status Page Documentation

**Last Updated**: November 11, 2025  
**Version**: 1.0

## Overview

The Status Page is a public-facing dashboard that displays real-time health status of monitored APIs across different geographic regions. Inspired by Google Cloud's status page (status.cloud.google.com), it provides an at-a-glance view of service availability.

## Architecture

### Visual Layout

```
┌──────────────────┬──────────────┬──────────────┬──────────────┐
│ Service          │ Virginia     │ Oregon       │ Mumbai       │
├──────────────────┼──────────────┼──────────────┼──────────────┤
│ Payment API      │ ✓ 45ms       │ ✓ 120ms      │ ✓ 156ms      │
│ User API         │ ✓ 32ms       │ ✗ Timeout    │ ✓ 201ms      │
│ Notification API │ ✓ 67ms       │ ✓ 98ms       │ — No Data    │
└──────────────────┴──────────────┴──────────────┴──────────────┘
```

- **Rows**: API Monitors (services being monitored)
- **Columns**: Regions (geographic locations where monitoring agents run)
- **Cells**: Health indicators with latency metrics

## Data Flow

```
┌─────────────────┐
│  Agents         │  Monitoring agents in different regions
│  (Virginia,     │  execute HTTP checks every 1-5 minutes
│   Oregon,       │
│   Mumbai)       │
└────────┬────────┘
         │ POST /api/public/heartbeats
         ▼
┌─────────────────┐
│  HttpHeartbeat  │  Stores check results:
│  Table          │  - success (boolean)
│  (PostgreSQL)   │  - responseTimeMs (integer)
│                 │  - executedAt (timestamp)
│                 │  - monitor_id, agent_id
└────────┬────────┘
         │ GET /api/public/status
         ▼
┌─────────────────┐
│  Status Page    │  Aggregates and displays:
│  API Endpoint   │  - Last 5 minutes of data
│                 │  - Grouped by Monitor × Region
└────────┬────────┘
         │ JSON Response
         ▼
┌─────────────────┐
│  React UI       │  Renders matrix with:
│  (Home Page)    │  - Green ✓ for UP
│                 │  - Red ✗ for DOWN
│                 │  - Latency in milliseconds
└─────────────────┘
```

## Backend Implementation

### 1. API Endpoint

**URL**: `GET /api/public/status`  
**Authentication**: None (public access)  
**Response Format**:

```json
{
  "apis": [
    {
      "monitorId": 1201,
      "apiName": "Payment API",
      "regionHealth": {
        "Virginia": {
          "status": "UP",
          "responseTimeMs": 45
        },
        "Oregon": {
          "status": "UP",
          "responseTimeMs": 120
        },
        "Mumbai": {
          "status": "DOWN",
          "responseTimeMs": null
        }
      }
    }
  ],
  "regions": ["Virginia", "Oregon", "Mumbai"]
}
```

### 2. Query Logic

**File**: `StatusPageResource.java`

```java
@GetMapping("/status")
@Transactional(readOnly = true)
public ResponseEntity<StatusPageDTO> getStatusPage() {
    // Fetch heartbeats from last 5 minutes
    Instant fiveMinutesAgo = Instant.now().minus(5, ChronoUnit.MINUTES);
    List<HttpHeartbeat> recentHeartbeats = 
        heartbeatRepository.findByExecutedAtAfter(fiveMinutesAgo);
    
    // Aggregate by Monitor × Region
    // Return structured response
}
```

**Key Query** (`HttpHeartbeatRepository.java`):

```java
@Query("SELECT DISTINCT h FROM HttpHeartbeat h 
       LEFT JOIN FETCH h.monitor m 
       LEFT JOIN FETCH h.agent a 
       LEFT JOIN FETCH a.datacenter d 
       LEFT JOIN FETCH d.region 
       WHERE h.executedAt > :from")
List<HttpHeartbeat> findByExecutedAtAfter(Instant from);
```

**Why JOIN FETCH?**
- Loads all related entities in a single database query
- Prevents N+1 query problem (would otherwise make hundreds of queries)
- Avoids LazyInitializationException

### 3. Data Aggregation Algorithm

```java
Map<Long, Map<String, RegionHealth>> monitorRegionHealth = new HashMap<>();

for (HttpHeartbeat hb : recentHeartbeats) {
    Long monitorId = hb.getMonitor().getId();
    String regionName = hb.getAgent().getDatacenter().getRegion().getName();
    
    // Create 2D map: Monitor → Region → Health
    monitorRegionHealth
        .computeIfAbsent(monitorId, k -> new HashMap<>())
        .put(regionName, new RegionHealth(
            hb.getSuccess() ? "UP" : "DOWN",
            hb.getResponseTimeMs()
        ));
}
```

**Logic**:
1. Group heartbeats by `(monitorId, regionName)` pair
2. For each pair, extract latest status and latency
3. Build nested map structure for easy lookup

## Frontend Implementation

### 1. Component Structure

**File**: `StatusPage.tsx`

```typescript
interface StatusPageData {
  apis: ApiStatus[];
  regions: string[];
}

interface ApiStatus {
  monitorId: number;
  apiName: string;
  regionHealth: Record<string, RegionHealth>;
}

interface RegionHealth {
  status: string;  // "UP" | "DOWN"
  responseTimeMs: number;
}
```

### 2. Data Fetching

```typescript
useEffect(() => {
  const fetchStatus = async () => {
    const response = await axios.get<StatusPageData>('/api/public/status');
    setStatusData(response.data);
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
  return () => clearInterval(interval);
}, []);
```

**Auto-refresh Strategy**:
- Initial load on page mount
- Refresh every 30 seconds
- Cleanup interval on component unmount

### 3. Visual Indicators

```typescript
{health.status === 'UP' ? (
  <svg width="20" height="20">
    <circle cx="10" cy="10" r="9" fill="#34a853" />
    <path d="M8 10l2 2 4-4" stroke="white" strokeWidth="2" />
  </svg>
) : (
  <svg width="20" height="20">
    <circle cx="10" cy="10" r="9" fill="#ea4335" />
    <path d="M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" />
  </svg>
)}
<span className="response-time">{health.responseTimeMs}ms</span>
```

**Color Scheme** (Google Cloud inspired):
- **Green (#34a853)**: Service is UP
- **Red (#ea4335)**: Service is DOWN
- **Gray (#9aa0a6)**: No recent data

## Status Determination Logic

### Health Status Rules

| Condition | Status | Visual | Description |
|-----------|--------|--------|-------------|
| `success = true` && latency < warning | UP | ✓ Green | Healthy, normal latency |
| `success = true` && latency >= warning | WARNING | ⚠ Yellow | Slow response, degraded performance |
| `success = true` && latency >= critical | CRITICAL | ⚠ Orange | Very slow, critical latency |
| `success = false` | DOWN | ✗ Red | HTTP error, timeout, or failure |
| No heartbeat in 5min | Unknown | — Gray | No recent data from agent |
| Assignment removed | (not shown) | — | Monitor-agent assignment deactivated |

### Success Criteria

A heartbeat is marked as `success = true` when:
- HTTP response status code is 2xx (200-299)
- Response received within timeout threshold
- No network errors or exceptions
- Optional: Response body matches expected pattern

A heartbeat is marked as `success = false` when:
- HTTP response status code is 4xx or 5xx
- Request timeout exceeded
- DNS resolution failure
- Connection refused or network error
- TLS/SSL handshake failure

### Latency Thresholds

Each monitor can define custom thresholds:
- **Warning Threshold** (e.g., 300ms): Triggers WARNING status
- **Critical Threshold** (e.g., 800ms): Triggers CRITICAL status

These thresholds are configurable per monitor in the Schedule settings.

## Configuration

### Time Window

**Default**: Last 5 minutes

```java
Instant fiveMinutesAgo = Instant.now().minus(5, ChronoUnit.MINUTES);
```

**Rationale**:
- Agents typically check every 1-5 minutes
- Ensures at least 1 heartbeat per monitor-region
- Balance between freshness and data availability

**To modify**: Change `ChronoUnit.MINUTES` value in `StatusPageResource.java`

### Refresh Interval

**Default**: 30 seconds

```typescript
const interval = setInterval(fetchStatus, 30000);
```

**To modify**: Change milliseconds value in `StatusPage.tsx`

### Security

**Public Access**: Enabled by default

```java
// SecurityConfiguration.java
.requestMatchers(mvc.pattern("/api/public/status")).permitAll()
```

**To restrict**: Remove `.permitAll()` and add authentication requirement

## Data Model Relationships

```
HttpHeartbeat
├── id (Long)
├── executedAt (Instant) ──────────→ Timestamp of check
├── success (Boolean) ─────────────→ UP/DOWN status
├── responseTimeMs (Integer) ──────→ Latency
├── responseStatusCode (Integer)
├── errorType (String)
├── errorMessage (String)
│
├── monitor (HttpMonitor) ─────────→ API being monitored
│   ├── id (Long)
│   ├── name (String) ─────────────→ Display name
│   ├── url (String)
│   └── method (String)
│
└── agent (Agent) ─────────────────→ Monitoring agent
    ├── id (Long)
    ├── name (String)
    └── datacenter (Datacenter)
        ├── id (Long)
        └── region (Region) ───────→ Geographic location
            ├── id (Long)
            └── name (String) ─────→ Display name
```

## Performance Considerations

### Database Optimization

1. **Index on executedAt**:
   ```sql
   CREATE INDEX idx_heartbeat_executed_at ON api_heartbeats(executed_at);
   ```
   - Fast filtering of recent heartbeats
   - Critical for 5-minute window query

2. **Partitioning** (for high volume):
   ```sql
   CREATE TABLE api_heartbeats_2025_11_10
   PARTITION OF api_heartbeats
   FOR VALUES FROM ('2025-11-10') TO ('2025-11-11');
   ```
   - Partition by date for faster queries
   - Easier data retention management

### Query Optimization

- **JOIN FETCH**: Single query instead of N+1
- **DISTINCT**: Prevents duplicate rows from joins
- **@Transactional(readOnly = true)**: Optimizes transaction handling

### Frontend Optimization

- **Client-side caching**: React state holds data between refreshes
- **Conditional rendering**: Only re-render changed cells
- **Debouncing**: Prevents multiple simultaneous requests

## Troubleshooting

### Issue: LazyInitializationException

**Error**: `Could not initialize proxy [HttpMonitor#1201] - no session`

**Solution**:
1. Add `@Transactional(readOnly = true)` to controller method
2. Use `JOIN FETCH` in repository query
3. Ensure all relationships are eagerly loaded

### Issue: Empty Status Page

**Possible Causes**:
1. No heartbeats in last 5 minutes
2. Agents not running or not configured
3. Database connection issues
4. No active agent-monitor assignments

**Debug Steps**:
```sql
-- Check recent heartbeats
SELECT COUNT(*) FROM api_heartbeats 
WHERE executed_at > NOW() - INTERVAL '5 minutes';

-- Check agent-monitor assignments
SELECT a.name, m.name, am.active FROM agent_monitors am
JOIN agents a ON a.id = am.agent_id
JOIN api_monitors m ON m.id = am.monitor_id
WHERE am.active = true;

-- Check if agents are sending data
SELECT a.name, MAX(h.executed_at) as last_heartbeat
FROM api_heartbeats h
JOIN agents a ON a.id = h.agent_id
GROUP BY a.name
ORDER BY last_heartbeat DESC;
```

### Issue: Old Data Showing After Removing Assignment

**Problem**: Status page shows old heartbeat data even after deactivating agent-monitor assignment

**Solution**: The updated logic now:
1. Fetches all active agent-monitor assignments
2. Filters heartbeats to only include active assignments
3. Ignores old heartbeat data from deactivated assignments

**Verify Fix**:
```sql
-- Check if assignment is truly deactivated
SELECT * FROM agent_monitors 
WHERE agent_id = ? AND monitor_id = ? AND active = false;

-- Old heartbeats should be ignored
SELECT * FROM api_heartbeats 
WHERE agent_id = ? AND monitor_id = ? 
AND executed_at > NOW() - INTERVAL '5 minutes';
```

### Issue: Agent Not Sending Data

**Symptoms**: Status page shows "—" (dash) for a region

**Possible Causes**:
1. Agent container stopped or crashed
2. Network connectivity issues
3. API key expired or invalid
4. Agent configuration error

**Debug Steps**:
```bash
# Check if agent container is running
docker ps | grep agent

# Check agent logs
docker logs agent-va --tail 100

# Verify agent can reach API
curl -H "X-API-Key: your-api-key" http://localhost:8080/api/public/monitors/agent/1151

# Check last heartbeat from agent
psql -c "SELECT MAX(executed_at) FROM api_heartbeats WHERE agent_id = 1151;"
```

### Issue: High Latency Not Showing Warning

**Problem**: Response time is high but status shows green (UP)

**Possible Causes**:
1. Warning/critical thresholds not configured
2. Thresholds set too high

**Solution**:
```sql
-- Check monitor schedule thresholds
SELECT m.name, s.thresholds_warning, s.thresholds_critical
FROM api_monitors m
JOIN schedules s ON s.id = m.schedule_id;

-- Update thresholds if needed
UPDATE schedules SET 
  thresholds_warning = 300,
  thresholds_critical = 800
WHERE id = ?;
```

### Issue: Slow Page Load

**Solutions**:
1. Add database indexes on `executed_at`, `monitor_id`, `agent_id`
2. Reduce time window (e.g., 3 minutes instead of 5)
3. Implement caching layer (Redis)
4. Use database connection pooling

## Example Scenarios

### Scenario 1: All Services Healthy

```
Payment API:      ✓ Virginia (45ms)   ✓ Oregon (120ms)   ✓ Mumbai (156ms)
User API:         ✓ Virginia (32ms)   ✓ Oregon (98ms)    ✓ Mumbai (201ms)
Notification API: ✓ Virginia (67ms)   ✓ Oregon (87ms)    ✓ Mumbai (189ms)
```

**Interpretation**: All services operational across all regions

### Scenario 2: Regional Outage

```
Payment API:      ✓ Virginia (45ms)   ✗ Oregon (—)       ✓ Mumbai (156ms)
User API:         ✓ Virginia (32ms)   ✗ Oregon (—)       ✓ Mumbai (201ms)
Notification API: ✓ Virginia (67ms)   ✗ Oregon (—)       ✓ Mumbai (189ms)
```

**Interpretation**: Oregon region experiencing issues (network/datacenter problem)

### Scenario 3: Service-Specific Issue

```
Payment API:      ✓ Virginia (45ms)   ✓ Oregon (120ms)   ✓ Mumbai (156ms)
User API:         ✗ Virginia (—)      ✗ Oregon (—)       ✗ Mumbai (—)
Notification API: ✓ Virginia (67ms)   ✓ Oregon (87ms)    ✓ Mumbai (189ms)
```

**Interpretation**: User API is down globally (application/backend issue)

### Scenario 4: High Latency Warning

```
Payment API:      ✓ Virginia (45ms)   ⚠ Oregon (350ms)   ✓ Mumbai (156ms)
User API:         ✓ Virginia (32ms)   ⚠ Oregon (820ms)   ✓ Mumbai (201ms)
Notification API: ✓ Virginia (67ms)   ✓ Oregon (87ms)    ✓ Mumbai (189ms)
```

**Interpretation**: Oregon region experiencing high latency (network congestion or degraded performance)
- Payment API: WARNING (350ms exceeds 300ms warning threshold)
- User API: CRITICAL (820ms exceeds 800ms critical threshold)

### Scenario 5: Agent Not Reporting

```
Payment API:      ✓ Virginia (45ms)   — Oregon           ✓ Mumbai (156ms)
User API:         ✓ Virginia (32ms)   — Oregon           ✓ Mumbai (201ms)
```

**Interpretation**: Oregon agent is not sending heartbeats (agent down, network issue, or assignment removed)

### Scenario 6: Monitor Assignment Removed

**Before** (Agent assigned to all monitors):
```
Payment API:      ✓ Virginia (45ms)   ✓ Oregon (120ms)
User API:         ✓ Virginia (32ms)   ✓ Oregon (98ms)
```

**After** (Oregon agent removed from User API monitoring):
```
Payment API:      ✓ Virginia (45ms)   ✓ Oregon (120ms)
User API:         ✓ Virginia (32ms)   (Oregon not shown)
```

**Interpretation**: Old heartbeat data is ignored; only active assignments are displayed

## Future Enhancements

### Planned Features

1. **Historical View**: Show status over last 24 hours/7 days
2. **Incident Timeline**: Display ongoing and past incidents
3. **Subscription**: Email/SMS alerts for status changes
4. **SLA Metrics**: Display uptime percentage (99.9%, 99.99%)
5. **Maintenance Windows**: Show scheduled maintenance
6. **Component Dependencies**: Show service dependency graph

### Advanced Metrics

- **Latency Trends**: Show response time graphs
- **Error Rate**: Percentage of failed checks
- **Availability**: Uptime percentage per service
- **Geographic Heatmap**: Visual map of regional health

## Related Documentation

- [Agent Setup](./AGENT_API.md)
- [HTTP Monitoring](./Manual%20API%20Testing/HttpMonitoring.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Quick Start Guide](./QUICK_START.md)

## API Reference

### GET /api/public/status

**Description**: Retrieve current status of all monitored APIs across regions

**Authentication**: None (public endpoint)

**Response**: 200 OK

```json
{
  "apis": [
    {
      "monitorId": 1201,
      "apiName": "Payment API",
      "regionHealth": {
        "Virginia": {
          "status": "UP",
          "responseTimeMs": 45
        }
      }
    }
  ],
  "regions": ["Virginia", "Oregon", "Mumbai"]
}
```

**Response Fields**:
- `apis`: Array of monitored services
  - `monitorId`: Unique identifier for the monitor
  - `apiName`: Display name of the service
  - `regionHealth`: Map of region name to health status
    - `status`: "UP" or "DOWN"
    - `responseTimeMs`: Latency in milliseconds (null if DOWN)
- `regions`: Array of all region names (for table headers)

**Example Usage**:

```bash
curl http://localhost:8080/api/public/status
```

```javascript
// React/TypeScript
const response = await axios.get('/api/public/status');
console.log(response.data);
```

## Conclusion

The Status Page provides a simple, effective way to communicate service health to stakeholders. By aggregating heartbeat data from distributed agents, it offers real-time visibility into API availability across geographic regions, enabling quick incident detection and response.
