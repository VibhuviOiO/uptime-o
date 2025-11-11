import { useState, useEffect } from 'react';

export interface AppConfig {
  navbarTitle: string;
  pageTitle: string;
  pageSubtitle: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  footerText: string;
  faviconUrl: string;
  metaDescription: string;
  metaKeywords: string;
  metaAuthor: string;
  navbarLinkText: string;
  navbarLinkUrl: string;
  companyName: string;
  companyWebsite: string;
  supportEmail: string;
}

export function useConfig() {
  const [data, setData] = useState<AppConfig>({
    navbarTitle: 'Uptime Status',
    pageTitle: 'Service Status',
    pageSubtitle: 'Real-time monitoring dashboard',
    logoUrl: '',
    logoWidth: 220,
    logoHeight: 55,
    footerText: 'Powered by UptimeO',
    faviconUrl: '/favicon.ico',
    metaDescription: 'Real-time service status monitoring',
    metaKeywords: 'uptime, status, monitoring',
    metaAuthor: '',
    navbarLinkText: '',
    navbarLinkUrl: '',
    companyName: '',
    companyWebsite: '',
    supportEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('http://localhost:8077/api/public/branding');
        if (response.ok) {
          const configData = await response.json();
          setData(configData);
        }
      } catch (err) {
        console.error('Failed to fetch branding config:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { data, loading, error };
}