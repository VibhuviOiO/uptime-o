import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Table, Badge, Input, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faSync } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAppSelector } from 'app/config/store';

interface IUser {
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated?: boolean;
  langKey?: string;
  imageUrl?: string;
  authorities?: string[];
  createdBy?: string;
  createdDate?: Date;
  lastModifiedBy?: string;
  lastModifiedDate?: Date;
}

interface UserManagementListProps {
  /** If true, shows the title and add button */
  showHeader?: boolean;
  /** Custom title for the header */
  title?: string;
  /** Custom description for the header */
  description?: string;
  /** Base path for links */
  basePath?: string;
}

export const UserManagementList: React.FC<UserManagementListProps> = ({
  showHeader = true,
  title = 'User Management',
  description = 'Manage user accounts, roles, and permissions.',
  basePath = '/admin/user-management',
}) => {
  const account = useAppSelector(state => state.authentication.account);
  const location = useLocation();

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    login: '',
    firstName: '',
    lastName: '',
    email: '',
    activated: true,
    authorities: [] as string[],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Listen for navigation state changes to trigger refresh after delete
  useEffect(() => {
    if (location.state?.refresh) {
      loadUsers();
    }
  }, [location.state]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IUser[]>('api/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handleSyncList = () => {
    loadUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      id: undefined,
      login: '',
      firstName: '',
      lastName: '',
      email: '',
      activated: true,
      authorities: ['ROLE_USER'],
    });
    setModalOpen(true);
  };

  const openEditModal = (user: IUser) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      login: user.login || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      activated: user.activated ?? true,
      authorities: user.authorities || [],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      authorities: prev.authorities.includes(role) ? prev.authorities.filter(r => r !== role) : [...prev.authorities, role],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`api/admin/users`, formData);
        toast.success('User updated successfully');
      } else {
        await axios.post(`api/admin/users`, formData);
        toast.success('User created successfully');
      }
      closeModal();
      loadUsers();
    } catch (error) {
      toast.error(`Failed to ${editingUser ? 'update' : 'create'} user`);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {showHeader && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>{title}</h3>
            {description && <p className="tab-description">{description}</p>}
          </div>
          <div className="d-flex gap-2">
            <Button color="info" onClick={handleSyncList} disabled={loading}>
              <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
            </Button>
            <Button color="primary" onClick={openCreateModal}>
              <FontAwesomeIcon icon={faPlus} /> Create a new user
            </Button>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="mb-3">
        <div className="search-box position-relative">
          <FontAwesomeIcon icon={faSearch} className="position-absolute top-50 start-0 translate-middle-y ms-3" />
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
          <Table hover striped>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Audit Trail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <strong>{user.login}</strong>
                      <Badge color={user.activated ? 'success' : 'secondary'} className="ms-1">
                        {user.activated ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {user.authorities?.map(auth => (
                      <Badge key={auth} color="info" className="me-1">
                        {auth}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <small>
                      <div>
                        <strong>Created:</strong> {user.createdBy} on{' '}
                        {user.createdDate ? new Date(user.createdDate).toLocaleString() : 'N/A'}
                      </div>
                      {user.lastModifiedBy && (
                        <div className="text-muted">
                          <strong>Updated:</strong> {user.lastModifiedBy} on{' '}
                          {user.lastModifiedDate ? new Date(user.lastModifiedDate).toLocaleString() : 'N/A'}
                        </div>
                      )}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-3">
                      <a onClick={() => openEditModal(user)} title="Edit" className="text-primary" style={{ cursor: 'pointer' }}>
                        <FontAwesomeIcon icon="pencil-alt" />
                      </a>
                      {user.login !== account.login && (
                        <Link to={`${basePath}/${user.login}/delete`} title="Delete" className="text-danger">
                          <FontAwesomeIcon icon="trash" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
        <ModalHeader toggle={closeModal}>{editingUser ? 'Edit User' : 'Create New User'}</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="login">Username *</Label>
              <Input
                id="login"
                name="login"
                type="text"
                value={formData.login}
                onChange={handleInputChange}
                required
                disabled={!!editingUser}
              />
            </FormGroup>

            <FormGroup>
              <Label for="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} />
            </FormGroup>

            <FormGroup>
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} />
            </FormGroup>

            <FormGroup>
              <Label for="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </FormGroup>

            <FormGroup check className="mb-3">
              <Input id="activated" name="activated" type="checkbox" checked={formData.activated} onChange={handleInputChange} />
              <Label for="activated" check>
                Activated
              </Label>
            </FormGroup>

            <FormGroup>
              <Label>Roles *</Label>
              <div>
                <FormGroup check inline>
                  <Input
                    id="role-user"
                    type="checkbox"
                    checked={formData.authorities.includes('ROLE_USER')}
                    onChange={() => handleRoleChange('ROLE_USER')}
                  />
                  <Label for="role-user" check>
                    User
                  </Label>
                </FormGroup>
                <FormGroup check inline>
                  <Input
                    id="role-admin"
                    type="checkbox"
                    checked={formData.authorities.includes('ROLE_ADMIN')}
                    onChange={() => handleRoleChange('ROLE_ADMIN')}
                  />
                  <Label for="role-admin" check>
                    Admin
                  </Label>
                </FormGroup>
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementList;
