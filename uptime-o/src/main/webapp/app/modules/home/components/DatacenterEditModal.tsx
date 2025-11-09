import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

interface DatacenterEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  datacenterId?: number | null;
  onSave?: () => void;
}

interface IRegion {
  id?: number;
  name?: string;
}

export const DatacenterEditModal: React.FC<DatacenterEditModalProps> = ({ isOpen, toggle, datacenterId, onSave }) => {
  const [formData, setFormData] = useState({ code: '', name: '', regionId: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<IRegion[]>([]);

  const isNew = !datacenterId;

  useEffect(() => {
    if (isOpen) {
      loadRegions();
      if (isNew) {
        setFormData({ code: '', name: '', regionId: '' });
      } else if (datacenterId) {
        loadDatacenter(datacenterId);
      }
    }
  }, [isOpen, datacenterId, isNew]);

  const loadRegions = async () => {
    try {
      const response = await axios.get<IRegion[]>('/api/regions?page=0&size=1000&sort=name,asc');
      setRegions(response.data);
    } catch (error) {
      toast.error('Failed to load regions');
    }
  };

  const loadDatacenter = async (id: number) => {
    try {
      const response = await axios.get(`/api/datacenters/${id}`);
      const datacenter = response.data;
      setFormData({
        code: datacenter.code || '',
        name: datacenter.name || '',
        regionId: datacenter.region?.id ? String(datacenter.region.id) : '',
      });
    } catch (error) {
      toast.error('Failed to load datacenter');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Code is required';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Code cannot be longer than 10 characters';
    } else if (formData.code.length < 1) {
      newErrors.code = 'Code must be at least 1 character';
    }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        id: datacenterId,
        code: formData.code,
        name: formData.name,
      };

      if (formData.regionId) {
        data.region = { id: parseInt(formData.regionId, 10) };
      }

      if (isNew) {
        await axios.post('/api/datacenters', data);
        toast.success('Datacenter created successfully');
      } else {
        await axios.put(`/api/datacenters/${datacenterId}`, data);
        toast.success('Datacenter updated successfully');
      }

      toggle();
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast.error(`Failed to ${isNew ? 'create' : 'update'} datacenter`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} data-cy="datacenterEditModalHeading">
        {isNew ? 'Create New Datacenter' : 'Edit Datacenter'}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="code">Code *</Label>
            <Input
              type="text"
              name="code"
              id="code"
              placeholder="Enter datacenter code (max 10 chars)"
              value={formData.code}
              onChange={handleChange}
              invalid={!!errors.code}
              disabled={loading}
              maxLength={10}
            />
            {errors.code && <div className="invalid-feedback d-block">{errors.code}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="name">Name *</Label>
            <Input
              type="text"
              name="name"
              id="name"
              placeholder="Enter datacenter name"
              value={formData.name}
              onChange={handleChange}
              invalid={!!errors.name}
              disabled={loading}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="regionId">Region (Optional)</Label>
            <Input type="select" name="regionId" id="regionId" value={formData.regionId} onChange={handleChange} disabled={loading}>
              <option value="">-- Select Region --</option>
              {regions &&
                regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
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

export default DatacenterEditModal;
