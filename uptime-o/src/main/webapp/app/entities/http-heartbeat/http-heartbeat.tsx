import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, Collapse } from 'reactstrap';
import { JhiItemCount, JhiPagination, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import HeartbeatDetails from './HeartbeatDetails';
import './http-heartbeat.scss';

import { getEntities } from './http-heartbeat.reducer';

export const HttpHeartbeat = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState({
    ...overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'executedAt'), pageLocation.search),
    order: DESC,
  });

  const apiHeartbeatList = useAppSelector(state => state.apiHeartbeat.entities);
  const loading = useAppSelector(state => state.apiHeartbeat.loading);
  const totalItems = useAppSelector(state => state.apiHeartbeat.totalItems);

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [collapsedMonitors, setCollapsedMonitors] = useState<Set<string>>(new Set());

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

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const getStatusClass = (record: any) => {
    if (!record.success) return 'failed';
    if (record.responseTimeMs >= (record.criticalThresholdMs || 1000)) return 'critical';
    if (record.responseTimeMs >= (record.warningThresholdMs || 500)) return 'warning';
    return 'healthy';
  };

  const groupedByMonitor = useMemo(() => {
    const monitorGroups = new Map<string, any[]>();
    apiHeartbeatList.forEach(record => {
      const monitorName = record.monitor?.name || 'Unknown Monitor';
      if (!monitorGroups.has(monitorName)) {
        monitorGroups.set(monitorName, []);
      }
      monitorGroups.get(monitorName).push(record);
    });

    const result = Array.from(monitorGroups.entries()).map(([monitorName, records], index) => {
      const agentGroups = new Map<string, any[]>();
      let healthy = 0,
        warning = 0,
        critical = 0,
        failed = 0;

      records.forEach(record => {
        const agentName = record.agent?.name || 'Unknown Agent';
        if (!agentGroups.has(agentName)) {
          agentGroups.set(agentName, []);
        }
        agentGroups.get(agentName).push(record);

        const status = getStatusClass(record);
        if (status === 'healthy') healthy++;
        else if (status === 'warning') warning++;
        else if (status === 'critical') critical++;
        else if (status === 'failed') failed++;
      });

      return {
        monitorName,
        statusCounts: { healthy, warning, critical, failed },
        agents: Array.from(agentGroups.entries()).map(([agentName, agentRecords]) => ({
          agentName,
          records: agentRecords.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()),
        })),
      };
    });

    if (result.length > 1 && collapsedMonitors.size === 0) {
      const collapsed = new Set(result.slice(1).map(m => m.monitorName));
      setCollapsedMonitors(collapsed);
    }

    return result;
  }, [apiHeartbeatList]);

  const openDetailModal = (record: any) => {
    setSelectedRecord(record);
  };

  const toggleMonitor = (monitorName: string) => {
    setCollapsedMonitors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monitorName)) {
        newSet.delete(monitorName);
      } else {
        newSet.add(monitorName);
      }
      return newSet;
    });
  };

  return (
    <div className="http-heartbeat-page">
      <div className="page-header">
        <div className="header-left">
          <h2>HTTP Heartbeats</h2>
          <Button color="info" size="sm" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh
          </Button>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot healthy"></div>
            <span>Healthy</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot warning"></div>
            <span>Warning</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot critical"></div>
            <span>Critical</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot failed"></div>
            <span>Failed</span>
          </div>
        </div>
      </div>

      <div className="heartbeat-cards-section">
        <div className="monitor-cards-container">
          {groupedByMonitor.map(({ monitorName, statusCounts, agents }) => (
            <div key={monitorName} className="monitor-card">
              <div className="monitor-card-header" onClick={() => toggleMonitor(monitorName)}>
                <h3 className="monitor-card-title">{monitorName}</h3>
                <div className="header-right">
                  <div className="status-indicators">
                    {statusCounts.healthy > 0 && <span className="status-badge healthy">{statusCounts.healthy}</span>}
                    {statusCounts.warning > 0 && <span className="status-badge warning">{statusCounts.warning}</span>}
                    {statusCounts.critical > 0 && <span className="status-badge critical">{statusCounts.critical}</span>}
                    {statusCounts.failed > 0 && <span className="status-badge failed">{statusCounts.failed}</span>}
                  </div>
                  <FontAwesomeIcon icon={collapsedMonitors.has(monitorName) ? 'chevron-down' : 'chevron-up'} />
                </div>
              </div>
              <Collapse isOpen={!collapsedMonitors.has(monitorName)}>
                <div className="agent-groups">
                  {agents.map(({ agentName, records }) => (
                    <div key={agentName} className="agent-group">
                      <h4 className="agent-group-title">{agentName}</h4>
                      <div className="squares-grid">
                        {records.map((record, index) => (
                          <div
                            key={record.id || index}
                            className={`status-square ${getStatusClass(record)} ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                            title={`${new Date(record.executedAt).toLocaleString()} - ${record.responseTimeMs}ms`}
                            onClick={() => openDetailModal(record)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selectedRecord} toggle={() => setSelectedRecord(null)} size="lg">
        <ModalHeader toggle={() => setSelectedRecord(null)}>Heartbeat Details</ModalHeader>
        <ModalBody>{selectedRecord && <HeartbeatDetails record={selectedRecord} onClose={() => setSelectedRecord(null)} />}</ModalBody>
      </Modal>

      {totalItems > 0 && (
        <div
          className="justify-content-center d-flex"
          style={{ marginTop: '20px', gap: '20px', flexDirection: 'column', alignItems: 'center' }}
        >
          <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          <JhiPagination
            activePage={paginationState.activePage}
            onSelect={handlePagination}
            maxButtons={5}
            itemsPerPage={paginationState.itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
};

export default HttpHeartbeat;
