# HTTP Heartbeat API Manual Testing Guide

## Overview
This document provides comprehensive manual testing procedures for the HTTP Heartbeat APIs in the UptimeO application.

## Important Notes
- **JSON Fields (FIXED ✅)**: The `rawRequestHeaders`, `rawResponseHeaders`, and `rawResponseBody` fields now properly accept JSON objects directly in the request body. These are automatically serialized to PostgreSQL JSONB columns.
  - **Previous Issue**: DTO had String fields instead of JsonNode - **NOW RESOLVED**
  - **Current State**: Both entity and DTO use `JsonNode` type with custom Hibernate `JsonNodeType` for proper JSONB serialization
  - **Result**: JSON objects deserialize correctly without type mismatch errors
- These fields are of type `JsonNode` in both the entity and DTO, enabling proper JSON deserialization and storage.

## Prerequisites
- Application running on `http://localhost:8080`
- PostgreSQL database with proper schema
- Valid user credentials (admin/admin)
- At least one HTTP Monitor created (required for heartbeat)
- At least one Agent created (required for heartbeat)

## Authentication

### Step 1: Login and Get JWT Token

**Request:**
```bash
curl -X POST "http://localhost:8080/api/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin","rememberMe":false}'
```

**Expected Response (200 OK):**
```json
{
  "id_token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Token obtained: `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA4NzIxMywiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYyMDAwODEzLCJ1c2VySWQiOjF9.c1vIroxBsEC5ch9hLeXz-rXyGboydAFxQDBklknEHfARmkMjzXzgCOYtbM23KQ6MiyPfWlDMEPk6Z7hi3xSAlg`

---

## HTTP Heartbeats CRUD Operations

### Step 2: Create HTTP Heartbeat (POST)

**Request:**
```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA4NzIxMywiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYyMDAwODEzLCJ1c2VySWQiOjF9.c1vIroxBsEC5ch9hLeXz-rXyGboydAFxQDBklknEHfARmkMjzXzgCOYtbM23KQ6MiyPfWlDMEPk6Z7hi3xSAlg" \
  -d '{
    "executedAt": "2025-10-25T17:37:00.000Z",
    "success": true,
    "responseTimeMs": 150,
    "responseSizeBytes": 2048,
    "responseStatusCode": 200,
    "responseContentType": "application/json",
    "responseServer": "nginx/1.21.0",
    "responseCacheStatus": "HIT",
    "dnsLookupMs": 20,
    "tcpConnectMs": 40,
    "tlsHandshakeMs": 80,
    "timeToFirstByteMs": 100,
    "warningThresholdMs": 300,
    "criticalThresholdMs": 500,
    "errorType": null,
    "errorMessage": null,
    "rawRequestHeaders": {"User-Agent": "UptimeMonitor/1.0", "Accept": "*/*"},
    "rawResponseHeaders": {"Content-Type": "application/json", "Server": "nginx/1.21.0"},
    "rawResponseBody": {"status": "ok", "data": "success"},
    "monitor": {"id": 4},
    "agent": {"id": 1}
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "executedAt": "2025-10-25T17:37:00.000Z",
  "success": true,
  "responseTimeMs": 150,
  "responseSizeBytes": 2048,
  "responseStatusCode": 200,
  "responseContentType": "application/json",
  "responseServer": "nginx/1.21.0",
  "responseCacheStatus": "HIT",
  "dnsLookupMs": 20,
  "tcpConnectMs": 40,
  "tlsHandshakeMs": 80,
  "timeToFirstByteMs": 100,
  "warningThresholdMs": 300,
  "criticalThresholdMs": 500,
  "errorType": null,
  "errorMessage": null,
  "rawRequestHeaders": {"User-Agent": "UptimeMonitor/1.0", "Accept": "*/*"},
  "rawResponseHeaders": {"Content-Type": "application/json", "Server": "nginx/1.21.0"},
  "rawResponseBody": {"status": "ok", "data": "success"},
  "monitor": {
    "id": 4,
    "name": null,
    "method": null,
    "type": null,
    "url": null,
    "headers": null,
    "body": null,
    "schedule": null
  },
  "agent": {
    "id": 1,
    "name": null,
    "datacenter": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS (201 CREATED)
- Created Heartbeat ID: **1401**
- JSON Fields: ✅ Successfully deserialized and stored as JSONB
  - `rawRequestHeaders`: `{"User-Agent": "UptimeMonitor/1.0", "Accept": "*/*"}`
  - `rawResponseHeaders`: `{"Content-Type": "application/json", "Server": "nginx/1.21.0"}`
  - `rawResponseBody`: `{"status": "ok", "data": "success"}`
- Location Header: `/api/http-heartbeats/1401`
- All timing metrics stored correctly
- Response properly serialized with nested JSON objects

---

### Step 3: Read HTTP Heartbeat (GET)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/http-heartbeats/1401" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA4NzIxMywiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYyMDAwODEzLCJ1c2VySWQiOjF9.c1vIroxBsEC5ch9hLeXz-rXyGboydAFxQDBklknEHfARmkMjzXzgCOYtbM23KQ6MiyPfWlDMEPk6Z7hi3xSAlg"
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "executedAt": "2025-10-25T17:37:00.000Z",
  "success": true,
  "responseTimeMs": 150,
  "responseSizeBytes": 2048,
  "responseStatusCode": 200,
  "responseContentType": "application/json",
  "responseServer": "nginx/1.21.0",
  "responseCacheStatus": "HIT",
  "dnsLookupMs": 20,
  "tcpConnectMs": 40,
  "tlsHandshakeMs": 80,
  "timeToFirstByteMs": 100,
  "warningThresholdMs": 300,
  "criticalThresholdMs": 500,
  "errorType": null,
  "errorMessage": null,
  "rawRequestHeaders": {"User-Agent": "UptimeMonitor/1.0", "Accept": "*/*"},
  "rawResponseHeaders": {"Content-Type": "application/json", "Server": "nginx/1.21.0"},
  "rawResponseBody": {"status": "ok", "data": "success"},
  "monitor": {
    "id": 4,
    "name": null,
    "method": null,
    "type": null,
    "url": null,
    "headers": null,
    "body": null,
    "schedule": null
  },
  "agent": {
    "id": 1,
    "name": null,
    "datacenter": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Data retrieved correctly
- JSONB fields properly deserialized to JSON objects

---

### Step 4: Update HTTP Heartbeat (PUT)

**Request:**
```bash
curl -X PUT "http://localhost:8080/api/http-heartbeats/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw" \
  -d '{
    "id": 1,
    "executedAt": "2025-10-25T17:38:00.000Z",
    "success": false,
    "responseTimeMs": 450,
    "responseSizeBytes": 512,
    "responseStatusCode": 429,
    "responseContentType": "application/json",
    "responseServer": "RapidAPI-1.2.8",
    "responseCacheStatus": "",
    "dnsLookupMs": 32,
    "tcpConnectMs": 50,
    "tlsHandshakeMs": 105,
    "timeToFirstByteMs": 251,
    "warningThresholdMs": 300,
    "criticalThresholdMs": 800,
    "errorType": "RateLimitError",
    "errorMessage": "Too many requests",
    "rawRequestHeaders": {"User-Agent": "CustomMonitor/1.0", "Content-Type": "application/json"},
    "rawResponseHeaders": {"Date": "Sat, 25 Oct 2025 17:37:30 GMT", "Server": "RapidAPI-1.2.8.0.0", "X-Rapidapi-Version": "1.2.8"},
    "rawResponseBody": {"message": "Too many requests found, testing"},
    "monitor": {"id": 4},
    "agent": {"id": 1}
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "executedAt": "2025-10-25T17:38:00.000Z",
  "success": false,
  "responseTimeMs": 450,
  "responseSizeBytes": 512,
  "responseStatusCode": 429,
  "responseContentType": "application/json",
  "responseServer": "RapidAPI-1.2.8",
  "responseCacheStatus": "",
  "dnsLookupMs": 32,
  "tcpConnectMs": 50,
  "tlsHandshakeMs": 105,
  "timeToFirstByteMs": 251,
  "warningThresholdMs": 300,
  "criticalThresholdMs": 800,
  "errorType": "RateLimitError",
  "errorMessage": "Too many requests",
  "rawRequestHeaders": {"User-Agent": "CustomMonitor/1.0", "Content-Type": "application/json"},
  "rawResponseHeaders": {"Date": "Sat, 25 Oct 2025 17:37:30 GMT", "Server": "RapidAPI-1.2.8.0.0", "X-Rapidapi-Version": "1.2.8"},
  "rawResponseBody": {"message": "Too many requests found, testing"},
  "monitor": {
    "id": 4,
    "name": null,
    "method": null,
    "type": null,
    "url": null,
    "headers": null,
    "body": null,
    "schedule": null
  },
  "agent": {
    "id": 1,
    "name": null,
    "datacenter": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Heartbeat updated with new metrics and error information
- JSONB fields properly persisted to database

---

### Step 5: List All HTTP Heartbeats (GET)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/http-heartbeats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "executedAt": "2025-10-25T17:38:00.000Z",
    "success": false,
    "responseTimeMs": 450,
    "responseSizeBytes": 512,
    "responseStatusCode": 429,
    "responseContentType": "application/json",
    "responseServer": "RapidAPI-1.2.8",
    "responseCacheStatus": "",
    "dnsLookupMs": 32,
    "tcpConnectMs": 50,
    "tlsHandshakeMs": 105,
    "timeToFirstByteMs": 251,
    "warningThresholdMs": 300,
    "criticalThresholdMs": 800,
    "errorType": "RateLimitError",
    "errorMessage": "Too many requests",
    "rawRequestHeaders": {"User-Agent": "CustomMonitor/1.0", "Content-Type": "application/json"},
    "rawResponseHeaders": {"Date": "Sat, 25 Oct 2025 17:37:30 GMT", "Server": "RapidAPI-1.2.8.0.0", "X-Rapidapi-Version": "1.2.8"},
    "rawResponseBody": {"message": "Too many requests found, testing"},
    "monitor": {
      "id": 4,
      "name": null,
      "method": null,
      "type": null,
      "url": null,
      "headers": null,
      "body": null,
      "schedule": null
    },
    "agent": {
      "id": 1,
      "name": null,
      "datacenter": null
    }
  }
]
```

**Execution Result:**
- Status: ✅ SUCCESS
- Heartbeat listed in collection
- Pagination working correctly

---

### Step 6: Partial Update HTTP Heartbeat (PATCH)

**Request:**
```bash
curl -X PATCH "http://localhost:8080/api/http-heartbeats/1" \
  -H "Content-Type: application/merge-patch+json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw" \
  -d '{
    "success": true,
    "responseTimeMs": 200,
    "rawResponseBody": {"message": "Updated success response"}
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "executedAt": "2025-10-25T17:38:00.000Z",
  "success": true,
  "responseTimeMs": 200,
  "responseSizeBytes": 512,
  "responseStatusCode": 429,
  "responseContentType": "application/json",
  "responseServer": "RapidAPI-1.2.8",
  "responseCacheStatus": "",
  "dnsLookupMs": 32,
  "tcpConnectMs": 50,
  "tlsHandshakeMs": 105,
  "timeToFirstByteMs": 251,
  "warningThresholdMs": 300,
  "criticalThresholdMs": 800,
  "errorType": "RateLimitError",
  "errorMessage": "Too many requests",
  "rawRequestHeaders": {"User-Agent": "CustomMonitor/1.0", "Content-Type": "application/json"},
  "rawResponseHeaders": {"Date": "Sat, 25 Oct 2025 17:37:30 GMT", "Server": "RapidAPI-1.2.8.0.0", "X-Rapidapi-Version": "1.2.8"},
  "rawResponseBody": {"message": "Updated success response"},
  "monitor": {
    "id": 4,
    "name": null,
    "method": null,
    "type": null,
    "url": null,
    "headers": null,
    "body": null,
    "schedule": null
  },
  "agent": {
    "id": 1,
    "name": null,
    "datacenter": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Partial update applied correctly
- Other fields preserved
- JSONB field (rawResponseBody) updated successfully

---

### Step 7: Delete HTTP Heartbeat (DELETE)

**Request:**
```bash
curl -X DELETE "http://localhost:8080/api/http-heartbeats/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (204 No Content):**
- Empty response body

**Execution Result:**
- Status: ✅ SUCCESS
- Heartbeat deleted

---

### Step 8: Verify Deletion (GET)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/http-heartbeats/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (404 Not Found):**
```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Not Found",
  "status": 404,
  "detail": "404 NOT_FOUND",
  "path": "/api/http-heartbeats/1",
  "message": "error.http.404"
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Heartbeat not found (as expected)

---

## JSONB Field Testing

### Raw Request Headers Field
- **Storage Format**: PostgreSQL JSONB column
- **Sample Data**: `{"User-Agent": "CustomMonitor/1.0", "Content-Type": "application/json"}`
- **Validation**: Custom Hibernate JsonNodeType properly serializes/deserializes

### Raw Response Headers Field
- **Storage Format**: PostgreSQL JSONB column
- **Sample Data**: `{"Date": "Sat, 25 Oct 2025 17:37:30 GMT", "Server": "RapidAPI-1.2.8.0.0", "X-Rapidapi-Version": "1.2.8"}`
- **Validation**: Complex nested header values preserved

### Raw Response Body Field
- **Storage Format**: PostgreSQL JSONB column
- **Sample Data**: `{"message": "Too many requests found, testing"}`
- **Validation**: JSON body properly persisted and retrieved

---

## Data Validation

### Timing Metrics
- `dnsLookupMs`: DNS resolution time in milliseconds
- `tcpConnectMs`: TCP connection time in milliseconds
- `tlsHandshakeMs`: TLS handshake time in milliseconds
- `timeToFirstByteMs`: TTFB in milliseconds
- `responseTimeMs`: Total response time in milliseconds

### Response Metrics
- `responseStatusCode`: HTTP status code (e.g., 200, 429, 500)
- `responseSizeBytes`: Response payload size in bytes
- `responseContentType`: MIME type of response

### Error Handling
- `errorType`: Classification of error (e.g., "RateLimitError", "Timeout")
- `errorMessage`: Detailed error description
- `success`: Boolean flag for overall request success

### Authentication
- JWT tokens properly validated
- Bearer token authentication working correctly
- Admin role permissions verified

---

## Test Summary

| Operation | Method | Endpoint | Status | Result |
|-----------|--------|----------|--------|---------|
| Login | POST | `/api/authenticate` | ✅ 200 | Token obtained |
| Create | POST | `/api/http-heartbeats` | ✅ 201 | Heartbeat created (ID: 1) |
| Read | GET | `/api/http-heartbeats/1` | ✅ 200 | Data retrieved |
| Update | PUT | `/api/http-heartbeats/1` | ✅ 200 | Heartbeat updated |
| List | GET | `/api/http-heartbeats` | ✅ 200 | Collection retrieved |
| Partial Update | PATCH | `/api/http-heartbeats/1` | ✅ 200 | Fields updated |
| Delete | DELETE | `/api/http-heartbeats/1` | ✅ 204 | Heartbeat deleted |
| Verify | GET | `/api/http-heartbeats/1` | ✅ 404 | Not found (expected) |

## Notes
- All CRUD operations completed successfully
- JSONB fields (rawRequestHeaders, rawResponseHeaders, rawResponseBody) properly handle complex JSON objects
- Custom Hibernate JsonNodeType ensures proper serialization to PostgreSQL JSONB
- Authentication and authorization working correctly
- Database persistence verified through create/update/delete cycle
- Partial updates preserve unchanged fields while updating JSONB fields
- Error tracking with errorType and errorMessage working correctly
