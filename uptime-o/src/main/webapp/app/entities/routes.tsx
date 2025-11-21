import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import HttpMonitor from './http-monitor';

import HttpHeartbeat from './http-heartbeat';
import HttpHeartbeatAggregated from './http-heartbeat/http-heartbeat-aggregated';
import HttpMetrics from './http-metrics/http-metrics';
import MonitorDetail from './http-monitor-detail/monitor-detail';
import AuditLog from './audit-log';

import InstanceHeartbeat from './instance-heartbeat';
import ServiceHeartbeat from './service-heartbeat';
import StatusPage from './status-page';
// import StatusDependency from './status-dependency';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}

        <Route path="http-monitor/*" element={<HttpMonitor />} />

        <Route path="http-heartbeats/*" element={<HttpHeartbeat />} />
        <Route path="http-heartbeat-aggregated" element={<HttpHeartbeatAggregated />} />
        <Route path="http-metrics" element={<HttpMetrics />} />
        <Route path="http-monitor-detail/:id" element={<MonitorDetail />} />
        <Route path="audit-log/*" element={<AuditLog />} />

        <Route path="instance-heartbeat/*" element={<InstanceHeartbeat />} />
        <Route path="service-heartbeat/*" element={<ServiceHeartbeat />} />
        <Route path="status-page/*" element={<StatusPage />} />
        {/* <Route path="status-dependency/*" element={<StatusDependency />} /> */}
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
