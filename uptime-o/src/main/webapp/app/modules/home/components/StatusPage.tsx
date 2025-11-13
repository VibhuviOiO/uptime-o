import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/status-page.scss';

interface RegionHealth {
  status: string;
  responseTimeMs: number;
  lastChecked?: string;
}

interface ApiStatus {
  monitorId: number;
  apiName: string;
  regionHealth: Record<string, RegionHealth>;
}

interface StatusPageData {
  apis: ApiStatus[];
  regions: string[];
}

const REFRESH_INTERVAL = 30000; // 30 seconds
const RETRY_DELAY = 5000; // 5 seconds on error

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

export const StatusPage = () => {
  const [statusData, setStatusData] = useState<StatusPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchStatus = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.get<StatusPageData>('/api/public/status', {
          signal: abortControllerRef.current.signal,
          timeout: 10000,
        });

        if (isActive) {
          setStatusData(response.data);
          setLastUpdate(new Date());
          setLoading(false);
          timeoutRef.current = setTimeout(fetchStatus, REFRESH_INTERVAL);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error('Error fetching status:', error);
        setLoading(false);

        if (isActive) {
          timeoutRef.current = setTimeout(fetchStatus, RETRY_DELAY);
        }
      }
    };

    fetchStatus();

    return () => {
      isActive = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return <div className="status-page-loading">Loading status...</div>;
  }

  if (!statusData || statusData.apis.length === 0) {
    return (
      <div className="status-page-empty">
        <h2>No monitoring data available</h2>
        <p>Start monitoring your APIs to see their status here</p>
      </div>
    );
  }

  return (
    <div className="status-page">
      <div className="status-header">
        <h1>Service Status</h1>
        <p className="status-subtitle">Real-time monitoring across all regions</p>
        <p className="status-description">
          This page provides status information on the services that are part of our platform. Check back here to view the current status of
          the services listed below.
        </p>
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
          <div className="legend-item">
            <div className="legend-icon">
              <span className="no-data-icon">—</span>
            </div>
            <span>No data</span>
          </div>
        </div>
        {lastUpdate && <div className="last-update-text">Refreshes every 30s • Updated {formatTimeAgo(lastUpdate)}</div>}
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
                          {health.status === 'UP' ? (
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
                              <span className="response-time">{health.responseTimeMs}ms</span>
                            </>
                          ) : health.status === 'WARNING' ? (
                            <>
                              <div className="status-icon status-icon-warning">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                  <circle cx="8" cy="8" r="8" fill="#fbbc04" />
                                  <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="response-time">{health.responseTimeMs}ms</span>
                            </>
                          ) : health.status === 'CRITICAL' ? (
                            <>
                              <div className="status-icon status-icon-critical">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                  <circle cx="8" cy="8" r="8" fill="#ff6d00" />
                                  <path d="M8 4v5M8 11v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="response-time">{health.responseTimeMs}ms</span>
                            </>
                          ) : (
                            <>
                              <div className="status-icon status-icon-down">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                  <circle cx="8" cy="8" r="8" fill="#ea4335" />
                                  <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="response-time error-text">Error</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="status-indicator unknown" title="No recent data">
                          <span className="no-data">—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusPage;
