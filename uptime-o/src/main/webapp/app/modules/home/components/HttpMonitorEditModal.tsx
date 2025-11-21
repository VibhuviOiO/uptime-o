import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
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
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    type: '',
    url: '',
    headers: '',
    body: '',
    intervalSeconds: 60,
    timeoutSeconds: 30,
    retryCount: 2,
    retryDelaySeconds: 5,
    responseTimeWarningMs: 1000,
    responseTimeCriticalMs: 3000,
    uptimeWarningPercent: 99.0,
    uptimeCriticalPercent: 95.0,
    includeResponseBody: false,
    resendNotificationCount: 0,
    certificateExpiryDays: 30,
    ignoreTlsError: false,
    checkSslCertificate: true,
    checkDnsResolution: true,
    upsideDownMode: false,
    maxRedirects: 10,
    description: '',
    tags: '',
    expectedStatusCodes: '200',
    performanceBudgetMs: null,
    sizeBudgetKb: null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState(false);

  const [groupMonitors, setGroupMonitors] = useState<IHttpMonitor[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [showExecutionSettings, setShowExecutionSettings] = useState(false);
  const [showAlertThresholds, setShowAlertThresholds] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const isNew = !monitor || !monitor.id;
  const isGroupType = formData.type === 'group';

  useEffect(() => {
    if (isOpen) {
      loadGroupMonitors();
      if (isNew) {
        setFormData({
          name: '',
          method: 'GET',
          type: '',
          url: '',
          headers: '',
          body: '',
          intervalSeconds: 60,
          timeoutSeconds: 30,
          retryCount: 2,
          retryDelaySeconds: 5,
          responseTimeWarningMs: 1000,
          responseTimeCriticalMs: 3000,
          uptimeWarningPercent: 99.0,
          uptimeCriticalPercent: 95.0,
          includeResponseBody: false,
          resendNotificationCount: 0,
          certificateExpiryDays: 30,
          ignoreTlsError: false,
          checkSslCertificate: true,
          checkDnsResolution: true,
          upsideDownMode: false,
          maxRedirects: 10,
          description: '',
          tags: '',
          expectedStatusCodes: '200',
          performanceBudgetMs: null,
          sizeBudgetKb: null,
        });
      } else if (monitor) {
        setFormData({
          name: monitor.name || '',
          method: monitor.method || 'GET',
          type: monitor.type || '',
          url: monitor.url || '',
          headers: monitor.headers ? JSON.stringify(monitor.headers) : '',
          body: monitor.body ? JSON.stringify(monitor.body) : '',
          intervalSeconds: monitor.intervalSeconds || 60,
          timeoutSeconds: monitor.timeoutSeconds || 30,
          retryCount: monitor.retryCount || 2,
          retryDelaySeconds: monitor.retryDelaySeconds || 5,
          responseTimeWarningMs: monitor.responseTimeWarningMs || 1000,
          responseTimeCriticalMs: monitor.responseTimeCriticalMs || 3000,
          uptimeWarningPercent: monitor.uptimeWarningPercent || 99.0,
          uptimeCriticalPercent: monitor.uptimeCriticalPercent || 95.0,
          includeResponseBody: monitor.includeResponseBody || false,
          resendNotificationCount: monitor.resendNotificationCount || 0,
          certificateExpiryDays: monitor.certificateExpiryDays || 30,
          ignoreTlsError: monitor.ignoreTlsError || false,
          checkSslCertificate: monitor.checkSslCertificate ?? true,
          checkDnsResolution: monitor.checkDnsResolution ?? true,
          upsideDownMode: monitor.upsideDownMode || false,
          maxRedirects: monitor.maxRedirects || 10,
          description: monitor.description || '',
          tags: monitor.tags || '',
          expectedStatusCodes: monitor.expectedStatusCodes || '200',
          performanceBudgetMs: monitor.performanceBudgetMs || null,
          sizeBudgetKb: monitor.sizeBudgetKb || null,
        });
        setSelectedParentId(monitor.parentId || null);
      }
    }
  }, [isOpen, monitor, isNew]);

  const loadGroupMonitors = async () => {
    try {
      const response = await axios.get<IHttpMonitor[]>('/api/http-monitors?page=0&size=1000&sort=id,desc');
      const groups = response.data.filter(m => m.type === 'group');
      setGroupMonitors(groups);
    } catch (error) {
      console.error('Failed to load group monitors:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot be longer than 100 characters';
    }

    if (formData.type !== 'group') {
      if (!formData.url || formData.url.trim() === '') {
        newErrors.url = 'URL is required';
      } else if (!isValidUrl(formData.url)) {
        newErrors.url = 'Please enter a valid URL';
      }
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
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const numericFields = [
      'intervalSeconds',
      'timeoutSeconds',
      'retryCount',
      'retryDelaySeconds',
      'responseTimeWarningMs',
      'responseTimeCriticalMs',
      'resendNotificationCount',
      'certificateExpiryDays',
      'maxRedirects',
    ];
    const floatFields = ['uptimeWarningPercent', 'uptimeCriticalPercent'];

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : numericFields.includes(name)
            ? parseInt(value, 10) || 0
            : floatFields.includes(name)
              ? parseFloat(value) || 0
              : value,
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
          type: formData.type,
          description: formData.description,
        };

        if (formData.type === 'group') {
          // Group monitors only need name, type, and description
          dataToSubmit.method = 'GET';
          dataToSubmit.url = '';
          dataToSubmit.intervalSeconds = 60;
          dataToSubmit.timeoutSeconds = 30;
          dataToSubmit.retryCount = 0;
          dataToSubmit.retryDelaySeconds = 0;
        } else {
          // HTTP monitors need all fields
          dataToSubmit.method = formData.method;
          dataToSubmit.url = formData.url;
          dataToSubmit.intervalSeconds = formData.intervalSeconds;
          dataToSubmit.timeoutSeconds = formData.timeoutSeconds;
          dataToSubmit.retryCount = formData.retryCount;
          dataToSubmit.retryDelaySeconds = formData.retryDelaySeconds;
          dataToSubmit.responseTimeWarningMs = formData.responseTimeWarningMs;
          dataToSubmit.responseTimeCriticalMs = formData.responseTimeCriticalMs;
          dataToSubmit.uptimeWarningPercent = formData.uptimeWarningPercent;
          dataToSubmit.uptimeCriticalPercent = formData.uptimeCriticalPercent;
          dataToSubmit.includeResponseBody = formData.includeResponseBody;
          dataToSubmit.resendNotificationCount = formData.resendNotificationCount;
          dataToSubmit.certificateExpiryDays = formData.certificateExpiryDays;
          dataToSubmit.ignoreTlsError = formData.ignoreTlsError;
          dataToSubmit.checkSslCertificate = formData.checkSslCertificate;
          dataToSubmit.checkDnsResolution = formData.checkDnsResolution;
          dataToSubmit.upsideDownMode = formData.upsideDownMode;
          dataToSubmit.maxRedirects = formData.maxRedirects;
          dataToSubmit.tags = formData.tags;
          dataToSubmit.expectedStatusCodes = formData.expectedStatusCodes;
          dataToSubmit.performanceBudgetMs = formData.performanceBudgetMs;
          dataToSubmit.sizeBudgetKb = formData.sizeBudgetKb;

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

          if (selectedParentId) {
            dataToSubmit.parentId = selectedParentId;
          }
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
          headers: '',
          body: '',
          intervalSeconds: 60,
          timeoutSeconds: 30,
          retryCount: 2,
          retryDelaySeconds: 5,
          responseTimeWarningMs: 1000,
          responseTimeCriticalMs: 3000,
          uptimeWarningPercent: 99.0,
          uptimeCriticalPercent: 95.0,
          includeResponseBody: false,
          resendNotificationCount: 0,
          certificateExpiryDays: 30,
          ignoreTlsError: false,
          checkSslCertificate: true,
          checkDnsResolution: true,
          upsideDownMode: false,
          maxRedirects: 10,
          description: '',
          tags: '',
          expectedStatusCodes: '200',
          performanceBudgetMs: null,
          sizeBudgetKb: null,
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
    <Card style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{isNew ? 'Create New Monitor' : 'Edit Monitor'}</h5>
          <Button close onClick={toggle} />
        </div>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-4">
              <FormGroup>
                <Label for="name">Name *</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Monitor name"
                  value={formData.name}
                  onChange={handleChange}
                  invalid={!!errors.name}
                  disabled={updating}
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
              </FormGroup>
            </div>
            <div className="col-4">
              <FormGroup>
                <Label for="type">Type *</Label>
                <Input type="select" name="type" id="type" value={formData.type} onChange={handleChange} disabled={updating}>
                  <option value="">Select...</option>
                  <option value="HTTPS">HTTPS</option>
                  <option value="http-keyword">HTTPS - keyword</option>
                  <option value="http-json">HTTPS - json</option>
                  <option value="group">group</option>
                </Input>
              </FormGroup>
            </div>
            {!isGroupType && (
              <div className="col-4">
                <FormGroup>
                  <Label for="method">Method *</Label>
                  <Input type="select" name="method" id="method" value={formData.method} onChange={handleChange} disabled={updating}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="HEAD">HEAD</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </Input>
                </FormGroup>
              </div>
            )}
          </div>
          {!isGroupType && (
            <>
              <FormGroup>
                <Label for="url">URL *</Label>
                <Input
                  type="text"
                  name="url"
                  id="url"
                  placeholder="Enter monitor URL (e.g., https://example.com)"
                  value={formData.url}
                  onChange={handleChange}
                  invalid={!!errors.url}
                  disabled={updating}
                />
                {errors.url && <div className="invalid-feedback d-block">{errors.url}</div>}
              </FormGroup>
              <FormGroup>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="includeResponseBody"
                    id="includeResponseBody"
                    checked={formData.includeResponseBody}
                    onChange={handleChange}
                    disabled={updating}
                  />
                  <label className="form-check-label" htmlFor="includeResponseBody">
                    Include Response Body
                  </label>
                </div>
              </FormGroup>
              {groupMonitors.length > 0 && (
                <FormGroup>
                  <Label for="parentId">Parent Group (Optional)</Label>
                  <Input
                    type="select"
                    value={selectedParentId || ''}
                    onChange={e => setSelectedParentId(e.target.value ? parseInt(e.target.value, 10) : null)}
                    disabled={updating}
                  >
                    <option value="">No parent group</option>
                    {groupMonitors.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              )}
            </>
          )}
          {!isGroupType && (
            <div className="mb-3">
              <div
                className="d-flex align-items-center justify-content-between p-2"
                style={{ backgroundColor: '#f8f9fa', cursor: 'pointer', borderRadius: '4px' }}
                onClick={() => setShowExecutionSettings(!showExecutionSettings)}
              >
                <strong>Execution Settings</strong>
                <FontAwesomeIcon icon={showExecutionSettings ? faSync : faPlus} />
              </div>
              {showExecutionSettings && (
                <div className="mt-2">
                  <div className="row">
                    <div className="col-6">
                      <Label for="intervalSeconds" style={{ fontSize: '0.85rem' }}>
                        Interval (seconds) *
                      </Label>
                      <Input
                        type="number"
                        name="intervalSeconds"
                        id="intervalSeconds"
                        value={formData.intervalSeconds}
                        onChange={handleChange}
                        disabled={updating}
                        min="10"
                      />
                    </div>
                    <div className="col-6">
                      <Label for="timeoutSeconds" style={{ fontSize: '0.85rem' }}>
                        Timeout (seconds) *
                      </Label>
                      <Input
                        type="number"
                        name="timeoutSeconds"
                        id="timeoutSeconds"
                        value={formData.timeoutSeconds}
                        onChange={handleChange}
                        disabled={updating}
                        min="5"
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <Label for="retryCount" style={{ fontSize: '0.85rem' }}>
                        Retry Count *
                      </Label>
                      <Input
                        type="number"
                        name="retryCount"
                        id="retryCount"
                        value={formData.retryCount}
                        onChange={handleChange}
                        disabled={updating}
                        min="0"
                      />
                    </div>
                    <div className="col-6">
                      <Label for="retryDelaySeconds" style={{ fontSize: '0.85rem' }}>
                        Retry Delay (seconds) *
                      </Label>
                      <Input
                        type="number"
                        name="retryDelaySeconds"
                        id="retryDelaySeconds"
                        value={formData.retryDelaySeconds}
                        onChange={handleChange}
                        disabled={updating}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <Label for="resendNotificationCount" style={{ fontSize: '0.85rem' }}>
                        Resend Notification Count
                      </Label>
                      <Input
                        type="number"
                        name="resendNotificationCount"
                        id="resendNotificationCount"
                        value={formData.resendNotificationCount}
                        onChange={handleChange}
                        disabled={updating}
                        min="0"
                      />
                      <small className="form-text text-muted">0 = disabled</small>
                    </div>
                    <div className="col-6">
                      <Label for="expectedStatusCodes" style={{ fontSize: '0.85rem' }}>
                        Expected Status Codes
                      </Label>
                      <Input
                        type="text"
                        name="expectedStatusCodes"
                        id="expectedStatusCodes"
                        placeholder="200,201,204"
                        value={formData.expectedStatusCodes}
                        onChange={handleChange}
                        disabled={updating}
                      />
                      <small className="form-text text-muted">Comma-separated</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {!isGroupType && (
            <div className="mb-3">
              <div
                className="d-flex align-items-center justify-content-between p-2"
                style={{ backgroundColor: '#f8f9fa', cursor: 'pointer', borderRadius: '4px' }}
                onClick={() => setShowAlertThresholds(!showAlertThresholds)}
              >
                <strong>Alert Thresholds (Optional)</strong>
                <FontAwesomeIcon icon={showAlertThresholds ? faSync : faPlus} />
              </div>
              {showAlertThresholds && (
                <div className="mt-2">
                  <div className="row">
                    <div className="col-6">
                      <Label for="responseTimeWarningMs" style={{ fontSize: '0.85rem' }}>
                        Response Time Warning (ms)
                      </Label>
                      <Input
                        type="number"
                        name="responseTimeWarningMs"
                        id="responseTimeWarningMs"
                        value={formData.responseTimeWarningMs}
                        onChange={handleChange}
                        disabled={updating}
                      />
                    </div>
                    <div className="col-6">
                      <Label for="responseTimeCriticalMs" style={{ fontSize: '0.85rem' }}>
                        Response Time Critical (ms)
                      </Label>
                      <Input
                        type="number"
                        name="responseTimeCriticalMs"
                        id="responseTimeCriticalMs"
                        value={formData.responseTimeCriticalMs}
                        onChange={handleChange}
                        disabled={updating}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <Label for="uptimeWarningPercent" style={{ fontSize: '0.85rem' }}>
                        Uptime Warning (%)
                      </Label>
                      <Input
                        type="number"
                        name="uptimeWarningPercent"
                        id="uptimeWarningPercent"
                        value={formData.uptimeWarningPercent}
                        onChange={handleChange}
                        disabled={updating}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="col-6">
                      <Label for="uptimeCriticalPercent" style={{ fontSize: '0.85rem' }}>
                        Uptime Critical (%)
                      </Label>
                      <Input
                        type="number"
                        name="uptimeCriticalPercent"
                        id="uptimeCriticalPercent"
                        value={formData.uptimeCriticalPercent}
                        onChange={handleChange}
                        disabled={updating}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <Label for="performanceBudgetMs" style={{ fontSize: '0.85rem' }}>
                        Performance Budget (ms)
                      </Label>
                      <Input
                        type="number"
                        name="performanceBudgetMs"
                        id="performanceBudgetMs"
                        placeholder="500"
                        value={formData.performanceBudgetMs || ''}
                        onChange={handleChange}
                        disabled={updating}
                      />
                      <small className="form-text text-muted">Target goal (optional)</small>
                    </div>
                    <div className="col-6">
                      <Label for="sizeBudgetKb" style={{ fontSize: '0.85rem' }}>
                        Size Budget (KB)
                      </Label>
                      <Input
                        type="number"
                        name="sizeBudgetKb"
                        id="sizeBudgetKb"
                        placeholder="100"
                        value={formData.sizeBudgetKb || ''}
                        onChange={handleChange}
                        disabled={updating}
                      />
                      <small className="form-text text-muted">Target goal (optional)</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isGroupType && (
            <div className="mb-3">
              <div
                className="d-flex align-items-center justify-content-between p-2"
                style={{ backgroundColor: '#f8f9fa', cursor: 'pointer', borderRadius: '4px' }}
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <strong>Advanced Settings</strong>
                <FontAwesomeIcon icon={showAdvancedSettings ? faSync : faPlus} />
              </div>
              {showAdvancedSettings && (
                <div className="mt-2">
                  <div className="row">
                    <div className="col-6">
                      <Label for="certificateExpiryDays" style={{ fontSize: '0.85rem' }}>
                        Certificate Expiry Notification (days)
                      </Label>
                      <Input
                        type="number"
                        name="certificateExpiryDays"
                        id="certificateExpiryDays"
                        value={formData.certificateExpiryDays}
                        onChange={handleChange}
                        disabled={updating}
                        min="1"
                      />
                    </div>
                    <div className="col-6">
                      <Label for="maxRedirects" style={{ fontSize: '0.85rem' }}>
                        Max Redirects (0 = disabled)
                      </Label>
                      <Input
                        type="number"
                        name="maxRedirects"
                        id="maxRedirects"
                        value={formData.maxRedirects}
                        onChange={handleChange}
                        disabled={updating}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="checkSslCertificate"
                          id="checkSslCertificate"
                          checked={formData.checkSslCertificate}
                          onChange={handleChange}
                          disabled={updating}
                        />
                        <label className="form-check-label" htmlFor="checkSslCertificate" style={{ fontSize: '0.85rem' }}>
                          Check SSL Certificate
                        </label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="checkDnsResolution"
                          id="checkDnsResolution"
                          checked={formData.checkDnsResolution}
                          onChange={handleChange}
                          disabled={updating}
                        />
                        <label className="form-check-label" htmlFor="checkDnsResolution" style={{ fontSize: '0.85rem' }}>
                          Check DNS Resolution
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="ignoreTlsError"
                          id="ignoreTlsError"
                          checked={formData.ignoreTlsError}
                          onChange={handleChange}
                          disabled={updating}
                        />
                        <label className="form-check-label" htmlFor="ignoreTlsError" style={{ fontSize: '0.85rem' }}>
                          Ignore TLS/SSL Errors
                        </label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="upsideDownMode"
                          id="upsideDownMode"
                          checked={formData.upsideDownMode}
                          onChange={handleChange}
                          disabled={updating}
                        />
                        <label className="form-check-label" htmlFor="upsideDownMode" style={{ fontSize: '0.85rem' }}>
                          Upside Down Mode
                        </label>
                        <small className="form-text text-muted d-block">Flip status (reachable = DOWN)</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              placeholder="Enter monitor description"
              value={formData.description}
              onChange={handleChange}
              disabled={updating}
              rows={2}
            />
          </FormGroup>
          {!isGroupType && (
            <>
              <FormGroup>
                <Label for="tags">Tags</Label>
                <Input
                  type="text"
                  name="tags"
                  id="tags"
                  placeholder="Enter tags (comma-separated)"
                  value={formData.tags}
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
            </>
          )}
          <div className="d-flex gap-2 mt-3">
            <Button color="secondary" onClick={toggle} disabled={updating} block>
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} disabled={updating} block>
              {isNew ? 'Create' : 'Save'}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};
