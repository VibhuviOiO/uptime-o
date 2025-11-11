# Standalone Mode Setup

## Overview
Standalone mode runs agents that connect directly to PostgreSQL without the backend API.

## Quick Start

### 1. Create Docker Network
```bash
docker network create uptimeo
```

### 2. Start PostgreSQL
```bash
cd docker/standalone
docker compose -f postgres.yml up -d
```

This will:
- Create PostgreSQL container
- Initialize schema from `sql/uptimeo.sql`
- Load sample data from `sql/data.sql`
- Create 9 agents (VA, NY, RDN, CHI, SF, LON, DAM, STO, SYD)
- Assign 4 monitors to each agent

### 3. Verify Database
```bash
docker exec -it postgres psql -U uptimeo -d uptimeo
```

Check data:
```sql
-- Check agents
SELECT id, name, datacenter_id FROM agents;

-- Check monitors
SELECT id, name, method, url FROM http_monitors;

-- Check agent-monitor assignments
SELECT a.name as agent, m.name as monitor 
FROM agent_monitors am
JOIN agents a ON am.agent_id = a.id
JOIN http_monitors m ON am.monitor_id = m.id
WHERE am.active = TRUE
ORDER BY a.id, m.id;

-- Check schedules
SELECT * FROM schedules;
```

### 4. Start Agent
```bash
# Edit agents.yml to set AGENT_ID (1-9)
docker compose -f agents.yml up -d
```

### 5. Start Status Page
```bash
docker compose -f status-page.yml up -d
```

Access at: http://localhost:8077

## Database Schema

### Core Tables
- `schedules` - Monitor execution schedules
- `http_monitors` - HTTP/HTTPS monitors
- `regions` - Geographic regions
- `datacenters` - Datacenter locations
- `agents` - Agent instances
- `agent_monitors` - Agent-to-monitor assignments
- `api_heartbeats` - Partitioned heartbeat results

### Sample Data

**Agents (9 total)**
| ID | Name | Datacenter |
|----|------|------------|
| 1 | VA Agent | Virginia |
| 2 | NY Agent | New York |
| 3 | RDN Agent | Richardson |
| 4 | CHI Agent | Chicago |
| 5 | SF Agent | San Francisco |
| 6 | LON Agent | London |
| 7 | DAM Agent | Amsterdam |
| 8 | STO Agent | Stockholm |
| 9 | SYD Agent | Sydney |

**Monitors (4 total)**
| ID | Name | Method | URL |
|----|------|--------|-----|
| 1 | IPfy Public IP Info | GET | https://api.ipify.org?format=json |
| 2 | Official Joke API | GET | https://official-joke-api.appspot.com/random_joke |
| 3 | Realty US Search | POST | https://realty-in-us.p.rapidapi.com/... |
| 4 | Realty Auto-Complete | GET | https://realty-in-us.p.rapidapi.com/... |

All monitors are assigned to all agents by default.

## Adding New Monitors

### Option 1: Direct SQL
```sql
-- Add monitor
INSERT INTO http_monitors (name, method, type, url, schedule_id) 
VALUES ('My Monitor', 'GET', 'HTTPS', 'https://example.com', 1);

-- Assign to agent
INSERT INTO agent_monitors (agent_id, monitor_id, active, created_by, created_date)
VALUES (1, 5, TRUE, 'admin', CURRENT_TIMESTAMP);
```

### Option 2: Using psql
```bash
docker exec -it postgres psql -U uptimeo -d uptimeo -c "
INSERT INTO http_monitors (name, method, type, url, schedule_id) 
VALUES ('Google', 'GET', 'HTTPS', 'https://www.google.com', 1) 
RETURNING id;
"

# Use returned ID to assign to agent
docker exec -it postgres psql -U uptimeo -d uptimeo -c "
INSERT INTO agent_monitors (agent_id, monitor_id, active, created_by, created_date)
VALUES (1, 5, TRUE, 'admin', CURRENT_TIMESTAMP);
"
```

Agent will pick up new monitors within 5 minutes (or configured `CONFIG_RELOAD_INTERVAL`).

## Partition Management

### Create Today's Partition
```sql
SELECT create_daily_partition();
```

### Manual Partition Creation
```sql
CREATE TABLE IF NOT EXISTS api_heartbeats_2025_11_15
PARTITION OF api_heartbeats
FOR VALUES FROM ('2025-11-15 00:00:00') TO ('2025-11-16 00:00:00');
```

### View Partitions
```sql
SELECT child.relname as partition_name
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'api_heartbeats'
ORDER BY child.relname;
```

## Troubleshooting

### Agent Not Picking Up Monitors
```sql
-- Check agent exists
SELECT * FROM agents WHERE id = 1;

-- Check monitor assignments
SELECT * FROM agent_monitors WHERE agent_id = 1 AND active = TRUE;

-- Check monitors exist
SELECT * FROM http_monitors WHERE id IN (
  SELECT monitor_id FROM agent_monitors WHERE agent_id = 1
);
```

### No Heartbeats
```sql
-- Check recent heartbeats
SELECT monitor_id, agent_id, executed_at, success, response_time_ms
FROM api_heartbeats
ORDER BY executed_at DESC
LIMIT 10;

-- Check partition exists
SELECT create_daily_partition();
```

### Reset Data
```bash
docker compose -f postgres.yml down -v
docker compose -f postgres.yml up -d
```

## Environment Variables

### Agent Configuration
```bash
DB_CONN_STRING=postgres://uptimeo:uptimeo@postgres:5432/uptimeo?sslmode=disable
AGENT_ID=1                    # Agent ID (1-9)
HEALTH_PORT=8080              # Health check port
CONFIG_RELOAD_INTERVAL=1m     # How often to check for config changes
QUEUE_PATH=./data/queue       # Queue file location for resilience
```

### Status Page Configuration
```bash
DB_CONN_STRING=postgres://uptimeo:uptimeo@postgres:5432/uptimeo?sslmode=disable
VITE_API_BASE_URL=/
NAVBAR_TITLE=Uptime Status
STATUS_PAGE_TITLE=Uptime Status
STATUS_PAGE_SUBTITLE=Real-time monitoring dashboard
```
