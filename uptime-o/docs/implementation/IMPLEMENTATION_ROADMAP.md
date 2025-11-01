# UptimeO Modern UX Implementation Roadmap

## Overview
Transform UptimeO into a modern real-time monitoring platform by building APIs, data hooks, and UI components in sequence. Each phase builds on previous work.

---

## PHASE 1: Dashboard - Operational Command Center (WEEK 1)

### Goal
Display real-time KPI metrics with status indicators and health overview.

### User Experience
```
┌──────────────────────────────────────────────────┐
│ 📊 UPTIME MONITORING DASHBOARD                   │
├──────────────────────────────────────────────────┤
│ [Time Period ▼] [Refresh] [Export]              │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────┬───────────────┬────────────┐   │
│  │ 📈 Overall  │ 📊 Response   │ ⚠️  Issues │   │
│  │ Uptime      │ Time          │ Detected   │   │
│  │ 99.8%       │ 245ms         │ 3          │   │
│  │ 🟢 Healthy  │ 🟢 Fast       │ 🟡 Watch  │   │
│  └─────────────┴───────────────┴────────────┘   │
│                                                   │
│  ┌─────────────┬───────────────┬────────────┐   │
│  │ 📌 Monitors │ ✓ Success     │ ✗ Failed   │   │
│  │ Active      │ Checks        │ Checks     │   │
│  │ 24          │ 1,439         │ 8          │   │
│  │ 🟢 100%     │ 🟢 99.4%      │ 🔴 0.6%    │   │
│  └─────────────┴───────────────┴────────────┘   │
│                                                   │
│  Last 24 Hours Timeline:                         │
│  ▓▓▓▓▓▓░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░▓▓▓▓▓▓▓▓▓▓▓▓│     │
│  Success (▓) | Issue (░) | [Detailed View]      │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Implementation Steps

#### 1.1: Backend - Dashboard Aggregation APIs

**New REST Endpoints:**

```
GET /api/dashboard/metrics
  Returns: {
    overallUptime: 99.8,              // % in last 24h
    averageResponseTime: 245,          // ms
    successfulChecks: 1439,
    failedChecks: 8,
    totalMonitors: 24,
    activeMonitors: 24,
    degradedCount: 3,                  // warnings
    failedCount: 1,                    // critical failures
    lastUpdated: "2025-11-01T10:30:00Z"
  }

GET /api/dashboard/timeline?period=24h&intervalMinutes=15
  Returns: {
    intervals: [
      { timestamp: "2025-11-01T00:00:00Z", successCount: 156, failureCount: 0, avgResponseTime: 234 },
      { timestamp: "2025-11-01T00:15:00Z", successCount: 158, failureCount: 1, avgResponseTime: 267 },
      ...
    ]
  }

GET /api/dashboard/datacenter-status
  Returns: [
    {
      id: 1,
      name: "DC-US-EAST",
      status: "HEALTHY",           // HEALTHY | DEGRADED | FAILED
      uptime: 99.9,
      monitorCount: 8,
      issueCount: 1,
      agentStatus: { online: 3, offline: 0 }
    },
    ...
  ]

GET /api/dashboard/top-monitors?limit=5&orderBy=failureRate
  Returns: [
    {
      id: 1,
      name: "API-v1",
      status: "HEALTHY",
      successRate: 99.9,
      avgResponseTime: 189,
      deployedDatacenters: 3,
      lastCheckTime: "2025-11-01T10:28:30Z"
    },
    ...
  ]
