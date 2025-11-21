import React from 'react';
import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import StatusPage from './status-page';

const StatusPageRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<StatusPage />} />
  </ErrorBoundaryRoutes>
);

export default StatusPageRoutes;
