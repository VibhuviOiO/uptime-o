import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

interface InstanceEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  instanceId?: number | null;
  onSave?: () => void;
}

interface IDatacenter {
  id?: number;
  name?: string;
}

export const InstanceEditModal: React.FC<InstanceEditModalProps> = ({ isOpen, toggle, instanceId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    description: '',
    instanceType: 'VM',
    monitoringType: 'SELF_HOSTED',
    agentId: '',
    operatingSystem: '',
    platform: '',
    privateIpAddress: '',
    publicIpAddress: '',
    datacenterId: '',
    pingEnabled: true,
    pingInterval: 30,
    pingTimeoutMs: 3000,
    pingRetryCount: 2,
    hardwareMonitoringEnabled: false,
    hardwareMonitoringInterval: 300,
    cpuWarningThreshold: 70,
    cpuDangerThreshold: 90,
    memoryWarningThreshold: 75,
    memoryDangerThreshold: 90,
    diskWarningThreshold: 80,
    diskDangerThreshold: 95,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [datacenters, setDatacenters] = useState<IDatacenter[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  const isNew = !instanceId;

  useEffect(() => {
    if (isOpen) {
      loadDatacenters();
      loadAgents();
      if (isNew) {
        setFormData({
          name: '',
          hostname: '',
          description: '',
          instanceType: 'VM',
          monitoringType: 'SELF_HOSTED',
          agentId: '',
          operatingSystem: '',
          platform: '',
          privateIpAddress: '',
          publicIpAddress: '',
          datacenterId: '',
          pingEnabled: true,
          pingInterval: 30,
          pingTimeoutMs: 3000,
          pingRetryCount: 2,
          hardwareMonitoringEnabled: false,
          hardwareMonitoringInterval: 300,
          cpuWarningThreshold: 70,
          cpuDangerThreshold: 90,
          memoryWarningThreshold: 75,
          memoryDangerThreshold: 90,
          diskWarningThreshold: 80,
          diskDangerThreshold: 95,
        });
      } else if (instanceId) {
        loadInstance(instanceId);
      }
    }
  }, [isOpen, instanceId, isNew]);

  const loadDatacenters = async () => {
    try {
      const response = await axios.get<IDatacenter[]>('/api/datacenters?page=0&size=1000&sort=name,asc');
      setDatacenters(response.data);
    } catch (error) {
      toast.error('Failed to load datacenters');
    }
  };

  const loadAgents = async () => {
    try {
      const response = await axios.get('/api/agents?page=0&size=1000&sort=name,asc');
      setAgents(response.data);
    } catch (error) {
      toast.error('Failed to load agents');
    }
  };

  const loadInstance = async (id: number) => {
    try {
      const response = await axios.get(`/api/instances/${id}`);
      const instance = response.data;
      setFormData({
        name: instance.name || '',
        hostname: instance.hostname || '',
        description: instance.description || '',
        instanceType: instance.instanceType || 'VM',
        monitoringType: instance.monitoringType || 'SELF_HOSTED',
        agentId: instance.agentId ? String(instance.agentId) : '',
        operatingSystem: instance.operatingSystem || '',
        platform: instance.platform || '',
        privateIpAddress: instance.privateIpAddress || '',
        publicIpAddress: instance.publicIpAddress || '',
        datacenterId: instance.datacenterId ? String(instance.datacenterId) : '',
        pingEnabled: instance.pingEnabled ?? true,
        pingInterval: instance.pingInterval || 30,
        pingTimeoutMs: instance.pingTimeoutMs || 3000,
        pingRetryCount: instance.pingRetryCount || 2,
        hardwareMonitoringEnabled: instance.hardwareMonitoringEnabled ?? false,
        hardwareMonitoringInterval: instance.hardwareMonitoringInterval || 300,
        cpuWarningThreshold: instance.cpuWarningThreshold || 70,
        cpuDangerThreshold: instance.cpuDangerThreshold || 90,
        memoryWarningThreshold: instance.memoryWarningThreshold || 75,
        memoryDangerThreshold: instance.memoryDangerThreshold || 90,
        diskWarningThreshold: instance.diskWarningThreshold || 80,
        diskDangerThreshold: instance.diskDangerThreshold || 95,
      });
    } catch (error) {
      toast.error('Failed to load instance');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (!formData.hostname || formData.hostname.trim() === '') {
      newErrors.hostname = 'Hostname is required';
    }

    if (!formData.datacenterId) {
      newErrors.datacenterId = 'Datacenter is required';
    }

    if (formData.monitoringType === 'AGENT_MONITORED' && !formData.agentId) {
      newErrors.agentId = 'Agent is required for Agent Monitored';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        id: instanceId,
        name: formData.name,
        hostname: formData.hostname,
        description: formData.description || null,
        instanceType: formData.instanceType,
        monitoringType: formData.monitoringType,
        agentId: formData.monitoringType === 'AGENT_MONITORED' && formData.agentId ? parseInt(formData.agentId, 10) : null,
        operatingSystem: formData.operatingSystem || null,
        platform: formData.platform || null,
        privateIpAddress: formData.privateIpAddress || null,
        publicIpAddress: formData.publicIpAddress || null,
        datacenterId: parseInt(formData.datacenterId, 10),
        pingEnabled: formData.pingEnabled,
        pingInterval: formData.pingInterval,
        pingTimeoutMs: formData.pingTimeoutMs,
        pingRetryCount: formData.pingRetryCount,
        hardwareMonitoringEnabled: formData.hardwareMonitoringEnabled,
        hardwareMonitoringInterval: formData.hardwareMonitoringInterval,
        cpuWarningThreshold: formData.cpuWarningThreshold,
        cpuDangerThreshold: formData.cpuDangerThreshold,
        memoryWarningThreshold: formData.memoryWarningThreshold,
        memoryDangerThreshold: formData.memoryDangerThreshold,
        diskWarningThreshold: formData.diskWarningThreshold,
        diskDangerThreshold: formData.diskDangerThreshold,
      };

      if (isNew) {
        await axios.post('/api/instances', data);
        toast.success('Instance created successfully');
      } else {
        await axios.put(`/api/instances/${instanceId}`, data);
        toast.success('Instance updated successfully');
      }

      toggle();
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast.error(`Failed to ${isNew ? 'create' : 'update'} instance`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{isNew ? 'Create New Instance' : 'Edit Instance'}</ModalHeader>
      <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Form>
          <h6 className="mb-3">Basic Information</h6>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Label for="name">Name *</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  invalid={!!errors.name}
                  disabled={loading}
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="hostname">Hostname *</Label>
                <Input
                  type="text"
                  name="hostname"
                  id="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  invalid={!!errors.hostname}
                  disabled={loading}
                />
                {errors.hostname && <div className="invalid-feedback d-block">{errors.hostname}</div>}
              </FormGroup>
            </div>
          </div>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="text"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </FormGroup>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Label for="instanceType">Instance Type</Label>
                <Input
                  type="select"
                  name="instanceType"
                  id="instanceType"
                  value={formData.instanceType}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="VM">VM</option>
                  <option value="BARE_METAL">Bare Metal</option>
                  <option value="CONTAINER">Container</option>
                  <option value="CLOUD_INSTANCE">Cloud Instance</option>
                </Input>
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="monitoringType">Monitoring Type</Label>
                <Input
                  type="select"
                  name="monitoringType"
                  id="monitoringType"
                  value={formData.monitoringType}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="SELF_HOSTED">Self Hosted</option>
                  <option value="AGENT_MONITORED">Agent Monitored</option>
                </Input>
              </FormGroup>
            </div>
          </div>
          {formData.monitoringType === 'AGENT_MONITORED' && (
            <FormGroup>
              <Label for="agentId">Agent *</Label>
              <Input
                type="select"
                name="agentId"
                id="agentId"
                value={formData.agentId}
                onChange={handleChange}
                invalid={!!errors.agentId}
                disabled={loading}
              >
                <option value="">-- Select Agent --</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Input>
              {errors.agentId && <div className="invalid-feedback d-block">{errors.agentId}</div>}
            </FormGroup>
          )}
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Label for="operatingSystem">Operating System</Label>
                <Input
                  type="text"
                  name="operatingSystem"
                  id="operatingSystem"
                  value={formData.operatingSystem}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., Linux, Windows"
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="platform">Platform</Label>
                <Input
                  type="text"
                  name="platform"
                  id="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., Ubuntu 22.04"
                />
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Label for="privateIpAddress">Private IP Address</Label>
                <Input
                  type="text"
                  name="privateIpAddress"
                  id="privateIpAddress"
                  value={formData.privateIpAddress}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., 192.168.1.10"
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="publicIpAddress">Public IP Address</Label>
                <Input
                  type="text"
                  name="publicIpAddress"
                  id="publicIpAddress"
                  value={formData.publicIpAddress}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., 203.0.113.10"
                />
              </FormGroup>
            </div>
          </div>
          <FormGroup>
            <Label for="datacenterId">Datacenter *</Label>
            <Input
              type="select"
              name="datacenterId"
              id="datacenterId"
              value={formData.datacenterId}
              onChange={handleChange}
              invalid={!!errors.datacenterId}
              disabled={loading}
            >
              <option value="">-- Select Datacenter --</option>
              {datacenters.map(dc => (
                <option key={dc.id} value={dc.id}>
                  {dc.name}
                </option>
              ))}
            </Input>
            {errors.datacenterId && <div className="invalid-feedback d-block">{errors.datacenterId}</div>}
          </FormGroup>

          <hr className="my-4" />
          <h6 className="mb-3">Ping Monitoring</h6>
          <FormGroup check className="mb-3">
            <Label check>
              <Input type="checkbox" name="pingEnabled" checked={formData.pingEnabled} onChange={handleChange} disabled={loading} /> Enable
              Ping Monitoring
            </Label>
          </FormGroup>
          {formData.pingEnabled && (
            <div className="row">
              <div className="col-md-4">
                <FormGroup>
                  <Label for="pingInterval">Interval (seconds)</Label>
                  <Input
                    type="number"
                    name="pingInterval"
                    id="pingInterval"
                    value={formData.pingInterval}
                    onChange={handleChange}
                    disabled={loading}
                    min="10"
                  />
                </FormGroup>
              </div>
              <div className="col-md-4">
                <FormGroup>
                  <Label for="pingTimeoutMs">Timeout (ms)</Label>
                  <Input
                    type="number"
                    name="pingTimeoutMs"
                    id="pingTimeoutMs"
                    value={formData.pingTimeoutMs}
                    onChange={handleChange}
                    disabled={loading}
                    min="1000"
                  />
                </FormGroup>
              </div>
              <div className="col-md-4">
                <FormGroup>
                  <Label for="pingRetryCount">Retry Count</Label>
                  <Input
                    type="number"
                    name="pingRetryCount"
                    id="pingRetryCount"
                    value={formData.pingRetryCount}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                  />
                </FormGroup>
              </div>
            </div>
          )}

          <hr className="my-4" />
          <h6 className="mb-3">Hardware Monitoring</h6>
          <FormGroup check className="mb-3">
            <Label check>
              <Input
                type="checkbox"
                name="hardwareMonitoringEnabled"
                checked={formData.hardwareMonitoringEnabled}
                onChange={handleChange}
                disabled={loading}
              />{' '}
              Enable Hardware Monitoring
            </Label>
          </FormGroup>
          {formData.hardwareMonitoringEnabled && (
            <>
              <FormGroup>
                <Label for="hardwareMonitoringInterval">Interval (seconds)</Label>
                <Input
                  type="number"
                  name="hardwareMonitoringInterval"
                  id="hardwareMonitoringInterval"
                  value={formData.hardwareMonitoringInterval}
                  onChange={handleChange}
                  disabled={loading}
                  min="60"
                />
              </FormGroup>
              <h6 className="mt-3 mb-2">CPU Thresholds (%)</h6>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="cpuWarningThreshold">Warning</Label>
                    <Input
                      type="number"
                      name="cpuWarningThreshold"
                      id="cpuWarningThreshold"
                      value={formData.cpuWarningThreshold}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="100"
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="cpuDangerThreshold">Danger</Label>
                    <Input
                      type="number"
                      name="cpuDangerThreshold"
                      id="cpuDangerThreshold"
                      value={formData.cpuDangerThreshold}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="100"
                    />
                  </FormGroup>
                </div>
              </div>
              <h6 className="mt-3 mb-2">Memory Thresholds (%)</h6>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="memoryWarningThreshold">Warning</Label>
                    <Input
                      type="number"
                      name="memoryWarningThreshold"
                      id="memoryWarningThreshold"
                      value={formData.memoryWarningThreshold}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="100"
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="memoryDangerThreshold">Danger</Label>
                    <Input
                      type="number"
                      name="memoryDangerThreshold"
                      id="memoryDangerThreshold"
                      value={formData.memoryDangerThreshold}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="100"
                    />
                  </FormGroup>
                </div>
              </div>
              <h6 className="mt-3 mb-2">Disk Thresholds (%)</h6>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="diskWarningThreshold">Warning</Label>
                    <Input
                      type="number"
                      name="diskWarningThreshold"
                      id="diskWarningThreshold"
                      value={formData.diskWarningThreshold}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="100"
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="diskDangerThreshold">Danger</Label>
                    <Input
                      type="number"
                      name="diskDangerThreshold"
                      id="diskDangerThreshold"
                      value={formData.diskDangerThreshold}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="100"
                    />
                  </FormGroup>
                </div>
              </div>
            </>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={loading}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InstanceEditModal;
