# Reset Database

If you see errors like "relation api_monitors does not exist", the database has old schema cached.

## Quick Reset

```bash
cd docker/standalone

# Stop and remove volumes
docker compose -f postgres.yml down -v

# Remove data directory
rm -rf tmp/pgdata

# Start fresh
docker compose -f postgres.yml up -d

# Verify
docker exec -it postgres psql -U uptimeo -d uptimeo -c "\dt"
```

You should see:
- `http_monitors` (not `api_monitors`)
- `agent_monitors` (not `datacenter_monitors`)
- `api_heartbeats`
- `schedules`
- `regions`
- `datacenters`
- `agents`

## Manual Fix (if needed)

```bash
# Connect to database
docker exec -it postgres psql -U uptimeo -d uptimeo

# Drop old tables
DROP TABLE IF EXISTS datacenter_monitors CASCADE;
DROP TABLE IF EXISTS api_monitors CASCADE;

# Recreate with correct schema
\i /docker-entrypoint-initdb.d/01-schema.sql
\i /docker-entrypoint-initdb.d/02-data.sql
```
