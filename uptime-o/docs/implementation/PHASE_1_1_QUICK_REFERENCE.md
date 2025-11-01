# Phase 1.1 Quick Reference

## What's New

### Real-time Dashboard Metrics
The home page now displays 4 KPI cards with real-time monitoring data that auto-refreshes every 30 seconds:
- **Network Uptime**: Overall system uptime percentage
- **Avg Response Time**: Average HTTP response time in milliseconds
- **Active Monitors**: Total count of deployed monitors
- **Active Issues**: Count of failed and degraded monitors

## Files Changed

### New Files Created
```
src/main/java/uptime/
├── web/rest/DashboardResource.java ..................... 7 REST endpoints
├── service/DashboardService.java ....................... Aggregation logic
└── service/dto/
    ├── DashboardMetricsDTO.java
    ├── TimelinePointDTO.java
    ├── TimelineDTO.java
    ├── DatacenterStatusDTO.java
    └── MonitorStatusDTO.java

src/main/webapp/app/modules/dashboard/
├── hooks/useDashboardMetrics.ts ....................... Auto-refresh hook
└── components/
    ├── DashboardKPIs.tsx .............................. KPI component
    └── dashboard-kpis.scss ............................ Styling
```

### Files Modified
```
src/main/java/uptime/repository/
└── HttpHeartbeatRepository.java ....................... +2 query methods

src/main/webapp/app/modules/home/
├── home.tsx .......................................... Integration
└── home.scss .......................................... New section styling
```

## Key Features

### 1. Real-time Data
- Fetches fresh data every 30 seconds
- Parallel requests for 5 dashboard endpoints
- Instant updates on page load

### 2. Smart Status System
- **Healthy** (Green) - All systems normal
  - Uptime ≥99% OR Response time ≤500ms
- **Degraded** (Amber) - Attention needed
  - Uptime 95-99% OR Response time 500-2000ms
- **Failed** (Red) - Issues present
  - Uptime <95% OR Response time >2000ms OR Failures detected

### 3. User Experience
- **Loading State**: Skeleton cards while fetching
- **Error State**: User-friendly error message if API fails
- **Responsive**: Works on mobile, tablet, desktop
- **Trend Indicators**: Shows up/down trends on KPI values
- **Status Badges**: Summary of healthy/degraded/failed counts

## API Endpoints

All endpoints are at `/api/dashboard/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/metrics` | GET | Overall metrics (uptime, response time, counts) |
| `/timeline` | GET | 24h timeline data for charts |
| `/datacenter-status` | GET | Health status of each datacenter |
| `/health-summary` | GET | System health distribution counts |
| `/top-monitors` | GET | Top 5 performing/failing monitors |
| `/region-metrics` | GET | Per-region statistics |
| `/sla-status` | GET | SLA compliance percentage |

## Usage Example

The hook handles all the complexity:

```typescript
const dashboardData = useDashboardMetrics(30000); // 30-second refresh

// Access the data:
dashboardData.metrics?.uptimePercentage
dashboardData.metrics?.averageResponseTime
dashboardData.healthSummary?.healthyCount
dashboardData.loading    // true while fetching
dashboardData.error      // error message if fetch fails
dashboardData.refetch()  // manual refresh function
```

## Build Commands

```bash
# Compile Java backend
mvn clean compile

# Test linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Build for production
npm run build

# Start development server
npm start

# Start backend
./mvnw
```

## Monitoring

### Database
- Queries use efficient bulk fetch + in-memory filtering
- Default 24-hour lookback period
- Configurable time intervals (15-30 minutes)

### Frontend
- Auto-refresh every 30 seconds (configurable)
- Parallel fetching of all 5 endpoints
- Graceful error handling

### Performance Targets
- API response time: <200ms
- Dashboard load time: <2 seconds
- Page renders within: <500ms
- Auto-refresh memory impact: negligible

## Status Color System

```scss
// Consistent across entire application
--healthy: #10b981      // Green
--degraded: #f59e0b     // Amber
--failed: #ef4444       // Red
```

## Responsive Breakpoints

| Screen | Layout | Columns |
|--------|--------|---------|
| Mobile | Portrait (< 640px) | 1 (stacked) |
| Tablet | Landscape (768px) | 2 |
| Laptop | Full (1024px+) | 4 |
| Desktop | Wide (1400px+) | 4 |

## Common Tasks

### Refresh Dashboard Manually
```typescript
// In a component using the hook:
const { refetch } = useDashboardMetrics();

<button onClick={refetch}>Refresh Now</button>
```

### Change Refresh Interval
```typescript
// Default 30 seconds (30000ms)
const dashboardData = useDashboardMetrics(60000); // Change to 60 seconds
```

### Disable Auto-refresh
```typescript
// Pass 0 or negative number
const dashboardData = useDashboardMetrics(0); // No auto-refresh
```

### Test with Mock Data
```typescript
// For development/testing:
const mockMetrics: DashboardMetricsDTO = {
  uptimePercentage: 99.8,
  averageResponseTime: 245,
  successCount: 4980,
  failedCount: 10,
  totalMonitors: 50,
  degradedCount: 2
};
```

## Troubleshooting

### Dashboard not loading
1. Check Java backend is running: `http://localhost:8080`
2. Check browser console for errors
3. Verify network requests in DevTools
4. Restart both backend and frontend

### Data not updating
1. Check if auto-refresh is disabled (interval = 0)
2. Verify network tab shows requests every 30s
3. Check if API returns 401 (authentication issue)
4. Manually click "Refresh" if available

### Styling looks wrong
1. Clear browser cache (Cmd+Shift+R)
2. Rebuild: `npm run clean-www && npm start`
3. Check that SCSS file is imported
4. Verify CSS classes match component

### API returns 404
1. Verify DashboardResource exists and compiled
2. Check endpoint path: `/api/dashboard/metrics`
3. Restart backend: `./mvnw`
4. Check logs for compilation errors

## Next Phase (1.2)

Coming soon:
- Timeline chart showing 24h trends
- Datacenters grid with detailed info
- Top monitors list with click-through
- Manual refresh button
- Advanced filtering options

## Documentation Files

- `PHASE_1_1_COMPLETION.md` - Full implementation details
- `PHASE_1_1_TESTING.md` - Testing and debugging guide
- `IMPLEMENTATION_ROADMAP.md` - Overall 3-phase plan
- `UX_DESIGN_SYSTEM.md` - Design specifications

## Support

For issues or questions:
1. Check the PHASE_1_1_TESTING.md guide first
2. Review browser console errors
3. Check backend logs: `tail -f logs/application.log`
4. Review git changes: `git diff main`

---

**Last Updated**: January 2025
**Phase**: 1.1 Complete
**Status**: ✅ Production Ready
