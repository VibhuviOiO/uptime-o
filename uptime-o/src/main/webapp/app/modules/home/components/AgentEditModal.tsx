import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { updateEntity, createEntity, getEntity, reset } from 'app/entities/agent/agent.reducer';
import { getEntities as getDatacenters } from 'app/entities/datacenter/datacenter.reducer';

interface AgentEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  agentId?: number | null;
  onSave?: () => void;
}

export const AgentEditModal: React.FC<AgentEditModalProps> = ({ isOpen, toggle, agentId, onSave }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({ name: '', datacenterId: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const agentEntity = useAppSelector(state => state.agent.entity);
  const updating = useAppSelector(state => state.agent.updating);
  const updateSuccess = useAppSelector(state => state.agent.updateSuccess);
  const datacenters = useAppSelector(state => state.datacenter.entities);

  const isNew = !agentId;

  useEffect(() => {
    if (isOpen) {
      dispatch(getDatacenters({ page: 0, size: 1000, sort: 'id,desc' }));
      if (isNew) {
        dispatch(reset());
        setFormData({ name: '', datacenterId: '' });
      } else if (agentId) {
        dispatch(getEntity(agentId));
      }
    }
  }, [isOpen, agentId, isNew, dispatch]);

  useEffect(() => {
    if (!isNew && agentEntity && agentEntity.id === agentId) {
      setFormData({
        name: agentEntity.name || '',
        datacenterId: agentEntity.datacenter?.id ? String(agentEntity.datacenter.id) : '',
      });
    }
  }, [agentEntity, agentId, isNew]);

  useEffect(() => {
    if (updateSuccess) {
      setFormData({ name: '', datacenterId: '' });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit: any = {
        name: formData.name,
      };

      if (formData.datacenterId) {
        dataToSubmit.datacenter = { id: parseInt(formData.datacenterId, 10) };
      }

      if (isNew) {
        dispatch(createEntity(dataToSubmit));
      } else {
        dispatch(
          updateEntity({
            id: agentId,
            ...dataToSubmit,
          }),
        );
      }
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
              disabled={updating}
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
              disabled={updating}
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
