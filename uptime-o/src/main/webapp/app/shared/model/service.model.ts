export interface IService {
  id?: number;
  name?: string;
  description?: string;
  serviceType?: 'TCP' | 'CASSANDRA' | 'MONGODB' | 'REDIS' | 'KAFKA' | 'POSTGRESQL' | 'MYSQL' | 'ELASTICSEARCH' | 'RABBITMQ' | 'CUSTOM';
  environment?: 'DEV' | 'QA' | 'STAGE' | 'PROD' | 'DMZ' | 'DR';
  monitoringEnabled?: boolean;
  intervalSeconds?: number;
  timeoutMs?: number;
  retryCount?: number;
  latencyWarningMs?: number;
  latencyCriticalMs?: number;
  advancedConfig?: any;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  datacenterId?: number;
  datacenterName?: string;
}

export const defaultValue: Readonly<IService> = {
  monitoringEnabled: true,
  isActive: true,
  intervalSeconds: 30,
  timeoutMs: 2000,
  retryCount: 2,
  latencyWarningMs: 200,
  latencyCriticalMs: 600,
};
