import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faPlus, faChartBar, faEye, faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IStatusPage } from 'app/shared/model/status-page.model';
import { StatusPageEditModal } from './status-page-edit-modal';

const StatusPage = () => {
  const [statusPages, setStatusPages] = useState<IStatusPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStatusPage, setSelectedStatusPage] = useState<IStatusPage | null>(null);

  useEffect(() => {
    loadStatusPages();
  }, []);

  const loadStatusPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IStatusPage[]>('/api/status-pages');
      setStatusPages(response.data);
    } catch (error) {
      toast.error('Failed to load status pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedStatusPage(null);
    setEditModalOpen(true);
  };

  const handleEdit = (statusPage: IStatusPage) => {
    setSelectedStatusPage(statusPage);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedStatusPage(null);
  };

  const handleEditSuccess = () => {
    loadStatusPages();
  };

  const handleDelete = async (statusPage: IStatusPage) => {
    if (window.confirm(`Are you sure you want to delete "${statusPage.name}"?`)) {
      try {
        await axios.delete(`/api/status-pages/${statusPage.id}`);
        toast.success('Status page deleted successfully');
        loadStatusPages();
      } catch (error) {
        toast.error('Failed to delete status page');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading status pages...</p>
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
                  <FontAwesomeIcon icon={faChartBar} className="me-2" />
                  Status Pages
                </h5>
                <Button color="primary" size="sm" onClick={handleCreateClick}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  New Status Page
                </Button>
              </div>

              {!statusPages || statusPages.length === 0 ? (
                <div className="alert alert-info">
                  <p>No status pages found. Create one to get started.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Public</th>
                      <th>Custom Domain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusPages.map((statusPage, i) => (
                      <tr key={`entity-${i}`}>
                        <td>
                          <strong>{statusPage.name}</strong>
                          {statusPage.description && <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{statusPage.description}</div>}
                        </td>
                        <td>
                          <code>{statusPage.slug}</code>
                        </td>
                        <td>
                          <span className={`badge ${statusPage.isPublic ? 'bg-success' : 'bg-secondary'}`}>
                            {statusPage.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td>
                          {statusPage.customDomain ? (
                            <a href={`https://${statusPage.customDomain}`} target="_blank" rel="noopener noreferrer">
                              {statusPage.customDomain}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => window.open(`/status/${statusPage.slug}`, '_blank')}
                            title="View Public Status Page"
                            style={{ padding: 0, marginRight: '0.5rem' }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => window.open(`/private-status/${statusPage.slug}`, '_blank')}
                            title="View Private Status Page"
                            style={{ padding: 0, marginRight: '0.5rem', color: '#6f42c1' }}
                          >
                            <FontAwesomeIcon icon={faLock} />
                          </Button>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleEdit(statusPage)}
                            title="Edit"
                            style={{ padding: 0, marginRight: '0.5rem' }}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </Button>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleDelete(statusPage)}
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
        {editModalOpen && (
          <div className="col-md-6">
            <StatusPageEditModal
              isOpen={editModalOpen}
              toggle={handleCloseEditModal}
              statusPage={selectedStatusPage}
              onSave={handleEditSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
