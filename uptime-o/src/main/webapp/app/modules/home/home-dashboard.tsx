import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faCheckCircle, faTimesCircle, faChartLine, faClock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './home-dashboard.scss';

interface DashboardStats {
  totalMonitors: number;
  onlineMonitors: number;
  offlineMonitors: number;
  avgUptime: number;
  avgResponseTime: number;
  totalChecks: number;
}

export const HomeDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalMonitors: 0,
    onlineMonitors: 0,
    offlineMonitors: 0,
    avgUptime: 0,
    avgResponseTime: 0,
    totalChecks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/http-monitors/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-dashboard">
      <div className="dashboard-header">
        <h1>Uptime Monitoring Dashboard</h1>
        <p className="text-muted">Real-time monitoring and performance analytics</p>
      </div>

      <Row className="stats-row">
        <Col md="3">
          <Card className="stat-card">
            <CardBody>
              <div className="stat-icon total">
                <FontAwesomeIcon icon={faServer} />
              </div>
              <div className="stat-content">
                <h3>{stats.totalMonitors}</h3>
                <p>Total Monitors</p>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="stat-card">
            <CardBody>
              <div className="stat-icon online">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="stat-content">
                <h3>{stats.onlineMonitors}</h3>
                <p>Online</p>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="stat-card">
            <CardBody>
              <div className="stat-icon offline">
                <FontAwesomeIcon icon={faTimesCircle} />
              </div>
              <div className="stat-content">
                <h3>{stats.offlineMonitors}</h3>
                <p>Offline</p>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card className="stat-card">
            <CardBody>
              <div className="stat-icon uptime">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="stat-content">
                <h3>{stats.avgUptime.toFixed(1)}%</h3>
                <p>Avg Uptime</p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md="6">
          <Card className="action-card">
            <CardBody>
              <h5>Monitor List</h5>
              <p>View all monitors with detailed status and metrics</p>
              <Button color="primary" onClick={() => navigate('/monitors')}>
                View Monitors
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card className="action-card">
            <CardBody>
              <h5>Visualization Dashboard</h5>
              <p>Compare multiple monitors with real-time charts</p>
              <Button color="primary" onClick={() => navigate('/dashboard')}>
                Open Dashboard
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomeDashboard;
