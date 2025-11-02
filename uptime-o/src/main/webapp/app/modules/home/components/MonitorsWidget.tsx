import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEye, faPencil, faTrash, faPlus, faCode } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from 'app/entities/http-monitor/http-monitor.reducer';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import { HttpMonitorEditModal } from './HttpMonitorEditModal';
import { HttpMonitorDeleteModal } from './HttpMonitorDeleteModal';
import { HttpMonitorViewModal } from './HttpMonitorViewModal';
import { BodyViewModal } from './BodyViewModal';
import { HeadersViewModal } from './HeadersViewModal';

export const MonitorsWidget = () => {
  const dispatch = useAppDispatch();
  const [pageNum, setPageNum] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [bodyViewOpen, setBodyViewOpen] = useState(false);
  const [headersViewOpen, setHeadersViewOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<IHttpMonitor | null>(null);

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
  }, [dispatch, pageNum]);

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
              <th>Method</th>
              <th>Type</th>
              <th>Schedule</th>
              <th>Headers</th>
              <th>Body</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {monitorList.map((monitor, index) => (
              <tr key={`entity-${index}`}>
                <td className="name-cell">
                  <strong>{monitor.name}</strong>
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
                <td className="method-cell">
                  <span className="badge bg-info">{monitor.method || 'GET'}</span>
                </td>
                <td className="type-cell">{monitor.type ? <span>{monitor.type}</span> : <span className="text-muted">-</span>}</td>
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
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn btn-view"
                      title="View"
                      onClick={() => handleView(monitor)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#0d6efd', marginRight: '0.5rem' }}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="action-btn btn-edit"
                      title="Edit"
                      onClick={() => handleEdit(monitor)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#0d6efd', marginRight: '0.5rem' }}
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
    </div>
  );
};

export default MonitorsWidget;
