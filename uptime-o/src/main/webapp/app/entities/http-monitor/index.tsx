import React from 'react';
import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import HttpMonitor from './http-monitor';

const HttpMonitorRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<HttpMonitor />} />
  </ErrorBoundaryRoutes>
);

export default HttpMonitorRoutes;
