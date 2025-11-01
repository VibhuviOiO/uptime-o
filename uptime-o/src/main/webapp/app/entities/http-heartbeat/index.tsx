import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import ApiHeartbeat from './http-heartbeat';
import ApiHeartbeatDetail from './http-heartbeat-detail';
import ApiHeartbeatUpdate from './http-heartbeat-update';
import ApiHeartbeatDeleteDialog from './http-heartbeat-delete-dialog';

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
