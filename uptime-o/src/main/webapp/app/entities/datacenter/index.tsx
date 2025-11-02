import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Datacenter from './datacenter';

const DatacenterRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Datacenter />} />
  </ErrorBoundaryRoutes>
);

export default DatacenterRoutes;
