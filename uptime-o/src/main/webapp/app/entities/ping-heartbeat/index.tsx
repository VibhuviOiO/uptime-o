import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import PingHeartbeat from './ping-heartbeat';
import PingHeartbeatDetail from './ping-heartbeat-detail';

const PingHeartbeatRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<PingHeartbeat />} />
    <Route path=":id" element={<PingHeartbeatDetail />} />
  </ErrorBoundaryRoutes>
);

export default PingHeartbeatRoutes;
