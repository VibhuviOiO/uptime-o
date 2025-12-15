# Phase 1.1 Quick Start Guide

## 30-Second Summary

✅ **What's New**: Real-time dashboard with 4 KPI cards that update every 30 seconds
✅ **Where**: Home page, top section titled "Performance Metrics"
✅ **Status**: Fully implemented and tested
✅ **Action**: Just start the app, no configuration needed

---

## Getting Started

### Step 1: Build the Backend
```bash
cd /Users/jinnabalaiah/vibhuvi/practice/UptimeO/uptime-o
mvn clean install
# Or for just compile: mvn clean compile
```

### Step 2: Start the Backend
```bash
./mvnw
# Starts on http://localhost:8080
```

### Step 3: Start the Frontend (in new terminal)
```bash
npm start
# Starts on http://localhost:9000
```

### Step 4: Open Dashboard
```
http://localhost:9000
# Navigate to Home (it's the default page)
```

### Step 5: Verify It Works
You should see:
- "Performance Metrics" section with 4 cards
- Green/Amber/Red status indicators
- Numbers updating every 30 seconds
- Loading skeleton on first load

---

## What You're Seeing

### The 4 KPI Cards

| Card | Shows | Means |
|------|-------|-------|
| **Network Uptime** | ≥99% | System is healthy |
| **Avg Response Time** | <500ms | Fast responses |
| **Active Monitors** | 50 | Number of monitors |
| **Active Issues** | 1-5 | How many problems |

### Status Colors

- 🟢 **Green (Healthy)**: Everything is good
- 🟡 **Amber (Degraded)**: Minor issues detected
- 🔴 **Red (Failed)**: Major issues present

### Bottom Summary

Shows count of:
- ✅ Healthy monitors
- ⚠️ Degraded monitors
- ❌ Failed monitors

---

## Auto-Refresh

The dashboard automatically refreshes every 30 seconds.

To see it work:
1. Open DevTools (F12 → Network tab)
2. Watch requests to `/api/dashboard/*` appear every 30 seconds
3. Notice the timestamp changes each refresh

---

## If Something Doesn't Work

### Problem: Dashboard not loading
**Solution**: 
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - ensure API calls return 200
4. Make sure backend is running on port 8080

### Problem: Data shows 0 or no data
**Solution**:
1. Check your database has HttpHeartbeat records
2. Run: `SELECT COUNT(*) FROM HTTP_HEARTBEAT;`
3. If empty, create some test data first

### Problem: Page loads but cards are empty
**Solution**:
1. Wait 5 seconds (API takes time)
2. Check if status badge shows error message
3. Click refresh in DevTools to retry

### Problem: Styling looks off
**Solution**:
1. Hard refresh browser (Cmd+Shift+R on Mac)
2. Clear npm cache: `npm cache clean --force`
3. Rebuild frontend: `npm run clean-www && npm start`

---

## Testing the API Directly

### Test if API is working:
```bash
curl -X GET "http://localhost:8080/api/dashboard/metrics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected response:
```json
{
  "uptimePercentage": 99.8,
  "averageResponseTime": 245,
  "successCount": 4980,
  "failedCount": 10,
  "totalMonitors": 50,
  "degradedCount": 2
}
```

### If you get 401 (Unauthorized):
1. Get a JWT token from login endpoint
2. Include it in Authorization header

### If you get 404:
1. Check backend is running
2. Verify DashboardResource.java exists
3. Restart backend

---

## Useful Commands

```bash
# Rebuild everything
npm run clean-www && mvn clean install

# Start backend in debug mode
./mvnw -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8000"

# Start frontend with watch
npm start

# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint -- --fix

# View backend logs
tail -f logs/application.log

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 9000
lsof -ti:9000 | xargs kill -9
```

---

## Key Files to Know

### Backend
- `DashboardResource.java` - The REST endpoints
- `DashboardService.java` - The business logic
- `HttpHeartbeatRepository.java` - The queries

### Frontend
- `useDashboardMetrics.ts` - The hook (fetch data)
- `DashboardKPIs.tsx` - The component (display data)
- `dashboard-kpis.scss` - The styling
- `home.tsx` - Where it's integrated

---

## Changing Refresh Interval

In `home.tsx`, find:
```typescript
const dashboardData = useDashboardMetrics(30000);
```

Change `30000` to your preferred milliseconds:
- `60000` = 60 seconds
- `10000` = 10 seconds
- `0` = disable auto-refresh

---

## Common Customizations

### Change status thresholds
Edit `DashboardService.java`, look for:
```java
if (uptime >= 99.0) return "HEALTHY";
if (uptime >= 95.0) return "DEGRADED";
```

### Change colors
Edit `dashboard-kpis.scss`, look for:
```scss
--healthy: #10b981;    // Change this
--degraded: #f59e0b;   // Or this
--failed: #ef4444;     // Or this
```

### Change card layout
Edit `dashboard-kpis.scss`, look for:
```scss
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```
Change `250px` to make cards wider/narrower

---

## Verifying Everything Works

**Checklist:**

- [ ] Backend running: `http://localhost:8080` (shows white page is OK)
- [ ] Frontend running: `http://localhost:9000` (shows login page)
- [ ] Logged in successfully
- [ ] Dashboard page loads
- [ ] "Performance Metrics" section visible
- [ ] 4 KPI cards showing data (not zeros)
- [ ] Cards have status colors (green/amber/red)
- [ ] Wait 30 seconds, numbers updated
- [ ] DevTools shows API requests every 30s
- [ ] No console errors

