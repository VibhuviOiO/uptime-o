# UptimeO - Modern UX Design System

## Executive Summary
UptimeO is an uptime monitoring platform with complex multi-level data:
- **Regions** → **Datacenters** → **Agents** (Infrastructure)
- **HTTP Monitors** → **Schedules** (Monitoring Config)
- **Datacenters** ↔ **HTTP Monitors** (Deployment Matrix)
- **HTTP Heartbeats** (Execution Results)

Modern UX should surface **real-time status** and **operational insights** while keeping infrastructure complexity **hidden from casual users**.

---

## Data Model Hierarchy

```
┌─ INFRASTRUCTURE LAYER (Setup Phase)
│  ├─ Regions (geographical organization)
│  ├─ Datacenters (execution locations)
│  └─ Agents (workers in datacenters)
│
├─ MONITORING CONFIG LAYER (Setup Phase)
│  ├─ HTTP Monitors (what to monitor)
│  ├─ Schedules (when to check)
│  └─ Datacenters ↔ Monitors (where to run)
│
└─ OPERATIONAL LAYER (Real-time)
   ├─ HTTP Heartbeats (execution results)
   ├─ Aggregated Dashboard (health view)
   └─ Alerts (incidents)
```

---

## Design Principles

### 1. **Progressive Disclosure**
- **Default View**: High-level health & status
- **Drilldown**: Monitor → Datacenter → Agent → Raw Results
- Hide complexity until needed

### 2. **Real-time Status First**
- Every entity shows current status immediately
- Red/Yellow/Green health indicators
- Last check time, next check scheduled

### 3. **Operational Focus**
- Highlight problems (failures, slow responses)
- Show trends (SLA compliance, uptime %)
- Enable quick action (rerun, disable, reassign)

### 4. **Consistent Patterns**
- Same status colors across all views
- Similar card layouts for consistency
- Predictable drilldown paths

---

## Color & Status System

```
🟢 GREEN / HEALTHY
- Status: SUCCESS
- Response: < Warning Threshold
- SLA: > 99%

🟡 YELLOW / DEGRADED
- Status: SUCCESS but slow
- Response: Between warning & critical thresholds
- SLA: 95-99%

🔴 RED / CRITICAL
- Status: FAILED / TIMEOUT / ERROR
- Response: > Critical Threshold
- SLA: < 95%
```

---

## 1. DASHBOARD - Operational Command Center

### Layout: 4-Tier Hierarchy

