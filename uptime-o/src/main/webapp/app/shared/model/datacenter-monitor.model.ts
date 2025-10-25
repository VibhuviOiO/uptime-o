import { IDatacenter } from 'app/shared/model/datacenter.model';
import { IApiMonitor } from 'app/shared/model/api-monitor.model';

export interface IDatacenterMonitor {
  id?: number;
  datacenter?: IDatacenter | null;
  monitor?: IApiMonitor | null;
}

export const defaultValue: Readonly<IDatacenterMonitor> = {};
