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
  dnsResolvedIp?: string | null;
  tcpConnectMs?: number | null;
  tlsHandshakeMs?: number | null;
  sslCertificateValid?: boolean | null;
  sslCertificateExpiry?: dayjs.Dayjs | null;
  sslCertificateIssuer?: string | null;
  sslDaysUntilExpiry?: number | null;
  timeToFirstByteMs?: number | null;
  warningThresholdMs?: number | null;
  criticalThresholdMs?: number | null;
  errorType?: string | null;
  errorMessage?: string | null;
  rawRequestHeaders?: string | null;
  rawResponseHeaders?: string | null;
  rawResponseBody?: string | null;
  // Phase 2 Enhancement Fields
  dnsDetails?: string | null;
  tlsDetails?: string | null;
  httpVersion?: string | null;
  contentEncoding?: string | null;
  compressionRatio?: number | null;
  transferEncoding?: string | null;
  responseBodyHash?: string | null;
  responseBodySample?: string | null;
  responseBodyValid?: boolean | null;
  responseBodyUncompressedBytes?: number | null;
  redirectDetails?: string | null;
  cacheControl?: string | null;
  etag?: string | null;
  cacheAge?: number | null;
  cdnProvider?: string | null;
  cdnPop?: string | null;
  rateLimitDetails?: string | null;
  networkPath?: string | null;
  agentMetrics?: string | null;
  phaseLatencies?: string | null;
  monitor?: IHttpMonitor | null;
  agent?: IAgent | null;
}

export const defaultValue: Readonly<IHttpHeartbeat> = {
  success: false,
};
