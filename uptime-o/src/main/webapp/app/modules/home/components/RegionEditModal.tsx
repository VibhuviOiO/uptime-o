import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

interface RegionEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  regionId?: number | null;
  onSave?: () => void;
}

export const RegionEditModal: React.FC<RegionEditModalProps> = ({ isOpen, toggle, regionId, onSave }) => {
  const [formData, setFormData] = useState({ name: '', regionCode: '', groupName: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const isNew = !regionId;

  useEffect(() => {
    if (isOpen) {
      if (isNew) {
        setFormData({ name: '', regionCode: '', groupName: '' });
      } else if (regionId) {
        loadRegion(regionId);
      }
    }
  }, [isOpen, regionId, isNew]);

  const loadRegion = async (id: number) => {
    try {
      const response = await axios.get(`/api/regions/${id}`);
      const region = response.data;
      setFormData({
        name: region.name || '',
        regionCode: region.regionCode || '',
        groupName: region.groupName || '',
      });
    } catch (error) {
      toast.error('Failed to load region');
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

    if (formData.regionCode && formData.regionCode.length > 20) {
      newErrors.regionCode = 'Region Code cannot be longer than 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = {
        id: regionId,
        name: formData.name,
        regionCode: formData.regionCode,
        groupName: formData.groupName,
      };

      if (isNew) {
        await axios.post('/api/regions', data);
        toast.success('Region created successfully');
      } else {
        await axios.put(`/api/regions/${regionId}`, data);
        toast.success('Region updated successfully');
      }

      toggle();
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast.error(`Failed to ${isNew ? 'create' : 'update'} region`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md" backdrop="static">
      <ModalHeader toggle={toggle} style={{ borderBottom: '1px solid #dee2e6' }}>
        <span>{isNew ? 'Create Region' : 'Edit Region'}</span>
      </ModalHeader>
      <ModalBody style={{ paddingBottom: 0 }}>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="region-name">
              Name <span style={{ color: '#dc3545' }}>*</span>
            </Label>
            <Input
              type="text"
              name="name"
              id="region-name"
              placeholder="Enter region name"
              value={formData.name}
              onChange={handleInputChange}
              invalid={!!errors.name}
              disabled={loading}
            />
            {errors.name && <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</div>}
          </FormGroup>

          <FormGroup>
            <Label for="region-code">Region Code</Label>
            <Input
              type="text"
              name="regionCode"
              id="region-code"
              placeholder="Enter region code (e.g., US-EAST-1)"
              value={formData.regionCode}
              onChange={handleInputChange}
              invalid={!!errors.regionCode}
              disabled={loading}
            />
            {errors.regionCode && <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.regionCode}</div>}
          </FormGroup>

          <FormGroup>
            <Label for="group-name">Group Name</Label>
            <Input
              type="text"
              name="groupName"
              id="group-name"
              placeholder="Enter group name"
              value={formData.groupName}
              onChange={handleInputChange}
              invalid={!!errors.groupName}
              disabled={loading}
            />
            {errors.groupName && <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.groupName}</div>}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter style={{ borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving...' : isNew ? 'Create' : 'Save Changes'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegionEditModal;
