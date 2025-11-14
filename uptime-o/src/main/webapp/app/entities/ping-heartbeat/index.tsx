import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import PingHeartbeat from './ping-heartbeat';

const PingHeartbeatRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<PingHeartbeat />} />
  </ErrorBoundaryRoutes>
);

export default PingHeartbeatRoutes;
