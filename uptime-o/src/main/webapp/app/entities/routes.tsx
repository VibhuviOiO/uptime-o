import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import HttpMonitor from './http-monitor';
import HttpHeartbeat from './http-heartbeat';
import HttpMetricsProfessional from './http-metrics/http-metrics-professional';
import MonitorDetail from './http-monitor-detail/monitor-detail';
import AuditLog from './audit-log';
import VisualizationDashboard from '../modules/dashboard/visualization-dashboard';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}

        <Route path="http-monitor/*" element={<HttpMonitor />} />
        <Route path="http-heartbeats/*" element={<HttpHeartbeat />} />
        <Route path="monitors" element={<HttpMetricsProfessional />} />
        <Route path="dashboard" element={<VisualizationDashboard />} />
        <Route path="http-monitor-detail/:id" element={<MonitorDetail />} />
        <Route path="audit-log/*" element={<AuditLog />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