```
┌──────────────────────────────────────────────────┐
│ 📊 MONITORING DASHBOARD                          │
├──────────────────────────────────────────────────┤
│  [Period Selector] [Refresh] [Export]            │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────┬──────────┬──────────┬──────────┐   │
│  │ Uptime  │ Avg Resp │ Total    │ Failed   │   │
│  │ 99.8%   │ 245ms    │ Monitors │ Checks   │   │
│  │ 🟢      │ 🟢       │ 24       │ 8        │   │
│  └─────────┴──────────┴──────────┴──────────┘   │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ LAST 24H STATUS TIMELINE                   │ │
│  │ ▓▓▓▓▓▓░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░▓▓▓▓▓▓▓▓▓▓▓▓│ │
│  │ ▓=success░=issue  [Details]               │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ BY REGION / DATACENTER / MONITOR           │ │
│  │ ┌─── DC-US-EAST ──────────────────────┐  │ │
│  │ │ ✓ 8 Monitors | ↑ 2 Issues | 📈 +5%  │  │ │
│  │ │ [Expand] [Manage]                   │  │ │
│  │ └─────────────────────────────────────┘  │ │
│  │ ┌─── DC-EU-WEST ──────────────────────┐  │ │
│  │ │ ✓ 12 Monitors | ✓ All Healthy| 📉 -2% │ │
│  │ │ [Expand] [Manage]                   │  │ │
│  │ └─────────────────────────────────────┘  │ │
│  │ ┌─── DC-AP-SOUTH ──────────────────────┐ │ │
│  │ │ ✗ 4 Monitors | ⚠ 1 Degraded | 🔴 High│ │
│  │ │ [Expand] [Manage]                    │ │
│  │ └─────────────────────────────────────┘  │ │
│  │                                           │ │
│  │ [Show All Monitors]                       │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Key Features:
- **KPI Cards**: Uptime %, Avg Response Time, Total Monitors, Failed Checks
- **Timeline**: Visual bar showing last 24h status (block/bar chart)
- **Accordion Groups**: Collapse/expand by Region → Datacenter → Monitors
- **Quick Stats**: Count of monitors, issues, trends
- **Drilldown**: Click to see full monitor details

---

## 2. INFRASTRUCTURE VIEW - Setup & Configuration

### A. Regions List

```
┌─────────────────────────────────────────┐
│ INFRASTRUCTURE > REGIONS                │
├─────────────────────────────────────────┤
│ [+ Create Region] [Search] [Filter]     │
├─────────────────────────────────────────┤
│                                          │
│ ┌─ NORTH_AMERICA ──────────────────┐  │
│ │ Code: NA | Datacenters: 3         │  │
│ │ ✓ DC-US-EAST ✓ DC-US-WEST ✓ DC.. │  │
│ │ [Edit] [Delete] [View Details]    │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ┌─ EUROPE ────────────────────────┐   │
│ │ Code: EU | Datacenters: 2        │   │
│ │ ✓ DC-EU-WEST ✓ DC-EU-CENTRAL    │   │
│ │ [Edit] [Delete] [View Details]   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌─ ASIA_PACIFIC ──────────────────┐  │
│ │ Code: AP | Datacenters: 1        │  │
│ │ ✓ DC-AP-SOUTH                    │  │
│ │ [Edit] [Delete] [View Details]   │  │
│ └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### B. Datacenters Detail View

```
┌─ INFRASTRUCTURE > DATACENTERS > DC-US-EAST ──────────┐
│                                                       │
│ DC-US-EAST  [🟢 Healthy]                            │
│ ──────────────────────────────────────────────────────│
│                                                       │
│ [Tabs: Overview | Agents | Monitors | Health]       │
│                                                       │
│ ┌─ OVERVIEW ─────────────────────────────────────┐  │
│ │ Region: NORTH_AMERICA                           │  │
│ │ Code: US-EAST                                   │  │
│ │ Status: Active                                  │  │
│ │ Agents: 3 online                                │  │
│ │ Monitors Deployed: 8                            │  │
│ │ Avg Response Time: 245ms                        │  │
│ │ Last Check: 2 mins ago                          │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ ┌─ AGENTS (3) ───────────────────────────────────┐  │
│ │ ✓ AGENT-US-EAST-1 [🟢 ONLINE] 256.234.45.67  │  │
│ │ ✓ AGENT-US-EAST-2 [🟢 ONLINE] 256.234.45.68  │  │
│ │ ✓ AGENT-US-EAST-3 [🟡 OFFLINE 5h] 256.234.. │  │
│ │ [Add Agent] [View Agent Details]              │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ ┌─ ASSIGNED MONITORS (8) ────────────────────────┐  │
│ │ 🟢 Monitor-API-v1      [Last: 189ms] [✓ 99.9%]│  │
│ │ 🟢 Monitor-DB-Health   [Last: 34ms]  [✓ 100%] │  │
│ │ 🟢 Monitor-API-v2      [Last: 567ms] [✓ 98.5%]│  │
│ │ 🟡 Monitor-Cache-Redis [Last: 2.3s]  [⚠ 95%] │  │
│ │ 🔴 Monitor-Webhook     [FAILED 3h]   [✗ 87%] │  │
│ │ ...more                                       │  │
│ │ [Assign New Monitor] [Manage All]             │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ [Edit] [Delete] [Go Back]                            │
└────────────────────────────────────────────────────────┘
```

### C. Agents Card Grid View

