import React, { useEffect, useState } from 'react';
import { Card, CardBody, Table, Alert, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCopy, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getWebsiteSettings } from 'app/shared/services/website-settings.service';
import { IWebsiteSettings } from 'app/shared/model/website-settings.model';
import { toast } from 'react-toastify';

const BrandingTab = () => {
  const [settings, setSettings] = useState<IWebsiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getWebsiteSettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const envVariables = [
    {
      name: 'WEBSITE_TITLE',
      description: 'Page title - appears in browser tab and navbar',
      example: 'My Monitoring System',
      currentValue: settings.title || 'UptimeO',
    },
    {
      name: 'WEBSITE_DESCRIPTION',
      description: 'Meta description for SEO - appears in search results',
      example: 'Enterprise uptime monitoring and observability',
      currentValue: settings.description || 'Uptime Monitoring and Observability Platform',
    },
    {
      name: 'WEBSITE_KEYWORDS',
      description: 'Meta keywords for SEO - comma separated',
      example: 'monitoring,uptime,observability,devops',
      currentValue: settings.keywords || 'uptime,monitoring,observability,http,heartbeat',
    },
    {
      name: 'WEBSITE_AUTHOR',
      description: 'Website author meta tag',
      example: 'My Company',
      currentValue: settings.author || 'UptimeO Team',
    },
    {
      name: 'WEBSITE_FAVICONPATH',
      description: 'Path to favicon inside container',
      example: '/content/images/custom-favicon.ico',
      currentValue: settings.faviconPath || '/content/images/favicon.ico',
    },
    {
      name: 'WEBSITE_LOGOPATH',
      description: 'Path to logo image inside container',
      example: '/content/images/custom-logo.png',
      currentValue: settings.logoPath || '/content/images/logo.png',
    },
    {
      name: 'WEBSITE_LOGOWIDTH',
      description: 'Logo width in pixels',
      example: '180',
      currentValue: String(settings.logoWidth || '200'),
    },
    {
      name: 'WEBSITE_LOGOHEIGHT',
      description: 'Logo height in pixels',
      example: '45',
      currentValue: String(settings.logoHeight || '50'),
    },
    {
      name: 'WEBSITE_FOOTERTITLE',
      description: 'Footer text',
      example: '© 2025 My Company - All Rights Reserved',
      currentValue: settings.footerTitle || 'Powered by UptimeO',
    },
  ];

  if (loading) {
    return (
      <div className="tab-content-wrapper">
        <Card>
          <CardBody>
            <p>Loading branding settings...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              <FontAwesomeIcon icon={faPalette} className="me-2" />
              Branding Configuration
            </h5>
            <Badge color="success">
              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
              Active
            </Badge>
          </div>

          <Alert color="info" className="mb-4">
            <h6 className="alert-heading">
              <FontAwesomeIcon icon={faPalette} className="me-2" />
              Current Configuration
            </h6>
            <p className="mb-2">These are the current branding settings. The configuration works in layers:</p>
            <ol className="mb-0">
              <li>
                <strong>Java defaults</strong> - Built-in fallback values
              </li>
              <li>
                <strong>Environment-specific defaults</strong> - application-dev.yml (Development) or application-prod.yml (Production)
              </li>
              <li>
                <strong>Environment variables</strong> - Override defaults when container starts
              </li>
            </ol>
          </Alert>

          <h6 className="mb-3">Environment Variables</h6>
          <Table responsive bordered hover className="mb-4">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Variable Name</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '25%' }}>Example Value</th>
                <th style={{ width: '20%' }}>Current Value</th>
              </tr>
            </thead>
            <tbody>
              {envVariables.map(variable => (
                <tr key={variable.name}>
                  <td>
                    <code className="text-primary">{variable.name}</code>
                    <button
                      className="btn btn-link btn-sm p-0 ms-2"
                      onClick={() => copyToClipboard(variable.name)}
                      title="Copy variable name"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                  </td>
                  <td>{variable.description}</td>
                  <td>
                    <code className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {variable.example}
                    </code>
                  </td>
                  <td>
                    <Badge color="secondary">{variable.currentValue}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default BrandingTab;
