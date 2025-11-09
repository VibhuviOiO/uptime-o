import React from 'react';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import UserManagementList from 'app/shared/components/user-management-list';

export const UserManagementTab = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);

  if (!isAdmin) {
    return (
      <div className="tab-content-wrapper">
        <h3>User Management</h3>
        <p className="text-danger">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <UserManagementList
        showHeader={true}
        title="User Management"
        description="Manage user accounts, roles, and permissions."
        basePath="/admin/user-management"
      />
    </div>
  );
};

export default UserManagementTab;
