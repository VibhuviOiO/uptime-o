import dayjs from 'dayjs';
import { IUser } from 'app/shared/model/user.model';

export interface IAuditLog {
  id?: number;
  action?: string;
  entityName?: string;
  entityId?: number;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp?: dayjs.Dayjs;
  ipAddress?: string | null;
  userAgent?: string | null;
  user?: IUser | null;
}

export const defaultValue: Readonly<IAuditLog> = {};
