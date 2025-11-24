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
  statusPages: any[];
}

export const StatusDependencyEditModal: React.FC<StatusDependencyEditModalProps> = ({
  isOpen,
  toggle,
  dependency,
  onSave,
  httpMonitors,
  services,
  instances,
  statusPages,
}) => {
  const [parentType, setParentType] = useState<DependencyType>(DependencyType.SERVICE);
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [childType, setChildType] = useState<DependencyType>(DependencyType.INSTANCE);
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dependency) {
      setParentType(dependency.parentType);
      setParentId(dependency.parentId);
      setChildType(dependency.childType);
      setSelectedChildren(dependency.childId ? [dependency.childId] : []);
    } else {
      setParentType(DependencyType.SERVICE);
      setParentId(undefined);
      setChildType(DependencyType.INSTANCE);
      setSelectedChildren([]);
    }
  }, [dependency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentId) {
      toast.error('Please select a parent item');
      return;
    }

    if (selectedChildren.length === 0) {
      toast.error('Please select at least one child item');
      return;
    }

    setSaving(true);
    try {
      if (dependency?.id) {
        await axios.put(`/api/status-dependencies/${dependency.id}`, {
          parentType,
          parentId,
          childType,
          childId: selectedChildren[0],
        });
        toast.success('Dependency updated successfully');
      } else {
        const promises = selectedChildren.map(childId =>
          axios.post('/api/status-dependencies', {
            parentType,
            parentId,
            childType,
            childId,
          }),
        );
        await Promise.all(promises);
        toast.success(`${selectedChildren.length} dependencies created successfully`);
      }
      onSave();
      toggle();
    } catch (error) {
      toast.error('Failed to save dependencies');
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
            <Label for="parentType">Parent Type</Label>
            <Input
              type="select"
              id="parentType"
              value={parentType}
              onChange={e => {
                setParentType(e.target.value as DependencyType);
                setParentId(undefined);
              }}
              required
              disabled={!!dependency}
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
              value={parentId || ''}
              onChange={e => setParentId(Number(e.target.value))}
              required
              disabled={!!dependency}
            >
              <option value="">Select {parentType}...</option>
              {getAvailableItems(parentType).map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <hr />

          <FormGroup>
            <Label for="childType">Child Type (Dependencies)</Label>
            <Input
              type="select"
              id="childType"
              value={childType}
              onChange={e => {
                setChildType(e.target.value as DependencyType);
                setSelectedChildren([]);
              }}
              required
              disabled={!!dependency}
            >
              <option value={DependencyType.HTTP}>HTTP Monitor</option>
              <option value={DependencyType.SERVICE}>Service</option>
              <option value={DependencyType.INSTANCE}>Instance</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="childIds">Child Items (Select Multiple)</Label>
            <Input
              type="select"
              id="childIds"
              multiple
              value={selectedChildren.map(String)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const target = e.target as unknown as HTMLSelectElement;
                const selected = Array.from(target.selectedOptions, (option: HTMLOptionElement) => Number(option.value));
                setSelectedChildren(selected);
              }}
              style={{ height: '150px' }}
              required
            >
              {getAvailableItems(childType).map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Input>
            <small className="form-text text-muted">Hold Ctrl/Cmd to select multiple items</small>
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
