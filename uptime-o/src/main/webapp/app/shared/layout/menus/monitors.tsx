import React from 'react';
import MenuItem from 'app/shared/layout/menus/menu-item';
import { NavDropdown } from './menu-components';

export const MonitorsMenu = () => (
  <NavDropdown icon="desktop" name="Monitors" id="monitors-menu" data-cy="monitorsMenu">
    <MenuItem icon="heartbeat" to="/api-heartbeat">
      API Heartbeats
    </MenuItem>
    {/* jhipster-needle-add-element-to-monitors-menu - JHipster will add entities to the monitors menu here */}
  </NavDropdown>
);

export default MonitorsMenu;
