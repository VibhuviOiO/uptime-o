# UptimeO Standalone Status Page

Public status page for displaying real-time service health across multiple regions.

**Note:** This is the standalone status page component only. For the full UptimeO management platform (with web UI for managing monitors, agents, and configurations), see the main `uptime-o` application.

## What is Standalone Mode?

Standalone mode provides a **read-only public status page** that connects directly to PostgreSQL. It displays service health data collected by standalone agents.

**Use this when:**
- You want a simple public status page
- You manage monitors manually via database
- You don't need a management UI

**Use managed mode (`uptime-o` app) when:**
- You need a web UI to manage monitors and agents
- You want dynamic monitor assignment
- You need user authentication and access control

## Production Deployment

### Prerequisites
- Docker and Docker Compose
- PostgreSQL database with UptimeO schema
- UptimeO standalone agent running and populating heartbeat data

### Quick Start

1. **Clone or download the `docker/standalone` folder**

2. **Configure environment:**
```bash
cd docker/standalone
cp .env.example .env
# Edit .env with your configuration
```

3. **Deploy:**
```bash
docker-compose -f status-page.yml up -d
```

4. **Access:** http://localhost:8077

### Configuration

See `docker/standalone/.env.example` for all available environment variables.

**Required:**
- `DB_CONN_STRING` - PostgreSQL connection string (use service name `postgres` not `localhost`)

**Branding:**
- Company name, logo, favicon, colors
- Support email and navigation links
- SEO meta tags

### Database Requirements

PostgreSQL database must contain:
- `http_monitors` - Monitor definitions
- `regions` - Region definitions
- `datacenters` - Datacenter definitions
- `agents` - Agent definitions
- `api_heartbeats` - Heartbeat data (populated by UptimeO agent)

### Monitoring

Check container logs:
```bash
docker logs -f uptimeo-status
```

Health check:
```bash
curl http://localhost:8077/health
```

### Troubleshooting

**No data displayed:**
- Verify database connection string uses `postgres` not `localhost`
- Ensure UptimeO agent is running and populating heartbeats
- Check container logs for errors

**Branding not updating:**
- Restart container after changing `.env` file
- Verify environment variables: `docker exec uptimeo-status env`

### Architecture (Standalone Mode)

```
┌─────────────────────────────────────────┐
│         Standalone Status Page          │
│  ┌─────────────┐    ┌───────────────┐  │
│  │  Frontend   │───▶│  Backend API  │  │
│  │ (React+TS)  │    │  (Node.js)    │  │
│  └─────────────┘    └───────┬───────┘  │
└──────────────────────────────┼──────────┘
                               │
                               │ SQL Queries
                               │
                    ┌──────────▼──────────┐
                    │    PostgreSQL       │
                    │  ┌───────────────┐  │
                    │  │ http_monitors │  │
                    │  │ regions       │  │
                    │  │ datacenters   │  │
                    │  │ agents        │  │
                    │  │ api_heartbeats│  │
                    │  └───────────────┘  │
                    └──────────▲──────────┘
                               │
                               │ Heartbeat Data
                               │
                    ┌──────────┴──────────┐
                    │  Standalone Agent   │
                    │  (uptime-o-agent)   │
                    └─────────────────────┘
```

**Components:**
- **Status Page** (this repo) - Public read-only status display
- **Standalone Agent** (`uptime-o-agent`) - Collects heartbeat data
- **PostgreSQL** - Stores monitors and heartbeat data

**Not included in standalone mode:**
- Management UI for creating/editing monitors
- User authentication
- API for dynamic monitor assignment

### Related Components

- **Standalone Agent:** `uptime-o-agent` - Collects heartbeat data
- **Managed Platform:** `uptime-o` - Full management UI with API

### Support

- **Release Notes:** See RELEASE_NOTES.md
- **Docker Image:** ghcr.io/vibhuvioio/uptimeo-statuspage
- **Port:** 8077
