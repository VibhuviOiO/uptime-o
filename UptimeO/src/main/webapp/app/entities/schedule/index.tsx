import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Schedule from './schedule';
import ScheduleDetail from './schedule-detail';
import ScheduleUpdate from './schedule-update';
import ScheduleDeleteDialog from './schedule-delete-dialog';

const ScheduleRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Schedule />} />
    <Route path="new" element={<ScheduleUpdate />} />
    <Route path=":id">
      <Route index element={<ScheduleDetail />} />
      <Route path="edit" element={<ScheduleUpdate />} />
      <Route path="delete" element={<ScheduleDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ScheduleRoutes;
