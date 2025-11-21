import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Card, CardBody, CardHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IStatusDependency, DependencyType } from 'app/shared/model/status-dependency.model';

interface StatusDependencyEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  dependency: IStatusDependency | null;
  onSave: () => void;
  httpMonitors: any[];
  services: any[];
  instances: any[];
}

export const StatusDependencyEditModal: React.FC<StatusDependencyEditModalProps> = ({
  isOpen,
  toggle,
  dependency,
  onSave,
  httpMonitors,
  services,
  instances,
}) => {
  const [formData, setFormData] = useState<IStatusDependency>({
    parentType: DependencyType.HTTP,
    parentId: undefined,
    childType: DependencyType.SERVICE,
    childId: undefined,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dependency) {
      setFormData(dependency);
    } else {
      setFormData({
        parentType: DependencyType.HTTP,
        parentId: undefined,
        childType: DependencyType.SERVICE,
        childId: undefined,
      });
    }
  }, [dependency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.parentId || !formData.childId) {
      toast.error('Please select both parent and child items');
      return;
    }

    setSaving(true);
    try {
      if (dependency?.id) {
        await axios.put(`/api/status-dependencies/${dependency.id}`, formData);
        toast.success('Dependency updated successfully');
      } else {
        await axios.post('/api/status-dependencies', formData);
        toast.success('Dependency created successfully');
      }
      onSave();
      toggle();
    } catch (error) {
      toast.error('Failed to save dependency');
    } finally {
      setSaving(false);
    }
  };

  const getAvailableItems = (type: DependencyType) => {
    switch (type) {
      case DependencyType.HTTP:
        return httpMonitors;
      case DependencyType.SERVICE:
        return services;
      case DependencyType.INSTANCE:
        return instances;
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <h5 className="mb-0">{dependency ? 'Edit Dependency' : 'Add Dependency'}</h5>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="parentType">Parent Type (Depends On)</Label>
            <Input
              type="select"
              id="parentType"
              value={formData.parentType}
              onChange={e => setFormData({ ...formData, parentType: e.target.value as DependencyType, parentId: undefined })}
              required
            >
              <option value={DependencyType.HTTP}>HTTP Monitor</option>
              <option value={DependencyType.SERVICE}>Service</option>
              <option value={DependencyType.INSTANCE}>Instance</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="parentId">Parent Item</Label>
            <Input
              type="select"
              id="parentId"
              value={formData.parentId || ''}
              onChange={e => setFormData({ ...formData, parentId: Number(e.target.value) })}
              required
            >
              <option value="">Select {formData.parentType}...</option>
              {getAvailableItems(formData.parentType).map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <hr />

          <FormGroup>
            <Label for="childType">Child Type (Dependency)</Label>
            <Input
              type="select"
              id="childType"
              value={formData.childType}
              onChange={e => setFormData({ ...formData, childType: e.target.value as DependencyType, childId: undefined })}
              required
            >
              <option value={DependencyType.HTTP}>HTTP Monitor</option>
              <option value={DependencyType.SERVICE}>Service</option>
              <option value={DependencyType.INSTANCE}>Instance</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="childId">Child Item</Label>
            <Input
              type="select"
              id="childId"
              value={formData.childId || ''}
              onChange={e => setFormData({ ...formData, childId: Number(e.target.value) })}
              required
            >
              <option value="">Select {formData.childType}...</option>
              {getAvailableItems(formData.childType).map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <div className="d-flex justify-content-end gap-2">
            <Button color="secondary" onClick={toggle} disabled={saving}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={saving}>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};
