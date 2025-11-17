import React from 'react';
import { Card, CardHeader, CardBody, Form, FormGroup, Label, Input, Row, Col, InputGroup, InputGroupText, Alert, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faUser, faImage, faUpload, faFileImage, faSave, faTimes, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IBranding } from 'app/shared/model/website-settings.model';

interface BrandingFormProps {
  branding: IBranding | null;
  formData: IBranding;
  uploading: { logo: boolean; favicon: boolean };
  onInputChange: (field: keyof IBranding, value: string | number | boolean) => void;
  onFileUpload: (type: 'logo' | 'favicon', file: File) => void;
  onSave: () => void;
  onCancel: () => void;
}

const BrandingForm: React.FC<BrandingFormProps> = ({ branding, formData, uploading, onInputChange, onFileUpload, onSave, onCancel }) => {
  return (
    <Card>
      <CardHeader className="bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FontAwesomeIcon icon={branding ? faEdit : faPlus} className="me-2" />
            {branding ? 'Edit' : 'Create'} Branding Configuration
          </h6>
          <div>
            <Button color="success" size="sm" onClick={onSave} className="me-2">
              <FontAwesomeIcon icon={faSave} className="me-1" />
              Save Configuration
            </Button>
            <Button color="light" size="sm" onClick={onCancel}>
              <FontAwesomeIcon icon={faTimes} className="me-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <Form>
          {/* Website Information */}
          <Card className="mb-4">
            <CardHeader className="bg-light">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faGlobe} className="me-2" />
                Website Information
              </h6>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="title">Website Title *</Label>
                    <InputGroup>
                      <InputGroupText>
                        <FontAwesomeIcon icon={faGlobe} />
                      </InputGroupText>
                      <Input
                        type="text"
                        id="title"
                        value={formData.title || ''}
                        onChange={e => onInputChange('title', e.target.value)}
                        placeholder="UptimeO"
                      />
                    </InputGroup>
                    <small className="text-muted">Appears in browser tab and navbar</small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="author">Author</Label>
                    <InputGroup>
                      <InputGroupText>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroupText>
                      <Input
                        type="text"
                        id="author"
                        value={formData.author || ''}
                        onChange={e => onInputChange('author', e.target.value)}
                        placeholder="UptimeO Team"
                      />
                    </InputGroup>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  id="description"
                  value={formData.description || ''}
                  onChange={e => onInputChange('description', e.target.value)}
                  placeholder="Uptime Monitoring and Observability Platform"
                  rows={3}
                />
                <small className="text-muted">SEO description for search engines</small>
              </FormGroup>
              <FormGroup>
                <Label for="keywords">Keywords</Label>
                <Input
                  type="text"
                  id="keywords"
                  value={formData.keywords || ''}
                  onChange={e => onInputChange('keywords', e.target.value)}
                  placeholder="uptime,monitoring,observability,http,heartbeat"
                />
                <small className="text-muted">Comma-separated keywords for SEO</small>
              </FormGroup>
            </CardBody>
          </Card>

          {/* Logo Configuration */}
          <Card className="mb-4">
            <CardHeader className="bg-light">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Logo Configuration
              </h6>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="logoPath">Logo Path</Label>
                    <InputGroup>
                      <InputGroupText>
                        <FontAwesomeIcon icon={faImage} />
                      </InputGroupText>
                      <Input
                        type="text"
                        id="logoPath"
                        value={formData.logoPath || ''}
                        onChange={e => onInputChange('logoPath', e.target.value)}
                        placeholder="/content/images/logo.png"
                      />
                    </InputGroup>
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
                        onChange={e => e.target.files?.[0] && onFileUpload('logo', e.target.files[0])}
                        disabled={uploading.logo}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="logoWidth">Width (pixels)</Label>
                    <Input
                      type="number"
                      id="logoWidth"
                      value={formData.logoWidth || ''}
                      onChange={e => onInputChange('logoWidth', parseInt(e.target.value, 10))}
                      placeholder="200"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="logoHeight">Height (pixels)</Label>
                    <Input
                      type="number"
                      id="logoHeight"
                      value={formData.logoHeight || ''}
                      onChange={e => onInputChange('logoHeight', parseInt(e.target.value, 10))}
                      placeholder="50"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Alert color="info" className="mb-0">
                <small>
                  <FontAwesomeIcon icon={faFileImage} className="me-1" />
                  Recommended: 400x100px max, 500KB, PNG/SVG format
                </small>
              </Alert>
            </CardBody>
          </Card>

          {/* Favicon & Footer */}
          <Card className="mb-4">
            <CardHeader className="bg-light">
              <h6 className="mb-0">
                <FontAwesomeIcon icon={faFileImage} className="me-2" />
                Favicon & Footer
              </h6>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label for="faviconPath">Favicon Path</Label>
                    <InputGroup>
                      <InputGroupText>
                        <FontAwesomeIcon icon={faFileImage} />
                      </InputGroupText>
                      <Input
                        type="text"
                        id="faviconPath"
                        value={formData.faviconPath || ''}
                        onChange={e => onInputChange('faviconPath', e.target.value)}
                        placeholder="/content/images/favicon.ico"
                      />
                    </InputGroup>
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
                        onChange={e => e.target.files?.[0] && onFileUpload('favicon', e.target.files[0])}
                        disabled={uploading.favicon}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="footerTitle">Footer Text</Label>
                <Input
                  type="text"
                  id="footerTitle"
                  value={formData.footerTitle || ''}
                  onChange={e => onInputChange('footerTitle', e.target.value)}
                  placeholder="Powered by UptimeO"
                />
                <small className="text-muted">Text displayed in the footer</small>
              </FormGroup>
              <Alert color="info" className="mb-0">
                <small>
                  <FontAwesomeIcon icon={faFileImage} className="me-1" />
                  Favicon: 48x48px max, 100KB, ICO/PNG format
                </small>
              </Alert>
            </CardBody>
          </Card>
        </Form>
      </CardBody>
    </Card>
  );
};

export default BrandingForm;
