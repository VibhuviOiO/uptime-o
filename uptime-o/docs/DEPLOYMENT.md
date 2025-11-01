# Deployment Guide

Complete guide for deploying UptimeO to various environments.

## Prerequisites

- Docker installed (`docker --version`)
- Docker Compose installed (`docker-compose --version`)
- Kubernetes (if deploying to K8s)
- PostgreSQL backup/restore tools
- SSL certificates (for production)

## Local Development Deployment

### Quick Start (Single Command)

```bash
# Build and run with Docker Compose
docker-compose -f src/main/docker/docker-compose.yml up -d

# Check status
docker ps
docker-compose logs -f app
```

### Manual Deployment

```bash
# 1. Build application
./mvnw clean package -DskipTests -Pprod

# 2. Start PostgreSQL
docker run --name postgres \
  -e POSTGRES_DB=uptimeo \
  -e POSTGRES_USER=uptimeo \
  -e POSTGRES_PASSWORD=uptimeo \
  -p 5432:5432 \
  -d postgres:15

# 3. Wait for database
sleep 10

# 4. Run application
java -jar target/uptime-o-*.jar \
  --server.port=8080 \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/uptimeo \
  --spring.datasource.username=uptimeo \
  --spring.datasource.password=uptimeo

# 5. Access application
# Frontend: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
```

## Docker Deployment

### Build Docker Image

```bash
# Using JIB (recommended)
./mvnw clean package -Pprod -DskipTests jib:dockerBuild

# Using Dockerfile
docker build -t uptime-o:latest .

# Verify build
docker images | grep uptime-o
```

### Run with Docker Compose

**File**: `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: uptimeo
      POSTGRES_USER: uptimeo
      POSTGRES_PASSWORD: uptimeo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "uptimeo"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: uptime-o:latest
    environment:
      SERVER_PORT: 8080
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/uptimeo
      SPRING_DATASOURCE_USERNAME: uptimeo
      SPRING_DATASOURCE_PASSWORD: uptimeo
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

**Start services**:

```bash
docker-compose up -d
docker-compose logs -f
```

**Stop services**:

```bash
docker-compose down
docker-compose down -v  # Remove volumes too
```

## Production Deployment

### Environment Variables

**File**: `.env.prod`

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db-host:5432/uptimeo
SPRING_DATASOURCE_USERNAME=uptimeo_prod
SPRING_DATASOURCE_PASSWORD=<secure-password>
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=10

# Server
SERVER_PORT=8080
SERVER_SSL_ENABLED=true
SERVER_SSL_KEY_STORE=/app/certs/keystore.p12
SERVER_SSL_KEY_STORE_PASSWORD=<keystore-password>
SERVER_SSL_KEY_STORE_TYPE=PKCS12

# Spring
SPRING_PROFILES_ACTIVE=prod
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_OPEN_IN_VIEW=false
SPRING_LIQUIBASE_ENABLED=true

# Monitoring
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics
MANAGEMENT_ENDPOINT_HEALTH_PROBES_ENABLED=true
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=when-authorized

# Security
SECURITY_JWT_SECRET=<long-secret-key>
SECURITY_JWT_EXPIRATION=86400000
```

### Build for Production

```bash
# Clean build with production profile
./mvnw clean package -Pprod -DskipTests

# Verify JAR
ls -lh target/uptime-o-*.jar

# Test locally with prod config
java -jar target/uptime-o-*.jar \
  --spring.profiles.active=prod \
  --server.port=9090
```

### SSL/TLS Configuration

```bash
# Generate self-signed certificate (testing only)
keytool -genkeypair -alias uptime-o \
  -keyalg RSA -keysize 2048 \
  -keystore keystore.p12 \
  -storetype PKCS12 \
  -storepass changeit \
  -dname "CN=uptime.example.com,O=Company,C=US" \
  -validity 365

# For production, use Let's Encrypt + certbot
certbot certonly --standalone -d uptime.example.com
# Convert PEM to PKCS12
openssl pkcs12 -export \
  -in /etc/letsencrypt/live/uptime.example.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/uptime.example.com/privkey.pem \
  -out keystore.p12 \
  -name uptime-o
```

### Database Setup

```bash
# Create database and user
createdb -U postgres uptimeo_prod
psql -U postgres -c "CREATE ROLE uptimeo_prod WITH LOGIN PASSWORD 'password';"
psql -U postgres -c "ALTER ROLE uptimeo_prod CREATEDB;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE uptimeo_prod TO uptimeo_prod;"

# Run Liquibase migrations
./mvnw liquibase:update \
  -Dliquibase.url=jdbc:postgresql://prod-db-host/uptimeo_prod \
  -Dliquibase.username=uptimeo_prod \
  -Dliquibase.password=<password>
```

### Systemd Service

**File**: `/etc/systemd/system/uptime-o.service`

```ini
[Unit]
Description=UptimeO Application
After=postgresql.service
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=uptime-o
WorkingDirectory=/opt/uptime-o
ExecStart=/usr/bin/java -Xmx512m -Xms256m \
  -jar /opt/uptime-o/uptime-o.jar \
  --spring.profiles.active=prod
Restart=always
RestartSec=10

Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://localhost/uptimeo_prod"
Environment="SPRING_DATASOURCE_USERNAME=uptimeo_prod"
Environment="SPRING_DATASOURCE_PASSWORD=<password>"

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Enable and start**:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uptime-o
sudo systemctl start uptime-o
sudo systemctl status uptime-o
sudo journalctl -u uptime-o -f
```

## Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
kubectl version --client

# Access to Kubernetes cluster
kubectl cluster-info
```

### Container Registry

```bash
# Tag image for registry
docker tag uptime-o:latest myregistry.azurecr.io/uptime-o:latest

# Push to registry
docker push myregistry.azurecr.io/uptime-o:latest
```

### Kubernetes Manifests

**File**: `k8s/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: uptime-o
  labels:
    app: uptime-o
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: uptime-o
  template:
    metadata:
      labels:
        app: uptime-o
    spec:
      serviceAccountName: uptime-o
      securityContext:
        fsGroup: 1000
      containers:
      - name: uptime-o
        image: myregistry.azurecr.io/uptime-o:latest
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: prod
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            configMapKeyRef:
              name: uptime-o-config
              key: spring.datasource.url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: uptime-o-secrets
              key: db.username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: uptime-o-secrets
              key: db.password
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: http
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: http
          initialDelaySeconds: 20
          periodSeconds: 5
          timeoutSeconds: 5
          failureThreshold: 3
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: tmp
        emptyDir: {}
```

**File**: `k8s/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: uptime-o
  labels:
    app: uptime-o
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: uptime-o
```

**File**: `k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: uptime-o-config
data:
  spring.datasource.url: "jdbc:postgresql://postgres:5432/uptimeo"
  spring.jpa.hibernate.ddl-auto: "validate"
  spring.profiles.active: "prod"
```

**File**: `k8s/secrets.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: uptime-o-secrets
type: Opaque
stringData:
  db.username: uptimeo
  db.password: "changeme"  # Use sealed-secrets in production
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace uptime-o

# Apply ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml -n uptime-o
kubectl apply -f k8s/secrets.yaml -n uptime-o

# Deploy application
kubectl apply -f k8s/deployment.yaml -n uptime-o
kubectl apply -f k8s/service.yaml -n uptime-o

# Check deployment
kubectl get pods -n uptime-o
kubectl describe deployment uptime-o -n uptime-o
kubectl logs -f deployment/uptime-o -n uptime-o

# Access service
kubectl port-forward service/uptime-o 8080:80 -n uptime-o
# Visit http://localhost:8080
```

## Health Checks

### Application Health

```bash
# Basic health
curl http://localhost:8080/actuator/health

# Detailed health (when authorized)
curl http://localhost:8080/actuator/health?full=true

# Liveness
curl http://localhost:8080/actuator/health/liveness

# Readiness
curl http://localhost:8080/actuator/health/readiness
```

### Database Health

```bash
# Check database connectivity
psql -h localhost -U uptimeo -d uptimeo \
  -c "SELECT NOW();"

# Check migrations status
./mvnw liquibase:status \
  -Dliquibase.url=jdbc:postgresql://localhost/uptimeo \
  -Dliquibase.username=uptimeo
```

## Backup & Recovery

### Database Backup

```bash
# Full backup
pg_dump -h localhost -U uptimeo -d uptimeo \
  > uptimeo_backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -h localhost -U uptimeo -d uptimeo | \
  gzip > uptimeo_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Custom format (faster for large databases)
pg_dump -h localhost -U uptimeo -d uptimeo \
  -Fc -f uptimeo_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Database Restore

```bash
# From SQL backup
psql -h localhost -U uptimeo -d uptimeo \
  < uptimeo_backup_20240101_000000.sql

# From compressed backup
gunzip -c uptimeo_backup_20240101_000000.sql.gz | \
  psql -h localhost -U uptimeo -d uptimeo

# From custom format
pg_restore -h localhost -U uptimeo -d uptimeo \
  -Fc uptimeo_backup_20240101_000000.dump
```

## Monitoring & Logging

### Application Logs

```bash
# View logs
docker logs <container-id>
docker logs -f <container-id>  # Follow logs

# View systemd logs
sudo journalctl -u uptime-o -n 100 -f

# View Kubernetes logs
kubectl logs deployment/uptime-o -n uptime-o -f
```

### Metrics

```bash
# View metrics
curl http://localhost:8080/actuator/metrics

# Specific metric
curl http://localhost:8080/actuator/metrics/jvm.memory.used

# Database metrics
curl http://localhost:8080/actuator/metrics/process.uptime
```

### Enable Structured Logging

**File**: `application.yml`

```yaml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/uptime-o.log
  level:
    root: INFO
    uptime.observability: DEBUG
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
lsof -i :8080
# Kill process
kill -9 <PID>
```

**Database Connection Failed**
```bash
# Check PostgreSQL status
docker ps | grep postgres

# Verify connection
psql -h localhost -U uptimeo -d uptimeo -c "SELECT 1"
```

**Out of Memory**
```bash
# Increase heap size in service startup
java -Xmx1024m -Xms512m -jar uptime-o.jar
```

## Deployment Checklist

- [ ] Database backup created
- [ ] All environment variables configured
- [ ] SSL certificates installed (if applicable)
- [ ] Database migrations applied
- [ ] Application started successfully
- [ ] Health checks passing
- [ ] API responding correctly
- [ ] Frontend accessible
- [ ] Logs being generated
- [ ] Monitoring configured
- [ ] Alerts configured

---

**Previous**: See [DEVELOPMENT.md](DEVELOPMENT.md)
**Next**: See [DOCKER.md](DOCKER.md) for container details
