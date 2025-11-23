import React from 'react';
import { Route } from 'react-router';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import StatusPage from './status-page';
import StatusPageDependencies from './status-page-dependencies';

const StatusPageRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<StatusPage />} />
    <Route path=":id/dependencies" element={<StatusPageDependencies />} />
  </ErrorBoundaryRoutes>
);

export default StatusPageRoutes;
