import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Card, CardBody, Badge, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faProjectDiagram, faList, faSitemap, faPencil } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IStatusDependency, DependencyType } from 'app/shared/model/status-dependency.model';
import { StatusDependencyEditModal } from './status-dependency-edit-modal';
import DependencyTree from './dependency-tree';

const StatusDependency = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [dependencies, setDependencies] = useState<IStatusDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<IStatusDependency | null>(null);

  // Get available items for dependencies
  const [httpMonitors, setHttpMonitors] = useState([]);
  const [services, setServices] = useState([]);
  const [instances, setInstances] = useState([]);
  const [statusPages, setStatusPages] = useState([]);

  useEffect(() => {
    loadDependencies();
    loadAvailableItems();
  }, []);

  const loadDependencies = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IStatusDependency[]>('/api/status-dependencies');
      setDependencies(response.data);
    } catch (error) {
      toast.error('Failed to load dependencies');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      const [httpRes, servicesRes, instancesRes, statusPagesRes] = await Promise.all([
        axios.get('/api/http-monitors'),
        axios.get('/api/services'),
        axios.get('/api/instances'),
        axios.get('/api/status-pages'),
      ]);
      setHttpMonitors(httpRes.data);
      setServices(servicesRes.data);
      setInstances(instancesRes.data);
      setStatusPages(statusPagesRes.data);
    } catch (error) {
      console.error('Failed to load available items', error);
    }
  };

  const handleCreateClick = () => {
    setSelectedDependency(null);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedDependency(null);
  };

  const handleEditSuccess = () => {
    loadDependencies();
  };

  const handleDelete = async (dependency: IStatusDependency) => {
    if (window.confirm('Are you sure you want to delete this dependency?')) {
      try {
        await axios.delete(`/api/status-dependencies/${dependency.id}`);
        toast.success('Dependency deleted successfully');
        loadDependencies();
      } catch (error) {
        toast.error('Failed to delete dependency');
      }
    }
  };

  const getItemName = (type: DependencyType, id: number) => {
    let items = [];
    switch (type) {
      case DependencyType.HTTP:
        items = httpMonitors;
        break;
      case DependencyType.SERVICE:
        items = services;
        break;
      case DependencyType.INSTANCE:
        items = instances;
        break;
      default:
        items = [];
        break;
    }
    const item = items.find((i: any) => i.id === id);
    return item ? item.name : `Unknown (${id})`;
  };

  const getTypeBadgeColor = (type: DependencyType) => {
    switch (type) {
      case DependencyType.HTTP:
        return 'primary';
      case DependencyType.SERVICE:
        return 'success';
      case DependencyType.INSTANCE:
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading dependencies...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faProjectDiagram} className="me-2" />
              Service Dependencies
            </h5>
            <Button color="primary" size="sm" onClick={handleCreateClick}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Dependency
            </Button>
          </div>

          <Nav tabs>
            <NavItem>
              <NavLink className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')} style={{ cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faList} className="me-2" />
                List View
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={activeTab === 'tree' ? 'active' : ''} onClick={() => setActiveTab('tree')} style={{ cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faSitemap} className="me-2" />
                Tree View
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab} className="mt-3">
            <TabPane tabId="list">
              {!dependencies || dependencies.length === 0 ? (
                <div className="alert alert-info">
                  <p>No dependencies configured. Add dependencies to model service relationships.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Parent (Depends On)</th>
                      <th>Child (Dependency)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dependencies.map((dependency, i) => (
                      <tr key={`entity-${i}`}>
                        <td>
                          <Badge color={getTypeBadgeColor(dependency.parentType)} className="me-2">
                            {dependency.parentType}
                          </Badge>
                          <strong>{getItemName(dependency.parentType, dependency.parentId)}</strong>
                        </td>
                        <td>
                          <Badge color={getTypeBadgeColor(dependency.childType)} className="me-2">
                            {dependency.childType}
                          </Badge>
                          <strong>{getItemName(dependency.childType, dependency.childId)}</strong>
                        </td>
                        <td>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => {
                              setSelectedDependency(dependency);
                              setEditModalOpen(true);
                            }}
                            title="Edit"
                            style={{ padding: 0, marginRight: '0.5rem' }}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </Button>
                          <Button
                            color="link"
                            size="sm"
                            onClick={() => handleDelete(dependency)}
                            title="Delete"
                            style={{ padding: 0, color: '#dc3545' }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TabPane>
            <TabPane tabId="tree">
              <DependencyTree />
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>

      {editModalOpen && (
        <div className="mt-3">
          <StatusDependencyEditModal
            isOpen={editModalOpen}
            toggle={handleCloseEditModal}
            dependency={selectedDependency}
            onSave={handleEditSuccess}
            httpMonitors={httpMonitors}
            services={services}
            instances={instances}
            statusPages={statusPages}
          />
        </div>
      )}
    </div>
  );
};

export default StatusDependency;
