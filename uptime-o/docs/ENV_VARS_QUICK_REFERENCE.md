# Environment Variables Quick Reference

## Essential Variables (MUST SET)

```bash
# JVM Memory (adjust based on load)
JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/uptimeo
SPRING_DATASOURCE_USERNAME=uptimeo
SPRING_DATASOURCE_PASSWORD=<secure-password>

# Security (GENERATE NEW KEYS!)
APPLICATION_ENCRYPTION_SECRET_KEY=<64-char-key>
JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=<base64-secret>
```

## Performance Tuning

```bash
# Database Connection Pool
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20  # 100 users: 10, 500 users: 20, 1000 users: 40
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5

# Logging (reduces disk usage by 90%)
LOGGING_LEVEL_ROOT=INFO
LOGGING_FILE_MAX_SIZE=100MB
LOGGING_FILE_MAX_HISTORY=30
```

## Monitoring

```bash
MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED=true
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,metrics,prometheus
```

## Generate Secrets

```bash
# Encryption key
openssl rand -hex 32

# JWT secret
openssl rand -base64 64
```

## Memory Sizing

| Users | Heap | Container RAM | CPU |
|-------|------|---------------|-----|
| 100   | 1GB  | 1.5GB        | 1   |
| 500   | 2GB  | 3GB          | 2   |
| 1000  | 4GB  | 6GB          | 4   |

## Health Checks

```bash
# Liveness
curl http://localhost:8080/management/health/liveness

# Readiness
curl http://localhost:8080/management/health/readiness

# Metrics
curl http://localhost:8080/management/prometheus
```

## Full Documentation

See [CONTAINER_DEPLOYMENT.md](./CONTAINER_DEPLOYMENT.md) for complete details.
