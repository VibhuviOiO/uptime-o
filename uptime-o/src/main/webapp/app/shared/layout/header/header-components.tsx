import React, { useEffect, useState } from 'react';

import { NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getWebsiteSettings } from 'app/shared/services/website-settings.service';
import { IWebsiteSettings } from 'app/shared/model/website-settings.model';

export const BrandIcon = ({ logoPath, logoWidth, logoHeight }) => {
  // Logo size is controlled by CSS for consistency

  return (
    <div className="brand-icon">
      <img src={logoPath || '/content/images/logo-jhipster.png'} alt="Logo" />
    </div>
  );
};

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

        // Update favicon only if it's different from default and accessible
        if (data.faviconPath && data.faviconPath !== '/content/images/favicon.ico') {
          // Test if the favicon URL is accessible before updating
          const testImg = new Image();
          testImg.onload = () => {
            const existingLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
            const link = existingLink || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = data.faviconPath;
            if (!existingLink) {
              head.appendChild(link);
            }
          };
          testImg.onerror = () => {
            // Keep existing favicon if new one fails to load
            console.warn('Failed to load favicon:', data.faviconPath);
          };
          testImg.src = data.faviconPath;
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