```

**Backend Implementation Steps:**

1. Create `DashboardResource.java` REST controller
2. Create `DashboardService.java` with aggregation logic
3. Add custom queries in `HttpHeartbeatRepository.java`:
   ```java
   @Query("SELECT 
     COUNT(h) as totalChecks,
     SUM(CASE WHEN h.success=true THEN 1 ELSE 0 END) as successCount,
     AVG(h.responseTimeMs) as avgResponseTime,
     MAX(h.executedAt) as lastCheck
     FROM HttpHeartbeat h 
     WHERE h.executedAt >= :since")
   DashboardMetrics getMetricsSince(@Param("since") Instant since);
   ```

4. Add Datacenter aggregation logic:
   ```java
   // Get monitor count per datacenter with status
   // Get agent online/offline count
   // Calculate uptime % from heartbeats
   ```

5. Cache results (Redis if available, or in-memory 1-minute TTL)

---

#### 1.2: Frontend - Dashboard Data Hooks

**Create `useDashboardMetrics.ts`** (enhanced version):

```typescript
// src/main/webapp/app/modules/home/hooks/useDashboardMetrics.ts

interface DashboardMetrics {
  overallUptime: number;
  averageResponseTime: number;
  successfulChecks: number;
  failedChecks: number;
  totalMonitors: number;
  degradedCount: number;
  failedCount: number;
}

interface TimelinePoint {
  timestamp: string;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
}

interface DatacenterStatus {
  id: number;
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  uptime: number;
  monitorCount: number;
  issueCount: number;
  agentStatus: { online: number; offline: number };
}

// Custom hook for metrics with auto-refresh
export const useDashboardMetrics = (refreshInterval = 30000) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [datacenters, setDatacenters] = useState<DatacenterStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setError(null);
        
        // Fetch all dashboard data in parallel
        const [metricsRes, timelineRes, dcsRes] = await Promise.all([
          axios.get('/api/dashboard/metrics'),
          axios.get('/api/dashboard/timeline?period=24h&intervalMinutes=15'),
          axios.get('/api/dashboard/datacenter-status')
        ]);

        setMetrics(metricsRes.data);
        setTimeline(timelineRes.data.intervals);
        setDatacenters(dcsRes.data);
      } catch (err) {
        setError('Failed to load dashboard metrics');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Set up auto-refresh interval
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { metrics, timeline, datacenters, loading, error };
};
```

---

#### 1.3: Frontend - Dashboard KPI Cards UI

**Create `DashboardKPIs.tsx`** component:

```typescript
// src/main/webapp/app/modules/home/components/DashboardKPIs.tsx

import React from 'react';
import { Card, CardBody, Row, Col, Spinner, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faTrendingUp } from '@fortawesome/free-solid-svg-icons';
import './dashboard-kpis.scss';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical' | 'loading';
  trend?: number;
  icon: React.ReactNode;
  backgroundColor?: string;
}

const statusColors = {
  healthy: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  loading: '#6b7280'
};

