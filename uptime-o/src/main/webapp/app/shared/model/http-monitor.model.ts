import { ISchedule } from 'app/shared/model/schedule.model';

export interface IHttpMonitor {
  id?: number;
  name?: string;
  method?: string;
  type?: string;
  url?: string;
  headers?: string | null;
  body?: string | null;
  schedule?: ISchedule | null;
}

export const defaultValue: Readonly<IHttpMonitor> = {};
