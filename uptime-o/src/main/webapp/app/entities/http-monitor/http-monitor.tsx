import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faEye, faPencil, faLink, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './http-monitor.reducer';
import DatacenterMonitorAssign from './datacenter-monitor-assign';
import 'app/shared/custom.scss';

export const HttpMonitor = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<any>(null);

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const httpMonitorList = useAppSelector(state => state.httpMonitor.entities);
  const loading = useAppSelector(state => state.httpMonitor.loading);
  const totalItems = useAppSelector(state => state.httpMonitor.totalItems);

  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
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

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const openAssignModal = (monitor: any) => {
    setSelectedMonitor(monitor);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedMonitor(null);
  };

  const handleAssignSave = () => {
    // Refresh list after assignments are saved
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  return (
    <div>
      <h2 id="http-monitor-heading" data-cy="HttpMonitorHeading">
        HTTP Monitors
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh list
          </Button>
          <Link to="/http-monitor/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create a new HTTP Monitor
          </Link>
        </div>
      </h2>
      <div className="entity-list-container">
        {httpMonitorList && httpMonitorList.length > 0 ? (
          <div className="table-responsive">
            <table className="entity-table">
              <thead>
                <tr>
                  <th className="hand" onClick={sort('name')}>
                    Name <FontAwesomeIcon icon={getSortIconByFieldName('name')} />
                  </th>
                  <th className="hand" onClick={sort('url')}>
                    URL <FontAwesomeIcon icon={getSortIconByFieldName('url')} />
                  </th>
                  <th className="hand" onClick={sort('method')}>
                    Method <FontAwesomeIcon icon={getSortIconByFieldName('method')} />
                  </th>
                  <th className="hand" onClick={sort('type')}>
                    Type <FontAwesomeIcon icon={getSortIconByFieldName('type')} />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {httpMonitorList.map((httpMonitor, i) => (
                  <tr key={`entity-${i}`} data-cy="entityTable">
                    <td className="name-cell">
                      <strong>{httpMonitor.name}</strong>
                    </td>
                    <td className="metadata-cell">
                      {httpMonitor.url ? (
                        <a href={httpMonitor.url} target="_blank" rel="noopener noreferrer" title={httpMonitor.url}>
                          {httpMonitor.url.length > 25 ? `${httpMonitor.url.substring(0, 25)}...` : httpMonitor.url}
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="method-cell">
                      <span className="badge bg-info">{httpMonitor.method || 'GET'}</span>
                    </td>
                    <td className="method-cell">
                      <span className="badge bg-secondary">{httpMonitor.type || '-'}</span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <Link to={`/http-monitor/${httpMonitor.id}`} className="action-btn btn-view" title="View">
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <Link
                          to={`/http-monitor/${httpMonitor.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                          className="action-btn btn-edit"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </Link>
                        <button
                          className="action-btn btn-assign"
                          title="Assign to Datacenters"
                          onClick={() => openAssignModal(httpMonitor)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FontAwesomeIcon icon={faLink} />
                        </button>
                        <Link
                          to={`/http-monitor/${httpMonitor.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                          className="action-btn btn-delete"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <div className="alert alert-warning">No HTTP Monitors found</div>
        )}
      </div>
      {totalItems ? (
        <div className={httpMonitorList && httpMonitorList.length > 0 ? '' : 'd-none'}>
          <div className="justify-content-center d-flex">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </div>
          <div className="justify-content-center d-flex">
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
