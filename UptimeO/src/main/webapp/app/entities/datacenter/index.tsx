import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Datacenter from './datacenter';
import DatacenterDetail from './datacenter-detail';
import DatacenterUpdate from './datacenter-update';
import DatacenterDeleteDialog from './datacenter-delete-dialog';

const DatacenterRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Datacenter />} />
    <Route path="new" element={<DatacenterUpdate />} />
    <Route path=":id">
      <Route index element={<DatacenterDetail />} />
      <Route path="edit" element={<DatacenterUpdate />} />
      <Route path="delete" element={<DatacenterDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default DatacenterRoutes;
