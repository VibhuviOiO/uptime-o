# Testing Guide

Comprehensive guide for testing UptimeO application.

## Testing Framework

UptimeO uses:
- **JUnit 5** - Test framework
- **Mockito** - Mocking framework
- **AssertJ** - Assertions
- **Spring Test** - Spring Boot testing utilities
- **TestContainers** - Docker containers for integration tests
- **Jest** - Frontend testing

## Test Structure

```
src/test/
├── java/uptime/observability/
│   ├── domain/          # Entity tests
│   ├── service/         # Service tests
│   ├── web/rest/        # REST controller tests (IT)
│   ├── security/        # Security tests
│   └── IntegrationTest.java  # Base integration test class
└── resources/
    ├── junit-platform.properties
    ├── application.yml  # Test configuration
    └── config/
```

## Unit Testing

### Entity Testing

**File**: `src/test/java/uptime/observability/domain/HttpHeartbeatTest.java`

```java
@DisplayName("HttpHeartbeat Entity")
class HttpHeartbeatTest {
    private HttpHeartbeat heartbeat;

    @BeforeEach
    void setup() {
        heartbeat = new HttpHeartbeat();
    }

    @Nested
    @DisplayName("Setters and Getters")
    class SettersAndGetters {
        @Test
        void testSetAndGetId() {
            heartbeat.setId(1L);
            assertThat(heartbeat.getId()).isEqualTo(1L);
        }

        @Test
        void testSetAndGetMonitorId() {
            heartbeat.setMonitorId(123L);
            assertThat(heartbeat.getMonitorId()).isEqualTo(123L);
        }

        @Test
        void testSetAndGetJsonFields() {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.valueToTree(Map.of("status", "ok"));
            
            heartbeat.setRawResponseBody(json);
            assertThat(heartbeat.getRawResponseBody()).isEqualTo(json);
        }
    }

    @Nested
    @DisplayName("JSON Field Handling")
    class JsonFieldHandling {
        @Test
        void testJsonNodeIsPreserved() {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode original = mapper.valueToTree(Map.of(
                "key1", "value1",
                "nested", Map.of("key2", "value2")
            ));

            heartbeat.setRawResponseBody(original);
            JsonNode retrieved = heartbeat.getRawResponseBody();

            assertThat(retrieved.toString()).isEqualTo(original.toString());
        }

        @Test
        void testNullJsonHandling() {
            heartbeat.setRawResponseBody(null);
            assertThat(heartbeat.getRawResponseBody()).isNull();
        }
    }
}
```

### DTO Testing

**File**: `src/test/java/uptime/observability/service/dto/HttpHeartbeatDTOTest.java`

```java
@DisplayName("HttpHeartbeatDTO")
class HttpHeartbeatDTOTest {
    private HttpHeartbeatDTO dto;
    private ObjectMapper mapper;

    @BeforeEach
    void setup() {
        dto = new HttpHeartbeatDTO();
        mapper = new ObjectMapper();
    }

    @Test
    @DisplayName("should serialize to JSON")
    void testSerialization() throws Exception {
        dto.setId(1L);
        dto.setMonitorId(123L);
        dto.setStatusCode(200);
        dto.setRawResponseBody(mapper.valueToTree(Map.of("status", "ok")));

        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"id\":1")
            .contains("\"statusCode\":200")
            .contains("\"status\":\"ok\"");
    }

    @Test
    @DisplayName("should deserialize from JSON")
    void testDeserialization() throws Exception {
        String json = """
            {
                "id": 1,
                "monitorId": 123,
                "statusCode": 200,
                "rawResponseBody": {"status": "ok"}
            }
            """;

        HttpHeartbeatDTO deserialized = mapper.readValue(json, HttpHeartbeatDTO.class);

        assertThat(deserialized.getId()).isEqualTo(1L);
        assertThat(deserialized.getStatusCode()).isEqualTo(200);
        assertThat(deserialized.getRawResponseBody().get("status").asText()).isEqualTo("ok");
    }

    @Test
    @DisplayName("should handle complex nested JSON")
    void testComplexJsonHandling() throws Exception {
        JsonNode complexJson = mapper.valueToTree(Map.of(
            "request", Map.of(
                "headers", Map.of("Content-Type", "application/json"),
                "body", Map.of("key", "value")
            ),
            "response", Map.of(
                "status", 200,
                "data", new int[]{1, 2, 3}
            )
        ));

        dto.setRawResponseBody(complexJson);
        String json = mapper.writeValueAsString(dto);
        HttpHeartbeatDTO restored = mapper.readValue(json, HttpHeartbeatDTO.class);

        assertThat(restored.getRawResponseBody()).isEqualTo(complexJson);
    }
}
```

