import React from 'react';
import { NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const BrandIcon = ({ logoPath, logoWidth, logoHeight }) => (
  <div className="brand-icon">
    <img src={logoPath || '/content/images/logo-jhipster.png'} alt="Logo" style={{ width: logoWidth, height: logoHeight }} />
  </div>
);

export const Brand = () => {
  return (
    <NavbarBrand tag={Link} to="/" className="brand-logo">
      <BrandIcon logoPath="/content/images/logo-jhipster.png" logoWidth={200} logoHeight={50} />
      <span className="brand-title">UptimeO</span>
    </NavbarBrand>
  );
};

export const Home = () => (
  <NavItem>
    <NavLink tag={Link} to="/" className="d-flex align-items-center">
      <FontAwesomeIcon icon="home" />
      <span>Home</span>
    </NavLink>
  </NavItem>
);
