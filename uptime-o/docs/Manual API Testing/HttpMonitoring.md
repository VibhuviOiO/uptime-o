# HTTP Monitoring API Manual Testing Guide

## Overview
This document provides comprehensive manual testing procedures for the HTTP Monitoring APIs in the UptimeO application.

## Prerequisites
- Application running on `http://localhost:8080`
- PostgreSQL database with proper schema
- Valid user credentials (admin/admin)

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
- Token obtained: `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw`

---

## HTTP Monitors CRUD Operations

### Step 2: Create HTTP Monitor (POST)

**Request:**
```bash
curl -X POST "http://localhost:8080/api/http-monitors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw" \
  -d '{
    "name": "Test Monitor",
    "method": "GET",
    "type": "HTTPS",
    "url": "https://httpbin.org/get",
    "schedule": {"id": 1}
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 1251,
  "name": "Test Monitor",
  "method": "GET",
  "type": "HTTPS",
  "url": "https://httpbin.org/get",
  "headers": null,
  "body": null,
  "schedule": {
    "id": 1,
    "name": null,
    "interval": null,
    "includeResponseBody": null,
    "thresholdsWarning": null,
    "thresholdsCritical": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Created Monitor ID: 1251
- Location Header: `/api/http-monitors/1251`

---

### Step 3: Read HTTP Monitor (GET)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/http-monitors/1251" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (200 OK):**
```json
{
  "id": 1251,
  "name": "Test Monitor",
  "method": "GET",
  "type": "HTTPS",
  "url": "https://httpbin.org/get",
  "headers": null,
  "body": null,
  "schedule": {
    "id": 1,
    "name": null,
    "interval": null,
    "includeResponseBody": null,
    "thresholdsWarning": null,
    "thresholdsCritical": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Data retrieved correctly

---

### Step 4: Update HTTP Monitor (PUT)

**Request:**
```bash
curl -X PUT "http://localhost:8080/api/http-monitors/1251" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw" \
  -d '{
    "id": 1251,
    "name": "Updated Test Monitor",
    "method": "POST",
    "type": "HTTPS",
    "url": "https://httpbin.org/post",
    "headers": {
      "Content-Type": "application/json",
      "User-Agent": "UptimeMonitor"
    },
    "body": {
      "key": "value",
      "test": true
    },
    "schedule": {"id": 1}
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 1251,
  "name": "Updated Test Monitor",
  "method": "POST",
  "type": "HTTPS",
  "url": "https://httpbin.org/post",
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "UptimeMonitor"
  },
  "body": {
    "key": "value",
    "test": true
  },
  "schedule": {
    "id": 1,
    "name": null,
    "interval": null,
    "includeResponseBody": null,
    "thresholdsWarning": null,
    "thresholdsCritical": null
  }
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Monitor updated with JSON headers and body

---

### Step 5: List All HTTP Monitors (GET)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/http-monitors" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1251,
    "name": "Updated Test Monitor",
    "method": "POST",
    "type": "HTTPS",
    "url": "https://httpbin.org/post",
    "headers": {
      "Content-Type": "application/json",
      "User-Agent": "UptimeMonitor"
    },
    "body": {
      "key": "value",
      "test": true
    },
    "schedule": {
      "id": 1,
      "name": null,
      "interval": null,
      "includeResponseBody": null,
      "thresholdsWarning": null,
      "thresholdsCritical": null
    }
  }
]
```

**Execution Result:**
- Status: ✅ SUCCESS
- Monitor listed in collection

---

### Step 6: Delete HTTP Monitor (DELETE)

**Request:**
```bash
curl -X DELETE "http://localhost:8080/api/http-monitors/1251" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (204 No Content):**
- Empty response body

**Execution Result:**
- Status: ✅ SUCCESS
- Monitor deleted

---

### Step 7: Verify Deletion (GET)

**Request:**
```bash
curl -X GET "http://localhost:8080/api/http-monitors/1251" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2MjA2NjA4MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzYxOTc5NjgwLCJ1c2VySWQiOjF9.e0Yj4HpRmsFV9qEOMzBXWsQitSKv9IcLLFiJL2lPqXZZwf6GkVROwEJ8-7_KcnuTShLagbXrcdyvlhFaGWqqGw"
```

**Expected Response (404 Not Found):**
```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Not Found",
  "status": 404,
  "detail": "404 NOT_FOUND",
  "path": "/api/http-monitors/1251",
  "message": "error.http.404"
}
```

**Execution Result:**
- Status: ✅ SUCCESS
- Monitor not found (as expected)

---

## Data Validation

### JSONB Field Handling
- **Headers**: Properly stored as JSON objects in PostgreSQL JSONB column
- **Body**: Properly stored as JSON objects in PostgreSQL JSONB column
- **Null Values**: Correctly handled for optional JSONB fields

### Authentication
- JWT tokens are properly validated
- Bearer token authentication working correctly
- Admin role permissions verified

## Test Summary

| Operation | Method | Endpoint | Status | Result |
|-----------|--------|----------|--------|---------|
| Login | POST | `/api/authenticate` | ✅ 200 | Token obtained |
| Create | POST | `/api/http-monitors` | ✅ 201 | Monitor created (ID: 1251) |
| Read | GET | `/api/http-monitors/1251` | ✅ 200 | Data retrieved |
| Update | PUT | `/api/http-monitors/1251` | ✅ 200 | Monitor updated |
| List | GET | `/api/http-monitors` | ✅ 200 | Collection retrieved |
| Delete | DELETE | `/api/http-monitors/1251` | ✅ 204 | Monitor deleted |
| Verify | GET | `/api/http-monitors/1251` | ✅ 404 | Not found (expected) |

## Notes
- All CRUD operations completed successfully
- JSONB fields properly handle complex JSON objects
- Authentication and authorization working correctly
- Database persistence verified through create/update/delete cycle