### Service Testing

**File**: `src/test/java/uptime/observability/service/HttpHeartbeatServiceTest.java`

```java
@DisplayName("HttpHeartbeatService")
class HttpHeartbeatServiceTest {
    @Mock
    private HttpHeartbeatRepository repository;

    @Mock
    private HttpHeartbeatMapper mapper;

    @InjectMocks
    private HttpHeartbeatService service;

    private HttpHeartbeat entity;
    private HttpHeartbeatDTO dto;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        entity = new HttpHeartbeat();
        entity.setId(1L);
        entity.setMonitorId(123L);

        dto = new HttpHeartbeatDTO();
        dto.setId(1L);
        dto.setMonitorId(123L);
    }

    @Test
    @DisplayName("should find heartbeat by id")
    void testFindOne() {
        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.toDto(entity)).thenReturn(dto);

        Optional<HttpHeartbeatDTO> result = service.findOne(1L);

        assertThat(result).isPresent().contains(dto);
        verify(repository).findById(1L);
    }

    @Test
    @DisplayName("should save heartbeat")
    void testSave() {
        when(mapper.toEntity(dto)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(dto);

        HttpHeartbeatDTO result = service.save(dto);

        assertThat(result).isEqualTo(dto);
        verify(repository).save(entity);
    }

    @Test
    @DisplayName("should delete heartbeat")
    void testDelete() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    @DisplayName("should find heartbeats by monitor id")
    void testFindByMonitorId() {
        when(repository.findByMonitorId(123L)).thenReturn(List.of(entity));
        when(mapper.toDto(entity)).thenReturn(dto);

        List<HttpHeartbeatDTO> result = service.findByMonitorId(123L);

        assertThat(result).hasSize(1).contains(dto);
    }
}
```

## Integration Testing

### REST Controller Test

**File**: `src/test/java/uptime/observability/web/rest/HttpHeartbeatResourceIT.java`

```java
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@DisplayName("HttpHeartbeatResource Integration Tests")
class HttpHeartbeatResourceIT {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HttpHeartbeatRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    private HttpHeartbeat heartbeat;

    @BeforeEach
    void setup() {
        repository.deleteAll();
        
        heartbeat = new HttpHeartbeat();
        heartbeat.setMonitorId(123L);
        heartbeat.setStatusCode(200);
        heartbeat.setResponseTime(100L);
    }

    @AfterEach
    void cleanup() {
        repository.deleteAll();
    }

    @Nested
    @DisplayName("GET /api/http-heartbeats")
    class GetAllHeartbeats {
        @Test
        @DisplayName("should return all heartbeats")
        void testGetAll() throws Exception {
            repository.save(heartbeat);

            mockMvc.perform(get("/api/http-heartbeats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].statusCode").value(200));
        }

        @Test
        @DisplayName("should support pagination")
        void testPagination() throws Exception {
            for (int i = 0; i < 15; i++) {
                HttpHeartbeat hb = new HttpHeartbeat();
                hb.setMonitorId(123L);
                hb.setStatusCode(200 + i);
                repository.save(hb);
            }

            mockMvc.perform(get("/api/http-heartbeats")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)));
        }
    }

    @Nested
    @DisplayName("POST /api/http-heartbeats")
    class CreateHeartbeat {
        @Test
        @DisplayName("should create heartbeat with JSON fields")
        void testCreateWithJsonFields() throws Exception {
            ObjectMapper mapper = new ObjectMapper();
            HttpHeartbeatDTO dto = new HttpHeartbeatDTO();
            dto.setMonitorId(123L);
            dto.setStatusCode(200);
            dto.setRawRequestHeaders(mapper.valueToTree(
                Map.of("User-Agent", "UptimeMonitor/1.0")
            ));
            dto.setRawResponseHeaders(mapper.valueToTree(
                Map.of("Content-Type", "application/json")
            ));
            dto.setRawResponseBody(mapper.valueToTree(
                Map.of("status", "ok")
            ));

            mockMvc.perform(post("/api/http-heartbeats")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value(200))
                .andExpect(jsonPath("$.rawResponseBody.status").value("ok"));

            assertThat(repository.count()).isEqualTo(1);
        }

        @Test
        @DisplayName("should validate required fields")
        void testValidation() throws Exception {
            HttpHeartbeatDTO dto = new HttpHeartbeatDTO();
            // Missing required fields

            mockMvc.perform(post("/api/http-heartbeats")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/http-heartbeats/{id}")
    class GetHeartbeat {
        @Test
        @DisplayName("should return heartbeat by id")
        void testGetById() throws Exception {
            HttpHeartbeat saved = repository.save(heartbeat);

            mockMvc.perform(get("/api/http-heartbeats/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.statusCode").value(200));
        }

        @Test
        @DisplayName("should return 404 for non-existent heartbeat")
        void testNotFound() throws Exception {
            mockMvc.perform(get("/api/http-heartbeats/{id}", 999))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /api/http-heartbeats/{id}")
    class UpdateHeartbeat {
        @Test
        @DisplayName("should update heartbeat")
        void testUpdate() throws Exception {
            HttpHeartbeat saved = repository.save(heartbeat);

            HttpHeartbeatDTO dto = new HttpHeartbeatDTO();
            dto.setStatusCode(500);
            dto.setMonitorId(123L);

            mockMvc.perform(put("/api/http-heartbeats/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusCode").value(500));
        }
    }

    @Nested
    @DisplayName("DELETE /api/http-heartbeats/{id}")
    class DeleteHeartbeat {
        @Test
        @DisplayName("should delete heartbeat")
        void testDelete() throws Exception {
            HttpHeartbeat saved = repository.save(heartbeat);

            mockMvc.perform(delete("/api/http-heartbeats/{id}", saved.getId()))
                .andExpect(status().isNoContent());

            assertThat(repository.findById(saved.getId())).isEmpty();
        }
    }
}
```

