# UptimeO Standalone Deployment

Clean, minimal setup for running UptimeO in standalone mode.

## Quick Start (Minimal - 2 Agents)

```bash
# Clean slate
rm -rf tmp/pgdata tmp/data

# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

## Extended Demo (14 Agents, 10 Regions)

```bash
# Clean slate
rm -rf tmp/pgdata tmp/data

# Start with extended setup
docker compose -f docker-compose.extended.yml up -d

# View logs
docker compose -f docker-compose.extended.yml logs -f

# Stop everything
docker compose -f docker-compose.extended.yml down
```

## File Structure

```
docker/standalone/
├── docker-compose.yml          # Minimal: postgres + 2 agents + status page
├── docker-compose.extended.yml # Extended: postgres + 14 agents + status page
├── .env                        # Status page configuration
├── sql/
│   ├── schema.sql             # Database schema (tables, indexes, partitions)
│   ├── data.minimal.sql       # Minimal data: 2 agents, 2 regions
│   └── data.extended.sql      # Extended data: 14 agents, 10 regions
└── tmp/                       # Auto-created (gitignored)
    ├── pgdata/               # PostgreSQL data
    └── data/                 # Agent queue data
```

## Configuration

Edit `.env` to customize branding and theme:

```env
# Branding
NAVBAR_TITLE=Your Company
STATUS_PAGE_TITLE=Service Status
LOGO_URL=https://example.com/logo.png
LOGO_DISPLAY_MODE=both  # logo_only, title_only, both

# Theme Colors
NAVBAR_BG_COLOR=#ffffff
NAVBAR_TEXT_COLOR=#202124
FOOTER_BG_COLOR=#ffffff
FOOTER_TEXT_COLOR=#5f6368
PAGE_BG_COLOR=#f5f5f5
```

## Access

- **Status Page**: http://localhost:8077
- **PostgreSQL**: localhost:5432 (uptimeo/uptimeo)
- **Agent Health**: http://localhost:8081/healthz (agent 1), 8082 (agent 2), etc.

## What Gets Monitored

8 public APIs monitored globally:
1. ISRO Spacecrafts
2. ISRO Launchers
3. ISRO Customer Satellites
4. Aviation Weather METAR
5. NHTSA Vehicle API
6. Squiggle AFL Teams
7. NVD Schema
8. JSONPlaceholder Posts

## Troubleshooting

```bash
# Check if containers are running
docker compose ps

# View specific container logs
docker compose logs postgres
docker compose logs agent-us-east
docker compose logs status-page

# Restart a specific service
docker compose restart agent-us-east

# Clean everything and start fresh
docker compose down
rm -rf tmp/pgdata tmp/data
docker compose up -d
```
