# HTTP Heartbeat DTO JSON Deserialization Fix

## Problem
The API was returning a **400 Bad Request** error when attempting to POST JSON objects in the `rawRequestHeaders`, `rawResponseHeaders`, and `rawResponseBody` fields:

```
JSON parse error: Cannot deserialize value of type `java.lang.String` from Object value (token `JsonToken.START_OBJECT`)
```

## Root Cause
While the backend **entity** (`HttpHeartbeat.java`) had the correct `JsonNode` types with proper Hibernate serialization, the **DTO** (`HttpHeartbeatDTO.java`) still declared these fields as `String` type. When Jackson tried to deserialize JSON objects from the request body into String fields, it failed because you cannot deserialize an object directly into a String without explicit conversion.

## Solution Applied
Changed the DTO fields from `String` to `JsonNode` to match the entity:

### Before:
```java
private String rawRequestHeaders;
private String rawResponseHeaders;
private String rawResponseBody;
```

### After:
```java
private JsonNode rawRequestHeaders;
private JsonNode rawResponseHeaders;
private JsonNode rawResponseBody;
```

### File Changed:
- `/Users/jinnabalaiah/algonomy/practice/UptimeO/uptime-o/src/main/java/uptime/observability/service/dto/HttpHeartbeatDTO.java`

### Mapper Cleanup:
Since both entity and DTO now use `JsonNode`, removed the unnecessary MapStruct qualifiers and custom conversion methods from `HttpHeartbeatMapper.java` that were trying to convert between String and JsonNode.

## Test Results
✅ **POST Request Successful (201 CREATED)**

```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "executedAt": "2025-10-25T17:37:00.000Z",
    "success": true,
    "responseTimeMs": 150,
    "responseSizeBytes": 2048,
    "responseStatusCode": 200,
    "rawRequestHeaders": {"User-Agent": "UptimeMonitor/1.0", "Accept": "*/*"},
    "rawResponseHeaders": {"Content-Type": "application/json", "Server": "nginx/1.21.0"},
    "rawResponseBody": {"status": "ok", "data": "success"},
    "monitor": {"id": 4},
    "agent": {"id": 1}
  }'
```

**Response (201 Created):**
```json
{
  "id": 1351,
  "executedAt": "2025-10-25T17:37:00Z",
  "rawRequestHeaders": {
    "User-Agent": "UptimeMonitor/1.0",
    "Accept": "*/*"
  },
  "rawResponseHeaders": {
    "Content-Type": "application/json",
    "Server": "nginx/1.21.0"
  },
  "rawResponseBody": {
    "status": "ok",
    "data": "success"
  },
  ...
}
```

## Key Points
1. **JSON objects are now properly deserialized** from the request body into the DTO fields
2. **No more type mismatch errors** between incoming JSON and DTO field types
3. **MapStruct mapping works seamlessly** since both sides use the same type (`JsonNode`)
4. **PostgreSQL JSONB storage** continues to work correctly via the entity's `@Type(JsonNodeType.class)` annotation
5. **API now follows the documented contract** - accepting JSON objects directly in the request body

## Build Status
✅ **Successful** - 79MB JAR file compiled and deployed without errors

## Next Steps
The API is now fully functional for HTTP Heartbeat CRUD operations with proper JSON field handling. You can:
1. Continue using the curl examples in `Manual API Testing/HttpHeartbeat.md`
2. Test via the frontend UI which now properly supports JSON field editing
3. Verify data persistence in PostgreSQL JSONB columns
