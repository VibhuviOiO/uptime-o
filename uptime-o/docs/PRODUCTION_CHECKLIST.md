# Production Deployment Checklist

## ✅ Pre-Deployment

- [ ] Build production image: `./mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild`
- [ ] Generate encryption key: `openssl rand -hex 32`
- [ ] Generate JWT secret: `openssl rand -base64 64`
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables (see below)
- [ ] Test image locally with production settings

## ✅ Required Environment Variables

```bash
# CRITICAL - Must be set
JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/uptimeo
SPRING_DATASOURCE_USERNAME=uptimeo
SPRING_DATASOURCE_PASSWORD=<secure-password>
APPLICATION_ENCRYPTION_SECRET_KEY=<64-char-key>
JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=<base64-secret>

# RECOMMENDED - Performance tuning
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=20
LOGGING_LEVEL_ROOT=INFO
MANAGEMENT_PROMETHEUS_METRICS_EXPORT_ENABLED=true
```

## ✅ Post-Deployment

- [ ] Verify health endpoint: `curl http://host:8080/management/health`
- [ ] Check logs for errors: `docker logs uptimeo`
- [ ] Verify database connection
- [ ] Test login functionality
- [ ] Monitor memory usage: `docker stats uptimeo`
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log rotation
- [ ] Set up automated backups

## ✅ Security Checklist

- [ ] Changed default JWT secret
- [ ] Changed default encryption key
- [ ] Using strong database password
- [ ] Disabled DEBUG logging
- [ ] Limited exposed management endpoints
- [ ] Running as non-root user (Jib default)
- [ ] Using HTTPS/TLS in production
- [ ] Secrets stored securely (not in code)

## ✅ Monitoring Setup

- [ ] Health checks configured
- [ ] Prometheus metrics enabled
- [ ] Alerting configured
- [ ] Log aggregation set up
- [ ] Disk space monitoring
- [ ] Database connection monitoring

## 📊 Expected Performance

| Metric | Target | Current |
|--------|--------|---------|
| Startup Time | < 60s | ___ |
| Response Time | < 200ms | ___ |
| Memory Usage | < 80% | ___ |
| CPU Usage | < 70% | ___ |
| DB Connections | < 80% pool | ___ |
| Log Volume | < 200MB/day | ___ |

## 🚨 Troubleshooting

### Application won't start
- Check database connectivity
- Verify JAVA_OPTS syntax
- Check logs: `docker logs uptimeo`

### High memory usage
- Increase heap: `-Xmx4096m`
- Check for memory leaks in logs

### Slow response times
- Increase DB pool: `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=40`
- Check database performance

### Disk full
- Check log rotation settings
- Reduce log retention: `LOGGING_FILE_MAX_HISTORY=7`

## 📚 Documentation

- [PRODUCTION_OPTIMIZATION.md](docs/PRODUCTION_OPTIMIZATION.md) - Logging, memory, optimization
- [CONTAINER_DEPLOYMENT.md](docs/CONTAINER_DEPLOYMENT.md) - Complete environment variables guide
- [ENV_VARS_QUICK_REFERENCE.md](docs/ENV_VARS_QUICK_REFERENCE.md) - Quick reference card

## 🎯 Quick Start

```bash
# 1. Build image
./mvnw -ntp verify -DskipTests -Pprod jib:dockerBuild

# 2. Run container
docker run -d \
  --name uptimeo \
  -p 8080:8080 \
  -e JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC" \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/uptimeo \
  -e SPRING_DATASOURCE_USERNAME=uptimeo \
  -e SPRING_DATASOURCE_PASSWORD=<password> \
  -e APPLICATION_ENCRYPTION_SECRET_KEY=<key> \
  -e JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET=<secret> \
  uptimeo:latest

# 3. Verify
curl http://localhost:8080/management/health
```

## ✅ Deployment Complete

Once all items are checked, your application is production-ready! 🚀
