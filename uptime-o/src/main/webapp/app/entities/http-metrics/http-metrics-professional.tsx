import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Row, Col, Table, Card, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSync,
  faFilter,
  faChartLine,
  faServer,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faChevronDown,
  faChevronRight,
  faHeartbeat,
  faTachometerAlt,
  faEllipsisV,
  faHistory,
  faEye,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { HttpMetricsService } from './http-metrics.service';
import { HttpMetricsDTO } from './http-metrics.model';
import axios from 'axios';
import GenericChart from '../../shared/charts/GenericChart';
import MonitorHistoryModal from '../http-monitor-detail/MonitorHistoryModal';
import './http-metrics-professional.scss';

interface AgentDetail {
  agentName: string;
  agentRegion: string;
  datacenter: string;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  uptimePercentage: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  lastCheckedAt: string;
  lastSuccess: boolean;
}

export const HttpMetricsProfessional = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<HttpMetricsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [timeRange, setTimeRange] = useState('30m');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [agentDetails, setAgentDetails] = useState<Record<string, AgentDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const [selectedMonitorId, setSelectedMonitorId] = useState<number>(0);
  const [agentMetricsData, setAgentMetricsData] = useState<Record<string, any>>({});
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<Record<string, any[]>>({});
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
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

  const formatLatency = (ms: number) => `${ms}ms`;

  const formatLastChecked = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const getMetricValue = (monitorId: number, agentName: string, field: string, defaultValue: any) => {
    const agentMetrics = agentMetricsData[monitorId];
    if (!agentMetrics || !Array.isArray(agentMetrics)) return defaultValue;

    const agentData = agentMetrics.find((agent: any) => agent.agentName === agentName);
    return agentData ? agentData[field] : defaultValue;
  };

  useEffect(() => {
    // Clear existing data when filters change
    setAgentMetricsData({});
    setTimeSeriesData({});
  }, [timeRange, selectedRegion]);

  useEffect(() => {
    // Fetch agent metrics for all monitors after main metrics are loaded
    if (metrics.length > 0) {
      const uniqueMonitorIds = Array.from(new Set(metrics.map(m => m.monitorId)));
      uniqueMonitorIds.forEach(monitorId => {
        fetchAgentMetrics(monitorId);
      });
    }
  }, [metrics]);

  const toggleRowExpansion = async (monitorId: number, agentName: string) => {
    const rowKey = `${monitorId}-${agentName}`;
    const newExpanded = new Set(expandedRows);

    if (expandedRows.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
      if (!agentDetails[rowKey]) {
        await fetchAgentDetails(monitorId, agentName, rowKey);
      }
    }
    setExpandedRows(newExpanded);
  };

  const prepareChartData = (monitorId: number, agentName: string) => {
    const agentData = timeSeriesData[monitorId] || [];
    const filteredData = agentData.filter((d: any) => d.agentName === agentName);

    const now = new Date();
    let timeRangeMs: number;
    switch (timeRange) {
      case '5m':
        timeRangeMs = 5 * 60 * 1000;
        break;
      case '15m':
        timeRangeMs = 15 * 60 * 1000;
        break;
      case '30m':
        timeRangeMs = 30 * 60 * 1000;
        break;
      case '1h':
        timeRangeMs = 60 * 60 * 1000;
        break;
      case '4h':
        timeRangeMs = 4 * 60 * 60 * 1000;
        break;
      case '24h':
        timeRangeMs = 24 * 60 * 60 * 1000;
        break;
      case '2d':
        timeRangeMs = 2 * 24 * 60 * 60 * 1000;
        break;
      case '7d':
        timeRangeMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        timeRangeMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeRangeMs = 30 * 60 * 1000;
    }

    const startTime = new Date(now.getTime() - timeRangeMs);
    const numBuckets = 50;
    const bucketSize = timeRangeMs / numBuckets;

    return Array.from({ length: numBuckets }, (_, i) => {
      const bucketStart = startTime.getTime() + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const bucketStartDate = new Date(bucketStart);

      const bucketRecords = filteredData.filter((r: any) => {
        const recordTime = new Date(r.timestamp).getTime();
        return recordTime >= bucketStart && recordTime < bucketEnd;
      });

      let healthy = 0;
      let warning = 0;
      let critical = 0;
      let failed = 0;

      bucketRecords.forEach((r: any) => {
        if (!r.success) {
          failed++;
        } else {
          const rt = r.responseTimeMs || 0;
          if (rt >= 1000) {
            critical++;
          } else if (rt >= 500) {
            warning++;
          } else {
            healthy++;
          }
        }
      });

      return {
        index: i,
        time: bucketStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        timestamp: bucketStartDate.toLocaleString(),
        healthy,
        warning,
        critical,
        failed,
        total: bucketRecords.length,
      };
    });
  };

  const fetchAgentMetrics = async (monitorId: number) => {
    try {
      const params = { timeRange, agentRegion: selectedRegion !== '' ? selectedRegion : undefined };
      const response = await axios.get(`/api/http-monitors/${monitorId}/complete`, { params });
      const data = response.data;

      if (data.agentMetrics && data.agentMetrics.length > 0) {
        setAgentMetricsData(prev => ({ ...prev, [monitorId]: data.agentMetrics }));
      }
      if (data.timeSeriesData) {
        setTimeSeriesData(prev => ({ ...prev, [monitorId]: data.timeSeriesData }));
      }
    } catch (error) {
      console.error('Error fetching agent metrics:', error);
    }
  };

  const fetchAgentDetails = async (monitorId: number, agentName: string, rowKey: string) => {
    try {
      setLoadingDetails(prev => new Set(prev).add(rowKey));

      const params = { timeRange, agentRegion: selectedRegion !== '' ? selectedRegion : undefined };
      const response = await axios.get(`/api/http-monitors/${monitorId}/complete`, { params });
      const data = response.data;

      if (data.agentMetrics && data.agentMetrics.length > 0) {
        const agentData = data.agentMetrics.find((agent: any) => agent.agentName === agentName);
        if (agentData) {
          setAgentDetails(prev => ({ ...prev, [rowKey]: agentData }));
        }
      }
    } catch (error) {
      console.error('Error fetching agent details:', error);
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowKey);
        return newSet;
      });
    }
  };

  const fetchHistoryData = async (monitorId: number, agentName: string) => {
    try {
      setLoadingHistory(true);
      const params = { timeRange, agentRegion: selectedRegion !== '' ? selectedRegion : undefined };
      const response = await axios.get(`/api/http-monitors/${monitorId}/complete`, { params });
      const data = response.data;

      if (data.timeSeriesData && data.timeSeriesData.length > 0) {
        const agentHistory = data.timeSeriesData.filter((record: any) => record.agentName === agentName);
        setHistoryRecords(agentHistory);
      } else {
        setHistoryRecords([]);
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
      setHistoryRecords([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const renderAgentDetails = (monitorId: number, agentName: string) => {
    const rowKey = `${monitorId}-${agentName}`;
    const details = agentDetails[rowKey];
    const isLoading = loadingDetails.has(rowKey);

    if (isLoading) {
      return (
        <tr>
          <td colSpan={16} className="agent-details-cell">
            <div className="loading-details">Loading agent details...</div>
          </td>
        </tr>
      );
    }

    if (!details) return null;

    return (
      <tr>
        <td colSpan={17} className="agent-details-cell">
          <div className="agent-details-container">
            <div className="agent-chart">
              <GenericChart
                type="bar"
                data={prepareChartData(monitorId, agentName)}
                xKey="time"
                yKeys={['healthy', 'warning', 'critical', 'failed']}
                colors={['#10b981', '#fbbf24', '#f97316', '#ef4444']}
                height={140}
              />
            </div>
          </div>
        </td>
      </tr>
    );
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
                    <th className="small">Latest TTFB</th>
                    <th className="small">Latest HTTP Status</th>
                    <th className="small">Latest Response Size</th>
                    <th className="small">Latest Server</th>
                    <th className="small">Last Checked</th>
                    <th className="small">Uptime</th>
                    <th className="small">P95</th>
                    <th className="small">P99</th>
                    <th className="small"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map(metric => {
                    const status = getStatusBadge(metric.lastSuccess, metric.lastLatencyMs, metric.lastCheckedTime, timeRange);
                    const isStale = status.class === 'status-stale';
                    const rowKey = `${metric.monitorId}-${metric.agentName}`;
                    const isExpanded = expandedRows.has(rowKey);

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
                            <span className="text-muted small">{getMetricValue(metric.monitorId, metric.agentName, 'totalChecks', 0)}</span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                // If agent is offline/stale, show N/A for all latest data
                                if (isStale) return 'N/A';

                                const agentData = getMetricValue(metric.monitorId, metric.agentName, 'lastResponseTime', null);
                                if (!agentData && !timeSeriesData[metric.monitorId]) return 'N/A';

                                // Get latest record from time series data (most recent by timestamp)
                                const agentRecords =
                                  timeSeriesData[metric.monitorId]?.filter((r: any) => r.agentName === metric.agentName) || [];
                                const latestRecord = agentRecords.sort(
                                  (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                                )[0];
                                if (!latestRecord)
                                  return agentData ? `${agentData}ms` : metric.lastLatencyMs ? `${metric.lastLatencyMs}ms` : 'N/A';

                                const dns = latestRecord.dnsLookupMs || 0;
                                const tcp = latestRecord.tcpConnectMs || 0;
                                const tls = latestRecord.tlsHandshakeMs || 0;
                                const response = latestRecord.responseTimeMs || 0;
                                const total = dns + tcp + tls + response;

                                return `${total}ms (${dns}+${tcp}+${tls}+${response})`;
                              })()}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                if (isStale) return 'N/A';
                                const agentRecords =
                                  timeSeriesData[metric.monitorId]?.filter((r: any) => r.agentName === metric.agentName) || [];
                                const latestRecord = agentRecords.sort(
                                  (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                                )[0];
                                const ttfb = latestRecord?.timeToFirstByteMs;
                                return ttfb ? `${ttfb}ms` : 'N/A';
                              })()}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                if (isStale) return 'N/A';
                                const agentRecords =
                                  timeSeriesData[metric.monitorId]?.filter((r: any) => r.agentName === metric.agentName) || [];
                                const latestRecord = agentRecords.sort(
                                  (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                                )[0];
                                const httpStatus = latestRecord?.responseStatusCode;
                                return httpStatus ? httpStatus : 'N/A';
                              })()}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                if (isStale) return 'N/A';
                                const agentRecords =
                                  timeSeriesData[metric.monitorId]?.filter((r: any) => r.agentName === metric.agentName) || [];
                                const latestRecord = agentRecords.sort(
                                  (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                                )[0];
                                const size = latestRecord?.responseSizeBytes;
                                return size ? `${(size / 1024).toFixed(1)}KB` : 'N/A';
                              })()}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                if (isStale) return 'N/A';
                                const agentRecords =
                                  timeSeriesData[metric.monitorId]?.filter((r: any) => r.agentName === metric.agentName) || [];
                                const latestRecord = agentRecords.sort(
                                  (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                                )[0];
                                const server = latestRecord?.responseServer;
                                return server || 'N/A';
                              })()}
                            </span>
                          </td>
                          <td>
                            <span className="last-checked text-muted small">{formatLastChecked(metric.lastCheckedTime)}</span>
                          </td>
                          <td>
                            <span className="text-success small">
                              {(() => {
                                const uptime = getMetricValue(metric.monitorId, metric.agentName, 'uptimePercentage', 0);
                                return typeof uptime === 'number' ? uptime.toFixed(1) : '0.0';
                              })()}
                              %
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                const p95 = getMetricValue(metric.monitorId, metric.agentName, 'p95ResponseTime', 0);
                                return typeof p95 === 'number' ? Math.round(p95) : 0;
                              })()}
                              ms
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {(() => {
                                const p99 = getMetricValue(metric.monitorId, metric.agentName, 'p99ResponseTime', 0);
                                return typeof p99 === 'number' ? Math.round(p99) : 0;
                              })()}
                              ms
                            </span>
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
                                <DropdownItem onClick={() => toggleRowExpansion(metric.monitorId, metric.agentName)}>
                                  <FontAwesomeIcon icon={faChartBar} className="me-2" />
                                  View Metrics
                                </DropdownItem>
                                <DropdownItem onClick={() => navigate(`/http-monitor-detail/${metric.monitorId}`)}>
                                  <FontAwesomeIcon icon={faEye} className="me-2" />
                                  View Agent Aggregated Data
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
                        {isExpanded && renderAgentDetails(metric.monitorId, metric.agentName)}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
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
