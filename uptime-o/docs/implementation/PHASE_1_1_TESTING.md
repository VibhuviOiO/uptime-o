# Phase 1.1 Testing & Verification Guide

## Testing the Implementation

### Backend Testing

#### 1. Build Verification
```bash
mvn clean compile
# Expected: BUILD SUCCESS
```

#### 2. Unit Tests
```bash
mvn test
# Tests DashboardService aggregation logic
# Tests DashboardResource endpoint annotations
```

#### 3. Manual Endpoint Testing

Start the backend server:
```bash
./mvnw -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8000"
# Or simpler: ./mvnw
```

Then test endpoints using curl:

**Test 1: Overall Metrics**
```bash
curl -X GET "http://localhost:8080/api/dashboard/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "uptimePercentage": 99.8,
  "averageResponseTime": 245.5,
  "successCount": 4980,
  "failedCount": 10,
  "totalMonitors": 50,
  "degradedCount": 2
}
```

**Test 2: Timeline Data**
```bash
curl -X GET "http://localhost:8080/api/dashboard/timeline?period=24h&intervalMinutes=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "points": [
    {
      "timestamp": "2025-01-15T00:00:00Z",
      "successCount": 320,
      "failureCount": 2,
      "averageResponseTime": 250.0
    },
    ...
  ],
  "startTime": "2025-01-15T00:00:00Z",
  "endTime": "2025-01-16T00:00:00Z",
  "period": "24h"
}
```

**Test 3: Datacenter Status**
```bash
curl -X GET "http://localhost:8080/api/dashboard/datacenter-status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
[
  {
    "id": 1,
    "name": "US-East-1",
    "status": "HEALTHY",
    "uptimePercentage": 99.95,
    "totalMonitors": 25,
    "healthyMonitors": 24,
    "degradedMonitors": 1,
    "failedMonitors": 0,
    "agentStatus": "ACTIVE",
    "avgResponseTime": 200.0,
    "issueCount": 1,
    "lastUpdated": "2025-01-15T12:30:45Z"
  }
]
```

### Frontend Testing

#### 1. TypeScript Compilation
```bash
npm run lint
# Expected: No errors (0 errors, 0 warnings)
```

#### 2. Component Testing

Start the dev server:
```bash
npm start
# Server runs on http://localhost:9000
```

#### 3. Visual Testing

1. Navigate to Home page (Dashboard)
2. Verify the new "Performance Metrics" section appears at the top
3. Check the 4 KPI cards display:
   - Network Uptime (with green/yellow/red status)
   - Avg Response Time (with trend indicator)
   - Active Monitors (with count)
   - Active Issues (with count)

#### 4. Responsive Testing

Test on different screen sizes:
- **Desktop (1920px)**: 4 columns grid
- **Laptop (1366px)**: 2 columns grid
- **Tablet (768px)**: 1-2 columns
- **Mobile (375px)**: 1 column stack

#### 5. State Testing

**Loading State**
- Verify skeleton loaders appear when page first loads
- Check that skeleton animation is smooth

**Error State**
- Temporarily stop backend server
- Dashboard should show error message instead of crashing
- Verify "Failed to load dashboard" appears with warning icon

**Success State**
- Dashboard metrics should load within 2-3 seconds
- KPI values should be non-zero (based on your database data)
- Status badges should show at bottom

**Auto-refresh**
- Wait 30 seconds and verify dashboard re-fetches data
- Check browser console for network requests every 30s
- Values should update with latest metrics

#### 6. Integration Testing

Verify the complete flow:
1. Backend service running ✓
2. Frontend loads dashboard ✓
3. Hook makes API calls ✓
4. KPI component displays data ✓
5. 30-second auto-refresh works ✓
6. Status colors match design system ✓
7. Responsive layout adapts ✓

### Performance Testing

#### Network Performance
```bash
# Open DevTools → Network tab
# Filter by XHR requests
# Should see 5 parallel requests to /api/dashboard/*
# Each response < 200ms
# Total time < 500ms
```

