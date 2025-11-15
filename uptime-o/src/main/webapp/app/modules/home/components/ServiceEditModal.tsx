import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IService, defaultValue } from 'app/shared/model/service.model';
import { IDatacenter } from 'app/shared/model/datacenter.model';

interface ServiceEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  serviceId: number | null;
  onSave: () => void;
}

export const ServiceEditModal: React.FC<ServiceEditModalProps> = ({ isOpen, toggle, serviceId, onSave }) => {
  const [service, setService] = useState<IService>(defaultValue);
  const [datacenters, setDatacenters] = useState<IDatacenter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDatacenters();
      if (serviceId) {
        loadService();
      } else {
        setService(defaultValue);
      }
    }
  }, [isOpen, serviceId]);

  const loadService = async () => {
    try {
      const response = await axios.get<IService>(`/api/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      toast.error('Failed to load service');
    }
  };

  const loadDatacenters = async () => {
    try {
      const response = await axios.get<IDatacenter[]>('/api/datacenters');
      setDatacenters(response.data);
    } catch (error) {
      console.error('Failed to load datacenters', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setService(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (serviceId) {
        await axios.put(`/api/services/${serviceId}`, service);
        toast.success('Service updated successfully');
      } else {
        await axios.post('/api/services', service);
        toast.success('Service created successfully');
      }
      onSave();
      toggle();
    } catch (error) {
      toast.error(`Failed to ${serviceId ? 'update' : 'create'} service`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{serviceId ? 'Edit Service' : 'Create Service'}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="row">
            <div className="col-6">
              <FormGroup>
                <Label for="datacenterId">Datacenter</Label>
                <Input type="select" name="datacenterId" id="datacenterId" value={service.datacenterId || ''} onChange={handleChange}>
                  <option value="">-- Select Datacenter --</option>
                  {datacenters.map(dc => (
                    <option key={dc.id} value={dc.id}>
                      {dc.name} ({dc.code})
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="name">Name *</Label>
                <Input type="text" name="name" id="name" value={service.name || ''} onChange={handleChange} required maxLength={200} />
              </FormGroup>
            </div>
          </div>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input type="textarea" name="description" id="description" value={service.description || ''} onChange={handleChange} rows={2} />
          </FormGroup>
          <div className="row">
            <div className="col-6">
              <FormGroup>
                <Label for="serviceType">Service Type *</Label>
                <Input type="select" name="serviceType" id="serviceType" value={service.serviceType || ''} onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option value="TCP">TCP</option>
                  <option value="CASSANDRA">Cassandra</option>
                  <option value="MONGODB">MongoDB</option>
                  <option value="REDIS">Redis</option>
                  <option value="KAFKA">Kafka</option>
                  <option value="POSTGRESQL">PostgreSQL</option>
                  <option value="MYSQL">MySQL</option>
                  <option value="ELASTICSEARCH">Elasticsearch</option>
                  <option value="RABBITMQ">RabbitMQ</option>
                  <option value="CUSTOM">Custom</option>
                </Input>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="environment">Environment *</Label>
                <Input type="select" name="environment" id="environment" value={service.environment || ''} onChange={handleChange} required>
                  <option value="">Select...</option>
                  <option value="DEV">Development</option>
                  <option value="QA">QA</option>
                  <option value="STAGE">Staging</option>
                  <option value="PROD">Production</option>
                  <option value="DMZ">DMZ</option>
                  <option value="DR">DR</option>
                </Input>
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <FormGroup>
                <Label for="intervalSeconds">Interval (seconds) *</Label>
                <Input
                  type="number"
                  name="intervalSeconds"
                  id="intervalSeconds"
                  value={service.intervalSeconds || 30}
                  onChange={handleChange}
                  required
                  min={10}
                />
              </FormGroup>
            </div>
            <div className="col-4">
              <FormGroup>
                <Label for="timeoutMs">Timeout (ms) *</Label>
                <Input
                  type="number"
                  name="timeoutMs"
                  id="timeoutMs"
                  value={service.timeoutMs || 2000}
                  onChange={handleChange}
                  required
                  min={100}
                />
              </FormGroup>
            </div>
            <div className="col-4">
              <FormGroup>
                <Label for="retryCount">Retry Count *</Label>
                <Input
                  type="number"
                  name="retryCount"
                  id="retryCount"
                  value={service.retryCount || 2}
                  onChange={handleChange}
                  required
                  min={0}
                />
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <FormGroup>
                <Label for="latencyWarningMs">Latency Warning (ms)</Label>
                <Input
                  type="number"
                  name="latencyWarningMs"
                  id="latencyWarningMs"
                  value={service.latencyWarningMs || 200}
                  onChange={handleChange}
                  min={0}
                />
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="latencyCriticalMs">Latency Critical (ms)</Label>
                <Input
                  type="number"
                  name="latencyCriticalMs"
                  id="latencyCriticalMs"
                  value={service.latencyCriticalMs || 600}
                  onChange={handleChange}
                  min={0}
                />
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <FormGroup check>
                <Input
                  type="checkbox"
                  name="monitoringEnabled"
                  id="monitoringEnabled"
                  checked={service.monitoringEnabled ?? true}
                  onChange={handleChange}
                />
                <Label for="monitoringEnabled" check>
                  Monitoring Enabled
                </Label>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup check>
                <Input type="checkbox" name="isActive" id="isActive" checked={service.isActive ?? true} onChange={handleChange} />
                <Label for="isActive" check>
                  Active
                </Label>
              </FormGroup>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ServiceEditModal;