const KPICard: React.FC<KPICardProps> = ({ 
  title, value, unit, status, trend, icon, backgroundColor 
}) => (
  <Card className="kpi-card" style={{ borderLeft: `4px solid ${statusColors[status]}` }}>
    <CardBody>
      <div className="kpi-header">
        <h5 className="kpi-title">{title}</h5>
        <div className="kpi-icon">{icon}</div>
      </div>

      <div className="kpi-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>

      {trend !== undefined && (
        <div className={`kpi-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          <FontAwesomeIcon icon={trend >= 0 ? faArrowUp : faArrowDown} />
          <span>{Math.abs(trend)}% from yesterday</span>
        </div>
      )}

      <div className="kpi-status">
        <span className={`badge badge-${status}`}>
          {status === 'healthy' && '✓ Healthy'}
          {status === 'warning' && '⚠ Warning'}
          {status === 'critical' && '✗ Critical'}
          {status === 'loading' && 'Loading...'}
        </span>
      </div>
    </CardBody>
  </Card>
);

interface DashboardKPIsProps {
  metrics: any;
  loading: boolean;
  error: string | null;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ metrics, loading, error }) => {
  if (loading) {
    return <div className="text-center p-5"><Spinner color="primary" /></div>;
  }

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  const uptimeStatus = metrics.overallUptime >= 99.5 ? 'healthy' : 
                      metrics.overallUptime >= 95 ? 'warning' : 'critical';
  const responseStatus = metrics.averageResponseTime <= 500 ? 'healthy' :
                        metrics.averageResponseTime <= 2000 ? 'warning' : 'critical';
  const issuesStatus = metrics.failedCount === 0 ? 'healthy' :
                      metrics.failedCount <= 2 ? 'warning' : 'critical';

  return (
    <Row className="dashboard-kpis mb-4">
      <Col lg="3" md="6" className="mb-3">
        <KPICard
          title="Overall Uptime"
          value={metrics.overallUptime}
          unit="%"
          status={uptimeStatus}
          trend={0.2}
          icon={<FontAwesomeIcon icon={faTrendingUp} size="2x" />}
        />
      </Col>

      <Col lg="3" md="6" className="mb-3">
        <KPICard
          title="Avg Response Time"
          value={metrics.averageResponseTime}
          unit="ms"
          status={responseStatus}
          trend={-5.3}
          icon={<FontAwesomeIcon icon="clock" size="2x" />}
        />
      </Col>

      <Col lg="3" md="6" className="mb-3">
        <KPICard
          title="Active Monitors"
          value={metrics.totalMonitors}
          unit="total"
          status="healthy"
          icon={<FontAwesomeIcon icon="flask" size="2x" />}
        />
      </Col>

      <Col lg="3" md="6" className="mb-3">
        <KPICard
          title="Issues Detected"
          value={metrics.degradedCount + metrics.failedCount}
          unit="alerts"
          status={issuesStatus}
          trend={-2.1}
          icon={<FontAwesomeIcon icon="exclamation-triangle" size="2x" />}
        />
      </Col>
    </Row>
  );
};

export default DashboardKPIs;
```

**Create `dashboard-kpis.scss`**:

```scss
.dashboard-kpis {
  .kpi-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .kpi-title {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: #6b7280;
        letter-spacing: 0.5px;
      }

      .kpi-icon {
        color: #d1d5db;
        opacity: 0.6;
      }
    }

    .kpi-value {
      display: flex;
      align-items: baseline;
      margin-bottom: 12px;

      .value {
        font-size: 28px;
        font-weight: 700;
        color: #111827;
      }

      .unit {
        margin-left: 4px;
        font-size: 14px;
        color: #6b7280;
      }
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      margin-bottom: 8px;

      &.positive {
        color: #22c55e;
      }

      &.negative {
        color: #ef4444;
      }
    }

    .kpi-status {
      .badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;

        &.badge-healthy {
          background-color: #dcfce7;
          color: #166534;
        }

        &.badge-warning {
          background-color: #fef3c7;
          color: #92400e;
        }

        &.badge-critical {
          background-color: #fee2e2;
          color: #991b1b;
        }

        &.badge-loading {
          background-color: #f3f4f6;
          color: #374151;
        }
      }
    }
  }
}
```

---

### Testing Checklist for Phase 1

- [ ] Backend APIs return correct aggregated data
- [ ] Frontend hooks fetch and cache data
- [ ] KPI cards display with correct status colors
- [ ] Auto-refresh works every 30 seconds
- [ ] Error handling works (no data, API error, etc.)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Performance: Page loads in < 2 seconds

---

## PHASE 2: Infrastructure & Monitors Views (WEEK 2-3)

### Goal
Display Datacenters, Agents, and Monitors with modern card/table views and real-time status.

[Detailed specifications to follow after Phase 1 completion]

---

## PHASE 3: Rich Detail Pages (WEEK 4)

### Goal
Add tabbed detail pages with charts, timelines, and SLA metrics.

[Detailed specifications to follow after Phase 2 completion]

---

## API Design Principles

### Pagination
```
GET /api/resource?page=0&size=20&sort=id,desc
```

### Filtering
```
GET /api/resource?filter=status:HEALTHY,monitorCount>5
```

### Real-time Updates
- Initial load: REST API
- Updates: WebSocket (future enhancement) or polling (15-30s)
- Caching: 1 minute TTL for aggregations

### Error Responses
```json
{
  "status": 400,
  "message": "Invalid filter parameter",
  "timestamp": "2025-11-01T10:30:00Z"
}
```

---

## Development Workflow

1. Backend: Create API endpoint + tests
2. Frontend: Create hook to consume API
3. Frontend: Build UI component
4. Integration test: Verify data flows end-to-end
5. Performance: Monitor load times
6. Deploy & Monitor

---

## Next Step

**Ready to start Phase 1.1?**

I'll create:
1. DashboardResource.java (REST endpoints)
2. DashboardService.java (aggregation logic)
3. Custom repository queries
4. All supporting code

Confirm to proceed! 🚀
