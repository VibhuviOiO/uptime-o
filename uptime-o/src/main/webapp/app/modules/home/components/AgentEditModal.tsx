import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

interface AgentEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  agentId?: number | null;
  onSave?: () => void;
}

interface IDatacenter {
  id?: number;
  name?: string;
}

export const AgentEditModal: React.FC<AgentEditModalProps> = ({ isOpen, toggle, agentId, onSave }) => {
  const [formData, setFormData] = useState({ name: '', datacenterId: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [datacenters, setDatacenters] = useState<IDatacenter[]>([]);

  const isNew = !agentId;

  useEffect(() => {
    if (isOpen) {
      loadDatacenters();
      if (isNew) {
        setFormData({ name: '', datacenterId: '' });
      } else if (agentId) {
        loadAgent(agentId);
      }
    }
  }, [isOpen, agentId, isNew]);

  const loadDatacenters = async () => {
    try {
      const response = await axios.get<IDatacenter[]>('/api/datacenters?page=0&size=1000&sort=name,asc');
      setDatacenters(response.data);
    } catch (error) {
      toast.error('Failed to load datacenters');
    }
  };

  const loadAgent = async (id: number) => {
    try {
      const response = await axios.get(`/api/agents/${id}`);
      const agent = response.data;
      setFormData({
        name: agent.name || '',
        datacenterId: agent.datacenter?.id ? String(agent.datacenter.id) : '',
      });
    } catch (error) {
      toast.error('Failed to load agent');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot be longer than 50 characters';
    } else if (formData.name.length < 1) {
      newErrors.name = 'Name must be at least 1 character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
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
        id: agentId,
        name: formData.name,
      };

      if (formData.datacenterId) {
        data.datacenter = { id: parseInt(formData.datacenterId, 10) };
      }

      if (isNew) {
        await axios.post('/api/agents', data);
        toast.success('Agent created successfully');
      } else {
        await axios.put(`/api/agents/${agentId}`, data);
        toast.success('Agent updated successfully');
      }

      toggle();
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast.error(`Failed to ${isNew ? 'create' : 'update'} agent`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{isNew ? 'Create New Agent' : 'Edit Agent'}</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="name">Name *</Label>
            <Input
              type="text"
              name="name"
              id="name"
              placeholder="Enter agent name"
              value={formData.name}
              onChange={handleChange}
              invalid={!!errors.name}
              disabled={loading}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="datacenterId">Datacenter (Optional)</Label>
            <Input
              type="select"
              name="datacenterId"
              id="datacenterId"
              value={formData.datacenterId}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">-- Select Datacenter --</option>
              {datacenters &&
                datacenters.map(datacenter => (
                  <option key={datacenter.id} value={datacenter.id}>
                    {datacenter.name}
                  </option>
                ))}
            </Input>
          </FormGroup>
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
