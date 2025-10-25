import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import DatacenterMonitor from './datacenter-monitor';
import DatacenterMonitorDetail from './datacenter-monitor-detail';
import DatacenterMonitorUpdate from './datacenter-monitor-update';
import DatacenterMonitorDeleteDialog from './datacenter-monitor-delete-dialog';

const DatacenterMonitorRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<DatacenterMonitor />} />
    <Route path="new" element={<DatacenterMonitorUpdate />} />
    <Route path=":id">
      <Route index element={<DatacenterMonitorDetail />} />
      <Route path="edit" element={<DatacenterMonitorUpdate />} />
      <Route path="delete" element={<DatacenterMonitorDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default DatacenterMonitorRoutes;
