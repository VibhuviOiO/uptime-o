export interface IApiHeartbeatAggregated {
  monitorId: number;
  monitorName: string;
  url: string;
  method: string;
  type: string;
  activeAgentsCount: number;
  inactiveAgentsCount: number;
  lastCheck: string;
  lastCheckResponseTime: number;
}
