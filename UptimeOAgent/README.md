# UptimeOAgent

UptimeOAgent is a Go-based monitoring agent that performs HTTP requests based on configured monitors and schedules, collecting detailed metrics and saving heartbeats to PostgreSQL. It supports extensibility for TCP and Ping monitors.

## Features

- HTTP monitoring with detailed timing metrics (DNS, TCP, TLS, TTFB)
- Configurable schedules and thresholds
- PostgreSQL storage for heartbeats
- Logging with structured JSON
- Extensible monitor interface
- Docker support for easy deployment
- High availability with distributed locking for failover

## Prerequisites

- Go 1.21+
- PostgreSQL 17+
- Docker and Docker Compose (for containerized runs)

## Development Setup

1. **Clone and Setup Project**:
   ```bash
   cd /Users/jinnabalaiah/algonomy/practice/rrstatus
   git clone <repo> UptimeOAgent  # If not already cloned
   cd UptimeOAgent
   go mod tidy
   ```

2. **Setup PostgreSQL**:
   - Install PostgreSQL locally or use Docker: `docker run -d --name postgres -e POSTGRES_USER=inframirror -e POSTGRES_PASSWORD=inframirror -e POSTGRES_DB=inframirror -p 5432:5432 postgres:17`
   - Execute SQL: `psql -h localhost -U inframirror -d inframirror -f ../plan/sql/inframirror.sql` and `psql -h localhost -U inframirror -d inframirror -f ../plan/sql/data.sql`

3. **Run the Agent**:
   ```bash
   export DB_CONN_STRING="postgres://inframirror:inframirror@localhost:5432/inframirror?sslmode=disable"
   export DATACENTER_ID=1  # For VA datacenter
   go run cmd/agent/main.go
   ```

### Configuration

Configuration is loaded from PostgreSQL tables: schedules, api_monitors, regions, datacenters, agents.

- Environment variables:
  - `DATACENTER_ID`: ID of the datacenter to run the agent for.
  - `DB_CONN_STRING`: PostgreSQL connection string.

## Building

```bash
go build -o agent ./cmd/agent
```

## Running Locally

1. Ensure PostgreSQL is running and populated.
2. Set environment variables: `export DB_CONN_STRING="postgres://inframirror:inframirror@localhost:5432/inframirror?sslmode=disable"` and `DATACENTER_ID=1`
3. Run: `./agent`

## Docker

### Build and Run with Docker Compose

1. Ensure PostgreSQL is populated with data.
2. Run: `docker-compose up --build`

This starts PostgreSQL and agent containers for each datacenter (VA, NY, RDN, CHI, SF, LON, DAM, STO, SYD). Each container attempts to acquire a distributed lock; only one instance per datacenter runs monitors, ensuring high availability and failover.

## Operations

- Logs are output in JSON format to stdout.
- Monitor the agent via logs or query PostgreSQL for heartbeats.
- For production, consider using a process manager like systemd or Kubernetes.
- Ensure database is securely managed.

## Extending Monitors

Implement the `MonitorInterface` for new monitor types (e.g., TCP, Ping) in `internal/monitor/`.

## Operations Guide

### Running in Production

- Use Docker Compose or Kubernetes to run one agent per datacenter.
- Ensure only one agent instance per datacenter acquires the lock at a time (scale for HA).
- Set environment variables:
  - `DB_CONN_STRING` (Postgres connection string)
  - `DATACENTER_ID` (datacenter to run agent for)

### Monitoring

- Check logs for:
  - `"Acquired lock for datacenter:X"` (agent is active)
  - `"Heartbeat inserted for monitor X (name)"` (successful monitor execution)
  - `"Monitor execution failed"` or `"Failed to save heartbeat"` (errors)
- Query heartbeats:
  ```sql
  SELECT * FROM api_heartbeats ORDER BY executed_at DESC LIMIT 10;
  ```
- Use monitoring tools (Prometheus, Grafana) for container health and resource usage.

### Troubleshooting

- If heartbeats are missing:
  - Check logs for errors (network, DB, lock issues).
  - Ensure Postgres sequence is correct:
    ```sql
    SELECT setval('api_heartbeats_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM api_heartbeats));
    ```
  - Verify agent connectivity to monitored endpoints.
- If agents do not shut down on Ctrl+C:
  - Use `docker stop <container>` or `kill <pid>`.

### Maintenance

- Periodically vacuum/analyze the heartbeats table for performance.
- Rotate logs and monitor disk usage.
- Update agent images and dependencies as needed.
- For config changes, update DB tables and restart agents (or wait for periodic reload).

### Security

- Restrict DB access to trusted agents.
- Use secrets management for DB credentials.
- Monitor for unauthorized access or unusual heartbeat patterns.
