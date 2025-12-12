import './footer.scss';

import React from 'react';
import { Col, Row } from 'reactstrap';

const Footer = () => {
  return (
    <div className="footer page-content">
      <Row>
        <Col md="12">
          <p>Powered by UptimeO</p>
        </Col>
      </Row>
    </div>
  );
};

export default Footer;
