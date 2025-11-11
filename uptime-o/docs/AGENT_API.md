# Agent API Documentation

These APIs are designed for monitoring agents to fetch their assigned monitors and submit heartbeat data. Authentication is done via API Key in the `X-API-Key` header, which is validated by `ApiKeyAuthenticationFilter` and grants `API_AGENT` authority.

## Authentication

All agent APIs require an API key to be passed in the header:
```
X-API-Key: uptimeo_YOUR_API_KEY_HERE
```

The API key is validated by the `ApiKeyAuthenticationFilter` which:
1. Extracts the API key from the `X-API-Key` header
2. Validates it against the database (SHA-256 hash lookup)
3. Checks if the key is active and not expired
4. Sets the security context with `API_AGENT` authority
5. Updates the last used timestamp

## API Endpoints

### 1. Get Assigned Monitors

**Endpoint:** `GET /api/public/monitors?agentId={agentId}`

**Description:** Retrieves all active monitors assigned to an agent along with their schedules and configuration.
curl -X GET "http://localhost:8080/api/public/monitors?agentId=2" \
  -H "X-API-Key: uptimeo_k2oXaUuhtxjZopopcSSFvnsQlI4avy2dSWe1o5Z30WA"


agent-syd

# 2. Execute monitors based on schedule intervals

# 3. Submit heartbeats (can batch multiple):
curl -X POST "http://localhost:8080/api/agent/heartbeats" \
  -H "X-API-Key: uptimeo_YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '[{
    "monitorId": 1,
    "agentId": 2,
    "success": true,
    "responseTimeMs": 245,
    "responseStatusCode": 200,
    "warningThresholdMs": 400,
    "criticalThresholdMs": 800
  }]'

**Description:** Retrieves all active monitors assigned to an agent along with their schedules, regions, datacenters, and configuration.

**Headers:**
```
X-API-Key: uptimeo_YOUR_API_KEY_HERE
Content-Type: application/json
```

**Query Parameters:**
- `agentId` (required): The ID of the agent

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "IPfy Public IP Info",
    "method": "GET",
    "type": "HTTP",
    "url": "https://api.ipify.org?format=json",
    "headers": null,
    "body": null,
    "schedule": {
      "id": 1,
      "name": "60s GET",
      "interval": 30,
      "includeResponseBody": false,
      "thresholdsWarning": 400,
      "thresholdsCritical": 800
    }
  },
  {
    "id": 2,
    "name": "Official Joke API",
    "method": "GET",
    "type": "HTTP",
    "url": "https://official-joke-api.appspot.com/random_joke",
    "headers": null,
    "body": null,
    "schedule": {
      "id": 1,
      "name": "60s GET",
      "interval": 30,
      "includeResponseBody": true,
      "thresholdsWarning": 400,
      "thresholdsCritical": 800
    }
  }
]
```

**Response Fields:**
- `id`: Monitor ID
- `name`: Monitor name
- `method`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `type`: Monitor type (HTTP)
- `url`: The URL to monitor
- `headers`: JSON object with custom headers (optional)
- `body`: JSON object with request body (optional, for POST/PUT)
- `schedule`:
  - `id`: Schedule ID
  - `name`: Schedule name
  - `interval`: Interval in seconds between checks
  - `includeResponseBody`: Whether to capture response body
  - `thresholdsWarning`: Warning threshold in milliseconds
  - `thresholdsCritical`: Critical threshold in milliseconds

**Example Usage:**
```bash
curl -X GET "http://localhost:8080/api/public/monitors?agentId=2" \
  -H "X-API-Key: uptimeo_YOUR_API_KEY_HERE"
```

---

### 2. Submit Heartbeats (Single)

**Endpoint:** `POST /api/public/heartbeats`

**Description:** Submits a single heartbeat for a monitored endpoint.

**Headers:**
```
X-API-Key: uptimeo_YOUR_API_KEY_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "monitorId": 1,
  "agentId": 2,
  "executedAt": "2025-11-09T04:59:23Z",
  "success": true,
  "responseTimeMs": 245,
  "responseSizeBytes": 1024,
  "responseStatusCode": 200,
  "responseContentType": "application/json",
  "responseServer": "nginx",
  "responseCacheStatus": "HIT",
  "dnsLookupMs": 15,
  "tcpConnectMs": 45,
  "tlsHandshakeMs": 89,
  "timeToFirstByteMs": 180,
  "warningThresholdMs": 400,
  "criticalThresholdMs": 800,
  "errorType": null,
  "errorMessage": null,
  "rawRequestHeaders": {
    "User-Agent": "UptimeO-Agent/1.0"
  },
  "rawResponseHeaders": {
    "content-type": "application/json",
    "server": "nginx"
  },
  "rawResponseBody": {
    "ip": "1.2.3.4"
  }
}
```

**Example Usage:**
```bash
curl -X POST "http://localhost:8080/api/public/heartbeats" \
  -H "X-API-Key: uptimeo_YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "monitorId": 1,
    "agentId": 2,
    "success": true,
    "responseTimeMs": 245,
    "responseStatusCode": 200
  }'
