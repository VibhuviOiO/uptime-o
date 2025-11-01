import React from 'react';
import MenuItem from 'app/shared/layout/menus/menu-item';
import { NavDropdown } from './menu-components';

export const MonitorsMenu = () => (
  <NavDropdown icon="desktop" name="Monitors" id="monitors-menu" data-cy="monitorsMenu">
    <MenuItem icon="heartbeat" to="/http-heartbeats">
      HTTP Heartbeats
    </MenuItem>
    <MenuItem icon="heartbeat" to="/http-heartbeats-aggregated">
      HTTP Monitors (Aggregated)
    </MenuItem>
  </NavDropdown>
);

export default MonitorsMenu;
