import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faCode, faBuilding, faPlus, faGlobe } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import AgentMonitorAssign from './agent-monitor-assign';
import { BodyViewModal } from 'app/modules/home/components/BodyViewModal';
import { HeadersViewModal } from 'app/modules/home/components/HeadersViewModal';
import { HttpMonitorEditModal } from 'app/modules/home/components/HttpMonitorEditModal';
import { HttpMonitorDeleteModal } from 'app/modules/home/components/HttpMonitorDeleteModal';

export const HttpMonitor = () => {
  const [monitors, setMonitors] = useState<IHttpMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bodyViewOpen, setBodyViewOpen] = useState(false);
  const [headersViewOpen, setHeadersViewOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<IHttpMonitor | null>(null);
  const [agentAssignments, setAgentAssignments] = useState<{ [monitorId: number]: any[] }>({});

  useEffect(() => {
    loadMonitors();
    fetchAgentAssignments();
  }, []);

  const loadMonitors = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IHttpMonitor[]>('/api/http-monitors?page=0&size=1000&sort=id,desc');
      setMonitors(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load HTTP monitors');
      setLoading(false);
    }
  };

  const fetchAgentAssignments = async () => {
    try {
      const response = await axios.get<any>('/api/agent-monitors?size=10000');
      const responseData = response.data;

      let assignments = [];
      if (Array.isArray(responseData)) {
        assignments = responseData;
      } else if (responseData.content && Array.isArray(responseData.content)) {
        assignments = responseData.content;
      }

      const grouped: { [key: number]: any[] } = {};
      assignments.forEach((assignment: any) => {
        const monitorId = assignment.monitorId;
        if (monitorId) {
          if (!grouped[monitorId]) {
            grouped[monitorId] = [];
          }
          if (assignment.agentName) {
            grouped[monitorId].push({ id: assignment.agentId, name: assignment.agentName });
          }
        }
      });

      setAgentAssignments(grouped);
    } catch (error) {
      console.error('Failed to fetch agent assignments:', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedMonitor(null);
    setEditModalOpen(true);
  };

  const handleEdit = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleEditSuccess = () => {
    loadMonitors();
    fetchAgentAssignments();
  };

  const handleDelete = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleDeleteSuccess = () => {
    loadMonitors();
    fetchAgentAssignments();
  };

  const openAssignModal = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleAssignSave = () => {
    fetchAgentAssignments();
    closeAssignModal();
  };

  const handleViewBody = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setBodyViewOpen(true);
  };

  const handleCloseBodyModal = () => {
    setBodyViewOpen(false);
    setSelectedMonitor(null);
  };

  const handleViewHeaders = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setHeadersViewOpen(true);
  };

  const handleCloseHeadersModal = () => {
    setHeadersViewOpen(false);
    setSelectedMonitor(null);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading HTTP monitors...</p>
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
                  <FontAwesomeIcon icon={faGlobe} className="me-2" />
                  HTTP Monitors
                </h5>
                <Button color="primary" size="sm" onClick={handleCreateClick}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  New Monitor
                </Button>
              </div>

              {!monitors || monitors.length === 0 ? (
                <div className="alert alert-info">
                  <p>No HTTP monitors found. Create one to get started.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>URL</th>
                      <th>Schedule</th>
                      <th>Headers</th>
                      <th>Body</th>
                      <th>Mapped Agents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitors.map((monitor, i) => (
                      <tr key={`entity-${i}`}>
                        <td>
                          <div>
                            <strong>{monitor.name}</strong>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              <span className="badge bg-info" style={{ fontSize: '0.65rem' }}>
                                {monitor.method || 'GET'}
                              </span>
                              {monitor.type && (
                                <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                                  {monitor.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {monitor.type === 'group' ? (
                            '-'
                          ) : monitor.url ? (
                            <a href={monitor.url} target="_blank" rel="noopener noreferrer" title={monitor.url}>
                              {monitor.url.length > 30 ? `${monitor.url.substring(0, 30)}...` : monitor.url}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {monitor.type === 'group' ? (
                            '-'
                          ) : (
                            <div style={{ fontSize: '0.85rem' }}>
                              <div>Interval: {monitor.intervalSeconds}s</div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>Timeout: {monitor.timeoutSeconds}s</div>
                            </div>
                          )}
                        </td>
                        <td>
                          {monitor.headers ? (
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => handleViewHeaders(monitor)}
                              title="View Headers"
                              style={{ padding: 0 }}
                            >
                              <FontAwesomeIcon icon={faCode} />
                            </Button>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {monitor.body ? (
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => handleViewBody(monitor)}
                              title="View Body"
                              style={{ padding: 0, color: '#198754' }}
                            >
                              <FontAwesomeIcon icon={faCode} />
                            </Button>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {monitor.type === 'group' ? (
                            '-'
                          ) : (
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {monitor.id && agentAssignments[monitor.id] && agentAssignments[monitor.id].length > 0 ? (
                                <>
                                  {agentAssignments[monitor.id].map((agent: any) => (
                                    <span
                                      key={agent.id}
                                      style={{
                                        fontSize: '0.7rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        padding: '0.35rem 0.6rem',
                                        backgroundColor: '#e7f3ff',
                                        color: '#0066cc',
                                        border: '1px solid #b3d9ff',
                                        borderRadius: '12px',
                                        fontWeight: '500',
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '0.65rem' }} />
                                      {agent.name}
                                    </span>
                                  ))}
                                  <Button
                                    color="link"
                                    size="sm"
                                    onClick={() => openAssignModal(monitor)}
                                    title="Manage Agents"
                                    style={{ padding: '0.2rem 0.4rem', color: '#0066cc', fontSize: '0.85rem' }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>No agents</span>
                                  <Button
                                    color="link"
                                    size="sm"
                                    onClick={() => openAssignModal(monitor)}
                                    title="Assign Agents"
                                    style={{ padding: '0.2rem 0.4rem', color: '#0066cc', fontSize: '0.85rem' }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleEdit(monitor)}
                            title="Edit"
                            style={{ padding: 0, marginRight: '0.5rem' }}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </Button>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleDelete(monitor)}
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
            <HttpMonitorEditModal
              isOpen={editModalOpen}
              toggle={handleCloseEditModal}
              monitor={selectedMonitor}
              onSave={handleEditSuccess}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'none' }}>
        <HttpMonitorEditModal isOpen={false} toggle={handleCloseEditModal} monitor={selectedMonitor} onSave={handleEditSuccess} />
      </div>
      <HttpMonitorDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        monitor={selectedMonitor}
        onDelete={handleDeleteSuccess}
      />
      <BodyViewModal isOpen={bodyViewOpen} toggle={handleCloseBodyModal} monitor={selectedMonitor} />
      <HeadersViewModal isOpen={headersViewOpen} toggle={handleCloseHeadersModal} monitor={selectedMonitor} />
      {selectedMonitor && (
        <AgentMonitorAssign
          isOpen={assignModalOpen}
          toggle={closeAssignModal}
          monitorId={selectedMonitor.id}
          monitorName={selectedMonitor.name}
          onSave={handleAssignSave}
        />
      )}
    </div>
  );
};

export default HttpMonitor;
