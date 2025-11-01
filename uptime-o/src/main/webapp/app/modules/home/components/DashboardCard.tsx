import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { DashboardMetric } from '../hooks/useDashboardMetrics';
import '../styles/dashboard-card.module.scss';

interface DashboardCardProps {
  title: string;
  icon: string;
  metric: DashboardMetric;
  linkTo: string;
  linkText: string;
  dataMetric: string;
  statusClass?: string;
}

/**
 * Reusable dashboard card component with lazy loading support
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, metric, linkTo, linkText, dataMetric, statusClass }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={cardRef} className="dashboard-card" data-metric={dataMetric}>
      <div className="card-header">
        <h2>{title}</h2>
        <span className="card-icon">{icon}</span>
      </div>

      <div className="card-body">
        {metric.loading ? (
          <div className="metric-skeleton">
            <div className="skeleton-line skeleton-lg" />
          </div>
        ) : metric.error ? (
          <div className="metric-error">
            <div className="metric-value error">!</div>
            <p className="metric-label error-text">{metric.error}</p>
          </div>
        ) : (
          <>
            <div className={`metric-value ${statusClass || ''}`}>{metric.value}</div>
            <p className="metric-label">{metric.label}</p>
          </>
        )}

        <Link to={linkTo} className="card-link">
          {linkText} →
        </Link>
      </div>
    </div>
  );
};

/**
 * Action button card component
 */
interface ActionCardProps {
  title: string;
  icon: string;
  actions: Array<{
    label: string;
    to: string;
  }>;
}

export const ActionCard: React.FC<ActionCardProps> = ({ title, icon, actions }) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2>{title}</h2>
        <span className="card-icon">{icon}</span>
      </div>

      <div className="card-body card-actions">
        {actions.map((action, index) => (
          <Link key={index} to={action.to} className="action-btn">
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardCard;
