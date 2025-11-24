import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IStatusPage } from 'app/shared/model/status-page.model';

interface StatusPageEditModalProps {
  isOpen: boolean;
  toggle: () => void;
  statusPage: IStatusPage | null;
  onSave: () => void;
}

export const StatusPageEditModal: React.FC<StatusPageEditModalProps> = ({ isOpen, toggle, statusPage, onSave }) => {
  const [formData, setFormData] = useState<IStatusPage>({
    name: '',
    slug: '',
    description: '',
    isPublic: false,
    customDomain: '',
    logoUrl: '',
    faviconUrl: '',
    headerColor: '#ffffff',
    headerTextColor: '#000000',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (statusPage) {
      setFormData(statusPage);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        isPublic: false,
        customDomain: '',
        logoUrl: '',
        faviconUrl: '',
        headerColor: '#ffffff',
        headerTextColor: '#000000',
      });
    }
    setError(null);
  }, [statusPage, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = 'checked' in target ? target.checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (statusPage?.id) {
        await axios.put(`/api/status-pages/${statusPage.id}`, formData);
        toast.success('Status page updated successfully');
      } else {
        await axios.post('/api/status-pages', formData);
        toast.success('Status page created successfully');
      }
      onSave();
      toggle();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save status page';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FontAwesomeIcon icon="chart-bar" className="me-2" />
          {statusPage ? 'Edit Status Page' : 'Create New Status Page'}
        </h5>
        <Button color="link" onClick={toggle} className="p-0">
          <FontAwesomeIcon icon="times" />
        </Button>
      </CardHeader>
      <Form onSubmit={handleSubmit}>
        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}

          <FormGroup>
            <Label for="name">Name *</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
              placeholder="Enter status page name"
            />
          </FormGroup>

          <FormGroup>
            <Label for="slug">Slug *</Label>
            <Input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug || ''}
              onChange={handleInputChange}
              required
              placeholder="url-friendly-name"
            />
          </FormGroup>

          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Optional description"
            />
          </FormGroup>

          <FormGroup check>
            <Label check>
              <Input type="checkbox" name="isPublic" checked={formData.isPublic || false} onChange={handleInputChange} />
              Public Status Page
            </Label>
          </FormGroup>

          <FormGroup check>
            <Label check>
              <Input type="checkbox" name="isHomePage" checked={formData.isHomePage || false} onChange={handleInputChange} />
              Set as Home Page
            </Label>
            <small className="form-text text-muted">Only one status page per role set can be home page</small>
          </FormGroup>

          {(formData.isHomePage || !formData.isPublic) && (
            <FormGroup>
              <Label for="allowedRoles">{formData.isHomePage ? 'Home Page Roles' : 'Allowed Roles (Private Page)'}</Label>
              <Input
                type="select"
                name="allowedRoles"
                id="allowedRoles"
                multiple
                value={formData.allowedRoles || []}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const target = e.target as unknown as HTMLSelectElement;
                  const selected = Array.from(target.selectedOptions, (option: HTMLOptionElement) => option.value);
                  setFormData(prev => ({ ...prev, allowedRoles: selected }));
                }}
                style={{ height: '120px' }}
              >
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_USER">User</option>
                <option value="ROLE_SUPPORT">Support</option>
                <option value="ROLE_INFRA_TEAM">Infrastructure Team</option>
                <option value="ROLE_SUPER_ADMIN">Super Admin</option>
              </Input>
              <small className="form-text text-muted">
                {formData.isHomePage
                  ? 'Select roles that see this as home page. Leave empty for unauthenticated users (public only).'
                  : 'Hold Ctrl/Cmd to select multiple roles. Leave empty for all authenticated users.'}
              </small>
            </FormGroup>
          )}

          <FormGroup>
            <Label for="customDomain">Custom Domain</Label>
            <Input
              type="text"
              name="customDomain"
              id="customDomain"
              value={formData.customDomain || ''}
              onChange={handleInputChange}
              placeholder="status.example.com"
            />
          </FormGroup>

          <FormGroup>
            <Label for="logoUrl">Logo URL</Label>
            <Input
              type="url"
              name="logoUrl"
              id="logoUrl"
              value={formData.logoUrl || ''}
              onChange={handleInputChange}
              placeholder="https://example.com/logo.png"
            />
          </FormGroup>

          <FormGroup>
            <Label for="faviconUrl">Favicon URL</Label>
            <Input
              type="url"
              name="faviconUrl"
              id="faviconUrl"
              value={formData.faviconUrl || ''}
              onChange={handleInputChange}
              placeholder="https://example.com/favicon.ico"
            />
          </FormGroup>

          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Label for="headerColor">Header Color</Label>
                <Input
                  type="color"
                  name="headerColor"
                  id="headerColor"
                  value={formData.headerColor || '#ffffff'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Label for="headerTextColor">Header Text Color</Label>
                <Input
                  type="color"
                  name="headerTextColor"
                  id="headerTextColor"
                  value={formData.headerTextColor || '#000000'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <Button color="secondary" onClick={toggle} disabled={loading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : statusPage ? 'Update' : 'Create'}
            </Button>
          </div>
        </CardBody>
      </Form>
    </Card>
  );
};
