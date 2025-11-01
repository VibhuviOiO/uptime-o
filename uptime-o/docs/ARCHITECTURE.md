# Architecture Overview

Understanding the UptimeO system architecture.

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - HTTP Monitor UI                                           │
│  - HTTP Heartbeat Dashboard                                  │
│  - Agent Management                                          │
│  - Schedule Configuration                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Spring Boot Backend                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Controllers (REST Endpoints)                          │ │
│  │  - HttpMonitorResource                                │ │
│  │  - HttpHeartbeatResource                              │ │
│  │  - AgentResource                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Services (Business Logic)                             │ │
│  │  - HttpMonitorService                                 │ │
│  │  - HttpHeartbeatService                               │ │
│  │  - AgentService                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Mappers (DTO ↔ Entity)                                │ │
│  │  - HttpMonitorMapper                                  │ │
│  │  - HttpHeartbeatMapper                                │ │
│  │  - Using MapStruct for type-safe mapping             │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Repositories (Data Access)                            │ │
│  │  - JPA Repository Pattern                             │ │
│  │  - Spring Data queries                                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ JDBC
                       │
┌──────────────────────▼──────────────────────────────────────┐
│             PostgreSQL Database                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tables:                                               │ │
│  │  - http_monitors (HTTP Monitor configs)               │ │
│  │  - api_heartbeats (Heartbeat records)                │ │
│  │  - agents (Monitoring agents)                         │ │
│  │  - schedules (Execution schedules)                    │ │
│  │                                                        │ │
│  │  JSONB Columns:                                       │ │
│  │  - raw_request_headers                               │ │
│  │  - raw_response_headers                              │ │
│  │  - raw_response_body                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. HTTP Monitor (Configuration)
- Stores HTTP monitoring configuration
- Defines URL, method, headers, body template
- Has associated Schedule and Agent
- Fields:
  - `id`: Unique identifier
  - `name`: Monitor name
  - `type`: Monitor type
  - `method`: HTTP method (GET, POST, etc.)
  - `url`: Target URL
  - `headers`: JSON object with request headers
  - `body`: JSON object with request body
  - `schedule`: Reference to execution schedule

### 2. HTTP Heartbeat (Execution Result)
- Records result of HTTP monitoring execution
- Captures timing metrics (DNS, TCP, TLS, TTFB)
- Stores request/response data as JSONB
- Fields:
  - `id`: Unique identifier
  - `executedAt`: Execution timestamp
  - `success`: Boolean success flag
  - `responseTimeMs`: Total response time
  - `responseStatusCode`: HTTP status code
  - `dnsLookupMs`: DNS resolution time
  - `tcpConnectMs`: TCP connection time
  - `tlsHandshakeMs`: TLS handshake time
  - `timeToFirstByteMs`: Time to first byte
  - `rawRequestHeaders`: JSONB request headers
  - `rawResponseHeaders`: JSONB response headers
  - `rawResponseBody`: JSONB response body
  - `errorType`: Classification of error (if any)
  - `errorMessage`: Error description (if any)

### 3. Agent
- Represents a monitoring agent/endpoint
- Associated with datacenter and region
- Can run multiple monitors

### 4. Schedule
- Defines execution frequency
- Used by monitors to determine execution interval

## Data Flow

### Creating a Monitor
1. User creates HTTP Monitor via UI
2. Monitor controller receives POST request
3. DTO validated and mapped to entity
4. Entity persisted to PostgreSQL
5. Response returned with created monitor ID

### Recording a Heartbeat
1. Scheduler triggers execution based on schedule
2. HTTP request executed with monitor config
3. Response captured (status, headers, body, timing)
4. Heartbeat entity created with results
5. JSONB fields serialized to PostgreSQL JSONB columns
6. Heartbeat persisted to database

### Retrieving Data
1. User requests heartbeats via API
2. Repository query executed
3. Entities loaded from database (with JSONB deserialization)
4. Entities mapped to DTOs
5. DTOs serialized to JSON response
6. Response sent to client

## Technology Stack Details

### Backend Framework
- **Spring Boot 3.x**: Application framework
- **JHipster**: Scaffolding and code generation
- **Spring Data JPA**: Data persistence abstraction
- **Hibernate 6.x**: ORM with JSONB support via JsonNodeType

### JSON Handling
- **Jackson**: JSON serialization/deserialization (frontend ↔ API)
- **JsonNode**: Represents JSON data in memory
- **JsonNodeType**: Custom Hibernate type for PostgreSQL JSONB

### API & Web
- **Spring Web**: REST endpoints
- **Spring Security**: Authentication & authorization
- **JWT**: Stateless authentication tokens

### Database
- **PostgreSQL**: Primary database
- **JSONB**: Native JSON storage type
- **Liquibase**: Database migrations (handled by JHipster)

### Code Generation & Mapping
- **MapStruct**: Type-safe DTO ↔ Entity mapping
- **Lombok**: Annotations for boilerplate reduction

### Frontend
- **React 18+**: UI framework
- **react-hook-form**: Form handling
- **Redux**: State management
- **TypeScript**: Type safety for JavaScript

## Authentication & Authorization

### JWT Authentication
1. User sends credentials to `/api/authenticate`
2. Server validates credentials against database
3. JWT token generated with user claims (username, roles, expiry)
4. Token returned in response
5. Client includes token in Authorization header for subsequent requests
6. Server validates JWT signature and expiry on each request

### Role-Based Access Control (RBAC)
- `ROLE_ADMIN`: Full system access
- `ROLE_USER`: Limited access to own resources

## JSON Field Serialization Flow

### Frontend → API
```
JSON Object (e.g., {"key": "value"})
     ↓
Jackson deserialization
     ↓
JsonNode (in-memory representation)
     ↓
DTO field assignment
```

### API → Database
```
JsonNode (from DTO)
     ↓
MapStruct mapping
     ↓
JsonNode (in entity)
     ↓
Hibernate JsonNodeType
     ↓
PostgreSQL JSONB column
```

### Database → API → Frontend
```
PostgreSQL JSONB
     ↓
Hibernate JsonNodeType deserialization
     ↓
JsonNode (in entity)
     ↓
MapStruct mapping
     ↓
JsonNode (in DTO)
     ↓
Jackson serialization
     ↓
JSON Object in HTTP response
```

## Error Handling

- Custom exception handlers for REST endpoints
- Error responses include type, title, status, detail
- Logging of all errors via LoggingAspect
- Database transaction rollback on error

## Performance Considerations

- JSONB columns indexed in PostgreSQL
- Repository queries optimized with proper loading strategies
- JWT token validation cached during request
- MapStruct compile-time code generation for efficient mapping

---

**Next**: See [DEVELOPMENT.md](DEVELOPMENT.md) for development workflow