#### Memory Usage
```bash
# Open DevTools → Memory tab
# Take heap snapshot before dashboard loads
# Take heap snapshot after 2 minutes (4 refresh cycles)
# Compare snapshots - should not see significant memory growth
```

#### CPU Usage
```bash
# Open DevTools → Performance tab
# Record for 60 seconds
# Dashboard should not consume >5% CPU during idle
# Should drop to ~1% after initial load
```

## Debugging Tips

### Backend Issues

**404 on Endpoint**
- Check `/web/rest/DashboardResource.java` exists
- Verify `@RestController` and `@RequestMapping("/api/dashboard")` annotations
- Restart Spring Boot

**Null Pointer in Service**
- Check `HttpHeartbeatRepository` has the 2 new methods
- Verify `DashboardService` is autowired correctly
- Check database has HttpHeartbeat records

**Compilation Error**
```bash
mvn clean compile -X
# Shows detailed compilation info
```

### Frontend Issues

**Import not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Component not rendering**
```bash
# Check browser console for React errors
# Verify all props are being passed correctly
# Check DashboardMetricsDTO types match
```

**Styling not applied**
```bash
# Clear webpack cache
npm run clean-www

# Rebuild
npm start
```

**Hook not fetching data**
```bash
# Check Network tab in DevTools
# Verify API URLs: /api/dashboard/metrics, etc.
# Check Authorization header (Bearer token)
# Check CORS headers: Access-Control-Allow-Origin
```

## Browser Console Diagnostics

### Expected Logs (Debug Mode)
```javascript
// On page load
console.log: "Dashboard data fetch error: [error message if any]"
console.log: "Network request to /api/dashboard/metrics"
console.log: "Received metrics: {uptime: 99.8, ...}"

// Every 30 seconds
console.log: "Dashboard data fetch success"
console.log: "New metrics received"
```

### Common Errors

**CORS Error**
```
Access to XMLHttpRequest from origin has been blocked by CORS policy
```
→ Add CORS headers to DashboardResource:
```java
@CrossOrigin(origins = "*")
```

**401 Unauthorized**
```
401 - Unauthorized
```
→ Ensure Bearer token in Authorization header

**Network Timeout**
```
Network error: Request timeout
```
→ Backend not responding, check if server is running

## Pre-deployment Checklist

- [ ] `mvn clean compile` passes
- [ ] `npm run lint` passes with 0 errors
- [ ] Home page loads without errors
- [ ] KPI cards appear with data
- [ ] All 4 KPI values are non-zero
- [ ] Status colors are correct
- [ ] Responsive layout works on mobile
- [ ] Auto-refresh works (check Network tab)
- [ ] Loading state appears briefly
- [ ] Error handling works (stop backend, see error message)
- [ ] Console has no errors or warnings
- [ ] Performance acceptable (<2s load time)

## Next Phase Testing (Phase 1.2)

Phase 1.2 will add:
- [ ] Timeline chart component (using Chart.js or similar)
- [ ] Datacenters grid with status filtering
- [ ] Top monitors list with details
- [ ] Manual refresh button

Testing for Phase 1.2 will verify:
- Chart renders with timeline data
- Filtering works correctly
- Click-through to detail pages
- Drill-down capability

## Production Readiness

### Before Deploying to Production

1. **Load Testing**
   - Test with 1000+ concurrent users
   - Dashboard should handle 30s refresh interval
   - Monitor database load

2. **Security Review**
   - All endpoints require authentication ✓
   - CORS properly configured ✓
   - Input validation on query parameters ✓

3. **Monitoring Setup**
   - Application Insights configured
   - Alert on dashboard API errors
   - Monitor response time thresholds

4. **Documentation**
   - API documentation in Swagger
   - Frontend component documentation
   - Deployment guide

---

**Last Updated**: January 2025
**Version**: Phase 1.1
**Tested On**: macOS with Java 11+ and Node 18+
