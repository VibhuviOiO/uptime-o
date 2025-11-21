import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { Button, Input, Row, Col, Table, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClock, faRotateRight, faFilter, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { HttpMetricsDTO } from 'app/entities/http-metrics/http-metrics.model';
import { HttpMetricsService } from './http-metrics.service';
import './http-metrics.scss';

export const HttpMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<HttpMetricsDTO[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<HttpMetricsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDatacenter, setSelectedDatacenter] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [datacenters, setDatacenters] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await HttpMetricsService.getAggregatedMetrics({
        searchName,
        regionName: selectedRegion || undefined,
        datacenterName: selectedDatacenter || undefined,
        agentName: selectedAgent || undefined,
      });
      setMetrics(data);
      setFilteredMetrics(data);

      // Extract unique values for filter dropdowns
      const uniqueRegions = Array.from(new Set(data.map(m => m.regionName).filter(Boolean)));
      const uniqueDatacenters = Array.from(new Set(data.map(m => m.datacenterName).filter(Boolean)));
      const uniqueAgents = Array.from(new Set(data.flatMap(m => [m.agentName]).filter(Boolean)));

      setRegions(uniqueRegions);
      setDatacenters(uniqueDatacenters);
      setAgents(uniqueAgents);
    } catch (error) {
      console.error('Error fetching HTTP metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await HttpMetricsService.getAggregatedMetrics({
        searchName,
        regionName: selectedRegion || undefined,
        datacenterName: selectedDatacenter || undefined,
        agentName: selectedAgent || undefined,
      });
      setFilteredMetrics(data);
    } catch (error) {
      console.error('Error searching HTTP metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchName('');
    setSelectedRegion('');
    setSelectedDatacenter('');
    setSelectedAgent('');
    setFilteredMetrics(metrics);
  };

  const formatLastChecked = (timestamp: string | null | undefined) => {
    if (!timestamp) return '-';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="http-metrics-container">
      {/* Top Stats Section */}
      <div className="metrics-stats-section">
        <div className="stat-card">
          <div className="stat-icon up">
            <div className="icon-dot success"></div>
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredMetrics.filter(m => m.lastSuccess).length}</div>
            <div className="stat-label">Services UP</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon down">
            <div className="icon-dot failed"></div>
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredMetrics.filter(m => !m.lastSuccess).length}</div>
            <div className="stat-label">Services DOWN</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon latency">
            <span className="stat-icon-symbol">⚡</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {filteredMetrics.length > 0
                ? (() => {
                    const total = filteredMetrics.reduce((sum, m) => sum + (m.lastLatencyMs || 0), 0);
                    return Math.round(total / filteredMetrics.length);
                  })()
                : 0}
              ms
            </div>
            <div className="stat-label">Avg Latency</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <span className="stat-icon-symbol">📊</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{filteredMetrics.length}</div>
            <div className="stat-label">Total Monitors</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="http-metrics-card">
        <CardBody className="http-metrics-body">
          {/* Header */}
          <div className="metrics-header">
            <div className="header-left">
              <h2 className="metrics-title">HTTP(s) Metrics</h2>
              <p className="metrics-description">Real-time monitoring across your infrastructure</p>
            </div>
            <div className="header-actions">
              <Button color="link" size="sm" className="refresh-btn" onClick={fetchMetrics}>
                <FontAwesomeIcon icon={faRotateRight} /> Refresh
              </Button>
            </div>
          </div>

          {/* Metrics Table */}
          <div className="metrics-table-wrapper">
            <div className="table-responsive">
              <Table className="metrics-table">
                <thead>
                  <tr>
                    <th>Monitor Name</th>
                    <th>Status</th>
                    <th>Latency</th>
                    <th>Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="loading-row">
                      <td colSpan={4}>
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                          <p>Loading metrics...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredMetrics.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-icon">📭</div>
                          <p className="empty-title">No metrics found</p>
                          <p className="empty-description">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMetrics.map(metric => (
                      <tr key={metric.monitorId} className="metric-row">
                        <td>
                          <div className="monitor-info">
                            <div className={`status-indicator ${metric.lastSuccess ? 'up' : 'down'}`}></div>
                            <div className="monitor-details">
                              <div
                                className="monitor-name monitor-link"
                                onClick={() => navigate(`/http-monitor-detail/${metric.monitorId}`)}
                                style={{ cursor: 'pointer' }}
                              >
                                {metric.monitorName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`status-badge ${metric.lastSuccess ? 'up' : 'down'}`}>
                            <div className="badge-dot"></div>
                            <span>{metric.lastSuccess ? 'UP' : 'DOWN'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="latency-badge">{metric.lastLatencyMs || 0}ms</span>
                        </td>
                        <td>
                          <span className="last-checked">{formatLastChecked(metric.lastCheckedTime)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default HttpMetrics;
