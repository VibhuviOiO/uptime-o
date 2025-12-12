import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Row, Col, Table, Card, CardBody } from 'reactstrap';
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
} from '@fortawesome/free-solid-svg-icons';
import { HttpMetricsService } from './http-metrics.service';
import { HttpMetricsDTO } from './http-metrics.model';
import './http-metrics-professional.scss';

export const HttpMetricsProfessional = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<HttpMetricsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await HttpMetricsService.getAggregatedMetrics(timeRange);
      setMetrics(data);
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

  const stats = useMemo(() => {
    const upCount = filteredMetrics.filter(m => m.lastSuccess).length;
    const downCount = filteredMetrics.filter(m => !m.lastSuccess).length;
    const avgLatency =
      filteredMetrics.length > 0
        ? Math.round(filteredMetrics.reduce((sum, m) => sum + (m.lastLatencyMs || 0), 0) / filteredMetrics.length)
        : 0;
    return { upCount, downCount, avgLatency, totalCount: filteredMetrics.length };
  }, [filteredMetrics]);

  const regions = useMemo(() => Array.from(new Set(metrics.map(m => m.regionName).filter(Boolean))), [metrics]);

  const getStatusBadge = (success: boolean, latency: number) => {
    if (!success) return { class: 'status-down', text: 'DOWN' };
    if (latency > 1000) return { class: 'status-critical', text: 'CRITICAL' };
    if (latency > 500) return { class: 'status-warning', text: 'WARNING' };
    return { class: 'status-up', text: 'UP' };
  };

  const formatLatency = (ms: number) => `${ms}ms`;

  const formatLastChecked = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
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
              {regions.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Input>
          </div>

          <div className="filter-group time-range-group">
            <div className="time-range-buttons">
              <Button
                color={timeRange === '1h' ? 'primary' : 'secondary'}
                size="sm"
                outline={timeRange !== '1h'}
                onClick={() => setTimeRange('1h')}
              >
                1h
              </Button>
              <Button
                color={timeRange === '6h' ? 'primary' : 'secondary'}
                size="sm"
                outline={timeRange !== '6h'}
                onClick={() => setTimeRange('6h')}
              >
                6h
              </Button>
              <Button
                color={timeRange === '24h' ? 'primary' : 'secondary'}
                size="sm"
                outline={timeRange !== '24h'}
                onClick={() => setTimeRange('24h')}
              >
                24h
              </Button>
              <Button
                color={timeRange === '7d' ? 'primary' : 'secondary'}
                size="sm"
                outline={timeRange !== '7d'}
                onClick={() => setTimeRange('7d')}
              >
                7d
              </Button>
            </div>
          </div>

          <div className="filter-group actions-group">
            <div className="action-buttons">
              <Button color="primary" size="sm" onClick={fetchMetrics} className="action-btn">
                <FontAwesomeIcon icon={faSearch} /> Search
              </Button>
              <Button
                color="secondary"
                outline
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('');
                  setTimeRange('1h');
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
            <div className="header-stats">
              <div className="stat-tile-small online">
                <FontAwesomeIcon icon={faCheckCircle} className="stat-icon" />
                <span className="stat-value">{stats.upCount}</span>
                <span className="stat-label">Online</span>
              </div>
              <div className="stat-tile-small offline">
                <FontAwesomeIcon icon={faTimesCircle} className="stat-icon" />
                <span className="stat-value">{stats.downCount}</span>
                <span className="stat-label">Offline</span>
              </div>
              <div className="stat-tile-small total">
                <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
                <span className="stat-value">{stats.totalCount}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
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
                    <th className="small">Response Time</th>
                    <th className="small">Agents</th>
                    <th className="small">Last Checked</th>
                    <th className="small">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map(metric => {
                    const status = getStatusBadge(metric.lastSuccess, metric.lastLatencyMs);
                    return (
                      <tr key={metric.monitorId} className="service-row">
                        <td>
                          <div>
                            <div className="fw-bold small">{metric.monitorName}</div>
                            <small className="text-muted">HTTP Monitor</small>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${status.class === 'status-up' ? 'bg-success' : status.class === 'status-down' ? 'bg-danger' : 'bg-warning'}`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td>
                          <small>{metric.regionName || '-'}</small>
                        </td>
                        <td>
                          <small>{metric.datacenterName || '-'}</small>
                        </td>
                        <td>
                          <span className="small fw-bold">{formatLatency(metric.lastLatencyMs)}</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{metric.agentCount}</span>
                        </td>
                        <td>
                          <small className="text-muted">{formatLastChecked(metric.lastCheckedTime)}</small>
                        </td>
                        <td>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => navigate(`/http-monitor-detail/${metric.monitorId}`)}
                            className="p-1 small"
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default HttpMetricsProfessional;
