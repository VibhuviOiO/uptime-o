import React from 'react';
import { Route } from 'react-router-dom';
import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import ServiceHeartbeat from './service-heartbeat';

const ServiceHeartbeatRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<ServiceHeartbeat />} />
  </ErrorBoundaryRoutes>
);

export default ServiceHeartbeatRoutes;
