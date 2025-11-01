# JSON Fields Implementation Guide

Complete guide to working with JSON fields in UptimeO.

## Overview

UptimeO uses PostgreSQL JSONB columns to store flexible JSON data. The three main JSON fields in HTTP Heartbeat are:
- `rawRequestHeaders`: Request headers sent to target
- `rawResponseHeaders`: Response headers from target
- `rawResponseBody`: Response body content

## Architecture

### Type Conversion Stack

```
JSON String (from frontend)
       ↓
Jackson ObjectMapper
       ↓
JsonNode (Java object)
       ↓
DTO field (JsonNode type)
       ↓
MapStruct mapper
       ↓
Entity field (JsonNode type)
       ↓
Hibernate JsonNodeType
       ↓
PostgreSQL JSONB
```

### Key Classes

**JsonNode** (`com.fasterxml.jackson.databind.JsonNode`)
- Immutable representation of JSON data
- Supports various JSON types: objects, arrays, strings, numbers, booleans, null
- Provides convenient methods for traversal and conversion

**HttpHeartbeatDTO** (`uptime.observability.service.dto`)
- Data Transfer Object for API communication
- Contains JsonNode fields for JSON data
- Mapped from/to entity via MapStruct

**HttpHeartbeat** (Entity)
- JPA entity representing heartbeat record
- Annotated with `@Type(JsonNodeType.class)` for JSONB fields
- Persisted to PostgreSQL with JSONB serialization

**HttpHeartbeatMapper** (MapStruct)
- Automatically generated mapper
- Handles bidirectional conversion between DTO and Entity
- No explicit conversion needed for JsonNode fields

**JsonNodeType** (Custom Hibernate Type)
- Custom type implementation for Hibernate
- Handles conversion between JsonNode and PostgreSQL JSONB
- Automatically used via `@Type` annotation

## Usage Examples

### Creating a Heartbeat with JSON Fields

```bash
curl -X POST "http://localhost:8080/api/http-heartbeats" \
  -H "Content-Type: application/json" \
  -d '{
    "executedAt": "2025-10-25T17:37:00.000Z",
    "success": true,
    "responseTimeMs": 150,
    "rawRequestHeaders": {
      "User-Agent": "UptimeMonitor/1.0",
      "Accept": "*/*",
      "Authorization": "Bearer token123"
    },
    "rawResponseHeaders": {
      "Content-Type": "application/json",
      "Server": "nginx/1.21.0",
      "X-RateLimit-Limit": "1000",
      "X-RateLimit-Remaining": "999"
    },
    "rawResponseBody": {
      "status": "ok",
      "data": {
        "uptime": 99.9,
        "lastChecked": "2025-10-25T17:37:00Z"
      }
    },
    "monitor": {"id": 1},
    "agent": {"id": 1}
  }'
```

### Querying Heartbeats with JSON Fields

```bash
# Get a specific heartbeat
curl -X GET "http://localhost:8080/api/http-heartbeats/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response will include properly formatted JSON:
```json
{
  "id": 1,
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
    "data": {...}
  }
}
```

### Updating JSON Fields (PUT)

```bash
curl -X PUT "http://localhost:8080/api/http-heartbeats/1" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "executedAt": "2025-10-25T17:38:00.000Z",
    "success": false,
    "responseTimeMs": 5000,
    "rawResponseBody": {
      "error": "Request timeout",
      "code": "TIMEOUT_ERROR"
    },
    "monitor": {"id": 1},
    "agent": {"id": 1}
  }'
```

### Partial Update (PATCH)

```bash
curl -X PATCH "http://localhost:8080/api/http-heartbeats/1" \
  -H "Content-Type: application/merge-patch+json" \
  -d '{
    "rawResponseBody": {
      "status": "updated",
      "timestamp": "2025-10-25T17:39:00Z"
    }
  }'
```

## Frontend Implementation

### React Component with JSON Fields

```typescript
import { JsonField, TextField, Form, ValidatedForm } from 'react-jhipster';

interface HttpHeartbeatFormProps {
  httpHeartbeat?: IHttpHeartbeat;
  onSubmit: (data: IHttpHeartbeat) => void;
}

