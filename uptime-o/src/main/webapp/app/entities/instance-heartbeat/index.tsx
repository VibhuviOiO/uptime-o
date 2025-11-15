import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import InstanceHeartbeat from './instance-heartbeat';

const InstanceHeartbeatRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<InstanceHeartbeat />} />
  </ErrorBoundaryRoutes>
);

export default InstanceHeartbeatRoutes;
