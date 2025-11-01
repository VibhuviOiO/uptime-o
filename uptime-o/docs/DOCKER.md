# Docker Guide

Complete guide for containerizing and running UptimeO with Docker.

## Docker Concepts

### What is Docker?

Docker is a containerization platform that packages your application with all dependencies into a container that can run anywhere.

**Benefits**:
- Consistency: Same environment everywhere
- Portability: Run on any system with Docker
- Isolation: Services don't interfere with each other
- Efficiency: Lightweight compared to VMs

## Building Docker Images

### Dockerfile

The `Dockerfile` defines how to build your Docker image.

**Base Dockerfile Structure**:

```dockerfile
# Stage 1: Build stage
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests -Pprod

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root user for security
RUN useradd -m -u 1000 uptime-o

# Copy application from builder
COPY --from=builder --chown=uptime-o:uptime-o /build/target/*.jar app.jar

# Switch to non-root user
USER uptime-o

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD java -version || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
```

### Build Image

```bash
# Basic build
docker build -t uptime-o:latest .

# Build with specific tag
docker build -t myregistry.azurecr.io/uptime-o:1.0.0 .

# Build with build args
docker build --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  -t uptime-o:latest .

# View build layers
docker history uptime-o:latest
```

### Image Optimization

**Multi-stage Build** (already shown above):
- Reduces final image size
- Keeps build tools separate from runtime
- Only application code in final image

**Layer Caching**:
```dockerfile
# Order matters - rarely changing layers first
FROM eclipse-temurin:17-jre-jammy
RUN apt-get update && apt-get install -y curl  # Rarely changes
COPY pom.xml .                                  # Medium frequency
COPY src ./src                                  # Changes frequently
RUN mvn clean package
```

## Running Docker Containers

### Basic Run

```bash
# Run with default settings
docker run -p 8080:8080 uptime-o:latest

# Run in background
docker run -d -p 8080:8080 uptime-o:latest

# Run with name
docker run -d --name uptime-app -p 8080:8080 uptime-o:latest

# View logs
docker logs uptime-app
docker logs -f uptime-app  # Follow logs
```

### Environment Variables

```bash
# Pass environment variables
docker run -d \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/uptimeo \
  -e SPRING_DATASOURCE_USERNAME=uptimeo \
  -e SPRING_DATASOURCE_PASSWORD=password \
  -p 8080:8080 \
  uptime-o:latest

# Pass from file
docker run -d \
  --env-file .env.prod \
  -p 8080:8080 \
  uptime-o:latest
```

### Volumes

```bash
# Map logs directory
docker run -d \
  -v /var/log/uptime-o:/app/logs \
  -p 8080:8080 \
  uptime-o:latest

# Mount configuration
docker run -d \
  -v ./config/application.yml:/app/config/application.yml:ro \
  -p 8080:8080 \
  uptime-o:latest

# Named volume for data
docker volume create uptime-data
docker run -d \
  -v uptime-data:/app/data \
  -p 8080:8080 \
  uptime-o:latest
```

### Networking

```bash
# Create network
docker network create uptime-network

# Run container on network
docker run -d \
  --network uptime-network \
  --name uptime-app \
  -p 8080:8080 \
  uptime-o:latest

# Run PostgreSQL on same network
docker run -d \
  --network uptime-network \
  --name postgres \
  -e POSTGRES_DB=uptimeo \
  -e POSTGRES_PASSWORD=password \
  postgres:15

# Connect with network hostname
docker run -d \
  --network uptime-network \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/uptimeo \
  -p 8080:8080 \
  uptime-o:latest
```

## Docker Compose

Docker Compose runs multiple containers together as a stack.

### Basic docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: uptime-postgres
    environment:
      POSTGRES_DB: uptimeo
      POSTGRES_USER: uptimeo
      POSTGRES_PASSWORD: uptimeo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U uptimeo"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - uptime-network

  app:
    image: uptime-o:latest
    container_name: uptime-app
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/uptimeo
      SPRING_DATASOURCE_USERNAME: uptimeo
      SPRING_DATASOURCE_PASSWORD: uptimeo_password
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
    ports:
      - "8080:8080"
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - uptime-network

volumes:
  postgres_data:
    driver: local

networks:
  uptime-network:
    driver: bridge
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Start with specific file
docker-compose -f docker-compose.prod.yml up -d

# View services
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f app

# Stop all services
docker-compose stop

# Stop and remove
docker-compose down

