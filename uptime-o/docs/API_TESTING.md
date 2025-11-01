# API Testing Guide

Comprehensive guide for manual API testing.

## Testing Tools

### Required Tools
- `curl` - HTTP client for command line
- `jq` - JSON query processor (optional, for pretty printing)
- `Postman` - API testing GUI (optional)
- `httpie` - User-friendly HTTP client (optional)

### Installation

```bash
# macOS
brew install curl jq

# Linux (Ubuntu/Debian)
sudo apt-get install curl jq

# Windows
# Download from https://curl.se/download.html
```

## Test Workflow

### 1. Get Authentication Token

```bash
TOKEN=$(curl -s -X POST "http://localhost:8080/api/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.id_token')

echo $TOKEN
```

### 2. Test Basic Connectivity

```bash
curl -X GET "http://localhost:8080/api/http-monitors" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create Test Data

```bash
# Create an agent first (if needed)
curl -X POST "http://localhost:8080/api/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Agent"}'

# Create a schedule
curl -X POST "http://localhost:8080/api/schedules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"intervalMinutes":5}'

# Create a monitor
curl -X POST "http://localhost:8080/api/http-monitors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Test Monitor",
    "type":"GET",
    "method":"GET",
    "url":"https://www.google.com",
    "schedule":{"id":1}
  }'
```

## Testing Scenarios

### Scenario 1: Happy Path (Successful Response)

**Step 1**: Create Monitor
```bash
MONITOR_ID=$(curl -s -X POST "http://localhost:8080/api/http-monitors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Success Test",
    "type":"GET",
    "method":"GET",
    "url":"https://www.google.com",
    "schedule":{"id":1}
  }' | jq -r '.id')

echo "Created Monitor: $MONITOR_ID"
```

**Step 2**: Create Successful Heartbeat
```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "executedAt":"2025-10-25T17:37:00.000Z",
    "success":true,
    "responseTimeMs":150,
    "responseSizeBytes":2048,
    "responseStatusCode":200,
    "responseContentType":"application/json",
    "responseServer":"nginx/1.21.0",
    "responseCacheStatus":"HIT",
    "dnsLookupMs":20,
    "tcpConnectMs":40,
    "tlsHandshakeMs":80,
    "timeToFirstByteMs":100,
    "warningThresholdMs":300,
    "criticalThresholdMs":500,
    "rawRequestHeaders":{"User-Agent":"Monitor/1.0"},
    "rawResponseHeaders":{"Content-Type":"application/json"},
    "rawResponseBody":{"status":"ok"},
    "monitor":{"id":'$MONITOR_ID'},
    "agent":{"id":1}
  }' | jq '.'
```

### Scenario 2: Error Response (Rate Limited)

```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "executedAt":"2025-10-25T17:37:00.000Z",
    "success":false,
    "responseTimeMs":450,
    "responseStatusCode":429,
    "errorType":"RateLimitError",
    "errorMessage":"Too many requests",
    "rawResponseBody":{"error":"Rate limit exceeded"},
    "monitor":{"id":1},
    "agent":{"id":1}
  }' | jq '.'
```

### Scenario 3: Timeout

```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "executedAt":"2025-10-25T17:38:00.000Z",
    "success":false,
    "responseTimeMs":10000,
    "responseStatusCode":0,
    "errorType":"TimeoutError",
    "errorMessage":"Request timeout after 10 seconds",
    "monitor":{"id":1},
    "agent":{"id":1}
  }' | jq '.'
