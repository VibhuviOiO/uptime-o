import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
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

interface InstanceStatus {
  id: number;
  name: string;
  hostname: string;
  status: string;
  responseTimeMs: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  success: boolean;
  errorMessage: string;
  lastChecked: string;
}

interface ServiceStatus {
  id: number;
  name: string;
  serviceType: string;
  environment: string;
  status: string;
  responseTimeMs: number;
  healthyInstances: number;
  totalInstances: number;
  success: boolean;
  errorMessage: string;
  metadata: any;
  lastChecked: string;
}

interface DependencyStatus {
  parentType: string;
  parentId: number;
  parentName: string;
  childType: string;
  childId: number;
  childName: string;
  parentStatus: string;
  childStatus: string;
  isHealthy: boolean;
}

interface PrivateStatus {
  overallStatus: string;
  httpMonitors: HttpMonitorStatus[];
  instances: InstanceStatus[];
  services: ServiceStatus[];
  dependencies: DependencyStatus[];
  lastUpdated: string;
}

const PrivateStatusPage = () => {
  const [status, setStatus] = useState<PrivateStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get<PrivateStatus>('/api/status');
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
      case 'DEGRADED':
        return 'warning';
      default:
        return 'secondary';
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
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>System Status Dashboard</h1>
            <Badge color={getStatusColor(status.overallStatus)} className="fs-6 px-3 py-2">
              {status.overallStatus}
            </Badge>
          </div>

          <Nav tabs>
            <NavItem>
              <NavLink className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                Overview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={activeTab === 'http' ? 'active' : ''} onClick={() => setActiveTab('http')}>
                HTTP Monitors ({status.httpMonitors.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={activeTab === 'instances' ? 'active' : ''} onClick={() => setActiveTab('instances')}>
                Instances ({status.instances.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
                Services ({status.services.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={activeTab === 'dependencies' ? 'active' : ''} onClick={() => setActiveTab('dependencies')}>
                Dependencies ({status.dependencies.length})
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="overview">
              <Row className="mt-4">
                <Col md={3}>
                  <Card>
                    <CardBody className="text-center">
                      <h3 className="text-primary">{status.httpMonitors.length}</h3>
                      <p className="mb-0">HTTP Monitors</p>
                      <small className="text-muted">{status.httpMonitors.filter(m => m.success).length} UP</small>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card>
                    <CardBody className="text-center">
                      <h3 className="text-info">{status.instances.length}</h3>
                      <p className="mb-0">Instances</p>
                      <small className="text-muted">{status.instances.filter(i => i.success).length} UP</small>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card>
                    <CardBody className="text-center">
                      <h3 className="text-success">{status.services.length}</h3>
                      <p className="mb-0">Services</p>
                      <small className="text-muted">{status.services.filter(s => s.success).length} UP</small>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card>
                    <CardBody className="text-center">
                      <h3 className="text-warning">{status.dependencies.length}</h3>
                      <p className="mb-0">Dependencies</p>
                      <small className="text-muted">{status.dependencies.filter(d => d.isHealthy).length} Healthy</small>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tabId="http">
              <Row className="mt-4">
                {status.httpMonitors.map(monitor => (
                  <Col md={6} lg={4} key={monitor.id} className="mb-3">
                    <Card>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">{monitor.name}</h6>
                          <Badge color={getStatusColor(monitor.status)}>{monitor.status}</Badge>
                        </div>
                        <p className="text-muted small mb-2">{monitor.url}</p>
                        {monitor.responseTimeMs && (
                          <p className="mb-1">
                            <small>Response: {monitor.responseTimeMs}ms</small>
                          </p>
                        )}
                        {monitor.errorMessage && <p className="text-danger small">{monitor.errorMessage}</p>}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tabId="instances">
              <Row className="mt-4">
                {status.instances.map(instance => (
                  <Col md={6} lg={4} key={instance.id} className="mb-3">
                    <Card>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">{instance.name}</h6>
                          <Badge color={getStatusColor(instance.status)}>{instance.status}</Badge>
                        </div>
                        <p className="text-muted small mb-2">{instance.hostname}</p>
                        {instance.cpuUsage && (
                          <p className="mb-1">
                            <small>CPU: {instance.cpuUsage.toFixed(1)}%</small>
                          </p>
                        )}
                        {instance.memoryUsage && (
                          <p className="mb-1">
                            <small>Memory: {instance.memoryUsage.toFixed(1)}%</small>
                          </p>
                        )}
                        {instance.diskUsage && (
                          <p className="mb-1">
                            <small>Disk: {instance.diskUsage.toFixed(1)}%</small>
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tabId="services">
              <Row className="mt-4">
                {status.services.map(service => (
                  <Col md={6} lg={4} key={service.id} className="mb-3">
                    <Card>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">{service.name}</h6>
                          <Badge color={getStatusColor(service.status)}>{service.status}</Badge>
                        </div>
                        <p className="text-muted small mb-2">
                          {service.serviceType} - {service.environment}
                        </p>
                        <p className="mb-1">
                          <small>
                            Instances: {service.healthyInstances}/{service.totalInstances}
                          </small>
                        </p>
                        {service.responseTimeMs && (
                          <p className="mb-1">
                            <small>Response: {service.responseTimeMs}ms</small>
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tabId="dependencies">
              <div className="mt-4">
                {status.dependencies.map((dep, index) => (
                  <Card key={index} className="mb-3">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{dep.parentName}</strong> ({dep.parentType})<span className="mx-2">→</span>
                          <strong>{dep.childName}</strong> ({dep.childType})
                        </div>
                        <div>
                          <Badge color={getStatusColor(dep.parentStatus)} className="me-2">
                            {dep.parentStatus}
                          </Badge>
                          <Badge color={getStatusColor(dep.childStatus)}>{dep.childStatus}</Badge>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </TabPane>
          </TabContent>

          <div className="text-center mt-4">
            <small className="text-muted">Last updated: {new Date(status.lastUpdated).toLocaleString()}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateStatusPage;
