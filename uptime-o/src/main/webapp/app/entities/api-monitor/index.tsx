import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import ApiMonitor from './api-monitor';
import ApiMonitorDetail from './api-monitor-detail';
import ApiMonitorUpdate from './api-monitor-update';
import ApiMonitorDeleteDialog from './api-monitor-delete-dialog';

const ApiMonitorRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<ApiMonitor />} />
    <Route path="new" element={<ApiMonitorUpdate />} />
    <Route path=":id">
      <Route index element={<ApiMonitorDetail />} />
      <Route path="edit" element={<ApiMonitorUpdate />} />
      <Route path="delete" element={<ApiMonitorDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ApiMonitorRoutes;