```

## JSON Field Testing

### Test 1: Complex JSON Headers

```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "executedAt":"2025-10-25T17:37:00.000Z",
    "success":true,
    "responseTimeMs":150,
    "responseStatusCode":200,
    "rawRequestHeaders":{
      "User-Agent":"UptimeMonitor/1.0",
      "Accept":"*/*",
      "Accept-Encoding":"gzip, deflate",
      "Connection":"keep-alive",
      "Authorization":"Bearer eyJhbGciOiJIUzUxMiJ9..."
    },
    "rawResponseHeaders":{
      "Content-Type":"application/json; charset=utf-8",
      "Content-Encoding":"gzip",
      "Content-Length":"2048",
      "Cache-Control":"public, max-age=3600",
      "ETag":"W/\"123abc\"",
      "Server":"nginx/1.21.0",
      "Date":"Sat, 25 Oct 2025 17:37:00 GMT"
    },
    "rawResponseBody":{
      "status":"ok",
      "data":{
        "uptime":99.9,
        "responseTime":"150ms",
        "lastCheck":"2025-10-25T17:37:00Z"
      }
    },
    "monitor":{"id":1},
    "agent":{"id":1}
  }' | jq '.'
```

### Test 2: Nested JSON Body

```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "executedAt":"2025-10-25T17:37:00.000Z",
    "success":true,
    "responseStatusCode":200,
    "rawResponseBody":{
      "results":[
        {"id":1,"name":"Service A","status":"healthy"},
        {"id":2,"name":"Service B","status":"degraded"},
        {"id":3,"name":"Service C","status":"down"}
      ],
      "metadata":{
        "timestamp":"2025-10-25T17:37:00Z",
        "region":"us-east-1",
        "zone":"az-1"
      }
    },
    "monitor":{"id":1},
    "agent":{"id":1}
  }' | jq '.'
```

## Validation Testing

### Test 1: Invalid JSON in Request

```bash
# Missing required field
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"success":true}' | jq '.'
```

**Expected**: 400 Bad Request with validation error

### Test 2: Invalid JSON Type

```bash
# responseTimeMs should be number, not string
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "executedAt":"2025-10-25T17:37:00.000Z",
    "success":true,
    "responseTimeMs":"invalid",
    "monitor":{"id":1},
    "agent":{"id":1}
  }' | jq '.'
```

**Expected**: 400 Bad Request with type error

### Test 3: Malformed JSON

```bash
# Invalid JSON syntax
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{invalid json}' | jq '.'
```

**Expected**: 400 Bad Request with parse error

## Pagination Testing

### List with Pagination

```bash
# Get page 0 with 5 items per page
curl -s "http://localhost:8080/api/http-heartbeats?page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.content[] | {id, executedAt, success}'

# Get sorted results
curl -s "http://localhost:8080/api/http-heartbeats?page=0&size=10&sort=executedAt,desc" \
  -H "Authorization: Bearer $TOKEN" | jq '.content[] | {id, executedAt}'
```

## Performance Testing

### Test: Bulk Creation

```bash
for i in {1..100}; do
  curl -s -X POST "http://localhost:8080/api/http-heartbeats" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "executedAt":"2025-10-25T'$(printf "%02d:%02d:00" $((i/60)) $((i%60)))'.000Z",
      "success":true,
      "responseTimeMs":'$((RANDOM % 500))',
      "responseStatusCode":200,
      "monitor":{"id":1},
      "agent":{"id":1}
    }' > /dev/null
  echo "Created heartbeat $i"
done
```

## Test Checklist

- [ ] Authentication working
- [ ] Create operations return 201
- [ ] Read operations return 200 and correct data
- [ ] Update operations return 200
- [ ] Delete operations return 204
- [ ] List operations support pagination
- [ ] JSON fields accept objects
- [ ] JSON fields returned properly formatted
- [ ] Error responses have proper format
- [ ] Invalid input rejected with 400
- [ ] Missing auth returns 401
- [ ] Non-existent resource returns 404

## Common Issues

### Issue: Connection Refused
**Solution**: Ensure application is running on port 8080

### Issue: Invalid Token
**Solution**: Generate new token and verify format

### Issue: Malformed JSON
**Solution**: Use `jq` to validate JSON: `echo '{"test":1}' | jq '.'`

### Issue: CORS Error
**Solution**: This is expected in browser. Use curl or API testing tools.

---

**See Also**: 
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [API_OVERVIEW.md](API_OVERVIEW.md) - API overview
- [JSON_FIELDS_GUIDE.md](JSON_FIELDS_GUIDE.md) - JSON fields guide
