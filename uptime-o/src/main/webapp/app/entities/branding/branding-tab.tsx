import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Alert, Badge, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCheckCircle, faEdit, faPlus, faSave, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { getWebsiteSettings } from 'app/shared/services/website-settings.service';
import { IWebsiteSettings, IBranding } from 'app/shared/model/website-settings.model';
import { getActiveBranding, createBranding, updateBranding } from 'app/shared/services/branding.service';
import { uploadFile } from 'app/shared/services/file-upload.service';
import { toast } from 'react-toastify';

const BrandingTab: React.FC = () => {
  const [settings, setSettings] = useState<IWebsiteSettings>({});
  const [branding, setBranding] = useState<IBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState<{ logo: boolean; favicon: boolean }>({ logo: false, favicon: false });
  const [formData, setFormData] = useState<IBranding>({
    title: 'UptimeO',
    description: 'Uptime Monitoring and Observability Platform',
    keywords: 'uptime,monitoring,observability,http,heartbeat',
    author: 'UptimeO Team',
    faviconPath: '/content/images/favicon.ico',
    logoPath: '/content/images/logo.png',
    logoWidth: 200,
    logoHeight: 50,
    footerTitle: 'Powered by UptimeO',
    isActive: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getWebsiteSettings();
      setSettings(data);

      if (data.brandingEnabled) {
        try {
          const brandingData = await getActiveBranding();
          setBranding(brandingData);
          setFormData(brandingData);
        } catch (error) {
          setBranding(null);
        }
      }
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IBranding, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (branding?.id) {
        await updateBranding({ ...formData, id: branding.id });
        toast.success('Branding updated successfully!');
      } else {
        await createBranding(formData);
        toast.success('Branding created successfully!');
      }
      setEditing(false);
      loadSettings();
    } catch (error) {
      toast.error('Failed to save branding');
    }
  };

  const handleCancel = () => {
    setFormData(
      branding || {
        title: 'UptimeO',
        description: 'Uptime Monitoring and Observability Platform',
        keywords: 'uptime,monitoring,observability,http,heartbeat',
        author: 'UptimeO Team',
        faviconPath: '/content/images/favicon.ico',
        logoPath: '/content/images/logo.png',
        logoWidth: 200,
        logoHeight: 50,
        footerTitle: 'Powered by UptimeO',
        isActive: true,
      },
    );
    setEditing(false);
  };

  const handleFileUpload = async (type: 'logo' | 'favicon', file: File) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const result = await uploadFile(type, file);
      const fieldName = type === 'logo' ? 'logoPath' : 'faviconPath';
      handleInputChange(fieldName, result.url);
      toast.success(`${type} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <div className="tab-content-wrapper">
        <Card>
          <CardBody>
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading branding settings...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!settings.brandingEnabled) {
    return (
      <div className="tab-content-wrapper">
        <Card>
          <CardHeader>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faPalette} className="me-2" />
              Branding Configuration
            </h5>
          </CardHeader>
          <CardBody>
            <Alert color="warning">
              <h6 className="alert-heading">Branding Feature Disabled</h6>
              <p className="mb-0">
                Branding configuration is currently disabled. To enable custom branding, set <code>application.branding.enabled=true</code>{' '}
                in your application configuration and restart the application.
              </p>
            </Alert>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faPalette} className="me-2" />
              Branding Configuration
            </h5>
            <div>
              {branding && (
                <Badge color="success" className="me-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                  Active
                </Badge>
              )}
              {!editing && (
                <Button color="primary" size="sm" onClick={() => setEditing(true)}>
                  <FontAwesomeIcon icon={branding ? faEdit : faPlus} className="me-1" />
                  {branding ? 'Edit' : 'Create'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {editing ? (
            <Form>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="title">Website Title *</Label>
                    <Input
                      type="text"
                      id="title"
                      value={formData.title || ''}
                      onChange={e => handleInputChange('title', e.target.value)}
                      placeholder="UptimeO"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="author">Author</Label>
                    <Input
                      type="text"
                      id="author"
                      value={formData.author || ''}
                      onChange={e => handleInputChange('author', e.target.value)}
                      placeholder="UptimeO Team"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  value={formData.description || ''}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Uptime Monitoring and Observability Platform"
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <Label for="keywords">Keywords</Label>
                <Input
                  type="text"
                  id="keywords"
                  value={formData.keywords || ''}
                  onChange={e => handleInputChange('keywords', e.target.value)}
                  placeholder="uptime,monitoring,observability,http,heartbeat"
                />
              </FormGroup>

              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="logoPath">Logo Path</Label>
                    <Input
                      type="text"
                      id="logoPath"
                      value={formData.logoPath || ''}
                      onChange={e => handleInputChange('logoPath', e.target.value)}
                      placeholder="/content/images/logo.png"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Upload Logo</Label>
                    <div style={{ position: 'relative' }}>
                      <Button color="outline-primary" size="sm" className="w-100" disabled={uploading.logo}>
                        <FontAwesomeIcon icon={faUpload} className="me-1" />
                        {uploading.logo ? 'Uploading...' : 'Choose File'}
                      </Button>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={e => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                        disabled={uploading.logo}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label for="logoWidth">Logo Width (px)</Label>
                    <Input
                      type="number"
                      id="logoWidth"
                      value={formData.logoWidth || ''}
                      onChange={e => handleInputChange('logoWidth', parseInt(e.target.value, 10))}
                      placeholder="200"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="logoHeight">Logo Height (px)</Label>
                    <Input
                      type="number"
                      id="logoHeight"
                      value={formData.logoHeight || ''}
                      onChange={e => handleInputChange('logoHeight', parseInt(e.target.value, 10))}
                      placeholder="50"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Upload Favicon</Label>
                    <div style={{ position: 'relative' }}>
                      <Button color="outline-primary" size="sm" className="w-100" disabled={uploading.favicon}>
                        <FontAwesomeIcon icon={faUpload} className="me-1" />
                        {uploading.favicon ? 'Uploading...' : 'Choose File'}
                      </Button>
                      <Input
                        type="file"
                        accept=".ico,.png,image/x-icon,image/png,image/vnd.microsoft.icon"
                        onChange={e => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                        disabled={uploading.favicon}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="faviconPath">Favicon Path</Label>
                    <Input
                      type="text"
                      id="faviconPath"
                      value={formData.faviconPath || ''}
                      onChange={e => handleInputChange('faviconPath', e.target.value)}
                      placeholder="/content/images/favicon.ico"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="footerTitle">Footer Text</Label>
                    <Input
                      type="text"
                      id="footerTitle"
                      value={formData.footerTitle || ''}
                      onChange={e => handleInputChange('footerTitle', e.target.value)}
                      placeholder="Powered by UptimeO"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <div className="d-flex justify-content-end">
                <Button color="secondary" className="me-2" onClick={handleCancel}>
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Cancel
                </Button>
                <Button color="primary" onClick={handleSave}>
                  <FontAwesomeIcon icon={faSave} className="me-1" />
                  Save
                </Button>
              </div>
            </Form>
          ) : (
            <div>
              {branding ? (
                <div>
                  <p className="text-muted mb-3">Current branding configuration is active.</p>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Title:</strong> {branding.title}
                      </p>
                      <p>
                        <strong>Author:</strong> {branding.author}
                      </p>
                      <p>
                        <strong>Description:</strong> {branding.description}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Logo:</strong> {branding.logoPath}
                      </p>
                      <p>
                        <strong>Favicon:</strong> {branding.faviconPath}
                      </p>
                      <p>
                        <strong>Footer:</strong> {branding.footerTitle}
                      </p>
                    </Col>
                  </Row>
                </div>
              ) : (
                <Alert color="info">
                  <p className="mb-0">No custom branding configuration found. Click &quot;Create&quot; to set up custom branding.</p>
                </Alert>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default BrandingTab;
