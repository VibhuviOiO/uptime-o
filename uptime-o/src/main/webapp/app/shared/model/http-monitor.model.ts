import { ISchedule } from 'app/shared/model/schedule.model';

export interface IHttpMonitor {
  id?: number;
  name?: string;
  method?: string;
  type?: string;
  url?: string;
  additionalUrls?: string[];
  callsPerInterval?: number;
  headers?: any;
  body?: any;
  schedule?: ISchedule | null;
}

export const defaultValue: Readonly<IHttpMonitor> = {};
