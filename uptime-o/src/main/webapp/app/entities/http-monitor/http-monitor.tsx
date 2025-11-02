import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
  faPencil,
  faLink,
  faTrash,
  faCode,
  faSync,
  faBuilding,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import axios from 'axios';

import { getEntities } from './http-monitor.reducer';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import DatacenterMonitorAssign from './datacenter-monitor-assign';
import { BodyViewModal } from 'app/modules/home/components/BodyViewModal';
import { HeadersViewModal } from 'app/modules/home/components/HeadersViewModal';
import { HttpMonitorEditModal } from 'app/modules/home/components/HttpMonitorEditModal';
import { HttpMonitorDeleteModal } from 'app/modules/home/components/HttpMonitorDeleteModal';
import '../entity.scss';

export const HttpMonitor = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();

  // Pagination state
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bodyViewOpen, setBodyViewOpen] = useState(false);
  const [headersViewOpen, setHeadersViewOpen] = useState(false);

  // Monitor selection
  const [selectedMonitor, setSelectedMonitor] = useState<IHttpMonitor | null>(null);

  // Datacenter assignments mapping
  const [datacenterAssignments, setDatacenterAssignments] = useState<{ [monitorId: number]: any[] }>({});

  // Redux selectors
  const httpMonitorList = useAppSelector(state => state.httpMonitor.entities);
  const loading = useAppSelector(state => state.httpMonitor.loading);
  const totalItems = useAppSelector(state => state.httpMonitor.totalItems);

  // Fetch data
  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
    fetchDatacenterAssignments();
  };

  const fetchDatacenterAssignments = async () => {
    try {
      // Fetch all datacenter-monitor assignments using axios (same as assign modal)
      const response = await axios.get<any>('/api/datacenter-monitors?size=10000');
      const responseData = response.data;

      // Handle paginated response - axios.data contains response.data
      let assignments = [];
      if (Array.isArray(responseData)) {
        assignments = responseData;
      } else if (responseData.content && Array.isArray(responseData.content)) {
        assignments = responseData.content;
      }

      // Debug: Log what we received
      if (assignments.length > 0) {
        console.warn('Sample assignment:', assignments[0]);
      }

      // Group by monitor ID
      const grouped: { [key: number]: any[] } = {};
      assignments.forEach((assignment: any) => {
        const monitorId = assignment.monitor?.id;
        if (monitorId) {
          if (!grouped[monitorId]) {
            grouped[monitorId] = [];
          }
          // Only add if datacenter exists
          if (assignment.datacenter) {
            grouped[monitorId].push(assignment.datacenter);
          }
        }
      });

      console.warn('Grouped assignments:', grouped);
      setDatacenterAssignments(grouped);
    } catch (error) {
      console.error('Failed to fetch datacenter assignments:', error);
    }
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  // Fetch datacenter assignments whenever the monitor list changes
  useEffect(() => {
    if (httpMonitorList && httpMonitorList.length > 0) {
      fetchDatacenterAssignments();
    }
  }, [httpMonitorList]);

  // Sorting
  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  // Pagination
  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  // Modal handlers - Edit
  const handleEdit = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleEditSuccess = () => {
    sortEntities();
    handleCloseEditModal();
  };

  // Modal handlers - Delete
  const handleDelete = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleDeleteSuccess = () => {
    sortEntities();
    handleCloseDeleteModal();
  };

  // Modal handlers - Assign
  const openAssignModal = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleAssignSave = async () => {
    // Refresh only the assignments for the current monitor
    if (selectedMonitor?.id) {
      try {
        const response = await axios.get<any>('/api/datacenter-monitors?size=10000');
        const responseData = response.data;

        let assignments = [];
        if (Array.isArray(responseData)) {
          assignments = responseData;
        } else if (responseData.content && Array.isArray(responseData.content)) {
          assignments = responseData.content;
        }

        // Update only this monitor's assignments
        const monitorAssignments = assignments.filter((a: any) => a.monitor?.id === selectedMonitor.id);
        const datacenters = monitorAssignments.map((a: any) => a.datacenter).filter((dc: any) => dc);

        // Update the state with just this monitor's data
        setDatacenterAssignments(prev => ({
          ...prev,
          [selectedMonitor.id]: datacenters,
        }));
      } catch (error) {
        console.error('Failed to refresh datacenter assignments:', error);
      }
    }

    closeAssignModal();
  };

  // Modal handlers - View Body
  const handleViewBody = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setBodyViewOpen(true);
  };

  const handleCloseBodyModal = () => {
    setBodyViewOpen(false);
    setSelectedMonitor(null);
  };

  // Modal handlers - View Headers
  const handleViewHeaders = (monitor: IHttpMonitor) => {
    setSelectedMonitor(monitor);
    setHeadersViewOpen(true);
  };

  const handleCloseHeadersModal = () => {
    setHeadersViewOpen(false);
    setSelectedMonitor(null);
  };

  return (
    <div className="monitors-page">
      <div className="monitors-header">
        <div className="header-content">
          <h1 id="http-monitor-heading" data-cy="HttpMonitorHeading">
            <FontAwesomeIcon icon={faCode} className="me-2" />
            HTTP Monitors
          </h1>
        </div>
        <div className="header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} outline>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
        </div>
      </div>

      {httpMonitorList && httpMonitorList.length > 0 ? (
        <>
          <div className="smart-table-wrapper">
            <table className="smart-table" data-cy="entityTable">
              <thead>
                <tr>
                  <th className="sortable" onClick={sort('name')}>
                    <span className="th-content">
                      Name
                      <FontAwesomeIcon icon={getSortIconByFieldName('name')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('url')}>
                    <span className="th-content">
                      URL
                      <FontAwesomeIcon icon={getSortIconByFieldName('url')} className="ms-1" />
                    </span>
                  </th>
                  <th>
                    <span className="th-content">Schedule</span>
                  </th>
                  <th>
                    <span className="th-content">Headers</span>
                  </th>
                  <th>
                    <span className="th-content">Body</span>
                  </th>
                  <th>
                    <span className="th-content">Mapped DCs</span>
                  </th>
                  <th className="actions-column">
                    <span className="th-content">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {httpMonitorList.map((httpMonitor, i) => (
                  <tr key={`entity-${i}`} className="table-row" data-cy="entityTable">
                    <td className="name-cell">
                      <div>
                        <strong
                          style={{
                            display: 'block',
                            wordWrap: 'break-word',
                          }}
                        >
                          {httpMonitor.name}
                        </strong>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="badge bg-info" style={{ fontSize: '0.65rem' }}>
                            {httpMonitor.method || 'GET'}
                          </span>
                          {httpMonitor.type && (
                            <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                              {httpMonitor.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="url-cell">
                      {httpMonitor.url ? (
                        <a href={httpMonitor.url} target="_blank" rel="noopener noreferrer" title={httpMonitor.url}>
                          {httpMonitor.url.length > 25 ? `${httpMonitor.url.substring(0, 25)}...` : httpMonitor.url}
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="schedule-cell">
                      {httpMonitor.schedule && httpMonitor.schedule.name ? (
                        <span>{httpMonitor.schedule.name}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="headers-cell">
                      {httpMonitor.headers ? (
                        <button
                          className="action-btn btn-headers"
                          title="View Headers"
                          onClick={() => handleViewHeaders(httpMonitor)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#0056b3' }}
                        >
                          <FontAwesomeIcon icon={faCode} />
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="body-cell">
                      {httpMonitor.body ? (
                        <button
                          className="action-btn btn-body"
                          title="View Body"
                          onClick={() => handleViewBody(httpMonitor)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#198754' }}
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
                        {httpMonitor.id && datacenterAssignments[httpMonitor.id] && datacenterAssignments[httpMonitor.id].length > 0 ? (
                          <>
                            {datacenterAssignments[httpMonitor.id].map((dc: any) => (
                              <span
                                key={dc.id}
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
                                <strong>{dc.name}</strong>
                                {dc.code && <span style={{ color: '#558b2f', fontSize: '0.55rem' }}>({dc.code})</span>}
                              </span>
                            ))}
                            <button
                              className="action-btn btn-assign"
                              title="Add Datacenters"
                              onClick={() => openAssignModal(httpMonitor)}
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
                              title="Add Datacenters"
                              onClick={() => openAssignModal(httpMonitor)}
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
                      <div className="action-buttons">
                        <button
                          className="action-btn btn-edit"
                          title="Edit"
                          onClick={() => handleEdit(httpMonitor)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                        <button
                          className="action-btn btn-delete"
                          title="Delete"
                          onClick={() => handleDelete(httpMonitor)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
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

          {totalItems ? (
            <div className="table-pagination">
              <div className="pagination-info">
                <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
              </div>
              <div className="pagination-controls">
                <JhiPagination
                  activePage={paginationState.activePage}
                  onSelect={handlePagination}
                  maxButtons={5}
                  itemsPerPage={paginationState.itemsPerPage}
                  totalItems={totalItems}
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </>
      ) : (
        !loading && <div className="alert alert-warning">No HTTP Monitors found</div>
      )}

      {/* Modals */}
      <HttpMonitorEditModal isOpen={editModalOpen} toggle={handleCloseEditModal} monitor={selectedMonitor} onSave={handleEditSuccess} />
      <HttpMonitorDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        monitor={selectedMonitor}
        onDelete={handleDeleteSuccess}
      />
      <BodyViewModal isOpen={bodyViewOpen} toggle={handleCloseBodyModal} monitor={selectedMonitor} />
      <HeadersViewModal isOpen={headersViewOpen} toggle={handleCloseHeadersModal} monitor={selectedMonitor} />

      {selectedMonitor && (
        <DatacenterMonitorAssign
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
