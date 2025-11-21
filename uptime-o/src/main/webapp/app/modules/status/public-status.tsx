import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Row, Col } from 'reactstrap';
import axios from 'axios';

interface HttpMonitorStatus {
  id: number;
  name: string;
  url: string;
  status: string;
  responseTimeMs: number;
  success: boolean;
  errorMessage: string;
  lastChecked: string;
}

interface PublicStatus {
  overallStatus: string;
  httpMonitors: HttpMonitorStatus[];
  lastUpdated: string;
}

const PublicStatusPage = () => {
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get<PublicStatus>('/api/public/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UP':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'CRITICAL':
        return 'danger';
      case 'DOWN':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getOverallStatusText = (status: string) => {
    switch (status) {
      case 'UP':
        return 'All Systems Operational';
      case 'WARNING':
        return 'Some Systems Degraded';
      case 'CRITICAL':
        return 'Major Outage';
      case 'DOWN':
        return 'System Outage';
      default:
        return 'Status Unknown';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="alert alert-danger" role="alert">
        Unable to load status information
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-4">
            <h1 className="display-4">System Status</h1>
            <Badge color={getStatusColor(status.overallStatus)} className="fs-5 px-3 py-2">
              {getOverallStatusText(status.overallStatus)}
            </Badge>
          </div>

          <Card>
            <CardBody>
              <h3 className="mb-4">Services</h3>
              <Row>
                {status.httpMonitors.map(monitor => (
                  <Col md={6} lg={4} key={monitor.id} className="mb-3">
                    <Card className="h-100">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{monitor.name}</h5>
                          <Badge color={getStatusColor(monitor.status)}>{monitor.status}</Badge>
                        </div>

                        <p className="text-muted small mb-2">{monitor.url}</p>

                        {monitor.success && monitor.responseTimeMs && (
                          <p className="mb-1">
                            <small className="text-muted">Response time: {monitor.responseTimeMs}ms</small>
                          </p>
                        )}

                        {monitor.errorMessage && <p className="text-danger small mb-1">{monitor.errorMessage}</p>}

                        <p className="mb-0">
                          <small className="text-muted">Last checked: {new Date(monitor.lastChecked).toLocaleString()}</small>
                        </p>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>

          <div className="text-center mt-4">
            <small className="text-muted">Last updated: {new Date(status.lastUpdated).toLocaleString()}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStatusPage;
