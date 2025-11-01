import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Schedule from './schedule';
import HttpMonitor from './http-monitor';
import Region from './region';
import Datacenter from './datacenter';
import Agent from './agent';
import ApiHeartbeat from './http-heartbeat';
import ApiHeartbeatAggregated from './http-heartbeat/http-heartbeat-aggregated';
import AuditLog from './audit-log';
import DatacenterMonitor from './datacenter-monitor';
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
        <Route path="http-heartbeats/*" element={<ApiHeartbeat />} />
        <Route path="api-heartbeat-aggregated" element={<ApiHeartbeatAggregated />} />
        <Route path="audit-log/*" element={<AuditLog />} />
        <Route path="datacenter-monitor/*" element={<DatacenterMonitor />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
