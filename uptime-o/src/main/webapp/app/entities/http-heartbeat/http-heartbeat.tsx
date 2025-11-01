import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { JhiItemCount, JhiPagination, TextFormat, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './http-heartbeat.reducer';

export const ApiHeartbeat = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const apiHeartbeatList = useAppSelector(state => state.apiHeartbeat.entities);
  const loading = useAppSelector(state => state.apiHeartbeat.loading);
  const totalItems = useAppSelector(state => state.apiHeartbeat.totalItems);

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
    <div>
      <h2 id="api-heartbeat-heading" data-cy="ApiHeartbeatHeading">
        HTTP Heartbeats
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh list
          </Button>
          <Link to="/http-heartbeats/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create a new HTTP Heartbeat
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {apiHeartbeatList && apiHeartbeatList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th className="hand" onClick={sort('id')}>
                  ID <FontAwesomeIcon icon={getSortIconByFieldName('id')} />
                </th>
                <th className="hand" onClick={sort('executedAt')}>
                  Executed At <FontAwesomeIcon icon={getSortIconByFieldName('executedAt')} />
                </th>
                <th className="hand" onClick={sort('success')}>
                  Success <FontAwesomeIcon icon={getSortIconByFieldName('success')} />
                </th>
                <th className="hand" onClick={sort('responseTimeMs')}>
                  Response Time Ms <FontAwesomeIcon icon={getSortIconByFieldName('responseTimeMs')} />
                </th>
                <th className="hand" onClick={sort('responseSizeBytes')}>
                  Response Size Bytes <FontAwesomeIcon icon={getSortIconByFieldName('responseSizeBytes')} />
                </th>
                <th className="hand" onClick={sort('responseStatusCode')}>
                  Response Status Code <FontAwesomeIcon icon={getSortIconByFieldName('responseStatusCode')} />
                </th>
                <th className="hand" onClick={sort('responseContentType')}>
                  Response Content Type <FontAwesomeIcon icon={getSortIconByFieldName('responseContentType')} />
                </th>
                <th className="hand" onClick={sort('responseServer')}>
                  Response Server <FontAwesomeIcon icon={getSortIconByFieldName('responseServer')} />
                </th>
                <th className="hand" onClick={sort('responseCacheStatus')}>
                  Response Cache Status <FontAwesomeIcon icon={getSortIconByFieldName('responseCacheStatus')} />
                </th>
                <th className="hand" onClick={sort('dnsLookupMs')}>
                  Dns Lookup Ms <FontAwesomeIcon icon={getSortIconByFieldName('dnsLookupMs')} />
                </th>
                <th className="hand" onClick={sort('tcpConnectMs')}>
                  Tcp Connect Ms <FontAwesomeIcon icon={getSortIconByFieldName('tcpConnectMs')} />
                </th>
                <th className="hand" onClick={sort('tlsHandshakeMs')}>
                  Tls Handshake Ms <FontAwesomeIcon icon={getSortIconByFieldName('tlsHandshakeMs')} />
                </th>
                <th className="hand" onClick={sort('timeToFirstByteMs')}>
                  Time To First Byte Ms <FontAwesomeIcon icon={getSortIconByFieldName('timeToFirstByteMs')} />
                </th>
                <th className="hand" onClick={sort('warningThresholdMs')}>
                  Warning Threshold Ms <FontAwesomeIcon icon={getSortIconByFieldName('warningThresholdMs')} />
                </th>
                <th className="hand" onClick={sort('criticalThresholdMs')}>
                  Critical Threshold Ms <FontAwesomeIcon icon={getSortIconByFieldName('criticalThresholdMs')} />
                </th>
                <th className="hand" onClick={sort('errorType')}>
                  Error Type <FontAwesomeIcon icon={getSortIconByFieldName('errorType')} />
                </th>
                <th className="hand" onClick={sort('errorMessage')}>
                  Error Message <FontAwesomeIcon icon={getSortIconByFieldName('errorMessage')} />
                </th>
                <th className="hand" onClick={sort('rawRequestHeaders')}>
                  Raw Request Headers <FontAwesomeIcon icon={getSortIconByFieldName('rawRequestHeaders')} />
                </th>
                <th className="hand" onClick={sort('rawResponseHeaders')}>
                  Raw Response Headers <FontAwesomeIcon icon={getSortIconByFieldName('rawResponseHeaders')} />
                </th>
                <th className="hand" onClick={sort('rawResponseBody')}>
                  Raw Response Body <FontAwesomeIcon icon={getSortIconByFieldName('rawResponseBody')} />
                </th>
                <th>
                  Monitor <FontAwesomeIcon icon="sort" />
                </th>
                <th>
                  Agent <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {apiHeartbeatList.map((apiHeartbeat, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/http-heartbeats/${apiHeartbeat.id}`} color="link" size="sm">
                      {apiHeartbeat.id}
                    </Button>
                  </td>
                  <td>
                    {apiHeartbeat.executedAt ? <TextFormat type="date" value={apiHeartbeat.executedAt} format={APP_DATE_FORMAT} /> : null}
                  </td>
                  <td>{apiHeartbeat.success ? 'true' : 'false'}</td>
                  <td>{apiHeartbeat.responseTimeMs}</td>
                  <td>{apiHeartbeat.responseSizeBytes}</td>
                  <td>{apiHeartbeat.responseStatusCode}</td>
                  <td>{apiHeartbeat.responseContentType}</td>
                  <td>{apiHeartbeat.responseServer}</td>
                  <td>{apiHeartbeat.responseCacheStatus}</td>
                  <td>{apiHeartbeat.dnsLookupMs}</td>
                  <td>{apiHeartbeat.tcpConnectMs}</td>
                  <td>{apiHeartbeat.tlsHandshakeMs}</td>
                  <td>{apiHeartbeat.timeToFirstByteMs}</td>
                  <td>{apiHeartbeat.warningThresholdMs}</td>
                  <td>{apiHeartbeat.criticalThresholdMs}</td>
                  <td>{apiHeartbeat.errorType}</td>
                  <td>{apiHeartbeat.errorMessage}</td>
                  <td>{apiHeartbeat.rawRequestHeaders}</td>
                  <td>{apiHeartbeat.rawResponseHeaders}</td>
                  <td>{apiHeartbeat.rawResponseBody}</td>
                  <td>
                    {apiHeartbeat.monitor ? <Link to={`/http-monitor/${apiHeartbeat.monitor.id}`}>{apiHeartbeat.monitor.id}</Link> : ''}
                  </td>
                  <td>{apiHeartbeat.agent ? <Link to={`/agent/${apiHeartbeat.agent.id}`}>{apiHeartbeat.agent.id}</Link> : ''}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/http-heartbeats/${apiHeartbeat.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`/http-heartbeats/${apiHeartbeat.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        onClick={() =>
                          (window.location.href = `/http-heartbeats/${apiHeartbeat.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`)
                        }
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No HTTP Heartbeats found</div>
        )}
      </div>
      {totalItems ? (
        <div className={apiHeartbeatList && apiHeartbeatList.length > 0 ? '' : 'd-none'}>
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
    </div>
  );
};

export default ApiHeartbeat;
