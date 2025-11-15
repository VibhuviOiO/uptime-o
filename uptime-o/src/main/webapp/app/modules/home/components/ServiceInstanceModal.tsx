import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Form, FormGroup, Label, Input, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IServiceInstance, defaultValue } from 'app/shared/model/service-instance.model';
import { IInstance } from 'app/shared/model/instance.model';
import { IDatacenter } from 'app/shared/model/datacenter.model';

interface ServiceInstanceModalProps {
  isOpen: boolean;
  toggle: () => void;
  serviceId: number | null;
}

export const ServiceInstanceModal: React.FC<ServiceInstanceModalProps> = ({ isOpen, toggle, serviceId }) => {
  const [instances, setInstances] = useState<IServiceInstance[]>([]);
  const [availableInstances, setAvailableInstances] = useState<IInstance[]>([]);
  const [datacenters, setDatacenters] = useState<IDatacenter[]>([]);
  const [selectedDatacenterId, setSelectedDatacenterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstance, setNewInstance] = useState<IServiceInstance>(defaultValue);

  useEffect(() => {
    if (isOpen && serviceId) {
      loadInstances();
      loadDatacenters();
    }
  }, [isOpen, serviceId]);

  useEffect(() => {
    if (selectedDatacenterId) {
      loadAvailableInstances();
    }
  }, [selectedDatacenterId]);

  const loadInstances = async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const response = await axios.get<IServiceInstance[]>(`/api/services/${serviceId}/instances`);
      setInstances(response.data);
    } catch (error) {
      toast.error('Failed to load instances');
    } finally {
      setLoading(false);
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

  const loadAvailableInstances = async () => {
    if (!selectedDatacenterId) return;
    try {
      const response = await axios.get<IInstance[]>(`/api/instances?datacenterId.equals=${selectedDatacenterId}`);
      setAvailableInstances(response.data);
    } catch (error) {
      console.error('Failed to load available instances', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;
    setNewInstance(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    setLoading(true);
    try {
      await axios.post(`/api/services/${serviceId}/instances`, newInstance);
      toast.success('Instance added successfully');
      setNewInstance(defaultValue);
      setShowAddForm(false);
      setSelectedDatacenterId(null);
      setAvailableInstances([]);
      loadInstances();
    } catch (error) {
      toast.error('Failed to add instance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (instanceId: number) => {
    if (!window.confirm('Are you sure you want to remove this instance?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/service-instances/${instanceId}`);
      toast.success('Instance removed successfully');
      loadInstances();
    } catch (error) {
      toast.error('Failed to remove instance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Manage Service Instances</ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6>Instances</h6>
          <Button color="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)} disabled={loading}>
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Add Instance
          </Button>
        </div>

        {showAddForm && (
          <Form onSubmit={handleAdd} className="mb-3 p-3 border rounded">
            <div className="row">
              <div className="col-6">
                <FormGroup>
                  <Label for="datacenterId">Datacenter *</Label>
                  <Input
                    type="select"
                    id="datacenterId"
                    value={selectedDatacenterId || ''}
                    onChange={e => setSelectedDatacenterId(e.target.value ? parseInt(e.target.value, 10) : null)}
                    required
                  >
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
                  <Label for="instanceId">Instance *</Label>
                  <Input
                    type="select"
                    name="instanceId"
                    id="instanceId"
                    value={newInstance.instanceId || ''}
                    onChange={handleChange}
                    required
                    disabled={!selectedDatacenterId}
                  >
                    <option value="">-- Select Instance --</option>
                    {availableInstances.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.hostname})
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className="col-12">
                <FormGroup>
                  <Label for="port">Port *</Label>
                  <Input
                    type="number"
                    name="port"
                    id="port"
                    value={newInstance.port || ''}
                    onChange={handleChange}
                    required
                    min={1}
                    max={65535}
                  />
                </FormGroup>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button color="secondary" size="sm" onClick={() => setShowAddForm(false)} disabled={loading}>
                Cancel
              </Button>
              <Button color="primary" size="sm" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </Form>
        )}

        {instances.length === 0 ? (
          <div className="alert alert-info">No instances configured. Add one to get started.</div>
        ) : (
          <Table responsive striped hover size="sm">
            <thead>
              <tr>
                <th>Instance</th>
                <th>Port</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((instance, i) => (
                <tr key={`instance-${i}`}>
                  <td>
                    <div>{instance.instanceName}</div>
                    <small className="text-muted">
                      <code>{instance.instanceHostname}</code>
                    </small>
                  </td>
                  <td>{instance.port}</td>
                  <td>
                    <Badge color={instance.isActive ? 'success' : 'secondary'}>{instance.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => handleDelete(instance.id)}
                      disabled={loading}
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
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ServiceInstanceModal;