## Running Tests

### Maven Commands

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=HttpHeartbeatServiceTest

# Run specific test method
./mvnw test -Dtest=HttpHeartbeatResourceIT#testGetAll

# Run tests matching pattern
./mvnw test -Dtest=*Service*

# Skip tests during build
./mvnw clean package -DskipTests

# Run with coverage
./mvnw jacoco:report
# View report: target/site/jacoco/index.html
```

### IDE Integration

**IntelliJ IDEA**:
- Right-click test file → Run 'TestClass'
- Right-click test method → Run 'testMethod()'
- Use gutter icons to run tests

**VS Code**:
- Install Test Runner for Java extension
- Click "Run" above test methods
- View results in Test Explorer

## Test Coverage

### Generate Report

```bash
./mvnw jacoco:report
```

### View Coverage

Open `target/site/jacoco/index.html` in browser to view:
- Line coverage
- Branch coverage
- Complexity analysis

### Coverage Goals

Set coverage requirements in `pom.xml`:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <includesClasses>uptime.observability.service.*</includesClasses>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

## Frontend Testing (Jest)

### Test File Structure

```
src/main/webapp/app/
├── modules/
│   └── module-name/
│       ├── component.tsx
│       └── component.test.tsx
```

### Example Test

**File**: `src/main/webapp/app/modules/monitor/monitor-list.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MonitorList from './monitor-list';

describe('MonitorList Component', () => {
    test('renders monitor list', () => {
        render(<MonitorList />);
        expect(screen.getByText(/monitors/i)).toBeInTheDocument();
    });

    test('displays loading state initially', () => {
        render(<MonitorList />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('handles monitor selection', () => {
        const handleSelect = jest.fn();
        render(<MonitorList onSelect={handleSelect} />);
        
        const button = screen.getByRole('button', { name: /first-monitor/i });
        fireEvent.click(button);
        
        expect(handleSelect).toHaveBeenCalled();
    });
});
```

### Run Frontend Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test monitor-list.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Performance Testing

### Load Testing with JMeter

```bash
# Install JMeter (if not installed)
# Download from: https://jmeter.apache.org/download_jmeter.html

# Create test plan
jmeter -n -t load-test.jmx -l results.jtl

# View results
jmeter -g results.jtl -j jmeter.log
```

### Example Load Test

**File**: `load-test.jmx` (JMeter test plan - create via GUI)

Key elements:
- Thread Group: 100 threads, 10 ramp-up seconds
- HTTP Sampler: GET /api/http-heartbeats
- Assertions: Response code = 200
- Listeners: Results Tree, Summary Report

## Continuous Integration

### GitHub Actions

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: uptimeo_test
          POSTGRES_USER: uptimeo
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Run tests
        run: ./mvnw test
      
      - name: Generate coverage report
        run: ./mvnw jacoco:report
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Checklist

- [ ] Unit tests for all services
- [ ] Unit tests for all DTOs
- [ ] Integration tests for REST endpoints
- [ ] Security tests for authentication/authorization
- [ ] Database migration tests
- [ ] JSON field serialization tests
- [ ] Error handling tests
- [ ] Pagination tests
- [ ] Frontend component tests
- [ ] API contract tests
- [ ] Performance tests
- [ ] Coverage report generated
- [ ] All tests passing

---

**See Also**: 
- [API_TESTING.md](API_TESTING.md) - API testing procedures
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guidelines
