export interface IServiceHeartbeat {
  id?: number;
  serviceId?: number;
  serviceInstanceId?: number;
  serviceName?: string;
  instanceName?: string;
  instancePort?: number;
  executedAt?: string;
  success?: boolean;
  status?: 'UP' | 'DOWN' | 'WARNING' | 'CRITICAL' | 'DEGRADED' | 'TIMEOUT';
  responseTimeMs?: number;
  errorMessage?: string;
  metadata?: any;
  agentId?: number;
}