# Remove volumes too
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# Scale service
docker-compose up -d --scale app=3
```

## Container Registry

### Docker Hub

```bash
# Login
docker login

# Tag image
docker tag uptime-o:latest myusername/uptime-o:latest

# Push to Hub
docker push myusername/uptime-o:latest

# Pull from Hub
docker pull myusername/uptime-o:latest
```

### Private Registry

```bash
# Login to private registry
docker login myregistry.azurecr.io

# Tag for private registry
docker tag uptime-o:latest myregistry.azurecr.io/uptime-o:1.0.0

# Push to private registry
docker push myregistry.azurecr.io/uptime-o:1.0.0

# Pull from private registry
docker pull myregistry.azurecr.io/uptime-o:1.0.0

# Run from private registry
docker run -d -p 8080:8080 myregistry.azurecr.io/uptime-o:1.0.0
```

## Container Management

### Viewing Images

```bash
# List images
docker images

# List images with filter
docker images uptime*

# Show image details
docker inspect uptime-o:latest

# Show image layers
docker history uptime-o:latest
```

### Viewing Containers

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Show container details
docker inspect uptime-app

# Show container stats
docker stats uptime-app
```

### Container Operations

```bash
# Stop container
docker stop uptime-app

# Start container
docker start uptime-app

# Restart container
docker restart uptime-app

# Remove container
docker rm uptime-app

# Remove all stopped containers
docker container prune

# View container logs
docker logs uptime-app
docker logs -f uptime-app
docker logs --tail 100 uptime-app

# Execute command in container
docker exec -it uptime-app bash
docker exec uptime-app curl http://localhost:8080/actuator/health

# Copy from container
docker cp uptime-app:/app/logs/app.log ./logs/

# Copy to container
docker cp ./config/app.yml uptime-app:/app/config/
```

## Debugging

### Interactive Shell

```bash
# Start container with shell
docker run -it --rm uptime-o:latest /bin/bash

# Exec shell in running container
docker exec -it uptime-app /bin/bash

# Execute command
docker exec uptime-app ps aux
docker exec uptime-app curl http://localhost:8080/actuator/health
```

### View Logs

```bash
# Recent logs
docker logs --tail 50 uptime-app

# Follow logs with timestamps
docker logs -f --timestamps uptime-app

# Logs from specific time
docker logs --since 2024-01-01T00:00:00 uptime-app

# Save logs to file
docker logs uptime-app > container.log 2>&1
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Stats for specific container
docker stats uptime-app

# Save stats to file
docker stats --no-stream > stats.txt
```

## Performance Optimization

### Resource Limits

```yaml
# In docker-compose.yml
services:
  app:
    image: uptime-o:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Memory Management

```bash
# Set memory limit
docker run -m 512m uptime-o:latest

# Set memory swap limit
docker run -m 512m --memory-swap 1g uptime-o:latest

# Monitor memory usage
docker stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

## Security Best Practices

### Non-root User

```dockerfile
# Create non-root user
RUN useradd -m -u 1000 uptime-o
USER uptime-o
```

### Read-only Filesystem

```dockerfile
# Make filesystem read-only
RUN chmod -R 555 /app
# But allow temporary directories
VOLUME /app/tmp
```

### Security Scanning

```bash
# Scan image for vulnerabilities
docker scan uptime-o:latest

# Using Trivy
trivy image uptime-o:latest

# Export results
trivy image --format json uptime-o:latest > scan-results.json
```

## Useful Commands

```bash
# Clean up unused resources
docker system prune          # Remove stopped containers, dangling images
docker system prune -a       # Remove all unused images
docker system prune --volumes # Also remove unused volumes

# Show disk usage
docker system df
docker system df -v

# Export/Import images
docker save uptime-o:latest | gzip > uptime-o.tar.gz
docker load < uptime-o.tar.gz
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs uptime-app

# Inspect container
docker inspect uptime-app

# Check resources
docker stats uptime-app

# Test health
docker exec uptime-app curl http://localhost:8080/actuator/health
```

### Network Issues

```bash
# Test DNS resolution
docker exec uptime-app nslookup postgres

# Test connectivity
docker exec uptime-app curl http://postgres:5432

# Inspect network
docker network inspect uptime-network
```

### Disk Space Issues

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove specific image
docker rmi uptime-o:old-tag

# Remove all dangling images
docker rmi $(docker images -q -f "dangling=true")
```

---

**Previous**: See [DEPLOYMENT.md](DEPLOYMENT.md)
**See Also**: See [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
