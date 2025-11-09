# UptimeO Monitoring Agent

Go-based monitoring agent that executes HTTP monitors and submits heartbeats to UptimeO server. Features resilient operation with automatic retries, persistent queue, and graceful recovery.

## Setup

### 1. Run UptimeO Server First
Start your UptimeO server where you'll create agents and monitors through the admin UI:
```bash
# Your UptimeO server must be running
# Access admin UI: http://localhost:8080
# Create agents and monitors there
# Generate API key from Settings → API Keys
```

### 2. Run Agent

**Development:**
```bash
export API_BASE_URL="http://localhost:8080"
export API_KEY="uptimeo_YOUR_API_KEY"
export AGENT_ID=2
export DATACENTER_ID=1
go build -o agent ./cmd/agent
./agent
```

**Docker:**
```bash
# Build
docker build -t api-agent .

# Run single agent
docker run --rm -p 9090:9090 \
  -e API_BASE_URL="http://host.docker.internal:8080" \
  -e API_KEY="uptimeo_YOUR_API_KEY" \
  -e AGENT_ID=1 \
  -e DATACENTER_ID=1 \
  api-agent:latest

# Run all agents (update multiple-agents-compose.yml first)
docker compose -f multiple-agents-compose.yml up -d
docker compose -f multiple-agents-compose.yml logs -f
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| API_BASE_URL | Yes | UptimeO server URL |
| API_KEY | Yes | API key from UptimeO admin |
| AGENT_ID | Yes | Agent ID from database |
| DATACENTER_ID | Yes | Datacenter ID from database |
| HEALTH_PORT | No | Health check port (default: 9090) |
| QUEUE_PATH | No | Queue file path (default: /data/queue) |

## Resilience Features

- **Automatic Retry**: Exponential backoff for API failures
- **Persistent Queue**: Heartbeats saved to disk if API unavailable
- **Graceful Recovery**: Auto-flush queue when API returns
- **No Data Loss**: Agent never crashes due to API downtime

**Test queue persistence:**
```bash
# 1. Start agent with API down
./run-agent.sh  # API not running

# 2. Watch queue build: data/test-agent/heartbeat_queue_agent_X.json

# 3. Start API, watch queue flush
# Logs: "Successfully flushed X queued heartbeats"
```

## Validation

**Check heartbeats in database:**
```sql
-- Recent heartbeats
SELECT id, monitor_id, agent_id, executed_at, success, response_time_ms 
FROM api_heartbeats 
ORDER BY executed_at DESC LIMIT 10;

-- Verify agent_id and monitor_id populated
SELECT COUNT(*) FROM api_heartbeats WHERE agent_id IS NULL OR monitor_id IS NULL;
```

**Health check:**
```bash
curl http://localhost:9090/healthz
```

## Troubleshooting

**Agent won't start:**
- Verify API_BASE_URL is accessible
- Check API_KEY is valid
- Ensure AGENT_ID exists in database

**No heartbeats:**
- Check agent has assigned monitors in UptimeO admin
- Verify monitors are reachable from agent
- Review logs for errors

**Queue not flushing:**
- Check API connectivity
- Verify API_KEY permissions
- Review logs: "Failed to flush heartbeat queue"
