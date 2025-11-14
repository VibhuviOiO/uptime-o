import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Instance from './instance';
import InstanceDetail from './instance-detail';
import InstanceUpdate from './instance-update';
import InstanceDeleteDialog from './instance-delete-dialog';

const InstanceRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Instance />} />
    <Route path="new" element={<InstanceUpdate />} />
    <Route path=":id">
      <Route index element={<InstanceDetail />} />
      <Route path="edit" element={<InstanceUpdate />} />
      <Route path="delete" element={<InstanceDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default InstanceRoutes;
