import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Region from './region';

const RegionRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Region />} />
  </ErrorBoundaryRoutes>
);

export default RegionRoutes;
