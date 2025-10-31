import React from 'react';
import MenuItem from 'app/shared/layout/menus/menu-item';
import { NavDropdown } from './menu-components';

export const MonitorsMenu = () => (
  <NavDropdown icon="desktop" name="Monitors" id="monitors-menu" data-cy="monitorsMenu">
    <MenuItem icon="heartbeat" to="/api-heartbeat">
      API Heartbeats
    </MenuItem>
    <MenuItem icon="heartbeat" to="/api-heartbeat-aggregated">
      API Monitors (Aggregated)
    </MenuItem>
  </NavDropdown>
);

export default MonitorsMenu;