```

---

### 3. Submit Heartbeats (Batch)

**Endpoint:** `POST /api/public/heartbeats/batch`

**Description:** Submits one or more heartbeats for monitored endpoints. Supports bulk insert for efficiency.

**Headers:**
```
X-API-Key: uptimeo_YOUR_API_KEY_HERE
Content-Type: application/json
```

**Request Body (Array):**
```json
[
  {
    "monitorId": 1,
    "agentId": 2,
    "executedAt": "2025-11-09T04:59:23Z",
    "success": true,
    "responseTimeMs": 245,
    "responseSizeBytes": 1024,
    "responseStatusCode": 200,
    "responseContentType": "application/json",
    "responseServer": "nginx",
    "responseCacheStatus": "HIT",
    "dnsLookupMs": 15,
    "tcpConnectMs": 45,
    "tlsHandshakeMs": 89,
    "timeToFirstByteMs": 180,
    "warningThresholdMs": 400,
    "criticalThresholdMs": 800,
    "errorType": null,
    "errorMessage": null,
    "rawRequestHeaders": {
      "User-Agent": "UptimeO-Agent/1.0"
    },
    "rawResponseHeaders": {
      "content-type": "application/json",
      "server": "nginx"
    },
    "rawResponseBody": {
      "ip": "1.2.3.4"
    }
  },
  {
    "monitorId": 2,
    "agentId": 2,
    "executedAt": "2025-11-09T04:59:23Z",
    "success": false,
    "responseTimeMs": 5000,
    "responseSizeBytes": 0,
    "responseStatusCode": null,
    "responseContentType": null,
    "responseServer": null,
    "responseCacheStatus": null,
    "dnsLookupMs": 15,
    "tcpConnectMs": null,
    "tlsHandshakeMs": null,
    "timeToFirstByteMs": null,
    "warningThresholdMs": 400,
    "criticalThresholdMs": 800,
    "errorType": "timeout",
    "errorMessage": "Connection timeout after 5000ms",
    "rawRequestHeaders": {
      "User-Agent": "UptimeO-Agent/1.0"
    },
    "rawResponseHeaders": null,
    "rawResponseBody": null
  }
]
```

**Request Fields:**
- `monitorId` (required): ID of the monitor
- `agentId` (required): ID of the agent
- `executedAt` (required): Timestamp of execution in ISO 8601 format (e.g., "2025-11-09T17:10:00Z")
- `success` (required): Whether the check succeeded
- `responseTimeMs` (optional): Total response time in milliseconds
- `responseSizeBytes` (optional): Response size in bytes
- `responseStatusCode` (optional): HTTP status code
- `responseContentType` (optional): Content-Type header
- `responseServer` (optional): Server header
- `responseCacheStatus` (optional): Cache status (HIT, MISS, etc.)
- `dnsLookupMs` (optional): DNS lookup time in milliseconds
- `tcpConnectMs` (optional): TCP connection time in milliseconds
- `tlsHandshakeMs` (optional): TLS handshake time in milliseconds
- `timeToFirstByteMs` (optional): Time to first byte in milliseconds
- `warningThresholdMs` (optional): Warning threshold used
- `criticalThresholdMs` (optional): Critical threshold used
- `errorType` (optional): Error type if failed
- `errorMessage` (optional): Error message if failed
- `rawRequestHeaders` (optional): JSON object of request headers
- `rawResponseHeaders` (optional): JSON object of response headers
- `rawResponseBody` (optional): JSON object of response body

**Response:**
```json
{
  "totalReceived": 2,
  "successCount": 2,
  "failureCount": 0
}
```

**Response Fields:**
- `totalReceived`: Total number of heartbeats received
- `successCount`: Number of heartbeats successfully saved
- `failureCount`: Number of heartbeats that failed to save

**Response:**
```
200 OK
Headers: alert: Batch heartbeat submission successful
```

**Example Usage:**
```bash
curl -X POST "http://localhost:8080/api/public/heartbeats/batch" \
  -H "X-API-Key: uptimeo_YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "monitorId": 1,
      "agentId": 2,
      "success": true,
      "responseTimeMs": 245,
      "responseStatusCode": 200
    },
    {
      "monitorId": 2,
      "agentId": 2,
      "success": false,
      "responseTimeMs": 5000,
      "errorType": "timeout",
      "errorMessage": "Connection timeout"
    }
  ]'
