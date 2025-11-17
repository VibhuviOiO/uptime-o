import React, { useEffect, useState } from 'react';
import { Button, Table, Spinner, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faServer, faPlus, faNetworkWired, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import ServiceEditModal from 'app/modules/home/components/ServiceEditModal';
import ServiceDeleteModal from 'app/modules/home/components/ServiceDeleteModal';
import ServiceInstanceModal from 'app/modules/home/components/ServiceInstanceModal';
import { IService } from 'app/shared/model/service.model';
import { IServiceInstance } from 'app/shared/model/service-instance.model';

export const ServicesTab = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [serviceInstances, setServiceInstances] = useState<Record<number, IServiceInstance[]>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IService[]>('/api/services?page=0&size=1000&sort=id,desc');
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load services');
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedServiceId(null);
    setModalOpen(true);
  };

  const handleEditClick = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedServiceId(null);
  };

  const handleDeleteClick = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedServiceId(null);
  };

  const handleInstancesClick = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setInstanceModalOpen(true);
  };

  const toggleInstancesView = async (serviceId: number) => {
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
    } else {
      setExpandedServiceId(serviceId);
      // Load instances if not already loaded
      if (!serviceInstances[serviceId]) {
        try {
          const response = await axios.get<IServiceInstance[]>(`/api/services/${serviceId}/instances`);
          setServiceInstances(prev => ({ ...prev, [serviceId]: response.data }));
        } catch (error) {
          toast.error('Failed to load instances');
        }
      }
    }
  };

  const handleCloseInstanceModal = () => {
    setInstanceModalOpen(false);
    setSelectedServiceId(null);
  };

  const handleSaveSuccess = () => {
    loadServices();
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FontAwesomeIcon icon={faServer} className="me-2" />
          Services
        </h5>
        <Button color="primary" size="sm" onClick={handleCreateClick}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Service
        </Button>
      </div>

      {!services || services.length === 0 ? (
        <div className="alert alert-info">
          <p>No services found. Create one to get started.</p>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Environment</th>
              <th>Datacenter</th>
              <th>Monitoring</th>
              <th>Interval</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, i) => (
              <React.Fragment key={`entity-${i}`}>
                <tr>
                  <td>
                    <strong>{service.name}</strong>
                    {service.description && (
                      <>
                        <br />
                        <small className="text-muted">{service.description}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <Badge color="info">{service.serviceType}</Badge>
                  </td>
                  <td>
                    <Badge color={service.environment === 'PROD' ? 'danger' : 'secondary'}>{service.environment}</Badge>
                  </td>
                  <td>
                    <small>{service.datacenterName || <em className="text-muted">N/A</em>}</small>
                  </td>
                  <td>
                    <Badge color={service.monitoringEnabled ? 'success' : 'secondary'}>
                      {service.monitoringEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td>
                    <small>
                      {service.intervalSeconds}s / {service.timeoutMs}ms
                    </small>
                  </td>
                  <td>
                    <Badge color={service.isActive ? 'success' : 'secondary'}>{service.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => toggleInstancesView(service.id)}
                      title="Show/Hide Instances"
                      style={{ padding: 0, marginRight: '0.5rem' }}
                    >
                      <FontAwesomeIcon icon={expandedServiceId === service.id ? faChevronDown : faChevronRight} />
                    </Button>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => handleInstancesClick(service.id)}
                      title="Manage Instances"
                      style={{ padding: 0, marginRight: '0.5rem' }}
                    >
                      <FontAwesomeIcon icon={faNetworkWired} />
                    </Button>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => handleEditClick(service.id)}
                      title="Edit"
                      style={{ padding: 0, marginRight: '0.5rem' }}
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </Button>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => handleDeleteClick(service.id)}
                      title="Delete"
                      style={{ padding: 0, color: '#dc3545' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
                {expandedServiceId === service.id && (
                  <tr>
                    <td colSpan={8} style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>
                      <h6>Service Instances</h6>
                      {serviceInstances[service.id] && serviceInstances[service.id].length > 0 ? (
                        <Table size="sm" className="mb-0">
                          <thead>
                            <tr>
                              <th>Instance</th>
                              <th>Port</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceInstances[service.id].map((instance, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div>{instance.instanceName}</div>
                                  <small className="text-muted">{instance.instanceHostname}</small>
                                </td>
                                <td>{instance.port}</td>
                                <td>
                                  <Badge color={instance.isActive ? 'success' : 'secondary'}>
                                    {instance.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p className="text-muted mb-0">No instances configured</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}

      <ServiceEditModal isOpen={modalOpen} toggle={handleCloseModal} serviceId={selectedServiceId} onSave={handleSaveSuccess} />
      <ServiceDeleteModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        serviceId={selectedServiceId}
        onDelete={handleSaveSuccess}
      />
      <ServiceInstanceModal isOpen={instanceModalOpen} toggle={handleCloseInstanceModal} serviceId={selectedServiceId} />
    </div>
  );
};

export default ServicesTab;
