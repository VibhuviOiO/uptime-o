import { IDatacenter } from 'app/shared/model/datacenter.model';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';

export interface IDatacenterMonitor {
  id?: number;
  datacenter?: IDatacenter | null;
  monitor?: IHttpMonitor | null;
}

export const defaultValue: Readonly<IDatacenterMonitor> = {};