```

---

## Error Responses

### 401 Unauthorized
API key is missing, invalid, or expired.
```
Invalid API Key
```

### 400 Bad Request
Invalid request format or missing required fields.

---

## Agent Workflow

1. **On Startup:**
   - Agent calls `GET /api/public/monitors?agentId={agentId}` with API key
   - API key is validated by `ApiKeyAuthenticationFilter`
   - Security context is set with `API_AGENT` authority
   - Parses the monitors and schedules
   - Sets up timers/tickers based on intervals

2. **On Each Interval:**
   - Execute HTTP request to the monitor URL
   - Capture timing metrics (DNS, TCP, TLS, TTFB, total)
   - Capture response details (status, headers, body if configured)

3. **Submit Results:**
   - Agent calls `POST /api/public/heartbeats` (single) or `POST /api/public/heartbeats/batch` (multiple)
   - API key is validated on each request
   - Can batch multiple heartbeats in one request for efficiency
   - Receives HTTP 201 (single) or 200 (batch) on success

---

## Authentication Flow

1. **Agent sends request** with `X-API-Key` header
2. **ApiKeyAuthenticationFilter intercepts** the request (for `/api/public/heartbeats/**` and `/api/public/monitors/**`)
3. **API key is validated**:
   - SHA-256 hash is computed
   - Database lookup by hash (O(1) operation)
   - Check if active and not expired
   - Update last used timestamp
4. **Security context is set** with `API_AGENT` authority
5. **Request proceeds** to the controller
6. **Authorization check** verifies `API_AGENT` authority (configured in SecurityConfiguration)

## Notes

- **Batch Support:** The `/api/public/heartbeats/batch` endpoint accepts an array, allowing you to submit multiple heartbeats in a single request for better performance.
- **API Key Security:** Store API keys securely. They provide full access to fetch monitors and submit heartbeat data.
- **API Key Management:** API keys are created through the admin UI with optional expiration dates and can be deactivated at any time.
- **Timestamps:** Use ISO 8601 format for timestamps (`2025-11-09T04:59:23Z`)
- **JSON Fields:** The `headers`, `body`, `rawRequestHeaders`, `rawResponseHeaders`, and `rawResponseBody` fields accept JSON objects.
- **Error Handling:** The batch endpoint processes all heartbeats even if some fail, providing partial success.

---

## Migration from Database Connection

If your agent was previously connecting directly to the database, here are the key changes:

### Old Approach (Direct Database):
```go
// Query monitors
rows, err := db.Query(`
    SELECT m.id, m.name, m.method, m.url, s.interval, s.thresholds_warning, s.thresholds_critical
    FROM api_monitors m
    JOIN schedules s ON m.schedule_id = s.id
    JOIN agent_monitors am ON am.monitor_id = m.id
    WHERE am.agent_id = $1 AND am.active = true
`, agentId)

// Insert heartbeat
_, err = db.Exec(`
    INSERT INTO api_heartbeats 
    (monitor_id, agent_id, executed_at, success, response_time_ms, ...)
    VALUES ($1, $2, $3, $4, $5, ...)
`, monitorId, agentId, executedAt, success, responseTime, ...)
```

### New Approach (API):
```go
// Get monitors
req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/public/monitors?agentId=%d", baseURL, agentId), nil)
req.Header.Set("X-API-Key", apiKey)
resp, err := client.Do(req)

// Submit heartbeat (single)
heartbeat := Heartbeat{...}
body, _ := json.Marshal(heartbeat)
req, _ := http.NewRequest("POST", baseURL+"/api/public/heartbeats", bytes.NewBuffer(body))
req.Header.Set("X-API-Key", apiKey)
req.Header.Set("Content-Type", "application/json")
resp, err := client.Do(req)

// Submit heartbeats (batch)
heartbeats := []Heartbeat{...}
body, _ := json.Marshal(heartbeats)
req, _ := http.NewRequest("POST", baseURL+"/api/public/heartbeats/batch", bytes.NewBuffer(body))
req.Header.Set("X-API-Key", apiKey)
req.Header.Set("Content-Type", "application/json")
resp, err := client.Do(req)
```

### Benefits:
- ✅ No direct database connection required
- ✅ Cleaner separation of concerns
- ✅ API key authentication
- ✅ Bulk insert support
- ✅ Better error handling
- ✅ Can be deployed anywhere with just API access
