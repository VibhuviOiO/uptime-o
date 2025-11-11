# Container Deployment Guide

**Last Updated**: November 11, 2025  
**Version**: 1.0

## Overview

This guide provides optimized environment variables for running UptimeO in production containers using Jib-built Docker images.

## Building the Docker Image

```bash
# Build Docker image with Jib
./mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild

# For ARM64 (Apple Silicon)
./mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild -Djib-maven-plugin.architecture=arm64
```

---

## Required Environment Variables

### 1. JVM Memory Configuration

**Variable**: `JAVA_OPTS`

**Purpose**: Controls JVM heap size, garbage collection, and performance tuning

**Recommended Values**:

```bash
# For 500 concurrent users (2GB heap)
JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap_dump.hprof"

# For 1000 concurrent users (4GB heap)
JAVA_OPTS="-Xms2048m -Xmx4096m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap_dump.hprof"

# For 100 concurrent users (1GB heap) - Minimal
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

**Why**:
- `-Xms`: Initial heap size (prevents frequent resizing)
- `-Xmx`: Maximum heap size (prevents OOM errors)
- `-XX:+UseG1GC`: Low-latency garbage collector
- `-XX:MaxGCPauseMillis=200`: Limits GC pause to 200ms
- `-XX:+HeapDumpOnOutOfMemoryError`: Creates heap dump for debugging OOM issues

---

### 2. Spring Profile

**Variable**: `SPRING_PROFILES_ACTIVE`

**Purpose**: Activates production configuration

**Required Value**:
```bash
SPRING_PROFILES_ACTIVE=prod
```

**Why**: Enables INFO-level logging, production database settings, and optimized caching

---

### 3. Database Configuration

**Variables**: 
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

**Purpose**: Database connection settings

**Example**:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-host:5432/uptimeo
SPRING_DATASOURCE_USERNAME=uptimeo
SPRING_DATASOURCE_PASSWORD=<secure-password>
```

**Why**: Required for application to connect to PostgreSQL database

---

### 4. Database Connection Pool

**Variables**: 
- `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE`
- `SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE`

**Purpose**: Optimizes database connection pooling

**Recommended Values**:
```bash
# For 500 concurrent users
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5

# For 1000 concurrent users
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=40
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=10
```

**Why**: 
- Prevents connection exhaustion under load
- Formula: `max_pool_size = (concurrent_users / 25) + 5`
- Minimum idle keeps connections warm for fast response

---

### 5. Logging Configuration

**Variables**:
- `LOGGING_LEVEL_ROOT`
- `LOGGING_FILE_NAME`
- `LOGGING_FILE_MAX_SIZE`
- `LOGGING_FILE_MAX_HISTORY`

**Purpose**: Controls log verbosity and rotation

**Recommended Values**:
```bash
LOGGING_LEVEL_ROOT=INFO
LOGGING_FILE_NAME=/var/log/uptimeo/application.log
LOGGING_FILE_MAX_SIZE=100MB
LOGGING_FILE_MAX_HISTORY=30
LOGGING_FILE_TOTAL_SIZE_CAP=3GB
```

**Why**:
- `INFO` level reduces log volume by 90% vs DEBUG
- Log rotation prevents disk space exhaustion
- 30-day retention balances debugging needs with storage

---

### 6. Security Configuration

**Variables**:
- `APPLICATION_ENCRYPTION_SECRET_KEY`
- `JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET`

**Purpose**: Encryption keys for sensitive data and JWT tokens

**Required**:
```bash
APPLICATION_ENCRYPTION_SECRET_KEY=<64-character-random-key>
JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=<base64-encoded-secret>
```

**Generate Keys**:
```bash
# Generate encryption key (64 chars)
openssl rand -hex 32

# Generate JWT secret (base64, 512 bits)
openssl rand -base64 64
```

**Why**: 
- Protects sensitive data in database
- Secures JWT authentication tokens
- MUST be different from dev environment

---

### 7. Monitoring & Metrics

**Variables**:
- `MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED`
- `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE`

**Purpose**: Enables monitoring endpoints

**Recommended Values**:
```bash
MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED=true
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,metrics,prometheus
```

**Why**: 
- Exposes metrics for Prometheus/Grafana
- Health checks for Kubernetes liveness/readiness probes
- Essential for production monitoring

---

### 8. Application Startup

**Variable**: `JHIPSTER_SLEEP`

