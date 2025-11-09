# HTTP Heartbeat API with API Key Authentication

This document describes how to submit HTTP heartbeats using API keys, similar to how Datadog agents work.

## Overview

The `/api/public/heartbeats` endpoint supports two authentication methods:

1. **API Key Authentication** (for external agents) - via `X-API-Key` header
2. **Internal Authentication** (for internal services) - via JWT token

## 1. Create an API Key

First, login as an admin user and create an API key:

1. Navigate to: http://localhost:9000/account/settings/api-keys
2. Click "Create API Key"
3. Fill in:
   - Name: `Agent Monitor 1`
   - Description: `Production monitoring agent`
   - Expires At: (optional) future date
4. Copy the generated API key (starts with `uptimeo_...`)

**Important**: The API key is only shown once. Store it securely!

## 2. Submit Heartbeat with API Key (External Agent)

### Single Heartbeat

```bash
curl -X POST http://localhost:8080/api/public/heartbeats \
  -H "Content-Type: application/json" \
  -H "X-API-Key: uptimeo_YOUR_API_KEY_HERE" \
  -d '{
    "apiMonitor": {
      "id": 1
    },
    "statusCode": 200,
    "responseTime": 145,
    "isUp": true,
    "errorMessage": null,
    "checkedAt": "2025-11-09T08:00:00Z"
  }'
```

### Batch Heartbeats

```bash
curl -X POST http://localhost:8080/api/public/heartbeats/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: uptimeo_YOUR_API_KEY_HERE" \
  -d '[
    {
      "apiMonitor": {"id": 1},
      "statusCode": 200,
      "responseTime": 145,
      "isUp": true,
      "checkedAt": "2025-11-09T08:00:00Z"
    },
    {
      "apiMonitor": {"id": 2},
      "statusCode": 503,
      "responseTime": 5000,
      "isUp": false,
      "errorMessage": "Service Unavailable",
      "checkedAt": "2025-11-09T08:01:00Z"
    }
  ]'
```

## 3. Submit Heartbeat from Internal Service

Internal services can use JWT authentication:

```bash
curl -X POST http://localhost:8080/api/public/heartbeats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "apiMonitor": {
      "id": 1
    },
    "statusCode": 200,
    "responseTime": 145,
    "isUp": true,
    "checkedAt": "2025-11-09T08:00:00Z"
  }'
```

## 4. Example Python Agent

Here's a simple Python agent that sends heartbeats:

```python
import requests
import time
from datetime import datetime

API_KEY = "uptimeo_YOUR_API_KEY_HERE"
BASE_URL = "http://localhost:8080"
MONITOR_ID = 1
CHECK_URL = "https://example.com"

def send_heartbeat():
    try:
        # Perform health check
        start = time.time()
        response = requests.get(CHECK_URL, timeout=30)
        response_time = int((time.time() - start) * 1000)  # milliseconds
        
        # Prepare heartbeat data
        heartbeat = {
            "apiMonitor": {"id": MONITOR_ID},
            "statusCode": response.status_code,
            "responseTime": response_time,
            "isUp": response.status_code == 200,
            "errorMessage": None if response.status_code == 200 else f"HTTP {response.status_code}",
            "checkedAt": datetime.utcnow().isoformat() + "Z"
        }
        
        # Send to UptimeO
        result = requests.post(
            f"{BASE_URL}/api/public/heartbeats",
            json=heartbeat,
            headers={
                "X-API-Key": API_KEY,
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        if result.status_code == 201:
            print(f"✓ Heartbeat sent successfully: {CHECK_URL} - {response.status_code} - {response_time}ms")
        else:
            print(f"✗ Failed to send heartbeat: {result.status_code} - {result.text}")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    while True:
        send_heartbeat()
        time.sleep(60)  # Check every minute
```

## 5. Response Codes

- `201 Created` - Heartbeat submitted successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid or missing API key
- `500 Internal Server Error` - Server error

## 6. Security Notes

- API keys are hashed with SHA-256 and stored securely with unique index
- **O(1) lookup performance** - Fast validation using indexed hash lookup
- Keys can be deactivated or deleted at any time
- Each key tracks `lastUsedDate` for auditing
- Keys can have expiration dates (checked during validation)
- The `X-API-Key` header is only checked for `/api/public/heartbeats` endpoints
- Expired keys are automatically rejected during validation

## 7. API Key Management

### Deactivate an API Key

```bash
curl -X PUT http://localhost:8080/api/admin/api-keys/{id}/deactivate \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Delete an API Key

```bash
curl -X DELETE http://localhost:8080/api/admin/api-keys/{id} \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### List All API Keys

```bash
curl http://localhost:8080/api/admin/api-keys \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## 8. Architecture

This implementation follows the Datadog agent pattern:

1. **External Agents**: Use API keys for authentication
2. **API Key Filter**: Validates keys before reaching the controller
3. **Security Context**: Sets authentication with `ROLE_API_AGENT` authority
4. **Public Endpoint**: `/api/public/heartbeats` allows both API key and internal auth
5. **Backward Compatibility**: Internal services can still use JWT tokens

The filter only applies to `/api/public/heartbeats/**` endpoints, ensuring other endpoints remain unaffected.