export const HttpHeartbeatForm: React.FC<HttpHeartbeatFormProps> = ({
  httpHeartbeat,
  onSubmit,
}) => {
  const formatJsonValue = (value: any): string => {
    if (!value) return '';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  };

  const validateJson = (value: string): boolean => {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* Regular fields */}
      <TextField label="Executed At" name="executedAt" />
      <TextField label="Response Time (ms)" name="responseTimeMs" type="number" />
      
      {/* JSON Fields as Textareas */}
      <ValidatedField
        label="Raw Request Headers"
        name="rawRequestHeadersText"
        type="textarea"
        defaultValue={formatJsonValue(httpHeartbeat?.rawRequestHeaders)}
        validate={(value: string) => validateJson(value)}
        help="Enter valid JSON"
      />
      
      <ValidatedField
        label="Raw Response Headers"
        name="rawResponseHeadersText"
        type="textarea"
        defaultValue={formatJsonValue(httpHeartbeat?.rawResponseHeaders)}
        validate={(value: string) => validateJson(value)}
        help="Enter valid JSON"
      />
      
      <ValidatedField
        label="Raw Response Body"
        name="rawResponseBodyText"
        type="textarea"
        defaultValue={formatJsonValue(httpHeartbeat?.rawResponseBody)}
        validate={(value: string) => validateJson(value)}
        help="Enter valid JSON"
      />
    </Form>
  );
};
```

## Backend Implementation

### Entity Definition

```java
@Entity
@Table(name = "api_heartbeats")
public class HttpHeartbeat {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @Column(name = "raw_request_headers", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rawRequestHeaders;

    @Column(name = "raw_response_headers", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rawResponseHeaders;

    @Column(name = "raw_response_body", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode rawResponseBody;

    // getters and setters
    public JsonNode getRawRequestHeaders() {
        return rawRequestHeaders;
    }

    public void setRawRequestHeaders(JsonNode rawRequestHeaders) {
        this.rawRequestHeaders = rawRequestHeaders;
    }
}
```

### DTO Definition

```java
public class HttpHeartbeatDTO {
    private Long id;
    private JsonNode rawRequestHeaders;
    private JsonNode rawResponseHeaders;
    private JsonNode rawResponseBody;

    public JsonNode getRawRequestHeaders() {
        return rawRequestHeaders;
    }

    public void setRawRequestHeaders(JsonNode rawRequestHeaders) {
        this.rawRequestHeaders = rawRequestHeaders;
    }
}
```

### Mapper Definition

```java
@Mapper(componentModel = "spring")
public interface HttpHeartbeatMapper extends EntityMapper<HttpHeartbeatDTO, HttpHeartbeat> {
    @Mapping(target = "monitor", source = "monitor", qualifiedByName = "apiMonitorId")
    @Mapping(target = "agent", source = "agent", qualifiedByName = "agentId")
    HttpHeartbeatDTO toDto(HttpHeartbeat s);

    HttpHeartbeat toEntity(HttpHeartbeatDTO s);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget HttpHeartbeat entity, HttpHeartbeatDTO dto);
}
```

## Common Operations

### Working with JsonNode in Java

```java
// Creating JsonNode
ObjectMapper mapper = new ObjectMapper();
JsonNode headers = mapper.readTree("{\"Content-Type\": \"application/json\"}");

// Accessing nested values
String contentType = headers.get("Content-Type").asText();

// Checking field existence
if (headers.has("Authorization")) {
    String auth = headers.get("Authorization").asText();
}

// Iterating over fields
headers.fields().forEachRemaining(entry -> {
    String key = entry.getKey();
    String value = entry.getValue().asText();
});

// Converting to String
String jsonString = headers.toString();

// Converting to Map
Map<String, Object> map = mapper.convertValue(headers, Map.class);
```

### Validation

```java
private boolean validateJsonField(JsonNode node) {
    if (node == null) {
        return true; // Optional field
    }
    
    if (!node.isObject() && !node.isArray()) {
        throw new BadRequestException("JSON field must be object or array");
    }
    
    // Additional validation
    if (node.isObject()) {
        // Validate required fields
        if (!node.has("requiredField")) {
            throw new BadRequestException("Missing required field");
        }
    }
    
    return true;
}
```

## Database Queries

### PostgreSQL JSONB Queries

```sql
-- Query by JSON field value
SELECT * FROM api_heartbeats 
WHERE raw_response_headers->>'Content-Type' = 'application/json';

-- Query JSON field contains key
SELECT * FROM api_heartbeats 
WHERE raw_response_headers ? 'Server';

-- Query JSON array contains value
SELECT * FROM api_heartbeats 
WHERE raw_response_body->'items' @> '["item1"]';

-- Update JSON field
UPDATE api_heartbeats 
SET raw_response_headers = jsonb_set(raw_response_headers, '{Updated}', '"true"')
WHERE id = 1;
```

## Troubleshooting

### Issue: "Cannot deserialize value of type String from Object value"
**Cause**: DTO field is String type but receiving JSON object
**Fix**: Change DTO field to `JsonNode` type

### Issue: "Duplicate row was found and ASSERT was specified"
**Cause**: Hibernate caching or query issue
**Fix**: Clear session cache, use fresh queries

### Issue: JSON field appears as string in response
**Cause**: Jackson not configured to handle JsonNode
**Fix**: Ensure Jackson is properly configured in Spring Boot

### Issue: JSONB validation failing
**Cause**: PostgreSQL JSONB column constraint
**Fix**: Ensure JSON is valid before inserting

## Best Practices

1. **Always validate JSON** before sending to API
2. **Use pretty-printing** for debugging and UI display
3. **Handle null values** gracefully in JSON fields
4. **Index JSONB columns** in PostgreSQL for better query performance
5. **Document JSON schema** for each field
6. **Test JSON round-trips** (JSON → Object → JSON)
7. **Use proper error messages** when JSON validation fails
8. **Keep JSON field sizes reasonable** to avoid performance issues

## Performance Tips

- Use JSONB instead of TEXT for JSON data
- Index frequently queried JSON fields: `CREATE INDEX idx_heartbeat_headers ON api_heartbeats USING gin(raw_response_headers)`
- Limit JSON field sizes in application validation
- Use connection pooling for database queries
- Cache frequently accessed JSON data

---

**See Also**: 
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [API_TESTING.md](../Manual%20API%20Testing/HttpHeartbeat.md) - API testing with JSON fields
