# Uptime Agent (Standalone Mode)

Monitors HTTP endpoints and stores heartbeats directly in PostgreSQL.

## Quick Start

### Run as Developer

```bash
# 1. Start PostgreSQL with data
cd docker/standalone
docker compose -f postgres.yml up -d

# 2. Set environment variables
export DB_CONN_STRING="postgres://uptimeo:uptimeo@localhost:5432/uptimeo?sslmode=disable"
export AGENT_ID=1
export CONFIG_RELOAD_INTERVAL=1m
export HEALTH_PORT=8071
export QUEUE_PATH=./data/queue

# 3. Run agent
cd ../../uptime-o-agent
go run cmd/agent/main.go
```

## Build

```bash
# Build binary
go build -o agent cmd/agent/main.go

# Build Docker image
docker build -t uptimeo-agent .
```

### Run as Container

```bash
# 1. Start PostgreSQL
cd docker/standalone
docker compose -f postgres.yml up -d

# 2. Start agents (with HA)
docker compose -f agents.yml up -d

# 3. Check logs
docker logs agent-va-1
```

## Database Initialization

### Automatic (Recommended)
PostgreSQL auto-initializes on first start:
```bash
docker compose -f postgres.yml up -d
```

Loads:
- Schema: `sql/uptimeo.sql`
- Data: `sql/data.sql` (9 agents, 4 monitors)

### Manual
```bash
psql -h localhost -U uptimeo -d uptimeo -f sql/uptimeo.sql
psql -h localhost -U uptimeo -d uptimeo -f sql/data.sql
```

## Configuration

### Environment Variables

```bash
# Required
DB_CONN_STRING="postgres://uptimeo:uptimeo@localhost:5432/uptimeo?sslmode=disable"
AGENT_ID=1

# Optional (with defaults)
HEALTH_PORT=8080                    # Default: 8080
CONFIG_RELOAD_INTERVAL=1m           # Default: 24h (supports: 30s, 1m, 5m, 1h, 24h)
QUEUE_PATH=./data/queue             # Default: ./data/queue
```

### CONFIG_RELOAD_INTERVAL Examples

```bash
# Check for config changes every 30 seconds
export CONFIG_RELOAD_INTERVAL=30s

# Check every 1 minute (recommended for development)
export CONFIG_RELOAD_INTERVAL=1m

# Check every 5 minutes
export CONFIG_RELOAD_INTERVAL=5m

# Check every hour
export CONFIG_RELOAD_INTERVAL=1h

# Check once per day (default)
export CONFIG_RELOAD_INTERVAL=24h

# Or don't set it (uses default 24h)
# unset CONFIG_RELOAD_INTERVAL
```

**Note:** When agent has zero monitors, it automatically checks every 5 minutes regardless of this setting.

## Partition Management

### Auto-Partitioning
✅ **Enabled by default** - Daily partitions created automatically

The `api_heartbeats` table is partitioned by date for performance.

### How It Works
- Partition created on first heartbeat of the day
- Function: `create_daily_partition()` in schema
- No manual intervention needed

### Check Partitions
```sql
-- List all partitions
SELECT child.relname 
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'api_heartbeats'
ORDER BY child.relname;
```

### Manual Partition (if needed)
```sql
SELECT create_daily_partition();
```

## Data Retention

### Automatic Cleanup
Old data is automatically deleted based on `RETENTION_DAYS` (default: 30 days).

### Configure Retention
Edit `docker/standalone/sql/cleanup-30-days.sql` and change the interval:

```sql
-- Change from 30 days to 90 days
INTERVAL '90 days'

-- Or 7 days
INTERVAL '7 days'
```

Then reload:
```bash
psql -h localhost -U uptimeo -d uptimeo -f sql/cleanup-30-days.sql
```

### Manual Cleanup
```sql
-- Delete data older than 30 days
DELETE FROM api_heartbeats 
WHERE executed_at < NOW() - INTERVAL '30 days';

-- Drop old partitions
DROP TABLE IF EXISTS api_heartbeats_2025_10_01;
```

### Setup pg_cron (Optional)
For automatic cleanup:
```bash
psql -h localhost -U uptimeo -d uptimeo -f sql/cleanup-30-days.sql
```

This schedules:
- Hourly: Delete old rows
- Daily: Drop old partitions

## High Availability

Run multiple replicas with same AGENT_ID:
```bash
docker compose -f agents.yml up -d
```

- Only one instance monitors (leader)
- Others wait as standby
- Automatic failover if leader crashes
- ~30 seconds recovery time

## Verify Setup

```bash
# Check agents
docker exec -it postgres psql -U uptimeo -d uptimeo -c "SELECT * FROM agents;"

# Check monitors
docker exec -it postgres psql -U uptimeo -d uptimeo -c "SELECT * FROM http_monitors;"

# Check heartbeats
docker exec -it postgres psql -U uptimeo -d uptimeo -c "SELECT COUNT(*) FROM api_heartbeats;"

# Check partitions
docker exec -it postgres psql -U uptimeo -d uptimeo -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'api_heartbeats_%';"
```

## Add New Monitor

```sql
-- Add monitor
INSERT INTO http_monitors (name, method, type, url, schedule_id) 
VALUES ('Google', 'GET', 'HTTPS', 'https://www.google.com', 1);

-- Assign to agent
INSERT INTO agent_monitors (agent_id, monitor_id, active, created_by, created_date)
VALUES (1, 5, TRUE, 'admin', CURRENT_TIMESTAMP);
```

Agent picks up changes within 1 minute (or configured interval).

## Troubleshooting

### No heartbeats
```bash
# Check agent logs
docker logs agent-va-1

# Check if agent acquired lock
docker logs agent-va-1 | grep "Acquired leadership"

# Check database connection
docker exec agent-va-1 wget -q --spider postgres:5432 || echo "Cannot reach DB"
```

### Partition missing
```sql
-- Create today's partition
SELECT create_daily_partition();
```

### Reset everything
```bash
docker compose -f postgres.yml down -v
docker compose -f postgres.yml up -d
```


