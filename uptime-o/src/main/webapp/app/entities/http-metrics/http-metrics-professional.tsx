import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Table, Card, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faFilter, faChartLine, faServer, faEllipsisV, faHistory, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { HttpMetricsService } from './http-metrics.service';
import { HttpMetricsDTO } from './http-metrics.model';
import axios from 'axios';

import MonitorHistoryModal from '../http-monitor-detail/MonitorHistoryModal';
import './http-metrics-professional.scss';

export const HttpMetricsProfessional = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<HttpMetricsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [timeRange, setTimeRange] = useState('30m');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState('');
  const [selectedMonitorId, setSelectedMonitorId] = useState(0);
  const [agentMetricsData, setAgentMetricsData] = useState<Record<string, Map<string, any>>>({});
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 50;
  useEffect(() => {
    fetchMetrics();
  }, [timeRange, searchTerm, selectedRegion]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startTime: Date;

      switch (timeRange) {
        case '5m':
          startTime = new Date(now.getTime() - 5 * 60 * 1000);
          break;
        case '15m':
          startTime = new Date(now.getTime() - 15 * 60 * 1000);
          break;
        case '30m':
          startTime = new Date(now.getTime() - 30 * 60 * 1000);
          break;
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '4h':
          startTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '2d':
          startTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 30 * 60 * 1000);
      }

      const data = await HttpMetricsService.getAggregatedMetricsPaginated({
        page: 0,
        size: 1000,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        search: searchTerm || undefined,
        region: selectedRegion || undefined,
      });
      const metricsData = Array.isArray(data) ? data : data.content;
      setMetrics(metricsData);

      // Update all regions list when new data is fetched
      const uniqueRegions = Array.from(new Set(metricsData.map((m: any) => m.regionName).filter(Boolean)));
      setAllRegions(uniqueRegions);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = useMemo(() => {
    return metrics.filter(
      metric =>
        metric.monitorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedRegion === '' || metric.regionName === selectedRegion),
    );
  }, [metrics, searchTerm, selectedRegion]);

  // Paginate filtered metrics
  const paginatedMetrics = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredMetrics.slice(start, start + PAGE_SIZE);
  }, [filteredMetrics, currentPage]);

  const totalPages = Math.ceil(filteredMetrics.length / PAGE_SIZE);

  const getStatusBadge = (success: boolean, latency: number, lastCheckedTime: string | null, currentTimeRange: string) => {
    // No data available
    if (!lastCheckedTime) return { class: 'status-stale', text: 'NO DATA' };

    // Check if data is stale (outside selected time range)
    const lastCheck = new Date(lastCheckedTime);
    const now = new Date();
    const timeDiff = now.getTime() - lastCheck.getTime();
    const fiveMinutes = 5 * 60 * 1000; // Always use 5 minutes for staleness check

    if (timeDiff > fiveMinutes) return { class: 'status-stale', text: 'OFFLINE' };

    // Agent is online and reporting - check last result
    if (!success) return { class: 'status-down', text: 'FAILED' };
    return { class: 'status-up', text: 'ONLINE' };
  };

  const formatLastChecked = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  useEffect(() => {
    setAgentMetricsData({});
  }, [timeRange, selectedRegion]);

  useEffect(() => {
    // Fetch agent metrics for all monitors in ONE batch call
    if (metrics.length > 0) {
      const uniqueMonitorIds = Array.from(new Set(metrics.map(m => m.monitorId)));
      fetchBatchAgentMetrics(uniqueMonitorIds);
    }
  }, [metrics]);

  const fetchBatchAgentMetrics = async (monitorIds: number[]) => {
    try {
      const params = {
        monitorIds: monitorIds.join(','),
        timeRange,
        agentRegion: selectedRegion !== '' ? selectedRegion : undefined,
      };
      const response = await axios.get('/api/http-monitors/batch', { params });
      const batchData = response.data;

      const newAgentMetricsData: Record<string, Map<string, any>> = {};

      Object.entries(batchData).forEach(([monitorId, data]: [string, any]) => {
        if (data.agentMetrics && data.agentMetrics.length > 0) {
          const agentMap: Map<string, any> = new Map(data.agentMetrics.map((a: any) => [a.agentName, a]));
          newAgentMetricsData[monitorId] = agentMap;
        }
      });

      setAgentMetricsData(newAgentMetricsData);
    } catch (error) {
      console.error('Error fetching batch agent metrics:', error);
    }
  };

  const fetchHistoryData = async (monitorId: number, agentName: string) => {
    try {
      const params = { timeRange, agentRegion: selectedRegion !== '' ? selectedRegion : undefined };
      const response = await axios.get(`/api/http-monitors/${monitorId}/complete`, { params });
      const data = response.data;

      if (data.timeSeriesData && data.timeSeriesData.length > 0) {
        setHistoryRecords(data.timeSeriesData.filter((record: any) => record.agentName === agentName));
      } else {
        setHistoryRecords([]);
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
      setHistoryRecords([]);
    }
  };

  return (
    <div className="http-metrics-professional">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <FontAwesomeIcon icon={faChartLine} className="title-icon" />
            API Monitoring
          </h1>
        </div>
        <div className="header-actions">
          <Button color="secondary" outline size="sm" onClick={fetchMetrics} disabled={loading} className="refresh-button">
            <FontAwesomeIcon icon={faSync} spin={loading} />
          </Button>
        </div>
      </div>

      {/* Filters Section - Full Width Layout */}
      <div className="filters-section mb-4">
        <div className="filters-container">
          <div className="filter-group search-group">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group region-group">
            <Input
              type="select"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="region-select"
              bsSize="sm"
            >
              <option value="">All Regions</option>
              {allRegions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Input>
          </div>

          <div className="filter-group time-range-group">
            <div className="time-range-buttons">
              {['5m', '15m', '30m', '1h', '4h', '24h', '2d', '7d', '30d'].map(range => (
                <Button
                  key={range}
                  color={timeRange === range ? 'primary' : 'secondary'}
                  size="sm"
                  outline={timeRange !== range}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <div className="filter-group actions-group">
            <div className="action-buttons">
              <Button
                color="secondary"
                outline
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('');
                  setTimeRange('30m');
                }}
                className="action-btn"
              >
                <FontAwesomeIcon icon={faFilter} /> Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <Card className="services-table-card">
        <CardBody className="p-3">
          <div className="table-header mb-3">
            <h6 className="table-title mb-0">Service Status Overview</h6>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading service data...</p>
            </div>
          ) : filteredMetrics.length === 0 ? (
            <div className="empty-container">
              <FontAwesomeIcon icon={faServer} className="empty-icon" />
              <h6>No Services Found</h6>
              <p>No services match your current filters. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="services-table table-sm" hover>
                <thead className="table-light">
                  <tr>
                    <th className="small">Service Name</th>
                    <th className="small">Status</th>
                    <th className="small">Region</th>
                    <th className="small">Datacenter</th>
                    <th className="small">Agent</th>
                    <th className="small">Checks</th>
                    <th className="small">Latest Latency</th>

                    <th className="small">Last Checked</th>
                    <th className="small">Uptime</th>
                    <th className="small">P95</th>
                    <th className="small">P99</th>
                    <th className="small"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMetrics.map(metric => {
                    const rowKey = `${metric.monitorId}-${metric.agentName}`;
                    const status = getStatusBadge(metric.lastSuccess, metric.lastLatencyMs, metric.lastCheckedTime, timeRange);
                    const isStale = status.class === 'status-stale';

                    const agentMap = agentMetricsData[metric.monitorId];
                    const agentData = agentMap?.get(metric.agentName);
                    const totalChecks = agentData?.totalChecks ?? 0;
                    const uptime = agentData?.uptimePercentage ?? 0;
                    const p95 = agentData?.p95ResponseTime ?? 0;
                    const p99 = agentData?.p99ResponseTime ?? 0;

                    return (
                      <React.Fragment key={rowKey}>
                        <tr className={`service-row ${isStale ? 'stale-row' : ''}`}>
                          <td>
                            <div className="service-name">
                              <strong>{metric.monitorName}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${status.class}`}>{status.text}</span>
                          </td>
                          <td>
                            <span className="region-name">{metric.regionName || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="datacenter-name">{metric.datacenterName || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="agent-name">{metric.agentName || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="text-muted small">{totalChecks}</span>
                          </td>
                          <td>
                            <span className="text-muted small">{metric.lastLatencyMs ? `${metric.lastLatencyMs}ms` : 'N/A'}</span>
                          </td>

                          <td>
                            <span className="last-checked text-muted small">{formatLastChecked(metric.lastCheckedTime)}</span>
                          </td>
                          <td>
                            <span className="text-success small">{uptime.toFixed(1)}%</span>
                          </td>
                          <td>
                            <span className="text-muted small">{Math.round(p95)}ms</span>
                          </td>
                          <td>
                            <span className="text-muted small">{Math.round(p99)}ms</span>
                          </td>
                          <td>
                            <Dropdown
                              isOpen={dropdownOpen[rowKey] || false}
                              toggle={() => setDropdownOpen(prev => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                            >
                              <DropdownToggle color="link" size="sm" className="actions-dropdown">
                                <FontAwesomeIcon icon={faEllipsisV} />
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem onClick={() => navigate(`/http-monitor-detail/${metric.monitorId}`)}>
                                  <FontAwesomeIcon icon={faChartBar} className="me-2" />
                                  View Charts & Metrics
                                </DropdownItem>
                                <DropdownItem
                                  onClick={async () => {
                                    setSelectedAgentName(metric.agentName);
                                    setSelectedMonitorId(metric.monitorId);
                                    await fetchHistoryData(metric.monitorId, metric.agentName);
                                    setIsHistoryModalOpen(true);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faHistory} className="me-2" />
                                  View History
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
          {!loading && filteredMetrics.length > PAGE_SIZE && (
            <div className="d-flex justify-content-between align-items-center mt-3 px-3">
              <div className="text-muted small">
                Showing {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, filteredMetrics.length)} of{' '}
                {filteredMetrics.length}
              </div>
              <div className="btn-group">
                <Button size="sm" outline disabled={currentPage === 0} onClick={() => setCurrentPage(0)}>
                  First
                </Button>
                <Button size="sm" outline disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                  Prev
                </Button>
                <Button size="sm" outline disabled>
                  {currentPage + 1} / {totalPages}
                </Button>
                <Button size="sm" outline disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                  Next
                </Button>
                <Button size="sm" outline disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(totalPages - 1)}>
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <MonitorHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryRecords([]);
        }}
        records={historyRecords}
        warningThresholdMs={500}
        criticalThresholdMs={1000}
        agentName={selectedAgentName}
      />
    </div>
  );
};

export default HttpMetricsProfessional;
