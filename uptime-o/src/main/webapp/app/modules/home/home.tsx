import './home.scss';

import React from 'react';

import { useAppSelector } from 'app/config/store';
import DashboardCard, { ActionCard } from './components/DashboardCard';
import { useRegionsCount, useDatacentersCount, useAgentsCount, useMonitorsCount, useSystemHealth } from './hooks/useDashboardMetrics';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  // Lazy load metrics
  const regionsMetric = useRegionsCount();
  const datacentersMetric = useDatacentersCount();
  const agentsMetric = useAgentsCount();
  const monitorsMetric = useMonitorsCount();
  const healthMetric = useSystemHealth();

  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="header-subtitle">Overview of your monitoring infrastructure</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="dashboard-grid">
        {/* Regions Card */}
        <DashboardCard
          title="Regions"
          icon="🌍"
          metric={{
            ...regionsMetric,
            label: 'Configured globally',
          }}
          linkTo="/infrastructure/regions"
          linkText="View Regions"
          dataMetric="/api/regions/count"
        />

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
          statusClass={typeof healthMetric.value === 'string' && healthMetric.value.includes('Healthy') ? 'status-ok' : 'status-error'}
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
