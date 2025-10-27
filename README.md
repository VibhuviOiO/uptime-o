# Uptime Observability

- APP, for managing the agents related configurations
- Agent, to run on any remote machines to configure to monitors to get the info into the postgres
- Status page, what we cna show to the client. 

## Running the application

- current backend

# Create the Partition per day:

it means there is no partition for today's date in the `api_heartbeats` table.

### How to Fix

**Manual SQL (run in psql):**
For today's date (2025-10-27), use:

```sql
CREATE TABLE IF NOT EXISTS api_heartbeats_2025_10_27
PARTITION OF api_heartbeats
FOR VALUES FROM ('2025-10-27 00:00:00') TO ('2025-10-28 00:00:00');
```

Replace the date with the current day as needed.