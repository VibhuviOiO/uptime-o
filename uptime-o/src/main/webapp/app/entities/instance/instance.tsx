import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faServer, faPencil, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities } from './instance.reducer';

import '../entity.scss';

export const Instance = () => {
  const dispatch = useAppDispatch();
  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const instanceList = useAppSelector(state => state.instance.entities);
  const loading = useAppSelector(state => state.instance.loading);
  const totalItems = useAppSelector(state => state.instance.totalItems);

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

  return (
    <div className="instances-page">
      <div className="instances-header">
        <div className="header-content">
          <h1 id="instance-heading">
            <FontAwesomeIcon icon={faServer} className="me-2" />
            Instances
          </h1>
        </div>
        <div className="header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} outline>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </Button>
        </div>
      </div>

      {instanceList && instanceList.length > 0 ? (
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
                  <th className="sortable" onClick={sort('name')}>
                    <span className="th-content">
                      Name
                      <FontAwesomeIcon icon={getSortIconByFieldName('name')} className="ms-1" />
                    </span>
                  </th>
                  <th className="sortable" onClick={sort('hostname')}>
                    <span className="th-content">
                      Hostname
                      <FontAwesomeIcon icon={getSortIconByFieldName('hostname')} className="ms-1" />
                    </span>
                  </th>
                  <th>
                    <span className="th-content">Type</span>
                  </th>
                  <th>
                    <span className="th-content">Monitoring Type</span>
                  </th>
                  <th>
                    <span className="th-content">Checks</span>
                  </th>
                  <th>
                    <span className="th-content">OS/Platform</span>
                  </th>
                  <th>
                    <span className="th-content">IP Address</span>
                  </th>
                  <th>
                    <span className="th-content">Datacenter</span>
                  </th>
                  <th className="actions-column">
                    <span className="th-content">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {instanceList.map((instance, i) => (
                  <tr key={`entity-${i}`} className="table-row">
                    <td className="id-cell">
                      <span className="badge bg-secondary">{instance.id}</span>
                    </td>
                    <td className="name-cell">
                      <strong>{instance.name}</strong>
                      {instance.description && (
                        <>
                          <br />
                          <small className="text-muted">{instance.description}</small>
                        </>
                      )}
                    </td>
                    <td className="hostname-cell">
                      <code className="code-badge">{instance.hostname}</code>
                    </td>
                    <td>
                      <Badge color="info">{instance.instanceType}</Badge>
                    </td>
                    <td>
                      <Badge color={instance.monitoringType === 'SELF_HOSTED' ? 'secondary' : 'warning'}>
                        {instance.monitoringType === 'SELF_HOSTED' ? 'Self Hosted' : 'Agent Monitored'}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        {instance.pingEnabled && (
                          <Badge
                            color="success"
                            className="me-1"
                            title={`Interval: ${instance.pingInterval}s, Timeout: ${instance.pingTimeoutMs}ms, Retry: ${instance.pingRetryCount}`}
                          >
                            Ping
                          </Badge>
                        )}
                        {instance.hardwareMonitoringEnabled && (
                          <Badge
                            color="primary"
                            title={`Interval: ${instance.hardwareMonitoringInterval}s, CPU: ${instance.cpuWarningThreshold}%/${instance.cpuDangerThreshold}%, Memory: ${instance.memoryWarningThreshold}%/${instance.memoryDangerThreshold}%, Disk: ${instance.diskWarningThreshold}%/${instance.diskDangerThreshold}%`}
                          >
                            Hardware
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      {instance.operatingSystem && <div>{instance.operatingSystem}</div>}
                      {instance.platform && <small className="text-muted">{instance.platform}</small>}
                      {!instance.operatingSystem && !instance.platform && '-'}
                    </td>
                    <td>
                      {instance.privateIpAddress && (
                        <div>
                          <code>{instance.privateIpAddress}</code>
                        </div>
                      )}
                      {instance.publicIpAddress && <small className="text-muted">{instance.publicIpAddress}</small>}
                      {!instance.privateIpAddress && !instance.publicIpAddress && '-'}
                    </td>
                    <td className="datacenter-cell">{instance.datacenterName || '-'}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <Button size="sm" color="primary" tag="a" href={`/instance/${instance.id}/edit`} className="me-1">
                          <FontAwesomeIcon icon={faPencil} />
                        </Button>
                        <Button size="sm" color="danger" tag="a" href={`/instance/${instance.id}/delete`}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
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
        !loading && <div className="alert alert-warning">No Instances found</div>
      )}
    </div>
  );
};

export default Instance;
