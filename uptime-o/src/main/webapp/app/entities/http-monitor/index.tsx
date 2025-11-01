import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import HttpMonitor from './http-monitor';
import HttpMonitorDetail from './http-monitor-detail';
import HttpMonitorUpdate from './http-monitor-update';
import HttpMonitorDeleteDialog from './http-monitor-delete-dialog';

const HttpMonitorRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<HttpMonitor />} />
    <Route path="new" element={<HttpMonitorUpdate />} />
    <Route path=":id">
      <Route index element={<HttpMonitorDetail />} />
      <Route path="edit" element={<HttpMonitorUpdate />} />
      <Route path="delete" element={<HttpMonitorDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default HttpMonitorRoutes;
