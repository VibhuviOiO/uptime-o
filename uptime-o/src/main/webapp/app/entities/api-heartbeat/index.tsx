import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import ApiHeartbeat from './api-heartbeat';
import ApiHeartbeatDetail from './api-heartbeat-detail';
import ApiHeartbeatUpdate from './api-heartbeat-update';
import ApiHeartbeatDeleteDialog from './api-heartbeat-delete-dialog';

const ApiHeartbeatRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<ApiHeartbeat />} />
    <Route path="new" element={<ApiHeartbeatUpdate />} />
    <Route path=":id">
      <Route index element={<ApiHeartbeatDetail />} />
      <Route path="edit" element={<ApiHeartbeatUpdate />} />
      <Route path="delete" element={<ApiHeartbeatDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ApiHeartbeatRoutes;