**Purpose**: Delays application startup

**Default**: `0`

**Use Case**:
```bash
# Wait 10 seconds for database to be ready
JHIPSTER_SLEEP=10
```

**Why**: Useful in docker-compose when database takes time to initialize

---

### 9. Liquibase Migration

**Variables**:
- `SPRING_LIQUIBASE_ENABLED`
- `SPRING_LIQUIBASE_CONTEXTS`

**Purpose**: Controls database schema migrations

**Recommended Values**:
```bash
# Enable migrations on first deployment
SPRING_LIQUIBASE_ENABLED=true
SPRING_LIQUIBASE_CONTEXTS=prod

# Disable after initial setup (optional)
SPRING_LIQUIBASE_ENABLED=false
```

**Why**: 
- Automatically creates/updates database schema
- `prod` context excludes test data
- Can disable after initial deployment for faster startup

---

### 10. Branding Configuration (Optional)

**Variables**:
- `WEBSITE_TITLE`
- `WEBSITE_DESCRIPTION`
- `WEBSITE_LOGOPATH`
- `WEBSITE_FOOTERTITLE`

**Purpose**: Customizes UI branding

**Example**:
```bash
WEBSITE_TITLE="My Company Monitoring"
WEBSITE_DESCRIPTION="Enterprise uptime monitoring"
WEBSITE_LOGOPATH="/content/images/logo.png"
WEBSITE_FOOTERTITLE="Powered by My Company"
```

**Why**: White-label the application for your organization

---

## Complete Docker Run Example

```bash
docker run -d \
  --name uptimeo \
  -p 8080:8080 \
  -e JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap_dump.hprof" \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/uptimeo \
  -e SPRING_DATASOURCE_USERNAME=uptimeo \
  -e SPRING_DATASOURCE_PASSWORD=secure_password_here \
  -e SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20 \
  -e SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5 \
  -e LOGGING_LEVEL_ROOT=INFO \
  -e LOGGING_FILE_NAME=/var/log/uptimeo/application.log \
  -e APPLICATION_ENCRYPTION_SECRET_KEY=your_64_char_key_here \
  -e JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=your_base64_secret_here \
  -e MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED=true \
  -e SPRING_LIQUIBASE_ENABLED=true \
  -e JHIPSTER_SLEEP=0 \
  -v /var/log/uptimeo:/var/log/uptimeo \
  --restart unless-stopped \
  uptimeo:latest
```

---

## Docker Compose Example

Update `src/main/docker/app.yml`:

```yaml
name: uptimeo
services:
  app:
    image: uptimeo:latest
    environment:
      # JVM Configuration
      - JAVA_OPTS=-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap_dump.hprof
      
      # Spring Profile
      - SPRING_PROFILES_ACTIVE=prod
      
      # Database
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgresql:5432/uptimeo
      - SPRING_DATASOURCE_USERNAME=uptimeo
      - SPRING_DATASOURCE_PASSWORD=uptimeo
      - SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
      - SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=5
      
      # Logging
      - LOGGING_LEVEL_ROOT=INFO
      - LOGGING_FILE_NAME=/var/log/uptimeo/application.log
      - LOGGING_FILE_MAX_SIZE=100MB
      - LOGGING_FILE_MAX_HISTORY=30
      
      # Security (CHANGE THESE IN PRODUCTION!)
      - APPLICATION_ENCRYPTION_SECRET_KEY=${APPLICATION_ENCRYPTION_SECRET_KEY}
      - JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=${JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET}
      
      # Monitoring
      - MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED=true
      - MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,metrics,prometheus
      
      # Liquibase
      - SPRING_LIQUIBASE_ENABLED=true
      - SPRING_LIQUIBASE_CONTEXTS=prod
      
      # Startup
      - JHIPSTER_SLEEP=10
      
    ports:
      - "8080:8080"
    volumes:
      - ./logs:/var/log/uptimeo
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/management/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    depends_on:
      postgresql:
        condition: service_healthy
    restart: unless-stopped
    
  postgresql:
    extends:
      file: ./postgresql.yml
      service: postgresql
```

---

