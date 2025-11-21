import React from 'react';
import { NavDropdown } from './menu-components';
import MenuItem from './menu-item';

export const StatusPageMenu = () => (
  <NavDropdown icon="chart-bar" name="Status Pages" id="status-page-menu" data-cy="status-page-menu">
    <MenuItem icon="chart-bar" to="/status-page" data-cy="status-pages">
      Status Pages
    </MenuItem>
    <MenuItem icon="project-diagram" to="/status-dependency" data-cy="status-dependencies">
      Dependencies
    </MenuItem>
  </NavDropdown>
);
