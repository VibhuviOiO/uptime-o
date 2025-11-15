export interface IServiceInstance {
  id?: number;
  serviceId?: number;
  instanceId?: number;
  instanceName?: string;
  instanceHostname?: string;
  port?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const defaultValue: Readonly<IServiceInstance> = {
  isActive: true,
};
