# UptimeO Documentation

Welcome to UptimeO documentation! This folder contains comprehensive guides for using, developing, and deploying UptimeO.

## 📚 Documentation Structure

### Getting Started

- **[SETUP.md](SETUP.md)** - Set up your development environment
  - System requirements
  - Installation instructions for all platforms
  - IDE configuration
  - Troubleshooting

- **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes
  - Prerequisites
  - Default credentials
  - Quick API tests
  - Common issues

### Understanding the System

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and architecture
  - System overview diagram
  - Component descriptions
  - Data flow
  - Technology stack
  - JSON serialization pipeline
  - Design patterns

### Development

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guidelines
  - Project structure
  - Adding new features (step-by-step)
  - Git workflow
  - Code style guidelines
  - Debugging tips
  - Performance optimization

- **[TESTING.md](TESTING.md)** - Testing comprehensive guide
  - Unit testing
  - Integration testing
  - Test coverage
  - Frontend testing
  - Performance testing
  - CI/CD integration

### API Documentation

- **[API_OVERVIEW.md](API_OVERVIEW.md)** - REST API reference
  - Authentication
  - Base URL and endpoints
  - Response formats
  - HTTP status codes
  - Query parameters
  - Headers

- **[API_TESTING.md](API_TESTING.md)** - API testing procedures
  - Testing tools and setup
  - Testing workflows
  - Testing scenarios (happy path, errors, etc.)
  - JSON field testing
  - Validation testing
  - Performance testing

### JSON Implementation

- **[JSON_FIELDS_GUIDE.md](JSON_FIELDS_GUIDE.md)** - JSON field implementation
  - Type conversion stack
  - Entity definitions
  - DTO definitions
  - Mapper configuration
  - Usage examples
  - Frontend integration
  - Database queries
  - Troubleshooting

### Deployment

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
  - Local development deployment
  - Docker deployment
  - Production deployment
  - SSL/TLS setup
  - Database setup
  - Systemd service configuration
  - Health checks
  - Backup & recovery

- **[DOCKER.md](DOCKER.md)** - Docker guide
  - Docker concepts
  - Building images
  - Running containers
  - Docker Compose
  - Container registry
  - Container management
  - Debugging
  - Security best practices

### Troubleshooting

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
  - Connection issues
  - API issues
  - JSON field issues
  - Authentication issues
  - Database issues
  - Build issues
  - Frontend issues
  - Performance issues
  - Logging and debugging

## 🚀 Quick Navigation

### For Different Roles

**👤 New Team Member**
1. Start: [SETUP.md](SETUP.md)
2. Then: [QUICK_START.md](QUICK_START.md)
3. Learn: [ARCHITECTURE.md](ARCHITECTURE.md)

**👨‍💻 Backend Developer**
1. Read: [DEVELOPMENT.md](DEVELOPMENT.md)
2. Reference: [API_OVERVIEW.md](API_OVERVIEW.md)
3. Test: [TESTING.md](TESTING.md)
4. Debug: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**🔌 Frontend Developer**
1. Setup: [SETUP.md](SETUP.md)
2. API: [API_OVERVIEW.md](API_OVERVIEW.md)
3. Testing: [TESTING.md](TESTING.md)

**🚀 DevOps Engineer**
1. Deploy: [DEPLOYMENT.md](DEPLOYMENT.md)
2. Docker: [DOCKER.md](DOCKER.md)
3. Troubleshoot: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**📊 System Architect**
1. Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
2. JSON Design: [JSON_FIELDS_GUIDE.md](JSON_FIELDS_GUIDE.md)
3. Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)

### By Task

| Task | Documentation |
|------|---|
| Set up development environment | [SETUP.md](SETUP.md) |
| Get application running | [QUICK_START.md](QUICK_START.md) |
| Understand the system | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Add a new feature | [DEVELOPMENT.md](DEVELOPMENT.md) |
| Write tests | [TESTING.md](TESTING.md) |
| Call an API | [API_OVERVIEW.md](API_OVERVIEW.md) |
| Test an API | [API_TESTING.md](API_TESTING.md) |
| Work with JSON fields | [JSON_FIELDS_GUIDE.md](JSON_FIELDS_GUIDE.md) |
| Deploy to production | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Use Docker | [DOCKER.md](DOCKER.md) |
| Fix an issue | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

## 🔑 Key Concepts

### JSON Field Implementation

