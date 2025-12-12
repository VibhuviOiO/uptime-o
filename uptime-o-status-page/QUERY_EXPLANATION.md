# Status Calculation Flow

## 1. Database Query

```sql
-- Get last 20 heartbeats per monitor per region
WITH latest_heartbeats AS (
  SELECT
    h.monitor_id,
    r.name as region_name,
    m.name as monitor_name,
    h.success,
    (h.response_time_ms + h.dns_lookup_ms + h.tcp_connect_ms + h.tls_handshake_ms) AS total_latency_ms,
    ROW_NUMBER() OVER (PARTITION BY h.monitor_id, d.region_id ORDER BY h.executed_at DESC) as rn
  FROM api_heartbeats h
  JOIN agents a ON h.agent_id = a.id
  JOIN datacenters d ON a.datacenter_id = d.id
  JOIN regions r ON d.region_id = r.id
  JOIN api_monitors m ON h.monitor_id = m.id
  WHERE h.executed_at >= NOW() - INTERVAL '10 minutes'
)
SELECT
  monitor_name,
  region_name,
  COUNT(*) as total_calls,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_calls,
  ROUND((SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as uptime_percent,
  ROUND(AVG(total_latency_ms), 2) as avg_latency_ms
FROM latest_heartbeats
WHERE rn <= 20
GROUP BY monitor_id, monitor_name, region_name;
```

**Output:**
```
monitor_name    | region_name | total_calls | successful_calls | uptime_percent | avg_latency_ms
----------------+-------------+-------------+------------------+----------------+---------------
RECs Build Info | Narsingi    | 20          | 20               | 100.00         | 2370.05
```

## 2. Status Calculation

```typescript
successRate = 20 / 20 = 1.0 (100%)
avg_latency = 2370.05

if (successRate < 0.6)        → DOWN
else if (successRate < 0.8)   → DEGRADED
else if (avg_latency > 1000)  → CRITICAL ✓
else if (avg_latency > 500)   → WARNING
else                          → UP
```

Result: `CRITICAL`

## 3. API Response

```bash
curl http://localhost:8077/api/public/status | jq
```

```json
{
  "apis": [{
    "monitorId": 1001,
    "apiName": "RECs Build Info",
    "regionHealth": {
      "Narsingi": {
        "status": "CRITICAL",
        "responseTimeMs": 2370,
        "successRate": 100,
        "totalCalls": 20
      }
    }
  }],
  "regions": ["Narsingi"]
}
```

## 4. UI Display

```
Service         | Narsingi
----------------+----------
RECs Build Info | ⚠️ 2370ms
                |    100%
```

## Status Rules

```
< 60%           → DOWN
60-80%          → DEGRADED
≥ 80% + >1000ms → CRITICAL
≥ 80% + >500ms  → WARNING
≥ 80% + ≤500ms  → UP
```

## Verify

```bash
# 1. Raw data
docker exec -i postgres psql -U uptimeo -d uptimeo -c \
  "SELECT success, response_time_ms + dns_lookup_ms + tcp_connect_ms + tls_handshake_ms as total_ms 
   FROM api_heartbeats WHERE monitor_id = 1001 ORDER BY executed_at DESC LIMIT 20;"

# 2. Calculate
docker exec -i postgres psql -U uptimeo -d uptimeo -c \
  "SELECT COUNT(*), SUM(CASE WHEN success THEN 1 ELSE 0 END), 
   ROUND(AVG(response_time_ms + dns_lookup_ms + tcp_connect_ms + tls_handshake_ms), 2) 
   FROM (SELECT * FROM api_heartbeats WHERE monitor_id = 1001 ORDER BY executed_at DESC LIMIT 20) sub;"

# 3. API
curl http://localhost:8077/api/public/status

# 4. UI
open http://localhost:8077
```

## Config

```bash
# backend/.env
STATUS_SAMPLE_SIZE=20
SUCCESS_THRESHOLD_HIGH=0.8
SUCCESS_THRESHOLD_LOW=0.6
INDICATOR_WARN_THRESHOLD=500
INDICATOR_DANGER_THRESHOLD=1000
```


 docker exec postgres psql -U uptimeo -d uptimeo -c "SELECT DATE_TRUNC('minute', executed_at) as minute, COUNT(*) as heartbeat_count FROM api_heartbeats WHERE monitor_id = 1001 AND executed_at > NOW() - INTERVAL '5 minutes' GROUP BY minute ORDER BY minute DESC;"