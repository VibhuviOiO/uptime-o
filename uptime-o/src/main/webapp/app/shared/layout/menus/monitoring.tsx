import React from 'react';
import { NavDropdown } from './menu-components';
import MenuItem from './menu-item';

export const MonitoringMenu = () => (
  <NavDropdown icon="chart-line" name="Monitoring" id="monitoring-menu" data-cy="monitoring-menu">
    <MenuItem icon="globe" to="/http-monitor" data-cy="http-monitors">
      HTTP Monitors
    </MenuItem>
    <MenuItem icon="heartbeat" to="/http-heartbeats" data-cy="http-heartbeats">
      HTTP Heartbeats
    </MenuItem>
    <MenuItem icon="server" to="/ping-heartbeat" data-cy="ping-heartbeats">
      Ping Heartbeats
    </MenuItem>
    <MenuItem icon="network-wired" to="/service-heartbeat" data-cy="service-heartbeats">
      Service Heartbeats
    </MenuItem>
    <MenuItem icon="chart-line" to="/http-heartbeat-aggregated" data-cy="monitoring-dashboard">
      Dashboard
    </MenuItem>
    <MenuItem icon="tachometer-alt" to="/http-metrics" data-cy="http-metrics">
      HTTP(s) Metrics
    </MenuItem>
  </NavDropdown>
);
