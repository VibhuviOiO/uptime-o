import { useState, useEffect } from 'react';

export interface Indicator {
  type: string;
  enabled: boolean;
  label: string;
  color: string;
  threshold?: number;
}

export interface AppConfig {
  navbarTitle: string;
  pageTitle: string;
  pageSubtitle: string;
  logoUrl: string;
  logoDisplayMode: string;
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
  supportPhone: string;
  navbarBgColor: string;
  navbarTextColor: string;
  footerBgColor: string;
  footerTextColor: string;
  pageBgColor: string;
  showLatencyIndicators: boolean;
  indicators: Indicator[];
  indicatorOrder: string[];
  warnThreshold: number;
  dangerThreshold: number;
}

export function useConfig() {
  const [data, setData] = useState<AppConfig>({
    navbarTitle: 'Uptime Status',
    pageTitle: 'Service Status',
    pageSubtitle: 'Real-time monitoring dashboard',
    logoUrl: '',
    logoDisplayMode: 'both',
    footerText: 'Powered by UptimeO',
    faviconUrl: '/favicon.ico',
    metaDescription: 'Real-time service status monitoring',
    metaKeywords: 'uptime, status, monitoring',
    metaAuthor: '',
    navbarLinkText: '',
    navbarLinkUrl: '',
    companyName: '',
    companyWebsite: '',
    supportEmail: '',
    supportPhone: '',
    navbarBgColor: '#ffffff',
    navbarTextColor: '#202124',
    footerBgColor: '#ffffff',
    footerTextColor: '#5f6368',
    pageBgColor: '#f5f5f5',
    showLatencyIndicators: true,
    indicators: [
      { type: 'SUCCESS', enabled: true, label: 'Available', color: '#34a853' },
      { type: 'WARN', enabled: true, label: 'Elevated latency', color: '#fbbc04', threshold: 500 },
      { type: 'DANGER', enabled: true, label: 'High latency', color: '#ff6d00', threshold: 1000 },
      { type: 'DOWN', enabled: true, label: 'Service disruption', color: '#ea4335' },
    ],
    indicatorOrder: ['SUCCESS', 'WARN', 'DANGER', 'DOWN'],
    warnThreshold: 500,
    dangerThreshold: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`/api/public/branding?t=${Date.now()}`);
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