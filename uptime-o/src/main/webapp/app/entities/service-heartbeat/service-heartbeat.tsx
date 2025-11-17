import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faHeartbeat, faSync, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { getEntities } from './service-heartbeat.reducer';
import '../entity.scss';

export const ServiceHeartbeat = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState({
    ...overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'executedAt'), pageLocation.search),
    order: DESC,
  });

  const serviceHeartbeatList = useAppSelector(state => state.serviceHeartbeat.entities);
  const loading = useAppSelector(state => state.serviceHeartbeat.loading);
  const totalItems = useAppSelector(state => state.serviceHeartbeat.totalItems);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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
      CRITICAL: 'danger',
      DEGRADED: 'warning',
      TIMEOUT: 'secondary',
    };
    return <Badge color={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const toggleRowExpansion = (heartbeatId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(heartbeatId)) {
      newExpandedRows.delete(heartbeatId);
    } else {
      newExpandedRows.add(heartbeatId);
    }
    setExpandedRows(newExpandedRows);
  };

  const renderClusterMetadata = (metadata: any) => {
    if (!metadata) return null;

    const cluster = metadata.cluster || {};
    const stats = metadata.stats || {};
    const memory = metadata.memory || {};
    const server = metadata.server || {};
    const totalKeys = metadata.total_keys || 0;
    const connectedNode = metadata.connected_node || 'unknown';

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number): string => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    return (
      <div className="cluster-metadata">
        {/* Cluster Status */}
        <div className="mb-3">
          <h6 className="text-muted mb-2">Cluster Status</h6>
          <div className="row">
            <div className="col-md-3">
              <small>
                <strong>State:</strong>{' '}
                <Badge color={cluster.cluster_state === 'ok' ? 'success' : 'danger'}>
                  {(cluster.cluster_state || 'unknown').toUpperCase()}
                </Badge>
              </small>
            </div>
            <div className="col-md-3">
              <small>
                <strong>Masters:</strong> {cluster.cluster_size || 0}
              </small>
            </div>
            <div className="col-md-3">
              <small>
                <strong>Total Nodes:</strong> {cluster.cluster_known_nodes || 0}
              </small>
            </div>
            <div className="col-md-3">
              <small>
                <strong>Total Keys:</strong> {totalKeys.toLocaleString()}
              </small>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-4">
              <small>
                <strong>Slots Assigned:</strong> {cluster.cluster_slots_assigned || 0}/16384
              </small>
            </div>
            <div className="col-md-4">
              <small>
                <strong>Slots Failed:</strong> {cluster.cluster_slots_fail || 0}
              </small>
            </div>
            <div className="col-md-4">
              <small>
                <strong>Connected Node:</strong> {connectedNode}
              </small>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="mb-3">
            <h6 className="text-muted mb-2">Performance</h6>
            <div className="row">
              <div className="col-md-3">
                <small>
                  <strong>Commands:</strong> {(stats.total_commands_processed || 0).toLocaleString()}
                </small>
              </div>
              <div className="col-md-3">
                <small>
                  <strong>Ops/sec:</strong> {stats.instantaneous_ops_per_sec || 0}
                </small>
              </div>
              <div className="col-md-3">
                <small>
                  <strong>Hits:</strong> {(stats.keyspace_hits || 0).toLocaleString()}
                </small>
              </div>
              <div className="col-md-3">
                <small>
                  <strong>Misses:</strong> {(stats.keyspace_misses || 0).toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Memory & Server Info */}
        <div className="row">
          {Object.keys(memory).length > 0 && (
            <div className="col-md-6">
              <h6 className="text-muted mb-2">Memory</h6>
              <small>
                <strong>Used:</strong> {formatBytes(memory.used_memory || 0)}
              </small>
              <br />
              <small>
                <strong>Peak:</strong> {formatBytes(memory.used_memory_peak || 0)}
              </small>
              <br />
              <small>
                <strong>Fragmentation:</strong>{' '}
                <Badge color={memory.mem_fragmentation_ratio > 2 ? 'warning' : 'success'}>
                  {(memory.mem_fragmentation_ratio || 1).toFixed(2)}
                </Badge>
              </small>
            </div>
          )}
          {Object.keys(server).length > 0 && (
            <div className="col-md-6">
              <h6 className="text-muted mb-2">Server</h6>
              <small>
                <strong>Version:</strong> {server.redis_version || 'unknown'}
              </small>
              <br />
              <small>
                <strong>Uptime:</strong> {formatUptime(server.uptime_in_seconds || 0)}
              </small>
              <br />
              <small>
                <strong>Clients:</strong> {server.connected_clients || 0} connected, {server.blocked_clients || 0} blocked
              </small>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="instance-heartbeats-page">
      <div className="instance-heartbeats-header">
        <div className="header-content">
          <h1 id="service-heartbeat-heading">
            <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
            Service Heartbeats
          </h1>
        </div>
        <div className="header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} outline>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
        </div>
      </div>

      {serviceHeartbeatList && serviceHeartbeatList.length > 0 ? (
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
                    <span className="th-content">Service</span>
                  </th>
                  <th>
                    <span className="th-content">Type</span>
                  </th>
                  <th>
                    <span className="th-content">Instance</span>
                  </th>
                  <th>
                    <span className="th-content">Status</span>
                  </th>
                  <th>
                    <span className="th-content">Response Time</span>
                  </th>
                  <th>
                    <span className="th-content">Agent</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceHeartbeatList.map((heartbeat, i) => (
                  <React.Fragment key={`entity-${i}`}>
                    <tr className="table-row">
                      <td className="id-cell">
                        <div className="d-flex align-items-center">
                          {!heartbeat.instanceName && heartbeat.metadata && (
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => toggleRowExpansion(heartbeat.id)}
                              style={{ padding: 0, marginRight: '0.5rem' }}
                            >
                              <FontAwesomeIcon icon={expandedRows.has(heartbeat.id) ? faChevronDown : faChevronRight} />
                            </Button>
                          )}
                          <span className="badge bg-secondary">{heartbeat.id}</span>
                        </div>
                      </td>
                      <td>
                        <TextFormat type="date" value={heartbeat.executedAt} format={APP_DATE_FORMAT} />
                      </td>
                      <td>{heartbeat.serviceName || `Service ${heartbeat.serviceId}`}</td>
                      <td>{heartbeat.instanceName ? <Badge color="secondary">TCP</Badge> : <Badge color="primary">CLUSTER</Badge>}</td>
                      <td>
                        {heartbeat.instanceName ? (
                          <div>
                            <div>{heartbeat.instanceName}</div>
                            <small className="text-muted">Port: {heartbeat.instancePort}</small>
                          </div>
                        ) : (
                          <span className="text-muted">Cluster-wide</span>
                        )}
                      </td>
                      <td>{getStatusBadge(heartbeat.status)}</td>
                      <td>{heartbeat.responseTimeMs ? <span className="text-success">{heartbeat.responseTimeMs}ms</span> : '-'}</td>
                      <td>{heartbeat.agentId || '-'}</td>
                    </tr>
                    {!heartbeat.instanceName && heartbeat.metadata && expandedRows.has(heartbeat.id) && (
                      <tr>
                        <td colSpan={8} style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>
                          <h6>Cluster Details</h6>
                          {renderClusterMetadata(heartbeat.metadata)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
        !loading && <div className="alert alert-warning">No Service Heartbeats found</div>
      )}
    </div>
  );
};

export default ServiceHeartbeat;
