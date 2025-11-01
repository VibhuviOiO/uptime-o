import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faBolt, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import './dashboard-kpis.scss';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'degraded' | 'failed';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, unit = '', status, trend, icon }) => {
  return (
    <div className={`kpi-card kpi-card--${status}`}>
      <div className="kpi-card__header">
        <h3 className="kpi-card__label">{label}</h3>
        {icon && <div className="kpi-card__icon">{icon}</div>}
      </div>

      <div className="kpi-card__body">
        <div className="kpi-card__value">
          {value}
          {unit && <span className="kpi-card__unit">{unit}</span>}
        </div>
        {trend && (
          <div className={`kpi-card__trend kpi-card__trend--${trend.direction}`}>
            {trend.direction === 'up' ? <FontAwesomeIcon icon={faArrowTrendUp} /> : <FontAwesomeIcon icon={faArrowTrendDown} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className={`kpi-card__status-indicator kpi-card__status-indicator--${status}`} />
    </div>
  );
};

interface DashboardKPIsProps {
  uptimePercentage?: number;
  averageResponseTime?: number;
  totalMonitors?: number;
  failedCount?: number;
  healthyCount?: number;
  degradedCount?: number;
  failedMonitors?: number;
  loading?: boolean;
  error?: string | null;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  uptimePercentage = 0,
  averageResponseTime = 0,
  totalMonitors = 0,
  failedCount = 0,
  healthyCount = 0,
  degradedCount = 0,
  failedMonitors = 0,
  loading = false,
  error = null,
}) => {
  // Determine status based on thresholds
  const getUptimeStatus = () => {
    if (uptimePercentage >= 99) return 'healthy';
    if (uptimePercentage >= 95) return 'degraded';
    return 'failed';
  };

  const getResponseTimeStatus = () => {
    if (averageResponseTime <= 500) return 'healthy';
    if (averageResponseTime <= 2000) return 'degraded';
    return 'failed';
  };

  const getMonitorsStatus = () => {
    if (failedCount === 0 && degradedCount === 0) return 'healthy';
    if (failedCount === 0) return 'degraded';
    return 'failed';
  };

  const getIssuesStatus = () => {
    const issueCount = failedCount + degradedCount;
    if (issueCount === 0) return 'healthy';
    if (issueCount <= 2) return 'degraded';
    return 'failed';
  };

  if (error) {
    return (
      <div className="dashboard-kpis dashboard-kpis--error">
        <div className="dashboard-kpis__error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-kpis dashboard-kpis--loading">
        <div className="dashboard-kpis__skeleton-container">
          <div className="kpi-card kpi-card--skeleton">
            <div className="kpi-card__skeleton-line" />
            <div className="kpi-card__skeleton-line" />
          </div>
          <div className="kpi-card kpi-card--skeleton">
            <div className="kpi-card__skeleton-line" />
            <div className="kpi-card__skeleton-line" />
          </div>
          <div className="kpi-card kpi-card--skeleton">
            <div className="kpi-card__skeleton-line" />
            <div className="kpi-card__skeleton-line" />
          </div>
          <div className="kpi-card kpi-card--skeleton">
            <div className="kpi-card__skeleton-line" />
            <div className="kpi-card__skeleton-line" />
          </div>
        </div>
      </div>
    );
  }

  const issueCount = failedCount + degradedCount;

  return (
    <div className="dashboard-kpis">
      <div className="dashboard-kpis__grid">
        <KPICard
          label="Network Uptime"
          value={uptimePercentage.toFixed(2)}
          unit="%"
          status={getUptimeStatus()}
          trend={{
            value: 0.5,
            direction: 'up',
          }}
          icon={<FontAwesomeIcon icon={faBolt} />}
        />

        <KPICard
          label="Avg Response Time"
          value={averageResponseTime.toFixed(0)}
          unit="ms"
          status={getResponseTimeStatus()}
          trend={{
            value: 2.3,
            direction: 'up',
          }}
        />

        <KPICard
          label="Active Monitors"
          value={totalMonitors}
          status={getMonitorsStatus()}
          trend={
            failedMonitors > 0
              ? {
                  value: (failedMonitors / totalMonitors) * 100,
                  direction: 'down',
                }
              : undefined
          }
        />

        <KPICard
          label="Active Issues"
          value={issueCount}
          status={getIssuesStatus()}
          trend={
            issueCount > 0
              ? {
                  value: 5,
                  direction: 'down',
                }
              : undefined
          }
        />
      </div>

      <div className="dashboard-kpis__summary">
        <div className="dashboard-kpis__status-badge dashboard-kpis__status-badge--healthy">
          <span className="dashboard-kpis__status-dot" />
          <span className="dashboard-kpis__status-text">{healthyCount} Healthy</span>
        </div>
        <div className="dashboard-kpis__status-badge dashboard-kpis__status-badge--degraded">
          <span className="dashboard-kpis__status-dot" />
          <span className="dashboard-kpis__status-text">{degradedCount} Degraded</span>
        </div>
        <div className="dashboard-kpis__status-badge dashboard-kpis__status-badge--failed">
          <span className="dashboard-kpis__status-dot" />
          <span className="dashboard-kpis__status-text">{failedCount} Failed</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPIs;