```
┌─ INFRASTRUCTURE > AGENTS ──────────────────────────┐
│ [+ Create Agent] [Search] [Filter: Datacenter]     │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ AGENT-1      │  │ AGENT-2      │               │
│  │ 🟢 ONLINE    │  │ 🟢 ONLINE    │               │
│  │ DC-US-EAST   │  │ DC-US-EAST   │               │
│  │ 192.168.1.1  │  │ 192.168.1.2  │               │
│  │ Uptime: 48d  │  │ Uptime: 30d  │               │
│  │ Checks: 1M+  │  │ Checks: 982k │               │
│  │ [View][Edit] │  │ [View][Edit] │               │
│  └──────────────┘  └──────────────┘               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ AGENT-3      │  │ AGENT-4      │               │
│  │ 🔴 OFFLINE   │  │ 🟡 DEGRADED  │               │
│  │ DC-EU-WEST   │  │ DC-AP-SOUTH  │               │
│  │ 192.168.2.1  │  │ 192.168.3.1  │               │
│  │ Last: 5h ago │  │ CPU: 89%     │               │
│  │ Checks: 542k │  │ Memory: 92%  │               │
│  │ [View][Edit] │  │ [View][Edit] │               │
│  └──────────────┘  └──────────────┘               │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 3. MONITORING CONFIG VIEW - Monitors & Schedules

### A. HTTP Monitors List - Enhanced Table

```
┌─ SETTINGS > HTTP MONITORS ────────────────────────────┐
│ [+ Create Monitor] [Search] [Filter: Status/Sched]   │
│ [Bulk Assign Datacenters] [Export]                   │
├───────────────────────────────────────────────────────┤
│                                                        │
│ Monitor Name    │ URL          │ Sched  │ DCs │Status│
│ ─────────────────────────────────────────────────────│
│ 🟢 API-v1       │ /health      │ 60s   │ 3  │ ✓ 99.9│
│ 🟢 DB-Health    │ /db/status   │ 30s   │ 5  │ ✓ 100 │
│ 🟡 Cache-Redis  │ :6379        │ 15s   │ 2  │ ⚠ 95  │
│ 🔴 Webhook      │ /webhook     │ 300s  │ 1  │ ✗ 87  │
│ 🟢 API-v2       │ /api/status  │ 120s  │ 4  │ ✓ 99.5│
│                                                        │
│ [More] [Columns] [View] [Edit] [Assign] [Delete]    │
└───────────────────────────────────────────────────────┘
```

### B. Schedule Management - Timeline View

```
┌─ SETTINGS > SCHEDULES ─────────────────────┐
│ [+ Create Schedule] [Search]                │
├───────────────────────────────────────────┤
│                                             │
│ NAME: Every 60 Seconds                    │
│ ┌──────────────────────────────────────┐  │
│ │ Mon Tue Wed Thu Fri Sat Sun          │  │
│ │  ✓   ✓   ✓   ✓   ✓   ✓   ✓  Active │  │
│ │                                      │  │
│ │ Time Range: 00:00 - 23:59            │  │
│ │ Frequency: Every 60 seconds          │  │
│ │ Retries: 2 attempts                  │  │
│ │ Timeout: 30 seconds                  │  │
│ │                                      │  │
│ │ Monitors Using: 5                    │  │
│ │ [Edit] [Delete] [Duplicate]          │  │
│ └──────────────────────────────────────┘  │
│                                             │
└───────────────────────────────────────────┘
```

---

## 4. MONITORING VIEW - Real-time Results

### A. HTTP Heartbeats - Smart Table

```
┌─ MONITORING > HTTP HEARTBEATS ──────────────────────┐
│ [Filters] [Last 1h | 24h | 7d] [Auto-refresh]     │
│ ┌─ Advanced Filter ────────────────────────────┐   │
│ │ Monitor: [API-v1        ▼] Status: [All ▼]  │   │
│ │ Result: [All ▼] Response: [< 500ms ▼] Dc: [▼]│  │
│ └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Monitor    │ DC        │ Result │ Time  │ Response│
│ ────────────────────────────────────────────────── │
│ 🟢 API-v1  │ US-EAST   │ ✓ 200  │ 2m   │ 189ms  │
│ 🟢 API-v1  │ EU-WEST   │ ✓ 200  │ 2m   │ 234ms  │
│ 🟢 API-v1  │ AP-SOUTH  │ ✓ 200  │ 1m   │ 567ms  │
│ 🟢 DB-H    │ US-EAST   │ ✓ 200  │ 3m   │ 34ms   │
│ 🟡 Cache   │ EU-WEST   │ ✓ 200  │ 5m   │ 2.3s   │ ⚠
│ 🔴 Webhook │ AP-SOUTH  │ ✗ 500  │ 45m  │ N/A    │ ✗
│                                                     │
│ [Pagination] [Export CSV] [Retry Failed]          │
└─────────────────────────────────────────────────────┘
```

**Inline Actions:**
- Click row → View full details (headers, body, response)
- Retry button on failures
- Quick status filter chips

### B. Aggregated Dashboard - Heatmap View

```
┌─ MONITORING > DASHBOARD ──────────────────────────┐
│ [Period: 24h] [Group By: Monitor] [Export Chart]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ DATACENTER × MONITOR MATRIX                        │
│                                                     │
│              │ API-v1 │ DB-H │ Cache │ Webhook│   │
│ ────────────────────────────────────────────────── │
│ US-EAST      │ 🟢99.9%│ 🟢100│ 🟡95  │ 🔴87  │   │
│ EU-WEST      │ 🟢99.8%│ 🟢100│ 🟢98  │ 🟢99  │   │
│ AP-SOUTH     │ 🟢99.5%│ 🟢 99│ 🟢100 │ 🔴0   │   │
│ ────────────────────────────────────────────────── │
│ Overall SLA  │ 🟢99.7%│ 🟢100│ 🟡97.7│ 🟠60.7│  │
│                                                    │
│ [Toggle: Uptime % / Response Time / Error Rate]   │
│ [Drill into cell] [Export Data]                   │
└────────────────────────────────────────────────────┘
```

---

## 5. KEY UI COMPONENTS

### Status Badge System

```
🟢 HEALTHY
   - Color: #22c55e (green)
   - Text: "Healthy", "Success", "Online"
   - Icon: checkmark

