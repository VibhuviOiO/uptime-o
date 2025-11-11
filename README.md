# Uptime Observability

Monitoring platform with two deployment modes: standalone and managed.

## Architecture

### Standalone Mode
Direct database monitoring without backend management.

| Component | Folder | Dependencies |
|-----------|--------|--------------|
| Agent | `uptime-o-agent` | PostgreSQL |
| Status Page | `uptime-o-status-page` | PostgreSQL |

**Use case:** Simple monitoring with manual configuration.

### Managed Mode
Centralized platform for managing agents and monitors.

| Component | Folder | Dependencies |
|-----------|--------|--------------|
| Backend API | `uptime-o` | PostgreSQL |
| Agent | `uptime-o-api-agent` | Backend API |
| Status Page | `uptime-o-status-page` | PostgreSQL |

**Use case:** Dynamic monitor assignment with remote configuration.

## Troubleshooting

### Partition Table Creation

Create daily partitions for heartbeat tables:

```sql
CREATE TABLE IF NOT EXISTS api_heartbeats_2025_11_01
PARTITION OF api_heartbeats
FOR VALUES FROM ('2025-11-01 00:00:00') TO ('2025-11-02 00:00:00');
```
