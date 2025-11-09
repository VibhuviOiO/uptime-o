import React, { useState, useEffect } from 'react';
import { Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShieldAlt, faUserShield, faUsers } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';

interface IRoleInfo {
  name: string;
  description: string;
  userCount?: number;
}

export const RoleManagementTab = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);

  const [authorities, setAuthorities] = useState<string[]>([]);
  const [roleDetails, setRoleDetails] = useState<IRoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Default role descriptions
  const roleDescriptions: { [key: string]: string } = {
    ROLE_ADMIN: 'Full system access with all administrative privileges',
    ROLE_USER: 'Standard user access with basic permissions',
  };

  useEffect(() => {
    if (isAdmin) {
      loadAuthorities();
      loadUsers();
    }
  }, [isAdmin]);

  const loadAuthorities = async () => {
    try {
      const response = await axios.get('api/authorities');
      const authData = response.data;

      // Check if response.data is an array of strings or array of objects
      const authArray = Array.isArray(authData) ? authData.map(item => (typeof item === 'string' ? item : item.name || String(item))) : [];

      setAuthorities(authArray);

      // Create role details with descriptions
      const details = authArray.map(auth => ({
        name: String(auth), // Ensure it's a string
        description: roleDescriptions[auth] || 'Custom role',
      }));

      setRoleDetails(details);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load roles');
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get<any[]>('api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleAddRole = (values: any) => {
    // Note: JHipster doesn't provide a direct API to add authorities
    // This is typically managed through code/configuration
    toast.info('Role management is typically configured through application code. Contact your system administrator.');
    toggleModal();
  };

  const getUserCountForRole = (roleName: string): number => {
    return users.filter(user => user.authorities?.includes(roleName)).length;
  };

  const getRoleBadgeColor = (roleName: string): string => {
    if (roleName === 'ROLE_ADMIN') return 'danger';
    if (roleName === 'ROLE_USER') return 'primary';
    return 'secondary';
  };

  if (!isAdmin) {
    return (
      <div className="tab-content-wrapper">
        <h3>Role Management</h3>
        <p className="text-danger">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Role Management</h3>
          <p className="tab-description">Manage system roles and authority definitions.</p>
        </div>
        <Button color="primary" onClick={toggleModal} disabled>
          <FontAwesomeIcon icon={faPlus} /> Add Role
        </Button>
      </div>

      <Alert color="info" className="mb-4">
        <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
        <strong>Role Information:</strong> Roles define user permissions within the system. Admin roles have full access to all features,
        while User roles have limited access to standard features.
      </Alert>

      {loading ? (
        <p>Loading roles...</p>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Users</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {roleDetails.map(role => (
                  <tr key={role.name}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={role.name === 'ROLE_ADMIN' ? faUserShield : faUsers}
                          className={`me-2 text-${getRoleBadgeColor(role.name)}`}
                        />
                        <strong>{role.name}</strong>
                      </div>
                    </td>
                    <td>{role.description}</td>
                    <td>
                      <Badge color="info">{getUserCountForRole(role.name)} users</Badge>
                    </td>
                    <td>
                      <Badge color="success">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-4">
            <h5>Role Permissions</h5>
            <div className="role-permissions-grid mt-3">
              <div className="permission-card mb-3">
                <div className="d-flex align-items-start">
                  <FontAwesomeIcon icon={faUserShield} className="text-danger me-3 mt-1" size="lg" />
                  <div>
                    <h6 className="mb-2">ROLE_ADMIN</h6>
                    <ul className="small mb-0">
                      <li>Full system access</li>
                      <li>User management (create, update, delete users)</li>
                      <li>Role assignment</li>
                      <li>System configuration</li>
                      <li>Monitor management</li>
                      <li>View all data and reports</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="permission-card mb-3">
                <div className="d-flex align-items-start">
                  <FontAwesomeIcon icon={faUsers} className="text-primary me-3 mt-1" size="lg" />
                  <div>
                    <h6 className="mb-2">ROLE_USER</h6>
                    <ul className="small mb-0">
                      <li>View own profile</li>
                      <li>Update personal information</li>
                      <li>Change password</li>
                      <li>View monitors</li>
                      <li>View alerts and notifications</li>
                      <li>Access dashboard and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Alert color="warning" className="mt-4">
            <strong>Note:</strong> Role definitions are managed through the application configuration. To add or modify roles, update the{' '}
            <code>AuthoritiesConstants.java</code> file and restart the application. Dynamic role creation is not currently supported.
          </Alert>
        </>
      )}

      {/* Add Role Modal (Disabled - for future implementation) */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Add New Role</ModalHeader>
        <ValidatedForm onSubmit={handleAddRole}>
          <ModalBody>
            <Alert color="info">
              Role management is configured through application code. This feature is not available in the current version.
            </Alert>
            <ValidatedField
              name="roleName"
              label="Role Name"
              placeholder="e.g., ROLE_MANAGER"
              disabled
              validate={{
                required: { value: true, message: 'Role name is required.' },
                pattern: {
                  value: /^ROLE_[A-Z_]+$/,
                  message: 'Role name must start with ROLE_ and contain only uppercase letters and underscores.',
                },
              }}
            />
            <ValidatedField
              name="description"
              label="Description"
              placeholder="Enter role description"
              type="textarea"
              disabled
              validate={{
                required: { value: true, message: 'Description is required.' },
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
              Close
            </Button>
          </ModalFooter>
        </ValidatedForm>
      </Modal>
    </div>
  );
};

export default RoleManagementTab;
