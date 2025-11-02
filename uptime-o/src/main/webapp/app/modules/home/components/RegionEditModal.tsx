import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { updateEntity, createEntity, getEntity, reset } from 'app/entities/region/region.reducer';

interface RegionEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  regionId?: number | null;
  onSave?: () => void;
}

export const RegionEditModal: React.FC<RegionEditModalProps> = ({ isOpen, toggle, regionId, onSave }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({ name: '', regionCode: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const regionEntity = useAppSelector(state => state.region.entity);
  const updating = useAppSelector(state => state.region.updating);
  const updateSuccess = useAppSelector(state => state.region.updateSuccess);

  const isNew = !regionId;

  useEffect(() => {
    if (isOpen) {
      if (isNew) {
        dispatch(reset());
        setFormData({ name: '', regionCode: '' });
      } else if (regionId) {
        dispatch(getEntity(regionId));
      }
    }
  }, [isOpen, regionId, isNew, dispatch]);

  useEffect(() => {
    if (!isNew && regionEntity && regionEntity.id === regionId) {
      setFormData({
        name: regionEntity.name || '',
        regionCode: regionEntity.regionCode || '',
      });
    }
  }, [regionEntity, regionId, isNew]);

  useEffect(() => {
    if (updateSuccess) {
      setFormData({ name: '', regionCode: '' });
      toggle();
      onSave?.();
    }
  }, [updateSuccess, toggle, onSave]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isNew) {
        dispatch(
          createEntity({
            name: formData.name,
            regionCode: formData.regionCode,
          }),
        );
      } else {
        dispatch(
          updateEntity({
            id: regionId,
            name: formData.name,
            regionCode: formData.regionCode,
          }),
        );
      }
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
              disabled={updating}
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
              disabled={updating}
            />
            {errors.regionCode && <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.regionCode}</div>}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter style={{ borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
        <Button color="secondary" onClick={toggle} disabled={updating}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={updating} style={{ cursor: updating ? 'not-allowed' : 'pointer' }}>
          {updating ? 'Saving...' : isNew ? 'Create' : 'Save Changes'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegionEditModal;
