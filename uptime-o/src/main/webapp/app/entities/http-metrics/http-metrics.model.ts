export interface HttpMetricsDTO {
  monitorId: number;
  monitorName: string;
  lastSuccess: boolean;
  agentCount: number;
  regionName: string;
  datacenterName: string;
  lastCheckedTime: string | null;
  lastLatencyMs: number;
  agentName?: string;
}
