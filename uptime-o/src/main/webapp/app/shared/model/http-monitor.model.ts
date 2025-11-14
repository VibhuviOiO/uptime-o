export interface IHttpMonitor {
  id?: number;
  name?: string;
  method?: string;
  type?: string;
  url?: string;
  headers?: any;
  body?: any;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  retryCount?: number;
  retryDelaySeconds?: number;
  responseTimeWarningMs?: number | null;
  responseTimeCriticalMs?: number | null;
  uptimeWarningPercent?: number | null;
  uptimeCriticalPercent?: number | null;
  includeResponseBody?: boolean | null;
  resendNotificationCount?: number | null;
  certificateExpiryDays?: number | null;
  ignoreTlsError?: boolean | null;
  upsideDownMode?: boolean | null;
  maxRedirects?: number | null;
  description?: string | null;
  tags?: string | null;
  monitoringVisibility?: string | null;
  enabled?: boolean | null;
  parentId?: number | null;
}

export const defaultValue: Readonly<IHttpMonitor> = {
  intervalSeconds: 60,
  timeoutSeconds: 30,
  retryCount: 2,
  retryDelaySeconds: 5,
  responseTimeWarningMs: 1000,
  responseTimeCriticalMs: 3000,
  uptimeWarningPercent: 99.0,
  uptimeCriticalPercent: 95.0,
  includeResponseBody: false,
  resendNotificationCount: 0,
  certificateExpiryDays: 30,
  ignoreTlsError: false,
  upsideDownMode: false,
  maxRedirects: 10,
  description: '',
  tags: '',
  monitoringVisibility: 'internal',
  enabled: true,
};
