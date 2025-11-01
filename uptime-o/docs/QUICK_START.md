# Quick Start Guide

Get UptimeO running in 5 minutes.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 12+
- Node.js 16+ (for frontend development)

## Running the Application

### 1. Start PostgreSQL

```bash
# Using Docker
docker run --name postgres-uptime \
  -e POSTGRES_DB=uptimeo \
  -e POSTGRES_USER=uptimeo \
  -e POSTGRES_PASSWORD=uptimeo \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Build the Project

```bash
cd uptime-o
./mvnw clean package -DskipTests
```

### 3. Run the Application

```bash
./mvnw spring-boot:run
```

Application will be available at: **http://localhost:8080**

## Default Credentials

- **Username**: admin
- **Password**: admin

## First Steps

1. Navigate to http://localhost:8080
2. Login with admin/admin
3. Create a Schedule (e.g., every 5 minutes)
4. Create an Agent (monitoring endpoint)
5. Create an HTTP Monitor (monitor configuration)
6. Wait for heartbeats to be collected

## Quick API Tests

### Get JWT Token

```bash
curl -X POST "http://localhost:8080/api/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Create HTTP Monitor

```bash
curl -X POST "http://localhost:8080/api/http-monitors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Google API Monitor",
    "type": "GET",
    "method": "GET",
    "url": "https://www.google.com",
    "schedule": {"id": 1}
  }'
```

## Common Issues

**Port 8080 already in use**
```bash
./mvnw spring-boot:run -Dserver.port=8081
```

**Database connection failed**
- Ensure PostgreSQL is running
- Check credentials in application.yml

**Build fails**
```bash
./mvnw clean
./mvnw install -DskipTests
```

## Next Steps

- See [SETUP.md](SETUP.md) for development environment setup
- See [API_TESTING.md](API_TESTING.md) for complete API testing guide
- See [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system

---

**Questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
