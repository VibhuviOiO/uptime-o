import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { updateEntity, createEntity, getEntity, reset } from 'app/entities/datacenter/datacenter.reducer';
import { getEntities as getRegions } from 'app/entities/region/region.reducer';

interface DatacenterEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  datacenterId?: number | null;
  onSave?: () => void;
}

export const DatacenterEditModal: React.FC<DatacenterEditModalProps> = ({ isOpen, toggle, datacenterId, onSave }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({ code: '', name: '', regionId: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const datacenterEntity = useAppSelector(state => state.datacenter.entity);
  const updating = useAppSelector(state => state.datacenter.updating);
  const updateSuccess = useAppSelector(state => state.datacenter.updateSuccess);
  const regions = useAppSelector(state => state.region.entities);

  const isNew = !datacenterId;

  useEffect(() => {
    if (isOpen) {
      dispatch(getRegions({ page: 0, size: 1000, sort: 'id,desc' }));
      if (isNew) {
        dispatch(reset());
        setFormData({ code: '', name: '', regionId: '' });
      } else if (datacenterId) {
        dispatch(getEntity(datacenterId));
      }
    }
  }, [isOpen, datacenterId, isNew, dispatch]);

  useEffect(() => {
    if (!isNew && datacenterEntity && datacenterEntity.id === datacenterId) {
      setFormData({
        code: datacenterEntity.code || '',
        name: datacenterEntity.name || '',
        regionId: datacenterEntity.region?.id ? String(datacenterEntity.region.id) : '',
      });
    }
  }, [datacenterEntity, datacenterId, isNew]);

  useEffect(() => {
    if (updateSuccess) {
      setFormData({ code: '', name: '', regionId: '' });
      toggle();
      onSave?.();
    }
  }, [updateSuccess, toggle, onSave]);

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

    return newErrors;
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

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit: any = {
      code: formData.code,
      name: formData.name,
    };

    if (formData.regionId) {
      dataToSubmit.region = { id: parseInt(formData.regionId, 10) };
    }

    if (isNew) {
      dispatch(createEntity(dataToSubmit));
    } else {
      dispatch(
        updateEntity({
          ...datacenterEntity,
          ...dataToSubmit,
        }),
      );
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
              disabled={updating}
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
              disabled={updating}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="regionId">Region (Optional)</Label>
            <Input type="select" name="regionId" id="regionId" value={formData.regionId} onChange={handleChange} disabled={updating}>
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
        <Button color="secondary" onClick={toggle} disabled={updating}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={updating}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DatacenterEditModal;
