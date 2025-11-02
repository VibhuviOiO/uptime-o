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
import { SchedulesWidget } from './components/SchedulesWidget';
import { MonitorsWidget } from './components/MonitorsWidget';
import { useDatacentersCount, useAgentsCount, useMonitorsCount, useSystemHealth } from './hooks/useDashboardMetrics';
import { DashboardKPIs } from 'app/modules/dashboard/components/DashboardKPIs';
import { useDashboardMetrics } from 'app/modules/dashboard/hooks/useDashboardMetrics';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);
  const isAuthenticated = account && account.login;

  // Call all hooks unconditionally - this is required by React's rules of hooks
  const dashboardData = useDashboardMetrics(30000); // Refresh every 30 seconds
  const datacentersMetric = useDatacentersCount();
  const agentsMetric = useAgentsCount();
  const monitorsMetric = useMonitorsCount();
  const healthMetric = useSystemHealth();

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
          {/* First Row: Regions, Datacenters */}
          <div className="dashboard-grid dashboard-grid-row1">
            <div className="entity-column entity-column--span2">
              <h3 className="column-header">Regions</h3>
              <RegionsWidget />
            </div>
            <div className="entity-column entity-column--span2">
              <h3 className="column-header">Datacenters</h3>
              <DatacentersWidget />
            </div>
          </div>

          {/* Second Row: Agents, Schedules */}
          <div className="dashboard-grid dashboard-grid-row2">
            <div className="entity-column entity-column--span2">
              <h3 className="column-header">Agents</h3>
              <AgentsWidget />
            </div>
            <div className="entity-column entity-column--span2">
              <h3 className="column-header">Schedules</h3>
              <SchedulesWidget />
            </div>
          </div>

          {/* Third Row: HTTP Monitors (Full Width) */}
          <div className="dashboard-grid dashboard-grid-row3">
            <div className="entity-column entity-column--span4">
              <h3 className="column-header">HTTP Monitors</h3>
              <MonitorsWidget />
            </div>
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
