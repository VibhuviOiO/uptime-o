import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import UserManagementUpdate from './user-management-update';
import UserManagementDeleteDialog from './user-management-delete-dialog';

const UserManagementRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route path="new" element={<UserManagementUpdate />} />
    <Route path=":login">
      <Route path="edit" element={<UserManagementUpdate />} />
      <Route path="delete" element={<UserManagementDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default UserManagementRoutes;
