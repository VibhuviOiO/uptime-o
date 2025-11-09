import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

interface ScheduleEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  scheduleId?: number | null;
  onSave?: () => void;
}

export const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({ isOpen, toggle, scheduleId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    interval: 60000,
    includeResponseBody: false,
    thresholdsWarning: 0,
    thresholdsCritical: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const isNew = !scheduleId;

  useEffect(() => {
    if (isOpen) {
      if (isNew) {
        setFormData({
          name: '',
          interval: 60000,
          includeResponseBody: false,
          thresholdsWarning: 0,
          thresholdsCritical: 0,
        });
      } else if (scheduleId) {
        loadSchedule(scheduleId);
      }
    }
  }, [isOpen, scheduleId, isNew]);

  const loadSchedule = async (id: number) => {
    try {
      const response = await axios.get(`/api/schedules/${id}`);
      const schedule = response.data;
      setFormData({
        name: schedule.name || '',
        interval: schedule.interval || 60000,
        includeResponseBody: schedule.includeResponseBody || false,
        thresholdsWarning: schedule.thresholdsWarning || 0,
        thresholdsCritical: schedule.thresholdsCritical || 0,
      });
    } catch (error) {
      toast.error('Failed to load schedule');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 1 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 1 and 50 characters';
    }

    if (!formData.interval || formData.interval < 1) {
      newErrors.interval = 'Interval must be at least 1ms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const entity = {
      ...formData,
      id: scheduleId,
    };

    setLoading(true);
    try {
      if (isNew) {
        await axios.post('/api/schedules', entity);
        toast.success('Schedule created successfully');
      } else {
        await axios.put(`/api/schedules/${scheduleId}`, entity);
        toast.success('Schedule updated successfully');
      }
      toggle();
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast.error(isNew ? 'Failed to create schedule' : 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle}>{isNew ? 'Create Schedule' : 'Edit Schedule'}</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="name">
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              invalid={!!errors.name}
              placeholder="Enter schedule name"
              maxLength={50}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </FormGroup>

          <FormGroup>
            <Label for="interval">
              Interval (ms) <span className="text-danger">*</span>
            </Label>
            <Input
              type="number"
              name="interval"
              id="interval"
              value={formData.interval}
              onChange={handleChange}
              invalid={!!errors.interval}
              placeholder="Enter interval in milliseconds"
              min={1}
            />
            {errors.interval && <div className="invalid-feedback d-block">{errors.interval}</div>}
            <small className="form-text text-muted">Monitoring interval in milliseconds (e.g., 60000 = 1 minute)</small>
          </FormGroup>

          <FormGroup check className="mb-3">
            <Label check>
              <Input type="checkbox" name="includeResponseBody" checked={formData.includeResponseBody} onChange={handleChange} />
              Include Response Body
            </Label>
            <small className="form-text text-muted d-block">Store the full HTTP response body in metrics</small>
          </FormGroup>

          <FormGroup>
            <Label for="thresholdsWarning">Thresholds Warning (ms)</Label>
            <Input
              type="number"
              name="thresholdsWarning"
              id="thresholdsWarning"
              value={formData.thresholdsWarning}
              onChange={handleChange}
              placeholder="Warning threshold"
              min={0}
            />
            <small className="form-text text-muted">Response time threshold for warning alerts (optional)</small>
          </FormGroup>

          <FormGroup>
            <Label for="thresholdsCritical">Thresholds Critical (ms)</Label>
            <Input
              type="number"
              name="thresholdsCritical"
              id="thresholdsCritical"
              value={formData.thresholdsCritical}
              onChange={handleChange}
              placeholder="Critical threshold"
              min={0}
            />
            <small className="form-text text-muted">Response time threshold for critical alerts (optional)</small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ScheduleEditModal;
