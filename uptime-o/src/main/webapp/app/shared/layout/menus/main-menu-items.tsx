import React from 'react';
import MenuItem from './menu-item';

// Infrastructure Section
export const InfrastructureMenuItems = () => (
  <>
    <MenuItem icon="globe" to="/region" data-cy="regions">
      Regions
    </MenuItem>
    <MenuItem icon="building" to="/datacenter" data-cy="datacenters">
      Datacenters
    </MenuItem>
    <MenuItem icon="robot" to="/agent" data-cy="agents">
      Agents
    </MenuItem>
  </>
);

// Monitoring Section
export const MonitoringMenuItems = () => (
  <>
    <MenuItem icon="heartbeat" to="/http-heartbeats" data-cy="http-heartbeats">
      HTTP Heartbeats
    </MenuItem>
    <MenuItem icon="chart-line" to="/http-heartbeat-aggregated" data-cy="monitoring-dashboard">
      Dashboard
    </MenuItem>
  </>
);

// Settings Section
export const SettingsMenuItems = () => (
  <>
    <MenuItem icon="globe" to="/http-monitor" data-cy="http-monitors">
      HTTP Monitors
    </MenuItem>
    <MenuItem icon="clock" to="/schedule" data-cy="schedules">
      Schedules
    </MenuItem>
    <MenuItem icon="wrench" to="/account/settings" data-cy="settings">
      Account Settings
    </MenuItem>
  </>
);

// Help & Docs Section
export const HelpMenuItems = () => (
  <>
    <MenuItem icon="info-circle" to="/admin/docs" data-cy="api-docs">
      API Documentation
    </MenuItem>
  </>
);
