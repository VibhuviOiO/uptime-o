import React, { useEffect, useState } from 'react';

import { NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getWebsiteSettings } from 'app/shared/services/website-settings.service';
import { IWebsiteSettings } from 'app/shared/model/website-settings.model';

export const BrandIcon = ({ logoPath, logoWidth, logoHeight }) => (
  <div className="brand-icon">
    <img src={logoPath || '/content/images/logo-jhipster.png'} alt="Logo" style={{ width: logoWidth, height: logoHeight }} />
  </div>
);

export const Brand = () => {
  const [settings, setSettings] = useState<IWebsiteSettings>({
    title: 'UptimeO',
    logoPath: '/content/images/logo-jhipster.png',
    logoWidth: 200,
    logoHeight: 50,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getWebsiteSettings();
        setSettings(data);

        const head = document.getElementsByTagName('head')[0];

        // Update document title
        if (data.title) {
          document.title = data.title;
        }

        // Update or create meta description
        if (data.description) {
          let metaDescription = document.querySelector<HTMLMetaElement>("meta[name='description']");
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            head.appendChild(metaDescription);
          }
          metaDescription.content = data.description;
        }

        // Update or create meta keywords
        if (data.keywords) {
          let metaKeywords = document.querySelector<HTMLMetaElement>("meta[name='keywords']");
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            head.appendChild(metaKeywords);
          }
          metaKeywords.content = data.keywords;
        }

        // Update or create meta author
        if (data.author) {
          let metaAuthor = document.querySelector<HTMLMetaElement>("meta[name='author']");
          if (!metaAuthor) {
            metaAuthor = document.createElement('meta');
            metaAuthor.name = 'author';
            head.appendChild(metaAuthor);
          }
          metaAuthor.content = data.author;
        }

        // Update favicon
        if (data.faviconPath) {
          const existingLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
          const link = existingLink || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = data.faviconPath;
          if (!existingLink) {
            head.appendChild(link);
          }
        }
      } catch (error) {
        console.error('Failed to load website settings:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <NavbarBrand tag={Link} to="/" className="brand-logo">
      <BrandIcon logoPath={settings.logoPath} logoWidth={settings.logoWidth} logoHeight={settings.logoHeight} />
      <span className="brand-title">{settings.title || 'UptimeO'}</span>
      <span className="navbar-version">{VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`}</span>
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
