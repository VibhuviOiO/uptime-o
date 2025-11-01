import './home.scss';

import React from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

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
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Regions</h2>
            <span className="card-icon">🌍</span>
          </div>
          <div className="card-body">
            <div className="metric-value">—</div>
            <p className="metric-label">Configured globally</p>
            <Link to="/infrastructure/regions" className="card-link">
              View Regions →
            </Link>
          </div>
        </div>

        {/* Datacenters Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Datacenters</h2>
            <span className="card-icon">🏢</span>
          </div>
          <div className="card-body">
            <div className="metric-value">—</div>
            <p className="metric-label">Deployed instances</p>
            <Link to="/infrastructure/datacenters" className="card-link">
              View Datacenters →
            </Link>
          </div>
        </div>

        {/* Agents Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Agents</h2>
            <span className="card-icon">🤖</span>
          </div>
          <div className="card-body">
            <div className="metric-value">—</div>
            <p className="metric-label">Actively running</p>
            <Link to="/infrastructure/agents" className="card-link">
              View Agents →
            </Link>
          </div>
        </div>

        {/* Monitors Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Monitors</h2>
            <span className="card-icon">📊</span>
          </div>
          <div className="card-body">
            <div className="metric-value">—</div>
            <p className="metric-label">API tests configured</p>
            <Link to="/monitoring/monitors" className="card-link">
              View Monitors →
            </Link>
          </div>
        </div>

        {/* Health Status Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>System Health</h2>
            <span className="card-icon">❤️</span>
          </div>
          <div className="card-body">
            <div className="metric-value status-ok">Healthy</div>
            <p className="metric-label">All systems operational</p>
            <Link to="/admin/jhi-health" className="card-link">
              View Health →
            </Link>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
            <span className="card-icon">⚡</span>
          </div>
          <div className="card-body card-actions">
            <Link to="/infrastructure/regions" className="action-btn">
              + New Region
            </Link>
            <Link to="/monitoring/monitors" className="action-btn">
              + New Monitor
            </Link>
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
