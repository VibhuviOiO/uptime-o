# Development Guide

Comprehensive guide for developing features in UptimeO.

## Development Setup

### Prerequisites
- Java 17+ (`java -version`)
- Maven 3.8+ (`mvn -version`)
- PostgreSQL 12+ (`psql --version`)
- Node.js 16+ (`node -version`) - for frontend
- Git (`git --version`)

### Environment Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd uptime-o

# 2. Start PostgreSQL (if not running)
docker run --name postgres-dev \
  -e POSTGRES_DB=uptimeo \
  -e POSTGRES_USER=uptimeo \
  -e POSTGRES_PASSWORD=uptimeo \
  -p 5432:5432 \
  -d postgres:15

# 3. Build project
./mvnw clean install -DskipTests

# 4. Run application
./mvnw spring-boot:run
```

## Project Structure

```
uptime-o/
├── src/
│   ├── main/
│   │   ├── java/uptime/observability/
│   │   │   ├── domain/              # JPA entities
│   │   │   ├── service/dto/         # DTOs
│   │   │   ├── service/mapper/      # MapStruct mappers
│   │   │   ├── service/             # Business logic
│   │   │   ├── web/rest/            # REST controllers
│   │   │   └── security/            # Auth & security
│   │   ├── resources/
│   │   │   ├── application.yml      # Main config
│   │   │   ├── application-dev.yml  # Dev config
│   │   │   └── db/changelog/        # Liquibase migrations
│   │   └── webapp/                  # Frontend (React)
│   └── test/
│       ├── java/                    # Unit & integration tests
│       └── resources/               # Test config
├── pom.xml                          # Maven config
├── package.json                     # Frontend dependencies
└── docs/                            # Documentation
```

## Adding a New Feature

### Step 1: Create Entity

**File**: `src/main/java/uptime/observability/domain/MyEntity.java`

```java
@Entity
@Table(name = "my_entity")
public class MyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @Column(name = "name")
    private String name;

    // For JSON fields
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Type(JsonNodeType.class)
    private JsonNode metadata;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // ... other getters/setters
}
```

### Step 2: Create DTO

**File**: `src/main/java/uptime/observability/service/dto/MyEntityDTO.java`

```java
public class MyEntityDTO implements Serializable {
    private Long id;
    private String name;
    private JsonNode metadata;  // Match entity field types

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    // ... rest of getters/setters
}
```

### Step 3: Create Mapper

**File**: `src/main/java/uptime/observability/service/mapper/MyEntityMapper.java`

```java
@Mapper(componentModel = "spring")
public interface MyEntityMapper extends EntityMapper<MyEntityDTO, MyEntity> {
    MyEntityDTO toDto(MyEntity s);
    MyEntity toEntity(MyEntityDTO s);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget MyEntity entity, MyEntityDTO dto);
}
```

### Step 4: Create Repository

**File**: `src/main/java/uptime/observability/repository/MyEntityRepository.java`

```java
@Repository
public interface MyEntityRepository extends JpaRepository<MyEntity, Long> {
    // Custom query methods
    List<MyEntity> findByName(String name);
    
    @Query("SELECT m FROM MyEntity m WHERE m.name LIKE %:search%")
    List<MyEntity> searchByName(@Param("search") String search);
}
```

### Step 5: Create Service

**File**: `src/main/java/uptime/observability/service/MyEntityService.java`

```java
@Service
@Transactional
public class MyEntityService {
    private final MyEntityRepository repository;
    private final MyEntityMapper mapper;

