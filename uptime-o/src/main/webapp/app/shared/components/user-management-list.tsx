import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Badge, Input } from 'reactstrap';
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

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleSyncList = () => {
    loadUsers();
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
            <Link to={`${basePath}/new`} className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} /> Create a new user
            </Link>
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
                    <div className="d-flex gap-3">
                      <Link to={`${basePath}/${user.login}`} title="View" className="text-info">
                        <FontAwesomeIcon icon="eye" />
                      </Link>
                      <Link to={`${basePath}/${user.login}/edit`} title="Edit" className="text-primary">
                        <FontAwesomeIcon icon="pencil-alt" />
                      </Link>
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
    </div>
  );
};

export default UserManagementList;
