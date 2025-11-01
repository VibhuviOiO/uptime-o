# API Overview

Complete REST API reference for UptimeO.

## Authentication

All API requests (except `/api/authenticate`) require JWT token in the Authorization header.

### Get JWT Token

**Endpoint**: `POST /api/authenticate`

**Request**:
```bash
curl -X POST "http://localhost:8080/api/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Response (200 OK)**:
```json
{
  "id_token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA4NzcyMiwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYyMDAxMzIyLCJ1c2VySWQiOjF9.SIGNATURE"
}
```

### Using the Token

Include token in all subsequent requests:

```bash
curl -X GET "http://localhost:8080/api/http-monitors" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

## Base URL

```
http://localhost:8080/api
```

## Response Format

### Success Response

```json
{
  "id": 1,
  "name": "Monitor Name",
  "type": "GET",
  ...
}
```

### Error Response

```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Bad Request",
  "status": 400,
  "detail": "Detailed error message",
  "path": "/api/resource/1",
  "message": "error code"
}
```

## HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion or update |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## API Endpoints

### HTTP Monitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/http-monitors` | List all monitors |
| GET | `/http-monitors/{id}` | Get specific monitor |
| POST | `/http-monitors` | Create monitor |
| PUT | `/http-monitors/{id}` | Update monitor |
| PATCH | `/http-monitors/{id}` | Partially update monitor |
| DELETE | `/http-monitors/{id}` | Delete monitor |

### HTTP Heartbeats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/http-heartbeats` | List all heartbeats |
| GET | `/http-heartbeats/{id}` | Get specific heartbeat |
| POST | `/http-heartbeats` | Create heartbeat |
| PUT | `/http-heartbeats/{id}` | Update heartbeat |
| PATCH | `/http-heartbeats/{id}` | Partially update heartbeat |
| DELETE | `/http-heartbeats/{id}` | Delete heartbeat |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agents` | List all agents |
| GET | `/agents/{id}` | Get specific agent |
| POST | `/agents` | Create agent |
| PUT | `/agents/{id}` | Update agent |
| PATCH | `/agents/{id}` | Partially update agent |
| DELETE | `/agents/{id}` | Delete agent |

### Schedules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schedules` | List all schedules |
| GET | `/schedules/{id}` | Get specific schedule |
| POST | `/schedules` | Create schedule |
| PUT | `/schedules/{id}` | Update schedule |
| DELETE | `/schedules/{id}` | Delete schedule |

## Common Query Parameters

### Pagination

```bash
GET /api/http-monitors?page=0&size=20&sort=id,desc
```

**Parameters**:
- `page`: 0-indexed page number (default: 0)
- `size`: Number of records per page (default: 20)
- `sort`: Sort by field and direction (default: id,asc)

### Filtering

```bash
GET /api/http-monitors?name.contains=Google
```

## Request/Response Headers

### Required Headers

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### Optional Headers

```
Accept-Language: en-US
User-Agent: CustomClient/1.0
```

### Response Headers

```
Content-Type: application/json; charset=UTF-8
X-Total-Count: 100          # Total records (when paginating)
X-Custom-Header: value      # Application-specific headers
```

## Rate Limiting

Currently no rate limiting is implemented. Future versions may include:
- Request limit per minute
- Burst handling
- Rate limit headers in responses

## Versioning

Current API version: **v1** (implicit)

Future versions will use:
```
GET /api/v2/http-monitors
```

## Webhooks

Not currently implemented. Planned for future versions.

## Documentation Links

- [HTTP Monitor API](HTTP_MONITOR_API.md)
- [HTTP Heartbeat API](HTTP_HEARTBEAT_API.md)
- [Agent API](AGENT_API.md)
- [Schedule API](SCHEDULE_API.md)

## Testing

See [API_TESTING.md](../Manual%20API%20Testing/HttpHeartbeat.md) for comprehensive testing procedures.

---

**Last Updated**: November 1, 2025
