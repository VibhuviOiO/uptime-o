import dayjs from 'dayjs';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';
import { IAgent } from 'app/shared/model/agent.model';

export interface IHttpHeartbeat {
  id?: number;
  executedAt?: dayjs.Dayjs;
  success?: boolean | null;
  responseTimeMs?: number | null;
  responseSizeBytes?: number | null;
  responseStatusCode?: number | null;
  responseContentType?: string | null;
  responseServer?: string | null;
  responseCacheStatus?: string | null;
  dnsLookupMs?: number | null;
  tcpConnectMs?: number | null;
  tlsHandshakeMs?: number | null;
  timeToFirstByteMs?: number | null;
  warningThresholdMs?: number | null;
  criticalThresholdMs?: number | null;
  errorType?: string | null;
  errorMessage?: string | null;
  rawRequestHeaders?: string | null;
  rawResponseHeaders?: string | null;
  rawResponseBody?: string | null;
  monitor?: IHttpMonitor | null;
  agent?: IAgent | null;
}

export const defaultValue: Readonly<IHttpHeartbeat> = {
  success: false,
};
