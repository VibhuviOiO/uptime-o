import schedule from 'app/entities/schedule/schedule.reducer';
import httpMonitor from 'app/entities/http-monitor/http-monitor.reducer';
import region from 'app/entities/region/region.reducer';
import datacenter from 'app/entities/datacenter/datacenter.reducer';
import agent from 'app/entities/agent/agent.reducer';
import apiHeartbeat from 'app/entities/http-heartbeat/http-heartbeat.reducer';
import apiHeartbeatAggregated from 'app/entities/http-heartbeat/http-heartbeat-aggregated.reducer';
import auditLog from 'app/entities/audit-log/audit-log.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const entitiesReducers = {
  schedule,
  httpMonitor,
  region,
  datacenter,
  agent,
  apiHeartbeat,
  apiHeartbeatAggregated,
  auditLog,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
};

export default entitiesReducers;