UptimeO uses advanced JSON field handling:
- **Frontend** sends JSON objects in API requests
- **API** deserializes to `JsonNode` type
- **Mapper** converts `JsonNode` → Entity
- **Database** stores as PostgreSQL `JSONB`
- **Retrieval** reconstructs complete JSON objects

See [JSON_FIELDS_GUIDE.md](JSON_FIELDS_GUIDE.md) for details.

### Technology Stack

**Backend**
- Java 17
- Spring Boot 3.x
- JHipster
- Hibernate 6.x with JSONB support
- PostgreSQL 12+

**Frontend**
- React 18+
- TypeScript
- react-hook-form
- Redux

**DevOps**
- Docker & Docker Compose
- Kubernetes (optional)
- GitLab CI/CD

## 📋 Common Tasks Checklists

### First Time Setup
- [ ] Install Java 17+, Maven, Node.js, Docker
- [ ] Clone repository
- [ ] Configure IDE
- [ ] Start PostgreSQL
- [ ] Run `./mvnw clean install`
- [ ] Run `npm install`
- [ ] Start backend and frontend
- [ ] Verify at http://localhost:4200

### Adding a Feature
- [ ] Create feature branch
- [ ] Create entity in `domain/`
- [ ] Create DTO in `service/dto/`
- [ ] Create mapper in `service/mapper/`
- [ ] Create repository
- [ ] Create service
- [ ] Create REST controller
- [ ] Add tests
- [ ] Create database migration
- [ ] Submit pull request

### Deploying to Production
- [ ] Build JAR: `./mvnw clean package -Pprod`
- [ ] Create Docker image
- [ ] Test image locally
- [ ] Push to registry
- [ ] Configure environment variables
- [ ] Setup SSL certificates
- [ ] Run database migrations
- [ ] Deploy and verify
- [ ] Monitor logs and metrics

## 🔗 External Resources

### Official Documentation
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [JHipster Documentation](https://www.jhipster.tech/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://react.dev)

### Tools
- [Maven Documentation](https://maven.apache.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Git Documentation](https://git-scm.com/doc)

### Learning Resources
- [Spring Framework Guide](https://spring.io/guides)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [React Tutorial](https://react.dev/learn)
- [Docker Getting Started](https://docs.docker.com/get-started/)

## 📞 Getting Help

### Finding Information
1. **Search documentation** - Use Ctrl+F to search within docs
2. **Check TROUBLESHOOTING.md** - Common issues and solutions
3. **Review examples** - Code examples throughout docs
4. **Check logs** - Application logs often reveal issues

### Asking for Help
1. **Document what you tried** - Include steps and errors
2. **Provide error messages** - Full stack traces help
3. **Check recent changes** - Recent git commits might be relevant
4. **Search issues** - GitHub issues may have solutions
5. **Ask team** - Slack/Discord #development channel

## 📝 Contributing to Documentation

If you find issues or have improvements:

1. **Report issues**: Create GitHub issue with details
2. **Suggest improvements**: Describe current vs. desired state
3. **Update docs**: Submit pull request with changes
4. **Add examples**: Provide code examples for clarity

## 🎯 Documentation Roadmap

### Completed ✅
- Setup guide
- Quick start
- Architecture
- Development guide
- Testing guide
- API overview
- API testing
- JSON fields guide
- Deployment guide
- Docker guide
- Troubleshooting

### Potential Additions
- Database migration guide
- Kubernetes deployment
- Performance tuning guide
- Security hardening guide
- API client SDKs
- Integration examples
- Video tutorials
- Glossary

## 📄 License

This documentation is part of UptimeO project. See LICENSE file for details.

## ✨ Last Updated

- **Documentation Suite**: January 2024
- **All Guides**: Comprehensive coverage
- **Code Examples**: Production-ready
- **Tested**: All procedures verified

---

**Quick Links**:
- 🚀 [Getting Started](SETUP.md)
- ⚡ [5-Minute Quick Start](QUICK_START.md)
- 🏗️ [Architecture Overview](ARCHITECTURE.md)
- 💻 [Development Guide](DEVELOPMENT.md)
- 🧪 [Testing Guide](TESTING.md)
- 🌐 [API Reference](API_OVERVIEW.md)
- 🐳 [Docker Guide](DOCKER.md)
- ⚠️ [Troubleshooting](TROUBLESHOOTING.md)

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