🟡 DEGRADED / WARNING
   - Color: #eab308 (yellow)
   - Text: "Slow", "Degraded", "Warning"
   - Icon: alert triangle

🔴 FAILED / CRITICAL
   - Color: #ef4444 (red)
   - Text: "Failed", "Error", "Offline"
   - Icon: X or alert

⚫ UNKNOWN / PENDING
   - Color: #6b7280 (gray)
   - Text: "Pending", "Unknown"
   - Icon: question mark
```

### Response Time Badge

```
✓ Fast:       < 200ms    → Green
⚠ Acceptable: 200-500ms  → Yellow
✗ Slow:       > 500ms    → Orange
✗ Timeout:    > Limit    → Red
```

### Uptime Percentage Badge

```
✓ 99.5%+  → Green    (Excellent)
⚠ 95-99%  → Yellow   (Good)
✗ <95%    → Red      (Poor)
```

---

## 6. INTERACTION PATTERNS

### Quick Actions (Context Menus)

```
Right-click on Monitor:
├─ View Details
├─ Edit Configuration
├─ Run Now (manual trigger)
├─ Assign to Datacenters...
├─ View Heartbeats
├─ SLA Report
├─ Disable/Enable
└─ Delete

Right-click on Datacenter:
├─ View Details
├─ View All Agents
├─ View Assigned Monitors
├─ Manage Assignments...
├─ Health Report
└─ Edit
```

### Bulk Actions

```
Selected: 3 Monitors

