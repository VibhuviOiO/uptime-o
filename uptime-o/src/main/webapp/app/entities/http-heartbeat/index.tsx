import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import HttpHeartbeat from './http-heartbeat';
import HttpHeartbeatDetail from './http-heartbeat-detail';
import HttpHeartbeatUpdate from './http-heartbeat-update';
import HttpHeartbeatDeleteDialog from './http-heartbeat-delete-dialog';

const HttpHeartbeatRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<HttpHeartbeat />} />
    <Route path="new" element={<HttpHeartbeatUpdate />} />
    <Route path=":id">
      <Route index element={<HttpHeartbeatDetail />} />
      <Route path="edit" element={<HttpHeartbeatUpdate />} />
      <Route path="delete" element={<HttpHeartbeatDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default HttpHeartbeatRoutes;
