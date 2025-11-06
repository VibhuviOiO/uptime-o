import React, { useState, useEffect, useMemo } from 'react';
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
  faHeartbeat,
  faTachometerAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Card, CardBody, Badge, Button, Row, Col, Input, Label } from 'reactstrap';
import axios from 'axios';
import GenericChart from '../../shared/charts/GenericChart';
import MonitorHistoryModal from './MonitorHistoryModal';
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

const MonitorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState<MonitorDetail | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30m');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAgentHistory, setSelectedAgentHistory] = useState<TimeSeriesData[]>([]);
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');

  useEffect(() => {
    fetchMonitorDetail();
  }, [id]);

  useEffect(() => {
    fetchAgentMetrics();
    fetchTimeSeriesData();
  }, [id, timeRange, selectedRegion]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAgentMetrics();
        fetchTimeSeriesData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange, selectedRegion]);

  const fetchMonitorDetail = async () => {
    try {
      const response = await axios.get(`/api/http-monitors/${id}/details`);
      setMonitor(response.data);
    } catch (error) {
      console.error('Error fetching monitor details:', error);
    }
  };

  const fetchAgentMetrics = async () => {
    try {
      setLoading(true);
      const params: any = { timeRange };
      if (selectedRegion !== 'all') {
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
      if (selectedRegion !== 'all') {
        params.agentRegion = selectedRegion;
      }
      const response = await axios.get(`/api/http-monitors/${id}/time-series`, { params });
      setTimeSeriesData(response.data);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  // Prepare chart data for each agent
  const prepareChartData = (agentName: string) => {
    const agentData = timeSeriesData.filter(d => d.agentName === agentName);

    // Create time buckets
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

      const bucketRecords = agentData.filter(r => {
        const recordTime = new Date(r.timestamp).getTime();
        return recordTime >= bucketStart && recordTime < bucketEnd;
      });

      let healthy = 0;
      let warning = 0;
      let critical = 0;
      let failed = 0;

      bucketRecords.forEach(r => {
        if (!r.success) {
          failed++;
        } else {
          const warningThreshold = monitor?.warningThresholdMs || 500;
          const criticalThreshold = monitor?.criticalThresholdMs || 1000;
          const rt = r.responseTimeMs || 0;

          if (rt >= criticalThreshold) {
            critical++;
          } else if (rt >= warningThreshold) {
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

  const uniqueRegions = useMemo(() => {
    return ['all', ...Array.from(new Set(agentMetrics.map(a => a.agentRegion)))];
  }, [agentMetrics]);

  if (!monitor) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="monitor-detail-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-row-1">
          <Button color="link" onClick={() => navigate('/http-metrics')} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Monitors
          </Button>
          <div className="header-actions">
            <Button
              color={autoRefresh ? 'success' : 'secondary'}
              outline
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="auto-refresh-btn"
            >
              <FontAwesomeIcon icon={faRefresh} spin={autoRefresh} />
              {autoRefresh ? ' Auto-refresh ON' : ' Auto-refresh OFF'}
            </Button>
            <Button
              color="primary"
              outline
              onClick={() => {
                fetchAgentMetrics();
                fetchTimeSeriesData();
              }}
            >
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </Button>
          </div>
        </div>

        <div className="header-row-2">
          <div className="monitor-title">
            <h1>{monitor.name}</h1>
            <Badge color={monitor.lastSuccess ? 'success' : 'danger'} className="status-badge">
              {monitor.lastSuccess ? 'UP' : 'DOWN'}
            </Badge>
          </div>
          <div className="monitor-url">
            <code>{monitor.url}</code>
          </div>
        </div>

        <div className="header-row-3">
          <div className="metadata-item">
            <FontAwesomeIcon icon={faServer} className="metadata-icon" />
            <span className="metadata-label">Method:</span>
            <Badge color="secondary">{monitor.method}</Badge>
          </div>
          <div className="divider" />
          <div className="metadata-item">
            <FontAwesomeIcon icon={faGlobe} className="metadata-icon" />
            <span className="metadata-label">Protocol:</span>
            <Badge color="info">{monitor.protocol}</Badge>
          </div>
          <div className="divider" />
          <div className="metadata-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="metadata-icon" />
            <span className="metadata-label">Regions:</span>
            <span className="metadata-value">{monitor.regions.length}</span>
          </div>
          <div className="divider" />
          <div className="metadata-item">
            <FontAwesomeIcon icon={faClock} className="metadata-icon" />
            <span className="metadata-label">Interval:</span>
            <span className="metadata-value">{monitor.frequency}s</span>
          </div>
          <div className="divider" />
          <div className="metadata-item">
            <FontAwesomeIcon icon={faChartLine} className="metadata-icon" />
            <span className="metadata-label">Uptime:</span>
            <span className="metadata-value text-success">{monitor.uptimePercentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <CardBody>
          <Row>
            <Col md={4}>
              <Label>Time Range</Label>
              <Input type="select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                <option value="5m">Last 5 minutes</option>
                <option value="15m">Last 15 minutes</option>
                <option value="30m">Last 30 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="4h">Last 4 hours</option>
                <option value="24h">Last 24 hours</option>
                <option value="2d">Last 2 days</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </Input>
            </Col>
            <Col md={4}>
              <Label>Filter by Region</Label>
              <Input type="select" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
                {uniqueRegions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Agent Cards */}
      <div className="agent-cards">
        {loading ? (
          <div className="loading">Loading agent metrics...</div>
        ) : agentMetrics.length === 0 ? (
          <div className="no-data">No agent data available for the selected time range.</div>
        ) : (
          agentMetrics.map(agent => {
            const chartData = prepareChartData(agent.agentName);
            const hasFailures = agent.failedChecks > 0;
            const totalChecks = agent.totalChecks;
            const changePercent = '+0.1%'; // Mock data

            // Handler for View History button
            const handleViewHistory = () => {
              const agentHistory = timeSeriesData.filter(d => d.agentName === agent.agentName);
              setSelectedAgentHistory(agentHistory);
              setSelectedAgentName(agent.agentName);
              setIsHistoryModalOpen(true);
            };

            return (
              <Card key={agent.agentName} className="agent-card">
                <CardBody>
                  {/* Agent Header - Two Column Layout */}
                  <div className="agent-header">
                    {/* Left Side: Agent Info + Stats */}
                    <div className="agent-info-section">
                      {/* Title and Status */}
                      <div className="agent-title-row">
                        <h2 className="agent-name">{agent.agentRegion}</h2>
                        <div className={`status-indicator ${hasFailures ? 'status-down' : 'status-up'}`}>
                          <FontAwesomeIcon icon={hasFailures ? faTimesCircle : faCheckCircle} />
                        </div>
                        <Button color="primary" size="sm" className="history-btn" onClick={handleViewHistory}>
                          View History
                        </Button>
                      </div>

                      {/* Info Tiles Row */}
                      <div className="info-tiles">
                        {/* Agent Badge Tile */}
                        <div className="info-tile agent-tile">
                          <div className="tile-icon">
                            <FontAwesomeIcon icon={faServer} />
                          </div>
                          <div className="tile-content">
                            <div className="tile-label">AGENT</div>
                            <div className="tile-value">{agent.agentName}</div>
                          </div>
                        </div>

                        {/* Last Checked Tile */}
                        <div className="info-tile time-tile">
                          <div className="tile-icon">
                            <FontAwesomeIcon icon={faClock} />
                          </div>
                          <div className="tile-content">
                            <div className="tile-label">LAST CHECK</div>
                            <div className="tile-value">Just now</div>
                          </div>
                        </div>

                        {/* Checks Tile */}
                        <div className="info-tile stat-tile">
                          <div className="tile-icon">
                            <FontAwesomeIcon icon={faHeartbeat} />
                          </div>
                          <div className="tile-content">
                            <div className="tile-label">CHECKS</div>
                            <div className="tile-value">{totalChecks}</div>
                          </div>
                        </div>

                        {/* Availability Tile */}
                        <div className="info-tile stat-tile availability">
                          <div className="tile-icon">
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </div>
                          <div className="tile-content">
                            <div className="tile-label">UPTIME</div>
                            <div className="tile-value">{agent.uptimePercentage.toFixed(0)}%</div>
                          </div>
                        </div>

                        {/* P95 Tile */}
                        <div className="info-tile stat-tile p95">
                          <div className="tile-icon">
                            <FontAwesomeIcon icon={faTachometerAlt} />
                          </div>
                          <div className="tile-content">
                            <div className="tile-label">P95</div>
                            <div className="tile-value">{agent.p95ResponseTime} ms</div>
                          </div>
                        </div>

                        {/* P99 Tile */}
                        <div className="info-tile stat-tile p99">
                          <div className="tile-icon">
                            <FontAwesomeIcon icon={faTachometerAlt} />
                          </div>
                          <div className="tile-content">
                            <div className="tile-label">P99</div>
                            <div className="tile-value">{agent.p99ResponseTime} ms</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="agent-chart">
                    <GenericChart
                      type="bar"
                      data={chartData}
                      xKey="time"
                      yKeys={['healthy', 'warning', 'critical', 'failed']}
                      colors={['#10b981', '#fbbf24', '#f97316', '#ef4444']}
                      height={140}
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* Monitor History Modal */}
      <MonitorHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={selectedAgentHistory}
        warningThresholdMs={monitor?.warningThresholdMs}
        criticalThresholdMs={monitor?.criticalThresholdMs}
        agentName={selectedAgentName}
      />
    </div>
  );
};

export default MonitorDetail;
