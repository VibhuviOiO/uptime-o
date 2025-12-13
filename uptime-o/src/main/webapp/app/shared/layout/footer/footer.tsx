import './footer.scss';

import React, { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { useAppSelector } from 'app/config/store';
import { getWebsiteSettings } from 'app/shared/services/website-settings.service';
import { IWebsiteSettings, defaultValue } from 'app/shared/model/website-settings.model';

const Footer = () => {
  const [settings, setSettings] = useState<IWebsiteSettings>(defaultValue);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSettings = async () => {
        try {
          const websiteSettings = await getWebsiteSettings();
          setSettings(websiteSettings);
        } catch (error) {
          console.error('Error fetching website settings:', error);
        }
      };
      fetchSettings();
    }
  }, [isAuthenticated]);

  return (
    <div className="footer page-content">
      <Row>
        <Col md="12">
          <p>{settings.footerTitle}</p>
        </Col>
      </Row>
    </div>
  );
};

export default Footer;
