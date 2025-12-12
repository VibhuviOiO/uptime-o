import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Row, Col, Table, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faFilter, faChartLine, faServer, faClock } from '@fortawesome/free-solid-svg-icons';
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
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await HttpMetricsService.getAggregatedMetrics();
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
            HTTP Service Monitoring
          </h1>
          <p className="page-description">Monitor the health and performance of your HTTP services in real-time</p>
        </div>
        <div className="header-actions">
          <Button color="primary" size="sm" onClick={fetchMetrics} disabled={loading} className="refresh-button">
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <Row className="stats-section">
        <Col md="3">
          <Card className="stat-card stat-up">
            <CardBody>
              <div className="stat-content">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faServer} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">{stats.upCount}</div>
                  <div className="stat-label">Services Online</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="stat-card stat-down">
            <CardBody>
              <div className="stat-content">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faServer} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">{stats.downCount}</div>
                  <div className="stat-label">Services Offline</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="stat-card stat-latency">
            <CardBody>
              <div className="stat-content">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">{formatLatency(stats.avgLatency)}</div>
                  <div className="stat-label">Avg Response Time</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="stat-card stat-total">
            <CardBody>
              <div className="stat-content">
                <div className="stat-icon">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className="stat-details">
                  <div className="stat-number">{stats.totalCount}</div>
                  <div className="stat-label">Total Services</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Filters Section */}
      <Card className="filters-card">
        <CardBody>
          <Row className="align-items-end">
            <Col md="4">
              <div className="form-group">
                <label className="form-label">Search Services</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <Input
                    type="text"
                    placeholder="Enter service name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </Col>
            <Col md="3">
              <div className="form-group">
                <label className="form-label">Region</label>
                <Input type="select" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </Input>
              </div>
            </Col>
            <Col md="3">
              <div className="form-group">
                <label className="form-label">Time Range</label>
                <Input type="select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </Input>
              </div>
            </Col>
            <Col md="2">
              <Button
                color="secondary"
                outline
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('');
                  setTimeRange('1h');
                }}
              >
                <FontAwesomeIcon icon={faFilter} /> Clear
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Services Table */}
      <Card className="services-table-card">
        <CardBody>
          <div className="table-header">
            <h5 className="table-title">Service Status Overview</h5>
            <small className="table-subtitle">
              Showing {filteredMetrics.length} of {metrics.length} services
            </small>
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
              <Table className="services-table" hover>
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Status</th>
                    <th>Region</th>
                    <th>Datacenter</th>
                    <th>Response Time</th>
                    <th>Agents</th>
                    <th>Last Checked</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map(metric => {
                    const status = getStatusBadge(metric.lastSuccess, metric.lastLatencyMs);
                    return (
                      <tr key={metric.monitorId} className="service-row">
                        <td>
                          <div className="service-name-cell">
                            <strong>{metric.monitorName}</strong>
                            <small className="service-type">HTTP Monitor</small>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${status.class}`}>{status.text}</span>
                        </td>
                        <td>{metric.regionName || '-'}</td>
                        <td>{metric.datacenterName || '-'}</td>
                        <td>
                          <span className="latency-value">{formatLatency(metric.lastLatencyMs)}</span>
                        </td>
                        <td>
                          <span className="agent-count">{metric.agentCount}</span>
                        </td>
                        <td>
                          <small className="last-checked">{formatLastChecked(metric.lastCheckedTime)}</small>
                        </td>
                        <td>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => navigate(`/http-monitor-detail/${metric.monitorId}`)}
                            className="view-details-btn"
                          >
                            View Details
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
