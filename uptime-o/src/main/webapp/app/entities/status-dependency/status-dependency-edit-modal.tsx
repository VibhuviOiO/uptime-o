import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IStatusDependency, DependencyType } from 'app/shared/model/status-dependency.model';

interface DatacenterOption {
  id: number;
  name: string;
}

interface EntityOption {
  id: number;
  name: string;
}

interface StatusDependencyEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  statusDependency: IStatusDependency | null;
  onSave: () => void;
}

export const StatusDependencyEditModal: React.FC<StatusDependencyEditModalProps> = ({ isOpen, toggle, statusDependency, onSave }) => {
  const [formData, setFormData] = useState<IStatusDependency>({
    parentType: 'SERVICE',
    parentId: 0,
    childType: 'HTTP',
    childId: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datacenters, setDatacenters] = useState<DatacenterOption[]>([]);
  const [selectedDatacenter, setSelectedDatacenter] = useState<number | null>(null);
  const [parentOptions, setParentOptions] = useState<EntityOption[]>([]);
  const [childOptions, setChildOptions] = useState<EntityOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDatacenters();
    }
    if (statusDependency) {
      setFormData(statusDependency);
    } else {
      setFormData({
        parentType: 'SERVICE',
        parentId: 0,
        childType: 'HTTP',
        childId: 0,
      });
    }
    setError(null);
  }, [statusDependency, isOpen]);

  useEffect(() => {
    if (selectedDatacenter && formData.parentType) {
      loadEntityOptions(formData.parentType, setParentOptions);
    }
  }, [selectedDatacenter, formData.parentType]);

  useEffect(() => {
    if (selectedDatacenter && formData.childType) {
      loadEntityOptions(formData.childType, setChildOptions);
    }
  }, [selectedDatacenter, formData.childType]);

  const loadDatacenters = async () => {
    try {
      const response = await axios.get<DatacenterOption[]>('/api/datacenters');
      setDatacenters(response.data);
    } catch (err) {
      console.error('Failed to load datacenters:', err);
    }
  };

  const loadEntityOptions = async (type: string, setter: React.Dispatch<React.SetStateAction<EntityOption[]>>) => {
    if (!selectedDatacenter) return;

    try {
      let url = '';
      switch (type) {
        case 'HTTP':
          url = '/api/http-monitors';
          break;
        case 'SERVICE':
          url = `/api/services?datacenterId.equals=${selectedDatacenter}`;
          break;
        case 'INSTANCE':
          url = `/api/instances?datacenterId.equals=${selectedDatacenter}`;
          break;
        default:
          return;
      }

      const response = await axios.get(url);
      const options = response.data.map((item: any) => ({
        id: item.id,
        name: item.name || `${item.method} ${item.url}` || item.hostname || `ID: ${item.id}`,
      }));
      setter(options);
    } catch (err) {
      console.error(`Failed to load ${type} options:`, err);
      setter([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'parentType') {
      setFormData(prev => ({ ...prev, parentType: value as keyof typeof DependencyType, parentId: 0 }));
      setParentOptions([]);
    } else if (name === 'childType') {
      setFormData(prev => ({ ...prev, childType: value as keyof typeof DependencyType, childId: 0 }));
      setChildOptions([]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name.includes('Id') ? parseInt(value, 10) || 0 : value,
      }));
    }
  };

  const handleDatacenterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const datacenterId = parseInt(e.target.value, 10) || null;
    setSelectedDatacenter(datacenterId);
    setParentOptions([]);
    setChildOptions([]);
    setFormData(prev => ({ ...prev, parentId: 0, childId: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (statusDependency?.id) {
        await axios.put(`/api/status-dependencies/${statusDependency.id}`, formData);
        toast.success('Status dependency updated successfully');
      } else {
        await axios.post('/api/status-dependencies', formData);
        toast.success('Status dependency created successfully');
      }
      onSave();
      toggle();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save status dependency';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon="sitemap" className="me-2" />
          {statusDependency ? 'Edit Status Dependency' : 'Create New Status Dependency'}
        </h5>
        <Button color="link" onClick={toggle} className="p-0">
          <FontAwesomeIcon icon="times" />
        </Button>
      </CardHeader>
      <Form onSubmit={handleSubmit}>
        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}

          <FormGroup>
            <Label for="datacenter">Datacenter *</Label>
            <Input
              type="select"
              name="datacenter"
              id="datacenter"
              value={selectedDatacenter || ''}
              onChange={handleDatacenterChange}
              required
            >
              <option value="">Select Datacenter</option>
              {datacenters.map(dc => (
                <option key={dc.id} value={dc.id}>
                  {dc.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="parentType">Parent Type *</Label>
            <Input type="select" name="parentType" id="parentType" value={formData.parentType || ''} onChange={handleInputChange} required>
              <option value="SERVICE">Service</option>
              <option value="HTTP">HTTP Monitor</option>
              <option value="INSTANCE">Instance</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="parentId">Parent *</Label>
            <Input
              type="select"
              name="parentId"
              id="parentId"
              value={formData.parentId || ''}
              onChange={handleInputChange}
              required
              disabled={!selectedDatacenter || parentOptions.length === 0}
            >
              <option value="">Select {formData.parentType}</option>
              {parentOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="childType">Child Type *</Label>
            <Input type="select" name="childType" id="childType" value={formData.childType || ''} onChange={handleInputChange} required>
              <option value="SERVICE">Service</option>
              <option value="HTTP">HTTP Monitor</option>
              <option value="INSTANCE">Instance</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="childId">Child *</Label>
            <Input
              type="select"
              name="childId"
              id="childId"
              value={formData.childId || ''}
              onChange={handleInputChange}
              required
              disabled={!selectedDatacenter || childOptions.length === 0}
            >
              <option value="">Select {formData.childType}</option>
              {childOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <div className="d-flex gap-2 mt-3">
            <Button color="secondary" onClick={toggle} disabled={loading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : statusDependency ? 'Update' : 'Create'}
            </Button>
          </div>
        </CardBody>
      </Form>
    </Card>
  );
};
