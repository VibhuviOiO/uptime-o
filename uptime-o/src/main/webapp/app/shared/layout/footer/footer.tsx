import './footer.scss';

import React, { useEffect, useState } from 'react';

import { Col, Row } from 'reactstrap';
import { getWebsiteSettings } from 'app/shared/services/website-settings.service';

const Footer = () => {
  const [footerTitle, setFooterTitle] = useState('Powered by UptimeO');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getWebsiteSettings();
        if (data.footerTitle) {
          setFooterTitle(data.footerTitle);
        }
      } catch (error) {
        console.error('Failed to load footer settings:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="footer page-content">
      <hr />
      <Row>
        <Col md="12" className="text-center">
          <p>{footerTitle}</p>
        </Col>
      </Row>
    </div>
  );
};

export default Footer;
