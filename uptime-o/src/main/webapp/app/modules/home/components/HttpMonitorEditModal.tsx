import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import axios from 'axios';
import { toast } from 'react-toastify';

interface HttpMonitorEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  monitor?: IHttpMonitor | null;
  onSave?: () => void;
}

export const HttpMonitorEditModal: React.FC<HttpMonitorEditModalProps> = ({ isOpen, toggle, monitor, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    type: '',
    url: '',
    additionalUrls: '',
    callsPerInterval: '1',
    headers: '',
    body: '',
    scheduleId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);

  const isNew = !monitor || !monitor.id;

  useEffect(() => {
    if (isOpen) {
      loadSchedules();
      if (isNew) {
        setFormData({
          name: '',
          method: 'GET',
          type: '',
          url: '',
          additionalUrls: '',
          callsPerInterval: '1',
          headers: '',
          body: '',
          scheduleId: '',
        });
      } else if (monitor) {
        setFormData({
          name: monitor.name || '',
          method: monitor.method || 'GET',
          type: monitor.type || '',
          url: monitor.url || '',
          additionalUrls: monitor.additionalUrls ? monitor.additionalUrls.join('\n') : '',
          callsPerInterval: monitor.callsPerInterval ? String(monitor.callsPerInterval) : '1',
          headers: monitor.headers ? JSON.stringify(monitor.headers) : '',
          body: monitor.body ? JSON.stringify(monitor.body) : '',
          scheduleId: monitor.schedule?.id ? String(monitor.schedule.id) : '',
        });
      }
    }
  }, [isOpen, monitor, isNew]);

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules?page=0&size=1000&sort=id,desc');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot be longer than 100 characters';
    }

    if (!formData.url || formData.url.trim() === '') {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setUpdating(true);
      try {
        const dataToSubmit: any = {
          name: formData.name,
          method: formData.method,
          type: formData.type,
          url: formData.url,
        };

        if (formData.additionalUrls) {
          const urls = formData.additionalUrls
            .split('\n')
            .map(u => u.trim())
            .filter(u => u.length > 0);
          if (urls.length > 0) {
            dataToSubmit.additionalUrls = urls;
          }
        }

        if (formData.callsPerInterval) {
          dataToSubmit.callsPerInterval = parseInt(formData.callsPerInterval, 10);
        }

        if (formData.headers) {
          try {
            dataToSubmit.headers = JSON.parse(formData.headers);
          } catch {
            dataToSubmit.headers = formData.headers;
          }
        }

        if (formData.body) {
          try {
            dataToSubmit.body = JSON.parse(formData.body);
          } catch {
            dataToSubmit.body = formData.body;
          }
        }

        if (formData.scheduleId) {
          dataToSubmit.schedule = { id: parseInt(formData.scheduleId, 10) };
        }

        if (isNew) {
          await axios.post('/api/http-monitors', dataToSubmit);
          toast.success('Monitor created successfully');
        } else if (monitor?.id) {
          await axios.put(`/api/http-monitors/${monitor.id}`, { id: monitor.id, ...dataToSubmit });
          toast.success('Monitor updated successfully');
        }

        setFormData({
          name: '',
          method: 'GET',
          type: '',
          url: '',
          additionalUrls: '',
          callsPerInterval: '1',
          headers: '',
          body: '',
          scheduleId: '',
        });
        toggle();
        onSave?.();
      } catch (error) {
        toast.error(`Failed to ${isNew ? 'create' : 'update'} monitor`);
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{isNew ? 'Create New Monitor' : 'Edit Monitor'}</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="name">Name *</Label>
            <Input
              type="text"
              name="name"
              id="name"
              placeholder="Enter monitor name"
              value={formData.name}
              onChange={handleChange}
              invalid={!!errors.name}
              disabled={updating}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="url">Primary URL *</Label>
            <Input
              type="text"
              name="url"
              id="url"
              placeholder="Enter primary monitor URL (e.g., https://find.example.com)"
              value={formData.url}
              onChange={handleChange}
              invalid={!!errors.url}
              disabled={updating}
            />
            {errors.url && <div className="invalid-feedback d-block">{errors.url}</div>}
          </FormGroup>
          <FormGroup>
            <Label for="additionalUrls">Additional URLs (Optional)</Label>
            <Input
              type="textarea"
              name="additionalUrls"
              id="additionalUrls"
              placeholder="Enter additional URLs (one per line):\nhttps://find-client1.example.com\nhttps://find-client2.example.com"
              value={formData.additionalUrls}
              onChange={handleChange}
              disabled={updating}
              rows={3}
            />
            <small className="form-text text-muted">Agent will monitor all URLs. Use this for client-specific endpoints.</small>
          </FormGroup>
          <FormGroup>
            <Label for="callsPerInterval">Calls Per Interval</Label>
            <Input
              type="number"
              name="callsPerInterval"
              id="callsPerInterval"
              placeholder="Number of concurrent calls per interval"
              value={formData.callsPerInterval}
              onChange={handleChange}
              disabled={updating}
              min="1"
              max="100"
            />
            <small className="form-text text-muted">Number of concurrent HTTP calls to make per interval (for load testing).</small>
          </FormGroup>
          <FormGroup>
            <Label for="method">Method</Label>
            <Input type="select" name="method" id="method" value={formData.method} onChange={handleChange} disabled={updating}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="scheduleId">Schedule (Optional)</Label>
            <Input type="select" name="scheduleId" id="scheduleId" value={formData.scheduleId} onChange={handleChange} disabled={updating}>
              <option value="">-- Select Schedule --</option>
              {schedules &&
                schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </option>
                ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="type">Type (Optional)</Label>
            <Input
              type="text"
              name="type"
              id="type"
              placeholder="Enter monitor type (e.g., API, Website, Database)"
              value={formData.type}
              onChange={handleChange}
              disabled={updating}
            />
          </FormGroup>
          <FormGroup>
            <Label for="headers">Headers (Optional)</Label>
            <Input
              type="textarea"
              name="headers"
              id="headers"
              placeholder='Enter headers as JSON (e.g., {"Authorization": "Bearer token"})'
              value={formData.headers}
              onChange={handleChange}
              disabled={updating}
              rows={3}
            />
          </FormGroup>
          <FormGroup>
            <Label for="body">Body (Optional)</Label>
            <Input
              type="textarea"
              name="body"
              id="body"
              placeholder='Enter request body as JSON (e.g., {"key": "value"})'
              value={formData.body}
              onChange={handleChange}
              disabled={updating}
              rows={3}
            />
          </FormGroup>
          <FormGroup>
            <Label for="scheduleId">Schedule (Optional)</Label>
            <Input type="select" name="scheduleId" id="scheduleId" value={formData.scheduleId} onChange={handleChange} disabled={updating}>
              <option value="">-- Select a Schedule --</option>
              {schedules && schedules.length > 0 ? (
                schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name || `Schedule ${schedule.id}`}
                  </option>
                ))
              ) : (
                <option disabled>No schedules available</option>
              )}
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
