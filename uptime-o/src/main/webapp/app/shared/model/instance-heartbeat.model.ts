export interface IInstanceHeartbeat {
  id?: number;
  instanceId?: number;
  executedAt?: string;
  heartbeatType?: 'PING' | 'HARDWARE';
  success?: boolean;
  responseTimeMs?: number;
  packetLoss?: number;
  jitterMs?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  loadAverage?: number;
  processCount?: number;
  networkRxBytes?: number;
  networkTxBytes?: number;
  uptimeSeconds?: number;
  status?: 'UP' | 'DOWN' | 'DEGRADED' | 'WARNING' | 'DANGER' | 'TIMEOUT';
  errorMessage?: string;
  errorType?: string;
  agentId?: number;
  metadata?: any;
}

export const defaultValue: Readonly<IInstanceHeartbeat> = {
  success: false,
};
