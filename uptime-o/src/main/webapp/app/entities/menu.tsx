import React from 'react';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="asterisk" to="/schedule">
        Schedule
      </MenuItem>
      <MenuItem icon="asterisk" to="/http-monitor">
        HTTP Monitor
      </MenuItem>
      <MenuItem icon="asterisk" to="/region">
        Region
      </MenuItem>
      <MenuItem icon="asterisk" to="/datacenter">
        Datacenter
      </MenuItem>
      <MenuItem icon="asterisk" to="/agent">
        Agent
      </MenuItem>
      <MenuItem icon="asterisk" to="/api-heartbeat">
        Api Heartbeat
      </MenuItem>
      <MenuItem icon="asterisk" to="/audit-log">
        Audit Log
      </MenuItem>
      <MenuItem icon="asterisk" to="/datacenter-monitor">
        Datacenter Monitor
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
