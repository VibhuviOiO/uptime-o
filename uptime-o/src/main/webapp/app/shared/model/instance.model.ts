export interface IInstance {
  id?: number;
  name?: string;
  hostname?: string;
  description?: string | null;
  instanceType?: 'VM' | 'BARE_METAL' | 'CONTAINER' | 'CLOUD_INSTANCE';
  monitoringType?: 'SELF_HOSTED' | 'AGENT_MONITORED';
  agentId?: number | null;
  operatingSystem?: string | null;
  platform?: string | null;
  privateIpAddress?: string | null;
  publicIpAddress?: string | null;
  tags?: object | null;
  pingEnabled?: boolean;
  pingInterval?: number;
  pingTimeoutMs?: number;
  pingRetryCount?: number;
  hardwareMonitoringEnabled?: boolean;
  hardwareMonitoringInterval?: number;
  cpuWarningThreshold?: number;
  cpuDangerThreshold?: number;
  memoryWarningThreshold?: number;
  memoryDangerThreshold?: number;
  diskWarningThreshold?: number;
  diskDangerThreshold?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastPingAt?: string | null;
  lastHardwareCheckAt?: string | null;
  datacenterId?: number;
  datacenterName?: string;
}

export const defaultValue: Readonly<IInstance> = {
  pingEnabled: true,
  pingInterval: 30,
  pingTimeoutMs: 3000,
  pingRetryCount: 2,
  hardwareMonitoringEnabled: false,
  hardwareMonitoringInterval: 300,
  cpuWarningThreshold: 70,
  cpuDangerThreshold: 90,
  memoryWarningThreshold: 75,
  memoryDangerThreshold: 90,
  diskWarningThreshold: 80,
  diskDangerThreshold: 95,
};
