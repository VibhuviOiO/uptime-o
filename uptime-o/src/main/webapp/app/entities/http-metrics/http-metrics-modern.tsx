import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HttpMetricsService } from './http-metrics.service';
import { HttpMetricsDTO } from './http-metrics.model';
import './http-metrics-modern.scss';

export const HttpMetricsModern = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<HttpMetricsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await HttpMetricsService.getAggregatedMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = useMemo(() => {
    return metrics.filter(
      metric =>
        metric.monitorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedRegion === '' || metric.regionName === selectedRegion),
    );
  }, [metrics, searchTerm, selectedRegion]);

  const stats = useMemo(() => {
    const upCount = filteredMetrics.filter(m => m.lastSuccess).length;
    const downCount = filteredMetrics.filter(m => !m.lastSuccess).length;
    const avgLatency =
      filteredMetrics.length > 0
        ? Math.round(filteredMetrics.reduce((sum, m) => sum + (m.lastLatencyMs || 0), 0) / filteredMetrics.length)
        : 0;
    return { upCount, downCount, avgLatency, totalCount: filteredMetrics.length };
  }, [filteredMetrics]);

  const regions = useMemo(() => Array.from(new Set(metrics.map(m => m.regionName).filter(Boolean))), [metrics]);

  const getStatusColor = (success: boolean, latency: number) => {
    if (!success) return 'error';
    if (latency > 1000) return 'warning';
    return 'success';
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="metrics-modern">
      {/* Header */}
      <div className="metrics-header">
        <div className="header-content">
          <h1 className="page-title">Service Monitoring</h1>
          <p className="page-subtitle">Real-time performance metrics across your infrastructure</p>
        </div>
        <button className="refresh-btn" onClick={fetchMetrics} disabled={loading}>
          <svg className={`refresh-icon ${loading ? 'spinning' : ''}`} viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.upCount}</div>
            <div className="stat-label">Services Up</div>
          </div>
        </div>

        <div className="stat-card error">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.downCount}</div>
            <div className="stat-label">Services Down</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatLatency(stats.avgLatency)}</div>
            <div className="stat-label">Avg Response</div>
          </div>
        </div>

        <div className="stat-card neutral">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCount}</div>
            <div className="stat-label">Total Services</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="filter-select">
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="filter-select">
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {/* Services Grid */}
      <div className="services-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : filteredMetrics.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <h3>No services found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredMetrics.map(metric => (
              <div
                key={metric.monitorId}
                className={`service-card ${getStatusColor(metric.lastSuccess, metric.lastLatencyMs)}`}
                onClick={() => navigate(`/http-monitor-detail/${metric.monitorId}`)}
              >
                <div className="service-header">
                  <div className="service-name">{metric.monitorName}</div>
                  <div className={`status-badge ${getStatusColor(metric.lastSuccess, metric.lastLatencyMs)}`}>
                    {metric.lastSuccess ? 'UP' : 'DOWN'}
                  </div>
                </div>

                <div className="service-metrics">
                  <div className="metric">
                    <span className="metric-label">Response Time</span>
                    <span className="metric-value">{formatLatency(metric.lastLatencyMs)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Region</span>
                    <span className="metric-value">{metric.regionName}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Agents</span>
                    <span className="metric-value">{metric.agentCount}</span>
                  </div>
                </div>

                <div className="service-footer">
                  <span className="last-checked">
                    Last checked: {metric.lastCheckedTime ? new Date(metric.lastCheckedTime).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HttpMetricsModern;
