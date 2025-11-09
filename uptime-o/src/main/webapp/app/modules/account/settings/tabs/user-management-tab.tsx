import React, { useState, useEffect } from 'react';
import { Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Input } from 'reactstrap';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch, faUserCheck, faUserTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAppSelector } from 'app/config/store';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';

interface IUser {
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated?: boolean;
  authorities?: string[];
  createdBy?: string;
  createdDate?: Date;
  lastModifiedBy?: string;
  lastModifiedDate?: Date;
}

export const UserManagementTab = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorities, setAuthorities] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadAuthorities();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await axios.get<IUser[]>('api/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const loadAuthorities = async () => {
    try {
      const response = await axios.get<string[]>('api/authorities');
      setAuthorities(response.data);
    } catch (error) {
      console.error('Failed to load authorities', error);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingUser(null);
    }
  };

  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal);
    if (deleteModal) {
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setModal(true);
  };

  const handleDeleteClick = (user: IUser) => {
    setUserToDelete(user);
    setDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete?.login) {
      try {
        await axios.delete(`api/admin/users/${userToDelete.login}`);
        toast.success(`User ${userToDelete.login} deleted successfully`);
        loadUsers();
        toggleDeleteModal();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleActivation = async (user: IUser) => {
    try {
      const updatedUser = { ...user, activated: !user.activated };
      await axios.put('api/admin/users', updatedUser);
      toast.success(`User ${user.login} ${updatedUser.activated ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleValidSubmit = async (values: any) => {
    try {
      const userData = {
        ...editingUser,
        login: values.login,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        activated: values.activated,
        authorities: values.authorities || [],
      };

      if (editingUser?.id) {
        await axios.put('api/admin/users', userData);
        toast.success('User updated successfully');
      } else {
        await axios.post('api/admin/users', userData);
        toast.success('User created successfully');
      }

      loadUsers();
      toggleModal();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.title === 'Login name already used!') {
        toast.error('Username already exists!');
      } else if (error.response?.status === 400 && error.response?.data?.title === 'Email is already in use!') {
        toast.error('Email address already in use!');
      } else {
        toast.error(`Failed to ${editingUser?.id ? 'update' : 'create'} user`);
      }
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>User Management</h3>
          <p className="tab-description">Manage user accounts, roles, and permissions.</p>
        </div>
        <Button color="primary" onClick={toggleModal}>
          <FontAwesomeIcon icon={faPlus} /> Add User
        </Button>
      </div>

      <div className="mb-3">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <Input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="ps-5"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.login}</strong>
                  </td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge color={user.activated ? 'success' : 'secondary'}>{user.activated ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>
                    {user.authorities?.map(auth => (
                      <Badge key={auth} color="info" className="me-1">
                        {auth}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <div className="btn-group">
                      <Button size="sm" color="primary" outline onClick={() => handleEditUser(user)} title="Edit user">
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        size="sm"
                        color={user.activated ? 'warning' : 'success'}
                        outline
                        onClick={() => handleToggleActivation(user)}
                        title={user.activated ? 'Deactivate user' : 'Activate user'}
                      >
                        <FontAwesomeIcon icon={user.activated ? faUserTimes : faUserCheck} />
                      </Button>
                      {user.login !== account.login && (
                        <Button size="sm" color="danger" outline onClick={() => handleDeleteClick(user)} title="Delete user">
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>{editingUser?.id ? 'Edit User' : 'Add New User'}</ModalHeader>
        <ValidatedForm onSubmit={handleValidSubmit} defaultValues={editingUser || { activated: true }}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <ValidatedField
                  name="login"
                  label="Username"
                  placeholder="Enter username"
                  disabled={!!editingUser?.id}
                  validate={{
                    required: { value: true, message: 'Username is required.' },
                    minLength: { value: 1, message: 'Username must be at least 1 character.' },
                    maxLength: { value: 50, message: 'Username cannot be longer than 50 characters.' },
                    pattern: {
                      value: /^[a-zA-Z0-9_]*$/,
                      message: 'Username can only contain letters, numbers, and underscores.',
                    },
                  }}
                  data-cy="login"
                />
              </Col>
              <Col md={6}>
                <ValidatedField
                  name="email"
                  label="Email"
                  placeholder="Enter email"
                  type="email"
                  validate={{
                    required: { value: true, message: 'Email is required.' },
                    minLength: { value: 5, message: 'Email must be at least 5 characters.' },
                    maxLength: { value: 254, message: 'Email cannot be longer than 254 characters.' },
                    validate: v => isEmail(v) || 'Invalid email address.',
                  }}
                  data-cy="email"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <ValidatedField
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  validate={{
                    maxLength: { value: 50, message: 'First name cannot be longer than 50 characters.' },
                  }}
                  data-cy="firstName"
                />
              </Col>
              <Col md={6}>
                <ValidatedField
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  validate={{
                    maxLength: { value: 50, message: 'Last name cannot be longer than 50 characters.' },
                  }}
                  data-cy="lastName"
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <ValidatedField name="activated" label="Activated" type="checkbox" check data-cy="activated" />
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label">Roles</label>
                  {authorities.map(auth => (
                    <ValidatedField
                      key={auth}
                      name="authorities"
                      label={auth}
                      value={auth}
                      type="checkbox"
                      check
                      data-cy={`authority-${auth}`}
                    />
                  ))}
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button color="primary" type="submit" data-cy="submit">
              {editingUser?.id ? 'Update User' : 'Create User'}
            </Button>
          </ModalFooter>
        </ValidatedForm>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete user <strong>{userToDelete?.login}</strong>? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleDeleteModal}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserManagementTab;
