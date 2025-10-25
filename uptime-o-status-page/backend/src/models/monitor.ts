export interface Monitor {
  id: number;
  
  // Monitor Configuration
  monitorId: string;
  monitorName?: string | null;
  monitorType: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP' | 'PING' | 'DNS';
  targetHost: string;
  targetPort?: number | null;
  targetPath?: string | null;
  
  // HTTP-specific fields
  httpMethod?: string | null;
  expectedStatusCode?: number | null;
  
  // DNS-specific fields
  dnsQueryType?: string | null;
  dnsExpectedResponse?: string | null;
  
  // Execution Context
  executedAt: Date;
  agentId?: string | null;
  agentRegion?: string | null;
  
  // Universal Response Data
  success: boolean;
  responseTime?: number | null;
  responseSizeBytes?: number | null;
  
  // HTTP Response Data
  responseStatusCode?: number | null;
  responseContentType?: string | null;
  responseServer?: string | null;
  responseCacheStatus?: string | null;
  
  // Network Performance Metrics
  dnsLookupMs?: number | null;
  tcpConnectMs?: number | null;
  tlsHandshakeMs?: number | null;
  timeToFirstByteMs?: number | null;
  
  // Performance Thresholds
  warningThresholdMs?: number | null;
  criticalThresholdMs?: number | null;
  
  // PING-specific metrics
  packetLoss?: number | null;
  jitterMs?: number | null;
  
  // DNS-specific response
  dnsResponseValue?: string | null;
  
  // Error Tracking
  errorMessage?: string | null;
  errorType?: string | null;
  
  // Raw Data (conditional)
  rawResponseHeaders?: Record<string, any> | null;
  rawResponseBody?: string | null;
  rawRequestHeaders?: Record<string, any> | null;
  rawNetworkData?: Record<string, any> | null;
}

export interface apiHeartbeat {
  id: number;
  apiHeartbeatId: number;
  monitorType: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP' | 'PING' | 'DNS';
  targetHost: string;
  httpMethod?: string | null;
  expectedStatusCode?: number | null;
  executedAt: Date;
  agentId?: string | null;
  agentRegion?: string | null;
  success: boolean;
  responseTime?: number | null;
  responseSizeBytes?: number | null;
  responseStatusCode?: number | null;
  responseContentType?: string | null;
  responseServer?: string | null;
  responseCacheStatus?: string | null;
  errorMessage?: string | null;
  errorType?: string | null;
  rawResponseHeaders?: Record<string, any> | null;
  rawResponseBody?: string | null;
  rawRequestHeaders?: Record<string, any> | null;
  rawNetworkData?: Record<string, any> | null;
}

export type NewMonitor = Omit<Monitor, 'id'>;

export interface MonitorFilters {
  monitorType?: string;
  agentRegion?: string;
  success?: boolean;
  targetHost?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'executedAt' | 'responseTime' | 'monitorId';
  sortOrder?: 'asc' | 'desc';
  activeOnly?: boolean; 
  maxAge?: number;
  startTime?: Date;
  endTime?: Date; 
}