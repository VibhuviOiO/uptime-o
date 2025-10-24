export interface StatusRow {
  monitorId: number;
  monitorName: string;
  region_id: number;
  region: string;
  datacenter_id: number;
  datacenter: string;
  status: string; // "operational" | "degraded-orange" | "degraded-red" | "down"
  successRate: number; // e.g., 97.5
  avgLatencyMs: number;
  warningThresholdMs: number;
  criticalThresholdMs: number;
}