[Assign to Datacenters] [Run Now] [Disable All] [Delete]
```

---

## 7. DETAIL VIEWS - Rich Information

### Monitor Detail Page

```
┌─ MONITOR: API-v1 ──────────────────────────────┐
│ Status: 🟢 Healthy | SLA: 99.9%                │
├────────────────────────────────────────────────┤
│                                                 │
│ [Tabs: Overview | Results | Heartbeats | SLA] │
│                                                 │
│ ┌─ OVERVIEW ────────────────────────────────┐ │
│ │ URL: https://api.example.com/health      │ │
│ │ Method: GET | Timeout: 30s | Retries: 2 │ │
│ │ Schedule: Every 60s                       │ │
│ │ Warning Threshold: 500ms                  │ │
│ │ Critical Threshold: 2000ms                │ │
│ │                                           │ │
│ │ Deployed To: 3 Datacenters                │ │
│ │ ✓ US-EAST ✓ EU-WEST ✓ AP-SOUTH          │ │
│ │ [Manage Assignments]                      │ │
│ └───────────────────────────────────────────┘ │
│                                                 │
│ ┌─ LAST 24H TIMELINE ───────────────────────┐ │
│ │ ▓▓▓▓▓▓▓▓░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░▓▓▓▓▓▓▓▓▓▓▓▓│ │
│ │ Success rate: 99.9% | 1 failure at 14:23 │ │
│ └───────────────────────────────────────────┘ │
│                                                 │
│ ┌─ PERFORMANCE METRICS ─────────────────────┐ │
│ │ Avg Response: 245ms  | Min: 120ms         │ │
│ │ Max Response: 890ms  | P95: 567ms         │ │
│ │ Success Count: 1439  | Failed: 1          │ │
│ └───────────────────────────────────────────┘ │
│                                                 │
│ [Edit] [Run Now] [View All Results] [Delete]  │
└────────────────────────────────────────────────┘
```

---

## 8. RESPONSIVE DESIGN

### Mobile (< 768px)
- Stack components vertically
- Status badges in top-right
- Hide secondary info, show on tap
- Swipe for actions
- Collapse tables into cards

### Tablet (768px - 1024px)
- 2-column layouts
- Simplified tables with key columns only
- Expandable rows for details

### Desktop (> 1024px)
- Full tables with all columns
- Side-by-side comparisons
- Multi-panel layouts
- Charts and heatmaps

---

## 9. COLOR PALETTE

```
Primary:    #3b82f6 (Blue) - Links, actions, emphasis
Success:    #22c55e (Green) - Healthy status
Warning:    #eab308 (Yellow) - Degraded/slow
Danger:     #ef4444 (Red) - Failed/critical
Secondary:  #6b7280 (Gray) - Disabled, background
Background: #f9fafb (Light gray)
Surface:    #ffffff (White)
Text:       #111827 (Dark gray)
Border:     #e5e7eb (Light gray)
```

---

## 10. TYPOGRAPHY & SPACING

```
H1: 32px bold (Dashboard titles)
H2: 24px bold (Section titles)
H3: 18px bold (Component titles)
H4: 14px bold (Labels)
Body: 14px regular
Small: 12px (Secondary info)

Spacing: 8px base unit
- Padding: 8px, 16px, 24px
- Margin: 8px, 16px, 24px
- Gap: 12px (between items)
```

---

## 11. ANIMATION & TRANSITIONS

```
- Status changes: 200ms fade
- Expand/collapse: 300ms smooth
- Hover effects: 150ms scale
- Loading spinners: Smooth continuous
- Toast notifications: Slide in/out 300ms
```

---

## Implementation Priority

### Phase 1 (MVP):
1. Dashboard with KPIs and status indicators
2. Infrastructure list views (card grids)
3. Monitor list with assign modal
4. Heartbeat results table with filters

### Phase 2 (Enhanced):
1. Detail page tabs
2. Charts and metrics
3. Bulk actions
4. Advanced filters

### Phase 3 (Optimization):
1. Real-time websocket updates
2. Performance metrics charts
3. SLA reports
4. Custom dashboards

---

## Next Steps

Would you like me to implement any of these UI components?

Options:
1. **Upgrade Dashboard** - Real KPI cards with metrics
2. **Infrastructure Grid** - Modern card-based views for Datacenters/Agents
3. **Enhanced Heartbeats** - Inline filtering, status badges, better table
4. **Monitor Detail** - Tabbed interface with timeline
5. **All of the above** - Full modern UX transformation

Which would you prefer?
