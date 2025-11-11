# UptimeO Status Page - Release Notes

## Version 1.0.0 (Initial Release)

**Release Date:** January 2025  
**Docker Image:** `ghcr.io/vibhuvioio/uptimeo-statuspage:latest`

### Features

#### 🎨 Fully Customizable Branding
- Custom logo and favicon support (local or remote URLs)
- Configurable navbar title and page headers
- Company name with website link
- Custom footer text
- Support email integration
- Navigation link (e.g., Console, Dashboard)
- All branding via environment variables

#### 📊 Real-Time Status Display
- Service health matrix (APIs × Regions)
- Color-coded status indicators:
  - 🟢 Available - Normal latency
  - 🟡 Warning - Elevated latency
  - 🟠 Critical - High latency
  - 🔴 Down - Service disruption
  - ⚪ No Data - No recent heartbeats
- Response time display (milliseconds)
- Auto-refresh every 30 seconds
- Last update timestamp (local timezone)

#### 🌐 Multi-Region Support
- Dynamic region columns
- Per-region health status
- Cross-region service visibility
- Automatic region detection from database

#### 🔧 Production Ready
- Lightweight Node.js + React stack
- PostgreSQL connection pooling
- Error handling and logging
- CORS support for API access
- Docker containerized deployment
- Environment-based configuration

#### 📱 Modern UI/UX
- Clean, minimal design
- Responsive layout
- Status legend with descriptions
- Hover tooltips for detailed status
- Professional color scheme

### Technical Stack
- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with pg driver
- **Container:** Node 20 Alpine

### API Endpoints
- `GET /api/public/status` - Service health data
- `GET /api/public/branding` - Branding configuration
- `GET /health` - Health check
