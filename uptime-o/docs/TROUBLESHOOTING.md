# Troubleshooting Guide

Solutions for common issues in UptimeO.

## Connection Issues

### Application Won't Start

**Error**: `Address already in use`

**Solution**:
```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port
./mvnw spring-boot:run -Dserver.port=8081
```

**Error**: `Connection refused`

**Solution**:
- Ensure application is running: `curl http://localhost:8080`
- Check logs: `./mvnw spring-boot:run` (console output)
- Verify dependencies: `./mvnw dependency:tree`

### Database Connection Failed

**Error**: `org.postgresql.util.PSQLException: Connection to localhost:5432 refused`

**Solution**:
1. Verify PostgreSQL is running: `psql -U postgres`
2. Check credentials in `src/main/resources/application.yml`
3. Verify database exists: `createdb uptimeo`
4. Restart PostgreSQL:
   ```bash
   docker restart postgres-uptime
   # or
   brew services restart postgresql
   ```

### Hibernate Issues

**Error**: `No qualifying bean of type 'X' available`

**Solution**:
```bash
# Clean and rebuild
./mvnw clean install -DskipTests
```

**Error**: `Column does not exist`

**Solution**:
- Run Liquibase migrations: Database should auto-migrate
- Check `src/main/resources/db/changelog/` for migration files
- Manual migration:
  ```sql
  ALTER TABLE api_heartbeats ADD COLUMN raw_request_headers JSONB;
  ```

## API Issues

### 401 Unauthorized

**Error**: `401 Unauthorized`

**Cause**: Missing or invalid JWT token

**Solution**:
```bash
# Get a fresh token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.id_token')

# Use in request
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/http-monitors
```

### 400 Bad Request

**Error**: `400 Bad Request - Invalid JSON`

**Cause**: Malformed JSON or type mismatch

**Solution**:
1. Validate JSON:
   ```bash
   curl -X POST "http://localhost:8080/api/http-heartbeats" \
     -H "Content-Type: application/json" \
     -d '{"test": "json"}' 2>&1 | jq '.'
   ```

2. Check field types - they must match DTO definition

3. Use proper JSON types:
   - String: `"value"`
   - Number: `123` (not `"123"`)
   - Boolean: `true/false` (not `"true"`)
   - Object: `{...}`
   - Array: `[...]`

### 404 Not Found

**Error**: `404 Not Found`

**Solution**:
- Verify resource ID exists: `curl http://localhost:8080/api/http-monitors/999`
- Check resource was created: `curl http://localhost:8080/api/http-monitors`
- Verify you're using correct endpoint

### 500 Internal Server Error

**Error**: `500 Internal Server Error`

**Solution**:
1. Check application logs for stack trace
2. Look for database errors
3. Try with simpler request
4. Rebuild application: `./mvnw clean package -DskipTests`

## JSON Field Issues

### "Cannot deserialize value of type String from Object value"

**Cause**: DTO field is String but receiving JSON object

**Solution**: 
- Ensure DTO field is `JsonNode` type
- Verify entity field is also `JsonNode`
- Check `@Type(JsonNodeType.class)` annotation

**Fixed in**: HttpHeartbeatDTO.java fields changed to JsonNode

### JSON Field Returns as String

**Cause**: Incorrect serialization configuration

**Solution**:
1. Verify field type in DTO is `JsonNode`
2. Check Jackson configuration
3. Ensure HttpMessageConverters are properly configured

### Invalid JSON in Field

**Error**: `org.hibernate.HibernateException: could not deserialize`

**Cause**: Invalid JSON stored in database

**Solution**:
```sql
-- Check data
SELECT raw_response_body FROM api_heartbeats WHERE id = 1;

-- Fix if needed
UPDATE api_heartbeats 
SET raw_response_body = '{"valid":"json"}'
WHERE id = 1;
```

## Authentication Issues

### Login Fails

**Error**: `Invalid credentials`

**Solution**:
1. Verify user exists in database:
   ```sql
   SELECT * FROM jhi_user WHERE login = 'admin';
   ```

2. Reset password if needed - check user management in application

