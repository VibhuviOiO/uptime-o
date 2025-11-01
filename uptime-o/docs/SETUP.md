# Setup Guide

Step-by-step guide to set up UptimeO development environment.

## System Requirements

### Minimum Requirements

- **OS**: macOS 11+, Windows 10+, Ubuntu 20.04+
- **RAM**: 8 GB
- **Disk**: 10 GB free space
- **CPU**: Intel i5/AMD Ryzen 5 or equivalent

### Required Software

```bash
# Check versions
java -version              # Need: Java 17 or higher
mvn -version              # Need: Maven 3.8+
node -version             # Need: Node.js 16+
npm -version              # Need: npm 8+
docker --version          # Need: Docker 20.10+
docker-compose --version  # Need: Docker Compose 1.29+
```

## Installation

### macOS

**Option 1: Using Homebrew (Recommended)**

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install openjdk@17
brew install maven
brew install node
brew install docker

# Setup Java
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
export PATH="/usr/local/opt/openjdk@17/bin:$PATH"
java -version

# Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

**Option 2: Manual Installation**

1. **Java 17**: Download from [Eclipse Adoptium](https://adoptium.net/)
2. **Maven**: Download from [Apache Maven](https://maven.apache.org/download.cgi)
3. **Node.js**: Download from [nodejs.org](https://nodejs.org/)
4. **Docker**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Windows

**Using Chocolatey** (if installed):

```bash
choco install openjdk17
choco install maven
choco install nodejs
choco install docker-desktop
```

**Manual Installation**:

1. **Java 17**: Download from [Eclipse Adoptium](https://adoptium.net/)
   - Run installer and add to PATH
   - Verify: `java -version`

2. **Maven**: Download from [Apache Maven](https://maven.apache.org/download.cgi)
   - Extract to `C:\Program Files\Maven`
   - Add to PATH: `C:\Program Files\Maven\bin`
   - Verify: `mvn -version`

3. **Node.js**: Download from [nodejs.org](https://nodejs.org/)
   - Run installer (includes npm)
   - Verify: `node -version` and `npm -version`

4. **Docker**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Install and start Docker

### Linux (Ubuntu)

```bash
# Update package manager
sudo apt update

# Install Java 17
sudo apt install openjdk-17-jdk

# Install Maven
sudo apt install maven

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installations
java -version
mvn -version
node -version
npm -version
docker --version
```

## Repository Setup

### Clone Repository

```bash
# Navigate to your development folder
cd ~/Development  # or wherever you keep projects

# Clone the repository
git clone https://github.com/your-org/uptime-o.git
cd uptime-o

# Verify main branch
git status
```

### Configure Git

```bash
# Set your identity
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Optional: configure for this repo only (omit --global for global config)
git config --global core.editor "vim"  # or your preferred editor
git config --global pull.rebase false   # Use merge for pulls
```

### IDE Setup

#### IntelliJ IDEA

1. Open IntelliJ IDEA
2. **File** → **Open** → Select project folder
3. Wait for indexing to complete
4. **File** → **Project Structure**
   - **Project SDK**: Set to JDK 17
   - **Language level**: Java 17

5. Install plugins:
   - Settings → Plugins → Search for:
     - JHipster
     - Lombok
     - Spring Boot
     - Docker
     - Kubernetes

6. **View** → **Tool Windows** → **Maven** to view Maven commands

#### VS Code

1. Open VS Code
2. **File** → **Open Folder** → Select project folder
3. Install extensions:
   ```bash
   code --install-extension vscjava.extension-pack-for-java
   code --install-extension pivotal.vscode-spring-boot
   code --install-extension ms-docker.docker
   code --install-extension eamodio.gitlens
   ```

4. Create `.vscode/settings.json`:
   ```json
   {
     "[java]": {
       "editor.formatOnSave": true,
       "editor.codeActionsOnSave": {
         "source.fixAll": true
       }
     },
     "java.configuration.runtimes": [
       {
         "name": "JavaSE-17",
         "path": "/path/to/jdk17",
         "default": true
       }
     ]
   }
   ```

#### Eclipse

1. Download Eclipse IDE for Java Developers
2. **File** → **Import** → **Maven** → **Existing Maven Projects**
3. Select project folder
4. Install Spring Tools Suite (STS) plugin
5. **Window** → **Preferences** → **Java** → **Installed JREs** → Set to JDK 17

## Environment Configuration

### Create Environment Files

**Development Configuration**:

```bash
# Copy example configuration
cp src/main/resources/application.yml.example src/main/resources/application-dev.yml
```

**File**: `src/main/resources/application-dev.yml`

```yaml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/uptimeo_dev
    username: uptimeo
    password: uptimeo_dev_password
    hikari:
      maximum-pool-size: 5
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
  h2:
    console:
      enabled: true
  devtools:
    restart:
      enabled: true
server:
  port: 8080
  error:
    include-message: always
    include-binding-errors: always
logging:
  level:
    root: INFO
    uptime.observability: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

### Start PostgreSQL

**Option 1: Docker Compose** (Recommended)

```bash
# Start PostgreSQL container
docker run --name uptime-postgres \
  -e POSTGRES_DB=uptimeo_dev \
  -e POSTGRES_USER=uptimeo \
  -e POSTGRES_PASSWORD=uptimeo_dev_password \
  -p 5432:5432 \
  -d postgres:15

# Verify
docker ps | grep postgres
```

**Option 2: Local PostgreSQL** (if installed)

```bash
# macOS
brew services start postgresql@15

# Ubuntu
sudo systemctl start postgresql

# Windows
# Start from Services or command prompt
```

**Verify Connection**:

```bash
psql -h localhost -U uptimeo -d uptimeo_dev
# Password: uptimeo_dev_password
# Type: \q to exit
```

## Build Project

### Download Dependencies

```bash
# Download all dependencies (one-time, may take a few minutes)
./mvnw dependency:resolve dependency:resolve-plugins
```

### Build Application

```bash
# Full build
./mvnw clean install

# Skip tests (faster)
./mvnw clean install -DskipTests

# Build with production profile
./mvnw clean package -Pprod

# View build output
# - JAR file: target/uptime-o-*.jar
# - Size: ~70-80 MB
```

### Install Frontend Dependencies

```bash
# Install npm packages
npm install

# Verify
npm list | head -20
```

## Run Application

### Development Mode

```bash
# Terminal 1: Start backend
./mvnw spring-boot:run

# Terminal 2: Start frontend (in separate terminal)
npm start
```

**Access URLs**:
- Frontend: http://localhost:4200
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Production Build

```bash
# Build frontend
npm run build

# Build entire application
./mvnw clean package -Pprod -DskipTests

# Run JAR
java -jar target/uptime-o-*.jar
```

## Verify Installation

### Health Check Script

```bash
#!/bin/bash
# save as: check-setup.sh

echo "=== System Verification ==="

# Check Java
echo "Java:"
java -version

# Check Maven
echo "Maven:"
mvn -version

# Check Node
echo "Node:"
node -version
npm -version

# Check Docker
echo "Docker:"
docker --version
docker-compose --version

# Check PostgreSQL connection
echo "Database:"
psql -h localhost -U uptimeo -d uptimeo_dev -c "SELECT NOW();" 2>/dev/null && echo "✓ PostgreSQL connected" || echo "✗ PostgreSQL not available"

# Check project build
echo "Project Build:"
./mvnw --version

echo "=== End Verification ==="
```

**Run verification**:

```bash
chmod +x check-setup.sh
./check-setup.sh
```

### Quick API Test

```bash
# Wait for app to start (~30 seconds)
# Then test API

# Get health status
curl http://localhost:8080/actuator/health

# Get API info
curl http://localhost:8080/actuator/info

# List available endpoints
curl http://localhost:8080/swagger-ui.html
```

## IDE Configuration

### Code Formatting

**IntelliJ IDEA**:
1. **Settings** → **Editor** → **Code Style** → **Java**
2. Import checkstyle: `checkstyle.xml`
3. Enable "Reformat code on Save"

**VS Code**:
1. Install Prettier extension
2. Set as default formatter
3. Enable format on save

### Debugging

**IntelliJ**:
1. Set breakpoint (click line number)
2. **Run** → **Debug 'Application'**
3. Code will pause at breakpoint
4. Use Debug panel to step through code

**VS Code**:
1. Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "java",
         "name": "Debug UptimeO",
         "request": "launch",
         "mainClass": "uptime.observability.UptimeOApp",
         "cwd": "${workspaceFolder}",
         "console": "integratedTerminal"
       }
     ]
   }
   ```
2. Press F5 to start debugging

## Common Issues

### Issue: Java version not found

**Solution**:
```bash
# Check installed Java versions
/usr/libexec/java_home -V  # macOS
java -version              # All platforms

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS
export JAVA_HOME=/path/to/jdk17                    # Linux/Windows
```

### Issue: Maven build fails with "No compiler is provided"

**Solution**:
```bash
# Set JAVA_HOME and try again
export JAVA_HOME=/path/to/jdk17
./mvnw clean install
```

### Issue: PostgreSQL connection refused

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
psql -h localhost -U uptimeo -d uptimeo_dev

# If not running, start it:
docker run --name uptime-postgres \
  -e POSTGRES_DB=uptimeo_dev \
  -e POSTGRES_USER=uptimeo \
  -e POSTGRES_PASSWORD=uptimeo_dev_password \
  -p 5432:5432 \
  -d postgres:15
```

### Issue: Port 8080 already in use

**Solution**:
```bash
# macOS/Linux - Find and kill process
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or use different port
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"
```

### Issue: Node/npm command not found

**Solution**:
```bash
# Check PATH
echo $PATH

# Reinstall Node
# macOS: brew reinstall node
# Windows: Reinstall from nodejs.org
# Linux: sudo apt reinstall nodejs

# Verify
node -version
npm -version
```

## Next Steps

After successful setup:

1. **Read Documentation**:
   - [QUICK_START.md](QUICK_START.md) - 5-minute quickstart
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guidelines

2. **Run Tests**:
   ```bash
   ./mvnw test
   npm test
   ```

3. **Make Your First Change**:
   - Create feature branch: `git checkout -b feature/my-feature`
   - Make changes
   - Run tests
   - Create pull request

4. **Explore the Application**:
   - Visit http://localhost:8080
   - Try API endpoints via Swagger UI
   - Check logs in console

## Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: Check GitHub issues
- **Team**: Contact development team
- **Slack/Discord**: Ask in #development channel

## Tools Reference

| Tool | Version | Purpose | Link |
|------|---------|---------|------|
| Java | 17+ | Backend runtime | https://adoptium.net |
| Maven | 3.8+ | Build tool | https://maven.apache.org |
| Node.js | 16+ | Frontend runtime | https://nodejs.org |
| npm | 8+ | Package manager | https://www.npmjs.com |
| Docker | 20.10+ | Containerization | https://www.docker.com |
| PostgreSQL | 12+ | Database | https://www.postgresql.org |
| Git | Latest | Version control | https://git-scm.com |

---

**Next**: See [QUICK_START.md](QUICK_START.md) for first steps
**See Also**: See [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
