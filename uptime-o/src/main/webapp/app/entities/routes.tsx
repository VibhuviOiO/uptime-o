import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Schedule from './schedule';
import HttpMonitor from './http-monitor';
import Region from './region';
import Datacenter from './datacenter';
import Agent from './agent';
import HttpHeartbeat from './http-heartbeat';
import HttpHeartbeatAggregated from './http-heartbeat/http-heartbeat-aggregated';
import HttpMetrics from './http-metrics/http-metrics';
import AuditLog from './audit-log';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="schedule/*" element={<Schedule />} />
        <Route path="http-monitor/*" element={<HttpMonitor />} />
        <Route path="region/*" element={<Region />} />
        <Route path="datacenter/*" element={<Datacenter />} />
        <Route path="agent/*" element={<Agent />} />
        <Route path="http-heartbeats/*" element={<HttpHeartbeat />} />
        <Route path="http-heartbeat-aggregated" element={<HttpHeartbeatAggregated />} />
        <Route path="http-metrics" element={<HttpMetrics />} />
        <Route path="audit-log/*" element={<AuditLog />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