3. Default credentials: admin/admin (if not changed)

### Token Expired

**Error**: `Token has expired`

**Solution**:
- Get a new token
- Token expiry is configured in application properties
- Default: 24 hours from issue time

### CORS Error in Browser

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- This is expected behavior - CORS only applies to browser requests
- Use curl or API testing tools for testing
- Frontend is served from same origin, no CORS issue there

## Database Issues

### Duplicate Row Error

**Error**: `Duplicate row was found and ASSERT was specified`

**Cause**: Hibernate query returning multiple results when expecting one

**Solution**:
```bash
# Restart application to clear cache
./mvnw spring-boot:run

# Or clear database and reinitialize
# Backup first!
```

### Locked Tables

**Error**: `relation "table_name" is locked`

**Cause**: Another process has write lock

**Solution**:
```sql
-- Find locks
SELECT * FROM pg_locks;

-- Check active connections
SELECT * FROM pg_stat_activity;

-- Terminate blocking connection if needed
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'uptimeo' AND state = 'active';
```

## Build Issues

### Compilation Failures

**Error**: `Compilation failure: [ERROR] errors in source`

**Solution**:
1. Clean cache: `./mvnw clean`
2. Update dependencies: `./mvnw install`
3. Check Java version: `java -version` (must be 17+)
4. Rebuild: `./mvnw package -DskipTests`

### Test Failures

**Error**: `Tests in error`

**Solution**:
```bash
# Run without tests first
./mvnw package -DskipTests

# Then fix tests
./mvnw test
```

## Frontend Issues

### JavaScript Errors in Console

**Solution**:
1. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Reload page: Ctrl+F5
3. Check browser console for specific errors
4. Rebuild frontend: `npm run build` (if using npm directly)

### Form Won't Submit

**Cause**: Validation errors not shown

**Solution**:
1. Check browser console for errors
2. Verify all required fields are filled
3. Check JSON fields have valid JSON syntax
4. Inspect network tab to see actual error

## Performance Issues

### Slow Response Time

**Solution**:
1. Check database performance:
   ```sql
   SELECT query, mean_time 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

2. Add indexes:
   ```sql
   CREATE INDEX idx_heartbeat_executed 
   ON api_heartbeats(executed_at);
   
   CREATE INDEX idx_heartbeat_monitor 
   ON api_heartbeats(monitor_id);
   ```

3. Monitor application resources: CPU, memory, connections

### High Memory Usage

**Solution**:
1. Increase heap size:
   ```bash
   ./mvnw spring-boot:run -Drun.jvmArguments="-Xmx1024m"
   ```

2. Check for memory leaks in logs

3. Analyze heap dump if necessary

## Logging

### Enable Debug Logging

Add to `application.yml`:
```yaml
logging:
  level:
    uptime.observability: DEBUG
    org.springframework: WARN
    org.hibernate: WARN
```

### View Logs

```bash
# Real-time logs
./mvnw spring-boot:run 2>&1 | tail -f

# Check log file if configured
tail -f logs/application.log
```

### Enable SQL Logging

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

## Health Checks

### Application Health

```bash
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{"status": "UP"}
```

### Database Health

```bash
curl http://localhost:8080/actuator/db
```

### Metrics

```bash
curl http://localhost:8080/actuator/metrics
```

## Getting Help

1. **Check this document first** - most issues are covered
2. **Review application logs** - often contains the actual error
3. **Search existing issues** - may have been solved before
4. **Check Spring Boot documentation** - for framework-specific issues
5. **Enable debug logging** - get more detailed information

## Report an Issue

When reporting bugs, include:
- Error message (full stack trace preferred)
- Steps to reproduce
- Application version
- Operating system
- Java version: `java -version`
- Database version: `psql --version`

---

**Still stuck?** 
- Review [DEVELOPMENT.md](DEVELOPMENT.md) for dev setup
- Check [API_OVERVIEW.md](API_OVERVIEW.md) for API issues
- See [JSON_FIELDS_GUIDE.md](JSON_FIELDS_GUIDE.md) for JSON-specific issues
