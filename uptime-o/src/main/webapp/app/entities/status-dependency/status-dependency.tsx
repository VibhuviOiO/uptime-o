import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IStatusDependency } from 'app/shared/model/status-dependency.model';
// import { StatusDependencyEditModal } from './status-dependency-edit-modal';

const StatusDependency = () => {
  const [statusDependencies, setStatusDependencies] = useState<IStatusDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStatusDependency, setSelectedStatusDependency] = useState<IStatusDependency | null>(null);

  useEffect(() => {
    loadStatusDependencies();
  }, []);

  const loadStatusDependencies = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IStatusDependency[]>('/api/status-dependencies');
      setStatusDependencies(response.data);
    } catch (error) {
      toast.error('Failed to load status dependencies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedStatusDependency(null);
    setEditModalOpen(true);
  };

  const handleEdit = (statusDependency: IStatusDependency) => {
    setSelectedStatusDependency(statusDependency);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedStatusDependency(null);
  };

  const handleEditSuccess = () => {
    loadStatusDependencies();
  };

  const handleDelete = async (statusDependency: IStatusDependency) => {
    if (window.confirm(`Are you sure you want to delete this dependency?`)) {
      try {
        await axios.delete(`/api/status-dependencies/${statusDependency.id}`);
        toast.success('Status dependency deleted successfully');
        loadStatusDependencies();
      } catch (error) {
        toast.error('Failed to delete status dependency');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading status dependencies...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="row g-3">
        <div className={editModalOpen ? 'col-md-6' : 'col-md-12'}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon="sitemap" className="me-2" />
                  Status Dependencies
                </h5>
                <Button color="primary" size="sm" onClick={handleCreateClick}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  New Dependency
                </Button>
              </div>

              {!statusDependencies || statusDependencies.length === 0 ? (
                <div className="alert alert-info">
                  <p>No status dependencies found. Create one to get started.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Parent</th>
                      <th>Child</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusDependencies.map((dependency, i) => (
                      <tr key={`entity-${i}`}>
                        <td>
                          <span className="badge bg-primary me-1">{dependency.parentType}</span>
                          ID: {dependency.parentId}
                        </td>
                        <td>
                          <span className="badge bg-secondary me-1">{dependency.childType}</span>
                          ID: {dependency.childId}
                        </td>
                        <td>{dependency.createdAt ? new Date(dependency.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleEdit(dependency)}
                            title="Edit"
                            style={{ padding: 0, marginRight: '0.5rem' }}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </Button>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleDelete(dependency)}
                            title="Delete"
                            style={{ padding: 0, color: '#dc3545' }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>
        {/* {editModalOpen && (
          <div className="col-md-6">
            <StatusDependencyEditModal
              isOpen={editModalOpen}
              toggle={handleCloseEditModal}
              statusDependency={selectedStatusDependency}
              onSave={handleEditSuccess}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default StatusDependency;
