import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './public-status-page-view.scss';

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
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

const PublicStatusPageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [statusPage, setStatusPage] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const [pageRes, itemsRes] = await Promise.all([
          axios.get(`/api/public/status-page/${slug}`, { signal: abortControllerRef.current.signal }),
          axios.get(`/api/public/status-page/${slug}/items`, { signal: abortControllerRef.current.signal }),
        ]);

        if (!isActive) return;

        setStatusPage(pageRes.data);

        const monitorPromises = itemsRes.data
          .filter((item: any) => item.itemType === 'HTTP')
          .map(async (item: any) => {
            try {
              const [monitorRes, heartbeatRes] = await Promise.all([
                axios.get(`/api/public/monitors/${item.itemId}`),
                axios.get(`/api/public/heartbeats?monitorId=${item.itemId}&page=0&size=1&sort=executedAt,desc`),
              ]);
              const heartbeat = Array.isArray(heartbeatRes.data) && heartbeatRes.data.length > 0 ? heartbeatRes.data[0] : null;
              return {
                ...monitorRes.data,
                latestHeartbeat: heartbeat,
              };
            } catch (error) {
              console.error(`Failed to load monitor ${item.itemId}`, error);
              return null;
            }
          });

        const monitorsData = (await Promise.all(monitorPromises)).filter(m => m !== null);
        if (isActive) {
          setMonitors(monitorsData);
          setLastUpdate(new Date());
          setLoading(false);
          timeoutRef.current = setTimeout(loadData, 30000);
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error('Failed to load status page', error);
        if (isActive) {
          setLoading(false);
          timeoutRef.current = setTimeout(loadData, 5000);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [slug]);

  const getStatus = (monitor: any) => {
    if (!monitor.latestHeartbeat) return 'UNKNOWN';
    if (!monitor.latestHeartbeat.success) return 'DOWN';
    if (monitor.latestHeartbeat.responseTimeMs > 1000) return 'CRITICAL';
    if (monitor.latestHeartbeat.responseTimeMs > 500) return 'WARNING';
    return 'UP';
  };

  if (loading) {
    return <div className="status-page-loading">Loading status...</div>;
  }

  if (!statusPage) {
    return (
      <div className="status-page-empty">
        <h2>Status Page Not Found</h2>
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="status-page-empty">
        <h2>No monitoring data available</h2>
        <p>No monitors configured for this status page</p>
      </div>
    );
  }

  return (
    <div className="status-page">
      <div className="status-header">
        {statusPage.logoUrl && <img src={statusPage.logoUrl} alt="Logo" style={{ maxHeight: '60px', marginBottom: '1rem' }} />}
        <h1>{statusPage.name}</h1>
        {statusPage.description && <p className="status-subtitle">{statusPage.description}</p>}
      </div>

      <div className="status-legend-container">
        <div className="status-legend">
          <div className="legend-item">
            <div className="legend-icon">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="#34a853" />
                <path d="M6 8l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="#fbbc04" />
                <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span>Elevated latency</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="#ff6d00" />
                <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span>High latency</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="#ea4335" />
                <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span>Service disruption</span>
          </div>
        </div>
        {lastUpdate && <div className="last-update-text">Refreshes every 30s • Updated {formatTimeAgo(lastUpdate)}</div>}
      </div>

      <div className="status-table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th className="api-column">Service</th>
              <th className="region-column">Status</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map(monitor => {
              const status = getStatus(monitor);
              const heartbeat = monitor.latestHeartbeat;
              return (
                <tr key={monitor.id}>
                  <td className="api-name">{monitor.name}</td>
                  <td className="region-status">
                    {heartbeat ? (
                      <div className={`status-indicator ${status.toLowerCase()}`} title={getStatusTitle(status)}>
                        {status === 'UP' && (
                          <>
                            <div className="status-icon status-icon-up">
                              <svg width="16" height="16" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="8" fill="#34a853" />
                                <path
                                  d="M6 8l2 2 4-4"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <span className="response-time">{heartbeat.responseTimeMs}ms</span>
                          </>
                        )}
                        {status === 'WARNING' && (
                          <>
                            <div className="status-icon status-icon-warning">
                              <svg width="16" height="16" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="8" fill="#fbbc04" />
                                <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="response-time">{heartbeat.responseTimeMs}ms</span>
                          </>
                        )}
                        {status === 'CRITICAL' && (
                          <>
                            <div className="status-icon status-icon-critical">
                              <svg width="16" height="16" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="8" fill="#ff6d00" />
                                <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="response-time">{heartbeat.responseTimeMs}ms</span>
                          </>
                        )}
                        {status === 'DOWN' && (
                          <>
                            <div className="status-icon status-icon-down">
                              <svg width="16" height="16" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="8" fill="#ea4335" />
                                <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="response-time">—</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="status-indicator unknown">
                        <span className="no-data-icon">—</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusPage.footerText && (
        <div className="status-footer">
          <p>{statusPage.footerText}</p>
        </div>
      )}
    </div>
  );
};

export default PublicStatusPageView;