    public MyEntityService(MyEntityRepository repository, MyEntityMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<MyEntityDTO> findAll(Pageable pageable) {
        return repository.findAll(pageable)
            .map(mapper::toDto)
            .getContent();
    }

    public Optional<MyEntityDTO> findOne(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    public MyEntityDTO save(MyEntityDTO dto) {
        MyEntity entity = mapper.toEntity(dto);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
```

### Step 6: Create REST Controller

**File**: `src/main/java/uptime/observability/web/rest/MyEntityResource.java`

```java
@RestController
@RequestMapping("/api/my-entities")
public class MyEntityResource {
    private final MyEntityService service;

    public MyEntityResource(MyEntityService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MyEntityDTO>> getAllMyEntities(Pageable pageable) {
        List<MyEntityDTO> page = service.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MyEntityDTO> getMyEntity(@PathVariable Long id) {
        Optional<MyEntityDTO> dto = service.findOne(id);
        return ResponseEntity.ok().body(dto.orElse(null));
    }

    @PostMapping
    public ResponseEntity<MyEntityDTO> createMyEntity(@Valid @RequestBody MyEntityDTO dto) {
        MyEntityDTO result = service.save(dto);
        return ResponseEntity.created(URI.create("/api/my-entities/" + result.getId()))
            .body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MyEntityDTO> updateMyEntity(
        @PathVariable Long id,
        @Valid @RequestBody MyEntityDTO dto) {
        dto.setId(id);
        MyEntityDTO result = service.save(dto);
        return ResponseEntity.ok().body(result);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MyEntityDTO> partialUpdateMyEntity(
        @PathVariable Long id,
        @RequestBody MyEntityDTO dto) {
        dto.setId(id);
        Optional<MyEntityDTO> result = service.findOne(id)
            .map(existing -> {
                mapper.partialUpdate(existing, dto);
                return service.save(mapper.toDto(existing));
            });
        return ResponseEntity.ok().body(result.orElse(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMyEntity(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Step 7: Create Tests

**File**: `src/test/java/uptime/observability/web/rest/MyEntityResourceIT.java`

```java
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
class MyEntityResourceIT {
    @Autowired
    private MockMvc mockMvc;

    private MyEntity entity;

    @BeforeEach
    void setup() {
        entity = new MyEntity();
        entity.setName("Test Entity");
    }

    @Test
    void testGetAllMyEntities() throws Exception {
        mockMvc.perform(get("/api/my-entities"))
            .andExpect(status().isOk());
    }

    @Test
    void testCreateMyEntity() throws Exception {
        mockMvc.perform(post("/api/my-entities")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(entity)))
            .andExpect(status().isCreated());
    }
}
```

### Step 8: Create Database Migration

**File**: `src/main/resources/db/changelog/YYYYMMDD_HHmmss_create_my_entity.xml`

```xml
<databaseChangeLog>
    <changeSet id="YYYYMMDD_HHmmss_create_my_entity" author="author">
        <createTable tableName="my_entity">
            <column name="id" type="BIGINT">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="name" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="metadata" type="jsonb"/>
        </createTable>
    </changeSet>
</databaseChangeLog>
```

## Git Workflow

### Feature Branch

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, perf, test, build, chore

**Example**:
```
feat(http-heartbeat): add JSON field support

- Updated HttpHeartbeatDTO to use JsonNode for JSON fields
- Updated mapper with proper type handling
- Added validation for JSON fields

Fixes #123
```

## Code Style

### Java Code Style

Follow JHipster conventions:
- Use meaningful variable names
- Keep methods focused (single responsibility)
- Add JavaDoc for public methods
- Avoid magic numbers

```java
// Good
public Optional<MyEntityDTO> findByIdAndValidate(Long id) {
    return repository.findById(id)
        .filter(entity -> entity.isActive())
        .map(mapper::toDto);
}

// Bad
public MyEntityDTO find(Long id) {
    MyEntity e = repository.findById(id).orElse(null);
    if (e != null && e.getStatus() == 1) return mapper.toDto(e);
    return null;
}
```

### JSON Field Guidelines

1. Always use `JsonNode` for JSON fields (not String)
2. Add `@Type(JsonNodeType.class)` annotation
3. Set `columnDefinition = "jsonb"` for PostgreSQL
4. Validate JSON in service layer
5. Document expected JSON schema

```java
/**
 * Metadata as JSON object. Expected schema:
 * {
 *   "key1": "value1",
 *   "key2": {"nested": "object"}
 * }
 */
@Column(name = "metadata", columnDefinition = "jsonb")
@Type(JsonNodeType.class)
private JsonNode metadata;
```

## Testing

### Running Tests

```bash
# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=MyEntityResourceIT

# Specific test method
./mvnw test -Dtest=MyEntityResourceIT#testGetAllMyEntities

# With coverage
./mvnw jacoco:report
```

### Writing Unit Tests

```java
@DisplayName("MyEntityService")
class MyEntityServiceTest {
    private MyEntityService service;
    private MyEntityRepository repository;
    private MyEntityMapper mapper;

    @BeforeEach
    void setup() {
        repository = mock(MyEntityRepository.class);
        mapper = mock(MyEntityMapper.class);
        service = new MyEntityService(repository, mapper);
    }

    @Test
    @DisplayName("should find entity by id")
    void testFindOne() {
        // Arrange
        MyEntity entity = new MyEntity();
        entity.setId(1L);
        entity.setName("Test");
        
        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.toDto(entity)).thenReturn(new MyEntityDTO());

        // Act
        Optional<MyEntityDTO> result = service.findOne(1L);

        // Assert
        assertThat(result).isPresent();
        verify(repository).findById(1L);
    }
}
```

## Debugging

### Debug Mode

```bash
# Enable debug logging
./mvnw spring-boot:run -Dspring-boot.run.arguments="--logging.level.uptime.observability=DEBUG"
```

### Remote Debugging

```bash
# Start with debug port
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Connect IDE to localhost:5005
```

### SQL Debugging

Enable in application.yml:
```yaml
spring:
  jpa:
    properties:
      hibernate:
        show_sql: true
        format_sql: true
        use_sql_comments: true
```

## Performance Optimization

### Database Indexes

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_entity_name ON my_entity(name);
CREATE INDEX idx_entity_created ON my_entity(created_date);

-- Index JSON fields
CREATE INDEX idx_entity_metadata ON my_entity USING GIN(metadata);
```

### Query Optimization

```java
// Use projections for large datasets
@Query("SELECT new MyEntityDTO(e.id, e.name) FROM MyEntity e")
List<MyEntityDTO> findAllProjection();

// Use fetch joins for relationships
@Query("SELECT DISTINCT e FROM MyEntity e LEFT JOIN FETCH e.related")
List<MyEntity> findAllWithRelated();
```

### Caching

```java
@Service
@CacheConfig(cacheNames = "my-entity")
public class MyEntityService {
    @Cacheable(key = "#id")
    public Optional<MyEntityDTO> findOne(Long id) {
        return repository.findById(id).map(mapper::toDto);
    }

    @CacheEvict(key = "#result.id")
    public MyEntityDTO save(MyEntityDTO dto) {
        // ... save logic
    }
}
```

## Documentation

### Code Documentation

```java
/**
 * Creates a new entity.
 *
 * @param dto the entity DTO containing creation data
 * @return the created entity DTO with assigned ID
 * @throws BadRequestException if validation fails
 */
public MyEntityDTO save(MyEntityDTO dto) {
    // implementation
}
```

### Feature Documentation

Create `docs/FEATURE_NAME.md` with:
- Feature overview
- Design decisions
- API documentation
- Example usage
- Testing procedures

## Tools & IDEs

### IntelliJ IDEA

- Install JHipster plugin
- Enable code inspections
- Use run configurations for debug

### Eclipse

- Install Spring Tools Suite
- Configure formatting rules
- Enable Maven integration

### VS Code

- Install Java Extension Pack
- Install Spring Boot Extension Pack
- Configure debugging

---

**Next**: See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
**See Also**: [TESTING.md](TESTING.md) for testing guidelines
