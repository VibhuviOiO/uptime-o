import React from 'react';
import { NavDropdown } from './menu-components';
import { InfrastructureMenuItems, MonitoringMenuItems, SettingsMenuItems, HelpMenuItems } from './main-menu-items';

export const InfrastructureMenu = () => (
  <NavDropdown icon="globe" name="Infrastructure" id="infrastructure-menu" data-cy="infrastructure-menu">
    <InfrastructureMenuItems />
  </NavDropdown>
);

export const MonitoringMenu = () => (
  <NavDropdown icon="chart-line" name="Monitoring" id="monitoring-menu" data-cy="monitoring-menu">
    <MonitoringMenuItems />
  </NavDropdown>
);

export const SettingsMenu = () => (
  <NavDropdown icon="cog" name="Settings" id="settings-menu" data-cy="settings-menu">
    <SettingsMenuItems />
  </NavDropdown>
);

export const HelpMenu = () => (
  <NavDropdown icon="book" name="Help" id="help-menu" data-cy="help-menu">
    <HelpMenuItems />
  </NavDropdown>
);
