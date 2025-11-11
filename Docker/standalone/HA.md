# High Availability (HA) Setup

## Problem
Single agent instance = single point of failure. If agent crashes, monitoring stops.

## Solution
Run multiple replicas of the same agent with PostgreSQL advisory lock-based leader election.

## How It Works

### Leader Election
1. **Multiple instances** of same agent (same AGENT_ID) run simultaneously
2. **Only one becomes leader** using PostgreSQL advisory lock
3. **Leader performs monitoring** while others wait
4. **Automatic failover** if leader crashes/stops

### PostgreSQL Advisory Locks
```sql
-- Try to acquire lock (non-blocking)
SELECT pg_try_advisory_lock(agent_id);  -- Returns true/false

-- Release lock
SELECT pg_advisory_unlock(agent_id);
```

- Lock is **per agent ID** (not per instance)
- Lock is **session-based** - automatically released if connection drops
- Lock is **lightweight** - no table writes needed

## Behavior

### Normal Operation
```
agent-va-1: [INFO] Acquired leadership lock for agent 1
agent-va-1: [INFO] Starting monitoring...
agent-va-2: [INFO] Another instance is active. Waiting...
agent-va-2: [INFO] Another instance is active. Waiting...
```

### Failover Scenario
```
# Leader crashes
agent-va-1: [CRASHED]

# Lock automatically released by PostgreSQL
# Standby detects and acquires lock
agent-va-2: [INFO] Acquired leadership lock for agent 1
agent-va-2: [INFO] Starting monitoring...
```

### Recovery Time
- **Detection**: 30 seconds (standby retry interval)
- **Takeover**: Immediate (lock acquisition)
- **Total**: ~30 seconds maximum downtime

## Configuration

### Run 2 Replicas (Recommended)
```bash
docker compose -f agents.yml up -d
```

This starts:
- `agent-va-1` and `agent-va-2` (both AGENT_ID=1)
- `agent-ny-1` and `agent-ny-2` (both AGENT_ID=2)

### Run 3+ Replicas
```yaml
services:
  agent-va-3:
    image: uptimeo-agent:latest
    environment:
      AGENT_ID: "1"  # Same as agent-va-1 and agent-va-2
      # ... other config
```

### Scale Dynamically
```bash
docker compose -f agents.yml up -d --scale agent-va-1=3
```

## Monitoring HA Status

### Check Active Leader
```sql
-- View active advisory locks
SELECT 
  locktype,
  objid as agent_id,
  pid,
  granted
FROM pg_locks
WHERE locktype = 'advisory';
```

### Check Agent Logs
```bash
# Leader
docker logs agent-va-1 | grep "Acquired leadership"

# Standby
docker logs agent-va-2 | grep "Another instance is active"
```

### Health Checks
```bash
# Both should be healthy
curl http://localhost:8080/healthz  # agent-va-1
curl http://localhost:8081/healthz  # agent-va-2 (if exposed)
```

## Testing Failover

### Kill Leader
```bash
# Stop leader
docker stop agent-va-1

# Watch standby logs
docker logs -f agent-va-2
# Should see: "Acquired leadership lock for agent 1"
```

### Restart Leader
```bash
# Start original leader
docker start agent-va-1

# It becomes standby now
docker logs agent-va-1
# Should see: "Another instance is active. Waiting..."
```

## Architecture

```
┌─────────────┐     ┌─────────────┐
│ agent-va-1  │     │ agent-va-2  │
│ (Leader)    │     │ (Standby)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │  Advisory Lock    │
       └────────┬──────────┘
                │
         ┌──────▼──────┐
         │  PostgreSQL │
         │             │
         │  Lock: 1    │ ← Only one can hold
         └─────────────┘
```

## Benefits

✅ **Zero Data Loss** - Queue persists heartbeats during failover
✅ **Fast Failover** - ~30 seconds maximum
✅ **No Split-Brain** - PostgreSQL guarantees single leader
✅ **Automatic Recovery** - No manual intervention needed
✅ **Resource Efficient** - Standby uses minimal resources

## Limitations

⚠️ **Database Dependency** - PostgreSQL must be available for leader election
⚠️ **Not Distributed** - All replicas must connect to same PostgreSQL
⚠️ **Lock Granularity** - Per agent ID (not per monitor)

## Best Practices

1. **Run 2 replicas minimum** - One leader, one standby
2. **Different hosts** - Deploy replicas on different machines/zones
3. **Monitor locks** - Alert if no agent holds lock for >1 minute
4. **Health checks** - Ensure both replicas are healthy
5. **Resource limits** - Set memory/CPU limits to prevent resource exhaustion

## Troubleshooting

### Both Agents Stuck Waiting
```sql
-- Check for stale locks
SELECT * FROM pg_locks WHERE locktype = 'advisory';

-- Force release (if needed)
SELECT pg_advisory_unlock_all();
```

### Frequent Leader Changes
- Check network stability
- Increase retry interval (currently 30s)
- Check PostgreSQL connection pool settings

### No Agent Acquiring Lock
```bash
# Check database connectivity
docker exec agent-va-1 wget -q --spider postgres:5432 || echo "Cannot reach DB"

# Check logs for errors
docker logs agent-va-1 | grep "Failed to acquire lock"
```