If all checked ✓ → **Everything works!**

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F12` | Open DevTools |
| `Cmd+Shift+R` | Hard refresh (clear cache) |
| `Cmd+K` | Clear console |
| `Ctrl+P` | Search for file |
| `Cmd+/` | Toggle comment |

---

## Tips & Tricks

### Monitor API calls in real-time
```javascript
// Paste in DevTools Console:
setInterval(() => {
  fetch('/api/dashboard/metrics')
    .then(r => r.json())
    .then(data => console.log(new Date(), data));
}, 5000);
```

### Check what's being sent
```javascript
// In DevTools Console:
localStorage.getItem('user')
// Shows currently logged-in user
```

### Force a refresh
```javascript
// In DevTools Console:
location.reload(true);
```

### Check API response
```javascript
// In DevTools:
// Go to Network tab
// Click on /api/dashboard/metrics request
// Go to Response tab
// See the JSON data
```

---

## What Happens When You...

### Change a file?
- **Backend file** → Compile: `mvn compile`
- **Frontend file** → Auto-reloads (webpack watch)

### Need to restart?
- **Backend**: `Ctrl+C` in terminal, then `./mvnw`
- **Frontend**: `Ctrl+C` in terminal, then `npm start`

### Get an error?
1. Read the error message carefully
2. Check Console tab in DevTools
3. Check Network tab for failed requests
4. Restart both frontend and backend
5. Hard refresh browser

---

## Performance Tips

### To speed up initial load:
```bash
# Pre-fetch dependencies
mvn dependency:resolve dependency:resolve-plugins
```

### To speed up frontend:
```bash
# Install dependencies faster
npm ci  # Use instead of npm install
```

### To optimize build:
```bash
# Production build (smaller bundle)
npm run build
```

---

## Debugging Guide

### Nothing loads
1. Check backend is running: `curl http://localhost:8080`
2. Check frontend is running: open http://localhost:9000
3. Check console for errors: F12 → Console tab
4. Restart both services

### API returns errors
1. Check JWT token is valid: `localStorage.getItem('user')`
2. Check network response: F12 → Network → click request
3. Check backend logs: `tail logs/application.log`

### Component not rendering
1. Check React DevTools: F12 → React tab
2. Verify props: inspect element → see what props are passed
3. Check for console errors

### Styling broken
1. Hard refresh: Cmd+Shift+R
2. Check SCSS compiled to CSS: F12 → Elements → find .dashboard-kpis class
3. Check for CSS conflicts: search for other `.dashboard` classes

---

## One-Liner Commands

```bash
# Full rebuild and restart
mvn clean install && npm run clean-www && npm start

# Kill and restart both
lsof -ti:8080,9000 | xargs kill -9; ./mvnw & npm start

# Check if ports are available
netstat -an | grep -E "8080|9000"

# Build backend only
mvn clean compile

# Build frontend only
npm run build
```

---

## Support Resources

- **Phase 1.1 Completion**: See `PHASE_1_1_COMPLETION.md`
- **Testing Guide**: See `PHASE_1_1_TESTING.md`
- **Design System**: See `UX_DESIGN_SYSTEM.md`
- **Implementation Plan**: See `IMPLEMENTATION_ROADMAP.md`
- **Architecture**: See `PHASE_1_1_COMPLETION.md` → Architecture section

---

## Next Phase (1.2)

Coming soon:
- Timeline chart showing 24h trends
- Datacenter grid with status overview
- Top monitors list
- Advanced filtering

The foundation is ready. Phase 1.2 will build on this!

---

**Last Updated**: January 2025
**Quick Start Time**: ~5 minutes
**Status**: ✅ Ready to go
