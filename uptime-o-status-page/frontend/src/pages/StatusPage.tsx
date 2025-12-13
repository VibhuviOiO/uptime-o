import React, { useEffect, useState } from 'react';
import { useStatus } from '@/hooks/useStatus';
import { useConfig, Indicator } from '@/hooks/useConfig';
import '../styles/status-page.css';

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const getStatusTitle = (status: string): string => {
  switch (status) {
    case 'UP':
      return 'Available - Normal latency';
    case 'WARNING':
      return 'Available - Elevated latency';
    case 'CRITICAL':
      return 'Available - High latency';
    case 'DOWN':
      return 'Service disruption';
    default:
      return 'Unknown status';
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const StatusPage = () => {
  const { data: statusData, loading, refreshDisplay } = useStatus();
  const { data: config } = useConfig();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && statusData) {
      setLastUpdate(new Date());
    }
  }, [statusData, loading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (config) {
      document.title = config.pageTitle;
      
      // Apply theme colors
      document.documentElement.style.setProperty('--navbar-bg', config.navbarBgColor);
      document.documentElement.style.setProperty('--navbar-text', config.navbarTextColor);
      document.documentElement.style.setProperty('--footer-bg', config.footerBgColor);
      document.documentElement.style.setProperty('--footer-text', config.footerTextColor);
      document.documentElement.style.setProperty('--page-bg', config.pageBgColor);
      
      // Update favicon
      let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      if (config.faviconUrl) {
        favicon.href = config.faviconUrl;
      }
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', config.metaDescription);
      
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', config.metaKeywords);
      
      if (config.metaAuthor) {
        let metaAuthor = document.querySelector('meta[name="author"]');
        if (!metaAuthor) {
          metaAuthor = document.createElement('meta');
          metaAuthor.setAttribute('name', 'author');
          document.head.appendChild(metaAuthor);
        }
        metaAuthor.setAttribute('content', config.metaAuthor);
      }
    }
  }, [config]);

  const renderNavbarBrand = () => {
    const mode = config.logoDisplayMode || 'both';
    if (mode === 'logo_only' && config.logoUrl) {
      return <img src={config.logoUrl} alt={config.navbarTitle} />;
    } else if (mode === 'title_only') {
      return <span className="navbar-title">{config.navbarTitle}</span>;
    } else if (mode === 'both' && config.logoUrl) {
      return (
        <>
          <img src={config.logoUrl} alt={config.navbarTitle} />
          <span className="navbar-title">{config.navbarTitle}</span>
        </>
      );
    }
    return <span className="navbar-title">{config.navbarTitle}</span>;
  };

  const getIndicatorSvg = (type: string, color: string) => {
    switch (type) {
      case 'SUCCESS':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="8" fill={color} />
            <path d="M6 8l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'WARN':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="8" fill={color} />
            <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'DANGER':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="8" fill={color} />
            <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'DOWN':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="8" fill={color} />
            <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderLegend = () => {
    const orderedIndicators = config?.indicatorOrder
      ?.map(type => config.indicators?.find(ind => ind.type === type))
      .filter((ind): ind is Indicator => ind !== undefined && ind.enabled) || [];

    return (
      <>
        {orderedIndicators.map(indicator => (
          <div key={indicator.type} className="legend-item">
            <div className="legend-icon">
              {getIndicatorSvg(indicator.type, indicator.color)}
            </div>
            <span>{indicator.label}</span>
          </div>
        ))}
      </>
    );
  };

  const getStatusIndicatorType = (health: any): string | null => {
    if (health.status === 'DOWN') return 'DOWN';
    if (health.status === 'CRITICAL') {
      const dangerIndicator = config?.indicators?.find(ind => ind.type === 'DANGER');
      return dangerIndicator?.enabled ? 'DANGER' : 'WARN';
    }
    if (health.status === 'WARNING') return 'WARN';
    if (health.status === 'UP') return 'SUCCESS';
    return null;
  };

  const renderStatusIndicator = (health: any) => {
    const indicatorType = getStatusIndicatorType(health);
    const indicator = config?.indicators?.find(ind => ind.type === indicatorType);
    
    if (!indicator || !indicator.enabled) return null;

    const showLatencyValues = config?.showLatencyIndicators;

    return (
      <>
        <div className="status-icon" style={{ color: indicator.color }}>
          {getIndicatorSvg(indicator.type, indicator.color)}
        </div>
        {showLatencyValues && health.responseTimeMs && (
          <span className="response-time">{health.responseTimeMs}ms</span>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="status-page-wrapper" style={{ background: config.pageBgColor || '#f5f5f5' }}>
        <nav className="status-navbar">
          <div className="navbar-content">
            <div className="navbar-brand">{renderNavbarBrand()}</div>
            {config.navbarLinkText && config.navbarLinkUrl && (
              <a href={config.navbarLinkUrl} target="_blank" rel="noopener noreferrer" className="console-link">
                {config.navbarLinkText}
              </a>
            )}
          </div>
        </nav>
        <div className="status-page-loading">Loading status...</div>
      </div>
    );
  }

  if (!statusData || statusData.apis.length === 0) {
    return (
      <div className="status-page-wrapper" style={{ background: config.pageBgColor || '#f5f5f5' }}>
        <nav className="status-navbar">
          <div className="navbar-content">
            <div className="navbar-brand">{renderNavbarBrand()}</div>
            {config.navbarLinkText && config.navbarLinkUrl && (
              <a href={config.navbarLinkUrl} target="_blank" rel="noopener noreferrer" className="console-link">
                {config.navbarLinkText}
              </a>
            )}
          </div>
        </nav>
        <div className="status-page-empty">
          <h2>No monitoring data available</h2>
          <p>Start monitoring your APIs to see their status here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-page-wrapper" style={{ background: config.pageBgColor || '#f5f5f5' }}>
      <nav className="status-navbar" style={{ background: config.navbarBgColor || '#ffffff', color: config.navbarTextColor || '#202124' }}>
        <div className="navbar-content">
          <div className="navbar-brand">{renderNavbarBrand()}</div>
          {config.navbarLinkText && config.navbarLinkUrl && (
            <a href={config.navbarLinkUrl} target="_blank" rel="noopener noreferrer" className="console-link">
              {config.navbarLinkText}
            </a>
          )}
        </div>
      </nav>
      
      <div className="status-page">
        <div className="status-header">
          <h1>{config.pageTitle}</h1>
          <p className="status-subtitle">{config.pageSubtitle}</p>
          <p className="status-description">
            This page provides status information on the services that are part of <a href={config?.companyWebsite} target="_blank" rel="noopener noreferrer" className="company-link">{config?.companyName || 'our platform'}</a>. 
            Check back here to view the current status of the services listed below. 
            If you are experiencing an issue not listed here, please contact us:
          </p>
          <div className="support-contacts">
            {config?.supportEmail && (
              <div className="contact-item">
                <span>📧 Email: </span>
                <span className="contact-value" onClick={() => copyToClipboard(config.supportEmail)} title="Click to copy">
                  {config.supportEmail}
                </span>
              </div>
            )}
            {config?.supportPhone && (
              <div className="contact-item">
                <span>📞 Phone: </span>
                <a href={`tel:${config.supportPhone}`} className="contact-value">
                  {config.supportPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="status-legend-container">
          <div className="status-legend">
            {renderLegend()}
          </div>
          {lastUpdate && (
            <div className="last-update-text">
              Refreshes every {refreshDisplay} • Updated {formatTimeAgo(lastUpdate)}
            </div>
          )}
        </div>

        <div className="status-table-container">
          <table className="status-table">
            <thead>
              <tr>
                <th className="api-column">Service</th>
                {statusData.regions.map(region => (
                  <th key={region} className="region-column">
                    {region}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusData.apis.map(api => (
                <tr key={api.monitorId}>
                  <td className="api-name">{api.apiName}</td>
                  {statusData.regions.map(region => {
                    const health = api.regionHealth[region];
                    return (
                      <td key={region} className="region-status">
                        {health ? (
                          <div className={`status-indicator ${health.status.toLowerCase()}`} title={getStatusTitle(health.status)}>
                            {renderStatusIndicator(health)}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="status-footer" style={{ background: config.footerBgColor || '#ffffff' }}>
        <div className="footer-content" style={{ color: config.footerTextColor || '#5f6368' }}>
          <p>©{new Date().getFullYear()} {config.pageTitle} • {config.footerText}</p>
        </div>
      </footer>
    </div>
  );
};

export default StatusPage;
