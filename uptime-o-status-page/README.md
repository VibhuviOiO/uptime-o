# UptimeO Status Page

Public status page displaying real-time service health across regions.

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL with UptimeO schema
- Agent running (populating heartbeats)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with DB connection
npm run start
```

Output:
```
Postgres connection: SUCCESS
Backend server running on http://localhost:8077
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Output:
```
VITE v5.4.19  ready in 252 ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.100:5173/
```

## Docker

### Build & Run

```bash
docker-compose up -d
```

Access: http://localhost:8077

### Configuration

Edit `.env`:
```bash
DB_CONN_STRING=postgres://user:pass@postgres:5432/uptimeo
PORT=8077
```

## Verify Status
- [QUERY_EXPLANATION.md](QUERY_EXPLANATION.md) - Status calculation flow
- [compare-latency.sh](compare-latency.sh) - Compare DB vs curl tests
