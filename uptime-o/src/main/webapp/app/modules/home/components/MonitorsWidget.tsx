import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEye, faPencil, faTrash, faPlus, faCode, faLink, faBuilding } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Tooltip } from 'reactstrap';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/http-monitor/http-monitor.reducer';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import { HttpMonitorEditModal } from './HttpMonitorEditModal';
import { HttpMonitorDeleteModal } from './HttpMonitorDeleteModal';
import { HttpMonitorViewModal } from './HttpMonitorViewModal';
import { BodyViewModal } from './BodyViewModal';
import { HeadersViewModal } from './HeadersViewModal';
import AgentMonitorAssign from 'app/entities/http-monitor/agent-monitor-assign';

export const MonitorsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [bodyViewOpen, setBodyViewOpen] = useState(false);
  const [headersViewOpen, setHeadersViewOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<IHttpMonitor | null>(null);
  const [datacenterAssignments, setDatacenterAssignments] = useState<{ [monitorId: number]: any[] }>({});

  const monitorList = useAppSelector(state => state.httpMonitor.entities);
  const loading = useAppSelector(state => state.httpMonitor.loading);
  const totalItems = useAppSelector(state => state.httpMonitor.totalItems);

  useEffect(() => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 100,
        sort: 'id,desc',
      }),
    );
    fetchDatacenterAssignments();
  }, [dispatch, pageNum]);

  const fetchDatacenterAssignments = async () => {
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
          // Create agent object from the assignment data
          grouped[monitorId].push({
            id: assignment.agentId,
            name: assignment.agentName,
          });
        }
      });

      setDatacenterAssignments(grouped);
    } catch (error) {
      console.error('Failed to fetch agent assignments:', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedMonitor(null);
    setEditModalOpen(true);
  };

  const handleView = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setViewModalOpen(true);
  };

  const handleEdit = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setEditModalOpen(true);
  };

  const handleDelete = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedMonitor(null);
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

  const openAssignModal = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleAssignSave = () => {
    fetchDatacenterAssignments();
    handleCloseAssignModal();
  };

  const handleEditSuccess = () => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 100,
        sort: 'id,desc',
      }),
    );
  };

  const handleDeleteSuccess = () => {
    dispatch(
      getEntities({
        page: pageNum,
        size: 100,
        sort: 'id,desc',
      }),
    );
  };

  if (loading) {
    return (
      <div className="monitors-widget">
        <div className="widget-loading">
          <p>Loading monitors...</p>
        </div>
      </div>
    );
  }

  if (!monitorList || monitorList.length === 0) {
    return (
      <div className="monitors-widget">
        <div className="widget-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>
              <FontAwesomeIcon icon={faChartLine} className="me-2" />
              Monitors
            </h3>
            <button
              onClick={handleCreateClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#0d6efd',
                fontSize: '1rem',
              }}
              title="Create Monitor"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <Link to="/http-monitor" className="widget-link">
            View All
          </Link>
        </div>
        <div className="widget-empty">
          <p>No monitors found.</p>
          <button className="btn btn-sm btn-primary" onClick={handleCreateClick} style={{ border: 'none', cursor: 'pointer' }}>
            Create Monitor
          </button>
        </div>

        <HttpMonitorEditModal isOpen={editModalOpen} toggle={handleCloseEditModal} monitor={selectedMonitor} onSave={handleEditSuccess} />
        <HttpMonitorDeleteModal
          isOpen={deleteModalOpen}
          toggle={handleCloseDeleteModal}
          monitor={selectedMonitor}
          onDelete={handleDeleteSuccess}
        />
        <HttpMonitorViewModal isOpen={viewModalOpen} toggle={handleCloseViewModal} monitor={selectedMonitor} />
        <BodyViewModal isOpen={bodyViewOpen} toggle={handleCloseBodyModal} monitor={selectedMonitor} />
        <HeadersViewModal isOpen={headersViewOpen} toggle={handleCloseHeadersModal} monitor={selectedMonitor} />
      </div>
    );
  }

  return (
    <div className="monitors-widget">
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Monitors
            {totalItems > 0 && <span className="widget-count">{totalItems}</span>}
          </h3>
          <button
            onClick={handleCreateClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#0d6efd',
              fontSize: '1rem',
            }}
            title="Create Monitor"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <Link to="/http-monitor" className="widget-link">
          View All
        </Link>
      </div>
      <div className="widget-table-container">
        <table className="widget-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Schedule</th>
              <th>Headers</th>
              <th>Body</th>
              <th>Mapped DCs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitorList.map((monitor, index) => (
              <tr key={`entity-${index}`}>
                <td className="name-cell">
                  <div>
                    <strong
                      style={{
                        display: 'block',
                        wordWrap: 'break-word',
                      }}
                    >
                      {monitor.name}
                    </strong>
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
                <td className="metadata-cell">
                  {monitor.url ? (
                    <a href={monitor.url} target="_blank" rel="noopener noreferrer" title={monitor.url}>
                      {monitor.url.length > 25 ? `${monitor.url.substring(0, 25)}...` : monitor.url}
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="schedule-cell">
                  {monitor.schedule && monitor.schedule.name ? <span>{monitor.schedule.name}</span> : <span className="text-muted">-</span>}
                </td>
                <td className="headers-cell">
                  {monitor.headers ? (
                    <button
                      className="action-btn btn-headers"
                      title="View Headers"
                      onClick={() => handleViewHeaders(monitor)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#0056b3',
                      }}
                    >
                      <FontAwesomeIcon icon={faCode} />
                    </button>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="body-cell">
                  {monitor.body ? (
                    <button
                      className="action-btn btn-body"
                      title="View Body"
                      onClick={() => handleViewBody(monitor)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#198754',
                      }}
                    >
                      <FontAwesomeIcon icon={faCode} />
                    </button>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="datacenters-cell">
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      maxHeight: '50px',
                      overflowY: 'auto',
                    }}
                  >
                    {monitor.id && datacenterAssignments[monitor.id] && datacenterAssignments[monitor.id].length > 0 ? (
                      <>
                        {datacenterAssignments[monitor.id].map((agent: any) => (
                          <span
                            key={agent.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              padding: '0.15rem 0.35rem',
                              background: '#e8f5e9',
                              color: '#2e7d32',
                              borderRadius: '8px',
                              fontSize: '0.6rem',
                              fontWeight: '500',
                              border: '1px solid #a5d6a7',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '0.6rem' }} />
                            <strong>{agent.name}</strong>
                          </span>
                        ))}
                        <button
                          className="action-btn btn-assign"
                          title="Add Agents"
                          onClick={() => openAssignModal(monitor)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '0.15rem 0.25rem',
                            color: '#28a745',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-muted text-small">-</span>
                        <button
                          className="action-btn btn-assign"
                          title="Add Agents"
                          onClick={() => openAssignModal(monitor)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '0.15rem 0.25rem',
                            color: '#28a745',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="action-btn btn-view"
                      title="View"
                      onClick={() => handleView(monitor)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#0d6efd' }}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="action-btn btn-edit"
                      title="Edit"
                      onClick={() => handleEdit(monitor)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#0d6efd' }}
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                    <button
                      className="action-btn btn-delete"
                      title="Delete"
                      onClick={() => handleDelete(monitor)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#dc3545' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="widget-pagination">
        Showing {monitorList.length} of {totalItems} monitors
      </div>

      <HttpMonitorEditModal isOpen={editModalOpen} toggle={handleCloseEditModal} monitor={selectedMonitor} onSave={handleEditSuccess} />
      <HttpMonitorDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        monitor={selectedMonitor}
        onDelete={handleDeleteSuccess}
      />
      <HttpMonitorViewModal isOpen={viewModalOpen} toggle={handleCloseViewModal} monitor={selectedMonitor} />
      <BodyViewModal isOpen={bodyViewOpen} toggle={handleCloseBodyModal} monitor={selectedMonitor} />
      <HeadersViewModal isOpen={headersViewOpen} toggle={handleCloseHeadersModal} monitor={selectedMonitor} />
      <AgentMonitorAssign
        isOpen={assignModalOpen}
        toggle={handleCloseAssignModal}
        monitorId={selectedMonitor?.id}
        monitorName={selectedMonitor?.name}
        onSave={handleAssignSave}
      />
    </div>
  );
};

export default MonitorsWidget;
