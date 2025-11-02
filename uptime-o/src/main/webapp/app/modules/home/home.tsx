import './home.scss';

import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { useAppSelector } from 'app/config/store';
import DashboardCard, { ActionCard } from './components/DashboardCard';
import RegionsWidget from './components/RegionsWidget';
import { AgentsWidget } from './components/AgentsWidget';
import { DatacentersWidget } from './components/DatacentersWidget';
import { useDatacentersCount, useAgentsCount, useMonitorsCount, useSystemHealth } from './hooks/useDashboardMetrics';
import { DashboardKPIs } from 'app/modules/dashboard/components/DashboardKPIs';
import { useDashboardMetrics } from 'app/modules/dashboard/hooks/useDashboardMetrics';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAuthenticated = account && account.login;

  // Fetch new dashboard metrics (real-time) - only when authenticated
  const dashboardData = isAuthenticated ? useDashboardMetrics(30000) : null; // Refresh every 30 seconds

  // Lazy load metrics for infrastructure cards - only when authenticated
  const datacentersMetric = isAuthenticated ? useDatacentersCount() : null;
  const agentsMetric = isAuthenticated ? useAgentsCount() : null;
  const monitorsMetric = isAuthenticated ? useMonitorsCount() : null;
  const healthMetric = isAuthenticated ? useSystemHealth() : null;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="dashboard-home dashboard-home--unauthenticated">
        <div className="login-required-container">
          <div className="login-required-card">
            <div className="login-required-icon">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h2>Sign in required</h2>
            <p className="login-required-description">Please log in to access the monitoring dashboard.</p>
            <Link to="/login" className="login-required-button">
              Go to Login
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>

        <div className="dashboard-footer">
          <p>Need help? Contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="header-subtitle">Overview of your monitoring infrastructure</p>
        </div>
      </div>

      {/* Modern KPI Cards - Real-time Metrics */}
      <div className="dashboard-kpis-section">
        <h2 className="section-title">Performance Metrics</h2>
        {dashboardData && (
          <DashboardKPIs
            uptimePercentage={dashboardData.metrics?.uptimePercentage || 0}
            averageResponseTime={dashboardData.metrics?.averageResponseTime || 0}
            totalMonitors={dashboardData.metrics?.totalMonitors || 0}
            failedCount={dashboardData.metrics?.failedCount || 0}
            healthyCount={dashboardData.healthSummary?.healthyCount || 0}
            degradedCount={dashboardData.healthSummary?.degradedCount || 0}
            failedMonitors={dashboardData.healthSummary?.failedCount || 0}
            loading={dashboardData.loading}
            error={dashboardData.error}
          />
        )}
      </div>

      {/* Analytics Grid with Sidebar */}
      <div className="dashboard-main-layout">
        <div className="dashboard-main-content">
          {/* Analytics Grid */}
          <div className="dashboard-grid">
            {/* Datacenters Card */}
            <DashboardCard
              title="Datacenters"
              icon="🏢"
              metric={{
                ...datacentersMetric,
                label: 'Deployed instances',
              }}
              linkTo="/infrastructure/datacenters"
              linkText="View Datacenters"
              dataMetric="/api/datacenters/count"
            />

            {/* Agents Card */}
            <DashboardCard
              title="Agents"
              icon="🤖"
              metric={{
                ...agentsMetric,
                label: 'Actively running',
              }}
              linkTo="/infrastructure/agents"
              linkText="View Agents"
              dataMetric="/api/agents/count"
            />

            {/* Monitors Card */}
            <DashboardCard
              title="Monitors"
              icon="📊"
              metric={{
                ...monitorsMetric,
                label: 'API tests configured',
              }}
              linkTo="/monitoring/monitors"
              linkText="View Monitors"
              dataMetric="/api/http-monitors/count"
            />

            {/* Health Status Card */}
            <DashboardCard
              title="System Health"
              icon="❤️"
              metric={{
                ...healthMetric,
                label: 'All systems operational',
              }}
              linkTo="/admin/jhi-health"
              linkText="View Health"
              dataMetric="/management/health"
              statusClass={typeof healthMetric?.value === 'string' && healthMetric.value.includes('Healthy') ? 'status-ok' : 'status-error'}
            />

            {/* Quick Actions Card */}
            <ActionCard
              title="Quick Actions"
              icon="⚡"
              actions={[
                { label: '+ New Region', to: '/infrastructure/regions' },
                { label: '+ New Monitor', to: '/monitoring/monitors' },
              ]}
            />
          </div>
        </div>

        {/* Sidebar - Entity Widgets (25%) */}
        <div className="dashboard-sidebar">
          <div className="sidebar-widgets-stack">
            <RegionsWidget />
            <AgentsWidget />
            <DatacentersWidget />
          </div>
        </div>
      </div>

      {/* User Info Footer */}
      {account?.login && (
        <div className="dashboard-footer">
          <p>
            Logged in as <strong>{account.login}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
