import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faRefresh,
  faCircle,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faClock,
  faGlobe,
  faMapMarkerAlt,
  faServer,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardBody, Badge, Button, Row, Col, Input, Label } from 'reactstrap';
import axios from 'axios';
import './monitor-detail.scss';

interface MonitorDetail {
  id: number;
  name: string;
  url: string;
  method: string;
  protocol: string;
  frequency: number;
  enabled: boolean;
  warningThresholdMs: number;
  criticalThresholdMs: number;
  createdAt: string;
  updatedAt: string;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  uptimePercentage: number;
  lastCheckedAt: string;
  lastSuccess: boolean;
  regions: string[];
  agents: string[];
}

interface AgentMetrics {
  agentName: string;
  agentRegion: string;
  datacenter: string;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  warningChecks: number;
  criticalChecks: number;
  averageResponseTime: number;
  uptimePercentage: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  lastCheckedAt: string;
  lastSuccess: boolean;
  lastResponseTime: number;
}

interface TimeSeriesData {
  timestamp: string;
  agentName: string;
  agentRegion: string;
  success: boolean;
  responseTimeMs: number;
  responseStatusCode: number;
  errorType: string;
  errorMessage: string;
}

export const MonitorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState<MonitorDetail | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30m');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMonitorDetails();
      fetchAgentMetrics();
      fetchTimeSeriesData();
    }
  }, [id, timeRange, selectedRegion]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAgentMetrics();
        fetchTimeSeriesData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange, selectedRegion]);

  const fetchMonitorDetails = async () => {
    try {
      const response = await axios.get(`/api/http-monitors/${id}/details`);
      setMonitor(response.data);
    } catch (error) {
      console.error('Error fetching monitor details:', error);
    }
  };

  const fetchAgentMetrics = async () => {
    setLoading(true);
    try {
      const params: any = { timeRange };
      if (selectedRegion && selectedRegion !== 'all') {
        params.agentRegion = selectedRegion;
      }
      const response = await axios.get(`/api/http-monitors/${id}/agent-metrics`, { params });
      setAgentMetrics(response.data);
    } catch (error) {
      console.error('Error fetching agent metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSeriesData = async () => {
    try {
      const params: any = { timeRange };
      if (selectedRegion && selectedRegion !== 'all') {
        params.agentRegion = selectedRegion;
      }
      const response = await axios.get(`/api/http-monitors/${id}/time-series`, { params });
      setTimeSeriesData(response.data);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const handleRefresh = () => {
    fetchMonitorDetails();
    fetchAgentMetrics();
    fetchTimeSeriesData();
  };

  const getStatusBadgeClass = (success: boolean, responseTime: number, thresholds: { warning: number; critical: number }) => {
    if (!success) return 'status-down';
    if (responseTime >= thresholds.critical) return 'status-critical';
    if (responseTime >= thresholds.warning) return 'status-warning';
    return 'status-up';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!monitor) {
    return <div className="monitor-detail-loading">Loading...</div>;
  }

  return (
    <div className="monitor-detail-container">
      {/* Header */}
      <div className="monitor-detail-header">
        <div className="header-content">
          <Button className="btn-back" onClick={() => navigate('/http-metrics')} size="sm">
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </Button>
          <div className="monitor-title-section">
            <h1 className="monitor-title">{monitor.name}</h1>
            <div className="monitor-meta">
              <span className="monitor-url">
                <FontAwesomeIcon icon={faGlobe} /> {monitor.url}
              </span>
              <Badge className={monitor.lastSuccess ? 'status-badge-up' : 'status-badge-down'}>
                <FontAwesomeIcon icon={monitor.lastSuccess ? faCheckCircle : faTimesCircle} />
                {monitor.lastSuccess ? ' UP' : ' DOWN'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={() => setAutoRefresh(!autoRefresh)} color={autoRefresh ? 'success' : 'secondary'} size="sm" outline>
            <FontAwesomeIcon icon={faRefresh} className={autoRefresh ? 'fa-spin' : ''} />
            {autoRefresh ? ' Auto-refresh ON' : ' Auto-refresh OFF'}
          </Button>
          <Button onClick={handleRefresh} color="primary" size="sm">
            <FontAwesomeIcon icon={faRefresh} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="monitor-stats-grid">
        <Card className="stat-card">
          <CardBody>
            <div className="stat-icon checks">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{monitor.totalChecks}</div>
              <div className="stat-label">Total Checks</div>
            </div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-icon uptime">
              <FontAwesomeIcon icon={faCircle} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{monitor.uptimePercentage.toFixed(2)}%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-icon latency">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{Math.round(monitor.averageResponseTime)}ms</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-icon regions">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{monitor.regions.length}</div>
              <div className="stat-label">Regions</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="filters-card">
        <CardBody>
          <Row>
            <Col md={4}>
              <Label for="timeRange">Time Range</Label>
              <Input type="select" id="timeRange" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="30m">Last 30 minutes</option>
                <option value="1h">Last hour</option>
                <option value="4h">Last 4 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="2d">Last 2 days</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </Input>
            </Col>
            <Col md={4}>
              <Label for="regionFilter">Region</Label>
              <Input type="select" id="regionFilter" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
                <option value="all">All Regions</option>
                {monitor.regions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Agent Performance Section */}
      <Card className="agent-metrics-card">
        <CardBody>
          <h3 className="section-title">
            <FontAwesomeIcon icon={faServer} /> Performance by Agent
          </h3>

          {loading ? (
            <div className="loading-state">Loading agent metrics...</div>
          ) : (
            <div className="agent-metrics-table-wrapper">
              <table className="agent-metrics-table">
                <thead>
                  <tr>
                    <th>Agent / Region</th>
                    <th>Status</th>
                    <th>Checks</th>
                    <th>Availability</th>
                    <th>Avg Response</th>
                    <th>P95</th>
                    <th>P99</th>
                    <th>Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {agentMetrics.map((agent, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="agent-info">
                          <div className="agent-name">{agent.agentName}</div>
                          <div className="agent-region">
                            <FontAwesomeIcon icon={faMapMarkerAlt} /> {agent.agentRegion}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="status-breakdown">
                          <Badge className="status-badge-success">
                            <FontAwesomeIcon icon={faCheckCircle} /> {agent.successfulChecks}
                          </Badge>
                          {agent.warningChecks > 0 && (
                            <Badge className="status-badge-warning">
                              <FontAwesomeIcon icon={faExclamationTriangle} /> {agent.warningChecks}
                            </Badge>
                          )}
                          {agent.criticalChecks > 0 && (
                            <Badge className="status-badge-critical">
                              <FontAwesomeIcon icon={faExclamationTriangle} /> {agent.criticalChecks}
                            </Badge>
                          )}
                          {agent.failedChecks > 0 && (
                            <Badge className="status-badge-failed">
                              <FontAwesomeIcon icon={faTimesCircle} /> {agent.failedChecks}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-center">{agent.totalChecks}</td>
                      <td>
                        <div className="uptime-cell">
                          <span className="uptime-value">{agent.uptimePercentage.toFixed(2)}%</span>
                          <div className="uptime-bar">
                            <div className="uptime-fill" style={{ width: `${agent.uptimePercentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="latency-cell">{Math.round(agent.averageResponseTime)}ms</td>
                      <td className="latency-cell">{agent.p95ResponseTime}ms</td>
                      <td className="latency-cell">{agent.p99ResponseTime}ms</td>
                      <td className="timestamp-cell">{new Date(agent.lastCheckedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Time Series Chart Placeholder */}
      <Card className="chart-card">
        <CardBody>
          <h3 className="section-title">
            <FontAwesomeIcon icon={faChartLine} /> Response Time Trends
          </h3>
          <div className="chart-placeholder">
            <p>Chart visualization showing {timeSeriesData.length} data points</p>
            <p className="text-muted">Time series chart will be rendered here with agent-wise response times</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MonitorDetail;
