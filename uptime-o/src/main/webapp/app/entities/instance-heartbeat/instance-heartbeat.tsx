import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faHeartbeat, faSync } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { getEntities } from './instance-heartbeat.reducer';
import '../entity.scss';

export const InstanceHeartbeat = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const instanceHeartbeatList = useAppSelector(state => state.instanceHeartbeat.entities);
  const loading = useAppSelector(state => state.instanceHeartbeat.loading);
  const totalItems = useAppSelector(state => state.instanceHeartbeat.totalItems);

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

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      UP: 'success',
      DOWN: 'danger',
      WARNING: 'warning',
      DANGER: 'danger',
      DEGRADED: 'warning',
      TIMEOUT: 'secondary',
    };
    return <Badge color={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="instance-heartbeats-page">
      <div className="instance-heartbeats-header">
        <div className="header-content">
          <h1 id="instance-heartbeat-heading">
            <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
            Instance Heartbeats
          </h1>
        </div>
        <div className="header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} outline>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
        </div>
      </div>

      {instanceHeartbeatList && instanceHeartbeatList.length > 0 ? (
        <>
          <div className="smart-table-wrapper">
            <table className="smart-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={sort('id')}>
                    <span className="th-content">
                      ID
                      <FontAwesomeIcon icon={getSortIconByFieldName('id')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('executedAt')}>
                    <span className="th-content">
                      Executed At
                      <FontAwesomeIcon icon={getSortIconByFieldName('executedAt')} className="ms-1" />
                    </span>
                  </th>
                  <th>
                    <span className="th-content">Instance</span>
                  </th>
                  <th>
                    <span className="th-content">Type</span>
                  </th>
                  <th>
                    <span className="th-content">Status</span>
                  </th>
                  <th>
                    <span className="th-content">Response Time</span>
                  </th>
                  <th>
                    <span className="th-content">Metrics</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {instanceHeartbeatList.map((heartbeat, i) => (
                  <tr key={`entity-${i}`} className="table-row">
                    <td className="id-cell">
                      <span className="badge bg-secondary">{heartbeat.id}</span>
                    </td>
                    <td>
                      <TextFormat type="date" value={heartbeat.executedAt} format={APP_DATE_FORMAT} />
                    </td>
                    <td>{heartbeat.instanceId}</td>
                    <td>
                      <Badge color={heartbeat.heartbeatType === 'PING' ? 'info' : 'primary'}>{heartbeat.heartbeatType}</Badge>
                    </td>
                    <td>{getStatusBadge(heartbeat.status)}</td>
                    <td>
                      {heartbeat.heartbeatType === 'PING' && heartbeat.responseTimeMs ? (
                        <span className="text-success">{heartbeat.responseTimeMs}ms</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {heartbeat.heartbeatType === 'HARDWARE' ? (
                        <small>
                          CPU: {heartbeat.cpuUsage?.toFixed(1)}% | MEM: {heartbeat.memoryUsage?.toFixed(1)}% | DISK:{' '}
                          {heartbeat.diskUsage?.toFixed(1)}%
                        </small>
                      ) : heartbeat.heartbeatType === 'PING' ? (
                        <small>
                          Loss: {heartbeat.packetLoss?.toFixed(1)}% | Jitter: {heartbeat.jitterMs}ms
                        </small>
                      ) : (
                        '-'
                      )}
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
        !loading && <div className="alert alert-warning">No Heartbeats found</div>
      )}
    </div>
  );
};

export default InstanceHeartbeat;