## Kubernetes Deployment Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: uptimeo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: uptimeo
  template:
    metadata:
      labels:
        app: uptimeo
    spec:
      containers:
      - name: uptimeo
        image: uptimeo:latest
        ports:
        - containerPort: 8080
        env:
        # JVM Configuration
        - name: JAVA_OPTS
          value: "-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
        
        # Spring Profile
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        
        # Database
        - name: SPRING_DATASOURCE_URL
          value: "jdbc:postgresql://postgres-service:5432/uptimeo"
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: uptimeo-secrets
              key: db-username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: uptimeo-secrets
              key: db-password
        - name: SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE
          value: "20"
        - name: SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE
          value: "5"
        
        # Logging
        - name: LOGGING_LEVEL_ROOT
          value: "INFO"
        
        # Security
        - name: APPLICATION_ENCRYPTION_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: uptimeo-secrets
              key: encryption-key
        - name: JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET
          valueFrom:
            secretKeyRef:
              name: uptimeo-secrets
              key: jwt-secret
        
        # Monitoring
        - name: MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED
          value: "true"
        
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        
        livenessProbe:
          httpGet:
            path: /management/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /management/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
```

---

## GitHub Actions CI/CD Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Build Docker image with Jib
      run: ./mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild
    
    - name: Tag and push to registry
      run: |
        docker tag uptimeo:latest ghcr.io/${{ github.repository }}/uptimeo:latest
        docker tag uptimeo:latest ghcr.io/${{ github.repository }}/uptimeo:${{ github.sha }}
        docker push ghcr.io/${{ github.repository }}/uptimeo:latest
        docker push ghcr.io/${{ github.repository }}/uptimeo:${{ github.sha }}
```

---

## Environment Variable Priority

Variables are loaded in this order (later overrides earlier):

1. `application.yml` (defaults)
2. `application-prod.yml` (production defaults)
3. Environment variables (container runtime)
4. `_FILE` variants (Docker secrets)

Example using Docker secrets:
```bash
# Instead of:
-e SPRING_DATASOURCE_PASSWORD=mypassword

# Use:
-e SPRING_DATASOURCE_PASSWORD_FILE=/run/secrets/db_password
```

---

## Memory Sizing Guide

| Concurrent Users | Heap Size | Container Memory | CPU Cores | DB Connections |
|-----------------|-----------|------------------|-----------|----------------|
| 100 | 1GB | 1.5GB | 1 | 10 |
| 500 | 2GB | 3GB | 2 | 20 |
| 1000 | 4GB | 6GB | 4 | 40 |
| 2000+ | Scale horizontally | - | - | - |

**Formula**: Container Memory = Heap Size × 1.5 (accounts for non-heap, metaspace, native memory)

---

## Monitoring Endpoints

Once deployed, access these endpoints:

```bash
# Health check (for load balancers)
curl http://localhost:8080/management/health

# Liveness probe (Kubernetes)
curl http://localhost:8080/management/health/liveness

# Readiness probe (Kubernetes)
curl http://localhost:8080/management/health/readiness

# Prometheus metrics
curl http://localhost:8080/management/prometheus

# Application info
curl http://localhost:8080/management/info
```

---

## Troubleshooting

### High Memory Usage
```bash
# Increase heap size
JAVA_OPTS="-Xms2048m -Xmx4096m ..."
```

### Slow Database Queries
```bash
# Increase connection pool
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=40
```

### Too Many Logs
```bash
# Reduce log level
LOGGING_LEVEL_ROOT=WARN
```

### OOM Errors
```bash
# Enable heap dump and increase memory
JAVA_OPTS="-Xmx4096m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap_dump.hprof"
```

### Startup Failures
```bash
# Add startup delay for database
JHIPSTER_SLEEP=15
```

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use Docker secrets** or Kubernetes secrets for sensitive data
3. **Rotate JWT secrets** regularly
4. **Use strong encryption keys** (64+ characters)
5. **Limit exposed endpoints** in production
6. **Enable HTTPS/TLS** for production deployments
7. **Use read-only filesystem** where possible
8. **Run as non-root user** (Jib already does this - user 1000)

---

## Summary

### Minimal Required Variables
```bash
JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC"
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/uptimeo
SPRING_DATASOURCE_USERNAME=uptimeo
SPRING_DATASOURCE_PASSWORD=<password>
APPLICATION_ENCRYPTION_SECRET_KEY=<key>
JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=<secret>
```

### Recommended Additional Variables
```bash
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
LOGGING_LEVEL_ROOT=INFO
MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED=true
```

### Optional Variables
```bash
WEBSITE_TITLE=<custom-title>
JHIPSTER_SLEEP=10
SPRING_LIQUIBASE_ENABLED=true
```
