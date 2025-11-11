# Status Page Edge Cases & Solutions

## Overview

This document explains how the status page handles various edge cases and failure scenarios to ensure accurate, real-time status reporting.

## Edge Cases Handled

### 1. Agent Not Sharing Data

**Scenario**: Agent is configured but not sending heartbeats

**Possible Causes**:
- Agent container stopped/crashed
- Network connectivity issues between agent and server
- API key expired or invalid
- Agent configuration error (wrong API_BASE_URL, AGENT_ID)

**Status Page Behavior**:
```
Payment API:  ✓ Virginia (45ms)   — Oregon   ✓ Mumbai (156ms)
```
- Shows **"—" (dash)** for the region where agent is not reporting
- Does NOT show old/stale data
- Does NOT show green checkmark (which would be misleading)

**Implementation**:
```java
// Only show regions with active assignments
for (String region : expectedRegions) {
    regionHealth.putIfAbsent(region, null);  // null = show "—"
}
```

**Detection Logic**:
- Status page queries heartbeats from last 5 minutes
- If no heartbeat found for an active agent-monitor assignment → shows "—"
- This indicates agent is not reporting (vs. service being down)

---

### 2. High Latency (Degraded Performance)

**Scenario**: API is responding but very slowly

**Status Indicators**:

| Latency | Status | Visual | Color | Description |
|---------|--------|--------|-------|-------------|
| < 300ms | UP | ✓ | Green (#34a853) | Normal, healthy |
| 300-799ms | WARNING | ⚠ | Yellow (#fbbc04) | Slow, degraded |
| ≥ 800ms | CRITICAL | ⚠ | Orange (#ff6d00) | Very slow, critical |
| Timeout/Error | DOWN | ✗ | Red (#ea4335) | Failed |

**Status Page Behavior**:
```
Payment API:  ✓ Virginia (45ms)   ⚠ Oregon (350ms)   ⚠ Mumbai (820ms)
              GREEN                YELLOW             ORANGE
```

**Implementation**:
```java
private String determineStatus(HttpHeartbeat hb) {
    if (!Boolean.TRUE.equals(hb.getSuccess())) {
        return "DOWN";
    }
    
    Integer responseTime = hb.getResponseTimeMs();
    Integer warningThreshold = hb.getWarningThresholdMs();
    Integer criticalThreshold = hb.getCriticalThresholdMs();
    
    if (criticalThreshold != null && responseTime >= criticalThreshold) {
        return "CRITICAL";  // Orange
    }
    
    if (warningThreshold != null && responseTime >= warningThreshold) {
        return "WARNING";  // Yellow
    }
    
    return "UP";  // Green
}
```

**Configuration**:
Thresholds are set per monitor in the Schedule:
```sql
UPDATE schedules SET 
  thresholds_warning = 300,   -- Yellow at 300ms
  thresholds_critical = 800   -- Orange at 800ms
WHERE id = ?;
```

**Why This Matters**:
- Distinguishes between "down" and "slow"
- Alerts teams to performance degradation before complete failure
- Helps identify network congestion or resource constraints

---

### 3. API Down (Agent Still Sends Data)

**Scenario**: Monitored API is down, but agent is working correctly

**Agent Behavior**:
- Agent attempts to call the API
- Receives error (timeout, 5xx, connection refused)
- **Still sends heartbeat** with `success = false`
- Includes error details (errorType, errorMessage)

**Status Page Behavior**:
```
Payment API:  ✓ Virginia (45ms)   ✗ Oregon   ✓ Mumbai (156ms)
```
- Shows **red X** for the failed region
- Does NOT show latency (since request failed)
- Clearly indicates service is DOWN (not just slow)

**Heartbeat Data**:
```json
{
  "success": false,
  "responseStatusCode": 503,
  "errorType": "HTTP_ERROR",
  "errorMessage": "Service Unavailable",
  "responseTimeMs": null
}
```

**Implementation**:
```java
if (!Boolean.TRUE.equals(hb.getSuccess())) {
    return "DOWN";  // Red X, regardless of latency
}
```

**Validation**: ✅ Confirmed working correctly

---

### 4. Monitor Assignment Removed (Stale Data Issue)

**Scenario**: Agent-monitor assignment was active, then deactivated, but old heartbeats still exist in database

**Problem (Before Fix)**:
```
Time T0: Agent-VA monitors Payment API → ✓ Virginia (45ms)
Time T1: Assignment removed (active = false)
Time T2: Status page still shows → ✓ Virginia (45ms)  ❌ WRONG!
```
- Old heartbeat data (< 5 minutes) still in database
- Status page incorrectly showed old status
- Misleading: suggests monitoring is still active

**Solution (After Fix)**:
```java
// 1. Get all ACTIVE agent-monitor assignments
List<AgentMonitor> activeAssignments = agentMonitorRepository.findAll()
    .stream()
    .filter(am -> Boolean.TRUE.equals(am.getActive()))
    .collect(Collectors.toList());

// 2. Build expected monitor-region matrix
Map<Long, Set<String>> expectedMonitorRegions = new HashMap<>();
for (AgentMonitor am : activeAssignments) {
    expectedMonitorRegions
        .computeIfAbsent(am.getMonitor().getId(), k -> new HashSet<>())
        .add(am.getAgent().getRegion().getName());
}

// 3. Filter heartbeats to only include active assignments
for (HttpHeartbeat hb : recentHeartbeats) {
    boolean isActiveAssignment = activeAssignments.stream()
        .anyMatch(am -> 
            am.getMonitor().getId().equals(hb.getMonitor().getId()) && 
            am.getAgent().getId().equals(hb.getAgent().getId()) &&
            Boolean.TRUE.equals(am.getActive())
        );
    
    if (!isActiveAssignment) {
        continue;  // Skip old data from removed assignments
    }
    
    // Process heartbeat...
}
```

**Status Page Behavior (After Fix)**:
```
Before removal:
Payment API:  ✓ Virginia (45ms)   ✓ Oregon (120ms)

After removal (Oregon assignment deactivated):
Payment API:  ✓ Virginia (45ms)   (Oregon column not shown)
```

**Key Points**:
- Only shows regions with **active** assignments
- Ignores old heartbeat data from deactivated assignments
- Prevents misleading "green" status for unmonitored regions
- Dynamic: status page adapts to current configuration

**Database State**:
```sql
-- Assignment deactivated
SELECT * FROM agent_monitors 
WHERE monitor_id = 1201 AND agent_id = 1151;
-- Result: active = false

-- Old heartbeats still exist (< 5 min)
SELECT * FROM api_heartbeats 
WHERE monitor_id = 1201 AND agent_id = 1151
AND executed_at > NOW() - INTERVAL '5 minutes';
-- Result: 3 rows (but ignored by status page)
```

---

## Status Determination Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Fetch Active Agent-Monitor Assignments                  │
│    → Defines which monitor-region pairs SHOULD be monitored│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Fetch Recent Heartbeats (last 5 minutes)                │
│    → Raw monitoring data from agents                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Filter Heartbeats by Active Assignments                 │
│    → Ignore data from deactivated assignments              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. For Each Monitor-Region Pair:                           │
│                                                             │
│    Has heartbeat?                                           │
│    ├─ NO  → Status: Unknown (—)                            │
│    └─ YES → Check success flag                             │
│             ├─ false → Status: DOWN (✗ Red)                │
│             └─ true  → Check latency                       │
│                        ├─ >= critical → CRITICAL (⚠ Orange)│
│                        ├─ >= warning  → WARNING (⚠ Yellow) │
│                        └─ < warning   → UP (✓ Green)       │
└─────────────────────────────────────────────────────────────┘
```

## Status Matrix

| Condition | Active Assignment | Heartbeat Exists | Success | Latency | Status | Visual |
|-----------|-------------------|------------------|---------|---------|--------|--------|
| Normal operation | ✓ | ✓ | true | < warning | UP | ✓ Green |
| Slow response | ✓ | ✓ | true | ≥ warning | WARNING | ⚠ Yellow |
| Critical latency | ✓ | ✓ | true | ≥ critical | CRITICAL | ⚠ Orange |
| API down | ✓ | ✓ | false | N/A | DOWN | ✗ Red |
| Agent not reporting | ✓ | ✗ | N/A | N/A | Unknown | — Gray |
| Assignment removed | ✗ | ✓ (old) | N/A | N/A | (not shown) | — |
| Assignment removed | ✗ | ✗ | N/A | N/A | (not shown) | — |

## Real-World Example

**Setup**:
- 2 Monitors: Payment API, User API
- 3 Agents: Virginia, Oregon, Mumbai
- Initial: All agents monitor both APIs

**Timeline**:

### T0: All Healthy
```
Payment API:  ✓ Virginia (45ms)   ✓ Oregon (120ms)   ✓ Mumbai (156ms)
User API:     ✓ Virginia (32ms)   ✓ Oregon (98ms)    ✓ Mumbai (201ms)
```

### T1: Oregon Agent Crashes
```
Payment API:  ✓ Virginia (45ms)   — Oregon           ✓ Mumbai (156ms)
User API:     ✓ Virginia (32ms)   — Oregon           ✓ Mumbai (201ms)
```
- Oregon shows "—" (agent not reporting)
- Does NOT show old green status (would be misleading)

### T2: Mumbai Experiences High Latency
```
Payment API:  ✓ Virginia (45ms)   — Oregon           ⚠ Mumbai (820ms)
User API:     ✓ Virginia (32ms)   — Oregon           ⚠ Mumbai (950ms)
```
- Mumbai shows orange (CRITICAL latency)
- Indicates performance degradation, not complete failure

### T3: Payment API Goes Down in Virginia
```
Payment API:  ✗ Virginia          — Oregon           ⚠ Mumbai (820ms)
User API:     ✓ Virginia (32ms)   — Oregon           ⚠ Mumbai (950ms)
```
- Virginia shows red X for Payment API (service down)
- User API still green in Virginia (different service)

### T4: Admin Removes Oregon Assignment for User API
```
Payment API:  ✗ Virginia          — Oregon           ⚠ Mumbai (820ms)
User API:     ✓ Virginia (32ms)   (not shown)        ⚠ Mumbai (950ms)
```
- Oregon column removed for User API
- Old heartbeat data ignored
- Status page reflects current configuration

## Testing Edge Cases

### Test 1: Agent Not Reporting
```bash
# Stop agent
docker stop agent-oregon

# Wait 5+ minutes for old heartbeats to expire
sleep 300

# Check status page
curl http://localhost:8080/api/public/status

# Expected: Oregon shows "—" for all monitors
```

### Test 2: High Latency
```bash
# Simulate slow API (add delay)
# In your API, add: Thread.sleep(500);

# Agent will report success=true but high responseTimeMs
# Expected: Yellow or orange indicator based on threshold
```

### Test 3: Remove Assignment
```sql
-- Deactivate assignment
UPDATE agent_monitors 
SET active = false 
WHERE agent_id = 1151 AND monitor_id = 1201;

-- Check status page immediately
-- Expected: Region not shown for that monitor (even if heartbeats < 5min old)
```

### Test 4: API Down
```bash
# Stop the monitored API
docker stop payment-api

# Agent will attempt to connect and fail
# Expected: Red X with no latency shown
```

## Configuration Best Practices

### 1. Set Appropriate Thresholds
```sql
-- For internal APIs (same datacenter)
UPDATE schedules SET 
  thresholds_warning = 100,   -- 100ms
  thresholds_critical = 300   -- 300ms
WHERE name = 'internal-api-schedule';

-- For external APIs (cross-region)
UPDATE schedules SET 
  thresholds_warning = 500,   -- 500ms
  thresholds_critical = 1500  -- 1.5s
WHERE name = 'external-api-schedule';
```

### 2. Monitor Check Frequency
```sql
-- Critical services: Check every 1 minute
UPDATE schedules SET interval = 60 WHERE name = 'critical';

-- Non-critical: Check every 5 minutes
UPDATE schedules SET interval = 300 WHERE name = 'standard';
```

### 3. Data Retention
```sql
-- Keep heartbeats for 30 days
DELETE FROM api_heartbeats 
WHERE executed_at < NOW() - INTERVAL '30 days';

-- Run daily via cron job
```

## Monitoring the Monitors

### Alert on Agent Failures
```sql
-- Find agents that haven't reported in 10 minutes
SELECT a.name, MAX(h.executed_at) as last_heartbeat
FROM agents a
LEFT JOIN api_heartbeats h ON h.agent_id = a.id
GROUP BY a.name
HAVING MAX(h.executed_at) < NOW() - INTERVAL '10 minutes'
   OR MAX(h.executed_at) IS NULL;
```

### Alert on High Failure Rates
```sql
-- Find monitors with >50% failure rate in last hour
SELECT m.name, 
       COUNT(*) as total_checks,
       SUM(CASE WHEN h.success = false THEN 1 ELSE 0 END) as failures,
       ROUND(100.0 * SUM(CASE WHEN h.success = false THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate
FROM api_heartbeats h
JOIN api_monitors m ON m.id = h.monitor_id
WHERE h.executed_at > NOW() - INTERVAL '1 hour'
GROUP BY m.name
HAVING failure_rate > 50;
```

## Conclusion

The status page now correctly handles all edge cases:

1. ✅ **Agent not reporting** → Shows "—" (not old data)
2. ✅ **High latency** → Shows yellow/orange warning (not just green/red)
3. ✅ **API down** → Agent still sends data with success=false
4. ✅ **Assignment removed** → Old data ignored, region not shown

This ensures the status page always reflects the **current, accurate state** of your monitored services.
