import React from 'react';
import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import StatusDependency from './status-dependency';

const StatusDependencyRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<StatusDependency />} />
  </ErrorBoundaryRoutes>
);

export default StatusDependencyRoutes;
