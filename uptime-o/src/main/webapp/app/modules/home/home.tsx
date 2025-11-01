import './home.scss';

import React from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Welcome to UptimeO</div>
          <h1 className="hero-title">
            Synthetic API Monitoring
            <span className="highlight"> Made Simple</span>
          </h1>
          <p className="hero-subtitle">
            Monitor your APIs globally with agents deployed across datacenters.
            <br />
            Get real-time insights into your infrastructure health and performance.
          </p>

          {account?.login ? (
            <div className="hero-actions">
              <Link to="/infrastructure/regions" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <Link to="/admin/jhi-health" className="btn btn-secondary">
                System Health
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary">
                Sign In
              </Link>
              <Link to="/account/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          )}
        </div>

        <div className="hero-illustration">
          <div className="illustration-placeholder">
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              {/* Globe */}
              <circle cx="200" cy="150" r="80" fill="none" stroke="#0066CC" strokeWidth="2" />
              <circle cx="200" cy="150" r="75" fill="none" stroke="#0066CC" strokeWidth="1" opacity="0.5" />

              {/* Nodes */}
              <circle cx="140" cy="120" r="8" fill="#0066CC" />
              <circle cx="260" cy="130" r="8" fill="#10B981" />
              <circle cx="200" cy="220" r="8" fill="#F59E0B" />
              <circle cx="150" cy="180" r="6" fill="#EF4444" />

              {/* Connection lines */}
              <line x1="200" y1="150" x2="140" y2="120" stroke="#0066CC" strokeWidth="1" opacity="0.5" />
              <line x1="200" y1="150" x2="260" y2="130" stroke="#0066CC" strokeWidth="1" opacity="0.5" />
              <line x1="200" y1="150" x2="200" y2="220" stroke="#0066CC" strokeWidth="1" opacity="0.5" />
              <line x1="200" y1="150" x2="150" y2="180" stroke="#0066CC" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Coverage</h3>
            <p>Monitor from multiple regions and datacenters worldwide</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Continuous Testing</h3>
            <p>Schedule API tests to run at regular intervals</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Insights</h3>
            <p>View live metrics and performance data instantly</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Distributed Agents</h3>
            <p>Deploy lightweight agents across your infrastructure</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3>Smart Alerts</h3>
            <p>Get notified when your APIs go down or degrade</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analytics</h3>
            <p>Track trends and historical performance over time</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Define Infrastructure</h3>
            <p>Create regions and deploy datacenters with agents</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Schedule Tests</h3>
            <p>Set up monitoring schedules and API tests</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Monitor Globally</h3>
            <p>Agents execute tests from your infrastructure</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Insights</h3>
            <p>View results and get actionable performance data</p>
          </div>
        </div>
      </section>

      {/* Status Section */}
      {account?.login && (
        <section className="status-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Regions</div>
              <div className="stat-value">—</div>
              <div className="stat-desc">Configured globally</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Agents</div>
              <div className="stat-value">—</div>
              <div className="stat-desc">Actively monitoring</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Health</div>
              <div className="stat-value">—</div>
              <div className="stat-desc">System status</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Uptime</div>
              <div className="stat-value">—</div>
              <div className="stat-desc">30-day average</div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Monitoring?</h2>
          <p>Get started in minutes with UptimeO</p>
          {!account?.login ? (
            <Link to="/login" className="btn btn-primary btn-large">
              Sign In Now
            </Link>
          ) : (
            <Link to="/infrastructure/regions" className="btn btn-primary btn-large">
              Go to Monitoring
            </Link>
          )}
        </div>
      </section>

      {/* User Info */}
      {account?.login && (
        <section className="user-info">
          <p className="logged-in-message">
            Logged in as <strong>{account.login}</strong>
          </p>
        </section>
      )}
    </div>
  );
};

export default Home;
