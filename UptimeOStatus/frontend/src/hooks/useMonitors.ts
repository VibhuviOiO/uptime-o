import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

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
  executedAt: string;
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
  activeOnly?: boolean; // Show only monitors with recent activity
  maxAge?: number; // Max age in minutes for considering monitors active (default: 15)
  startTime?: Date; // Start time for filtering history
  endTime?: Date; // End time for filtering history
}

export interface MonitorStats {
  total: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
  recentChecks: number;
}

// Get all monitors with filters
export function useMonitors(filters?: MonitorFilters) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  return useQuery<Monitor[]>({
    queryKey: ['monitors', filters],
    queryFn: async () => {
        const res = await axios.get(apiUrl(`/monitorings?${queryParams.toString()}`));
      if (Array.isArray(res.data)) return res.data;
      if (!res.data) return [];
      return [res.data];
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
}

// Get monitor by ID
export function useMonitor(id: number) {
  return useQuery<Monitor>({
    queryKey: ['monitor', id],
    queryFn: async () => {
      const res = await axios.get(apiUrl(`/monitors/${id}`));
      return res.data;
    },
    enabled: !!id,
  });
}

// Get monitor statistics
export function useMonitorStats() {
  return useQuery<MonitorStats>({
    queryKey: ['monitor-stats'],
    queryFn: async () => {
      const res = await axios.get(apiUrl('/monitors/stats'));
      return res.data;
    },
  });
}

// Get monitor regions
export function useMonitorRegions() {
  return useQuery<{ region: string; count: number }[]>({
    queryKey: ['monitor-regions'],
    queryFn: async () => {
      const res = await axios.get(apiUrl('/monitors/regions'));
      return res.data;
    },
  });
}

// Protocol-specific hooks
export function useHTTPMonitors(filters?: Omit<MonitorFilters, 'monitorType'>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  return useQuery<Monitor[]>({
    queryKey: ['monitors', 'HTTP', filters],
    queryFn: async () => {
        const url = queryParams.toString() 
          ? apiUrl(`/monitorings?monitorType=HTTP&${queryParams.toString()}`)
          : apiUrl('/monitorings?monitorType=HTTP');
      const res = await axios.get(url);
      if (Array.isArray(res.data)) return res.data;
      if (!res.data) return [];
      return [res.data];
    },
    select: (data) => Array.isArray(data) ? data : [],
    keepPreviousData: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

export function useTCPMonitors(filters?: Omit<MonitorFilters, 'monitorType'>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  return useQuery<Monitor[]>({
    queryKey: ['monitors', 'TCP', filters],
    queryFn: async () => {
        const res = await axios.get(apiUrl(`/monitorings?monitorType=TCP&${queryParams.toString()}`));
      if (Array.isArray(res.data)) return res.data;
      if (!res.data) return [];
      return [res.data];
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
}

export function usePINGMonitors(filters?: Omit<MonitorFilters, 'monitorType'>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  return useQuery<Monitor[]>({
    queryKey: ['monitors', 'PING', filters],
    queryFn: async () => {
        const res = await axios.get(apiUrl(`/monitorings?monitorType=PING&${queryParams.toString()}`));
      if (Array.isArray(res.data)) return res.data;
      if (!res.data) return [];
      return [res.data];
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
}

export function useDNSMonitors(filters?: Omit<MonitorFilters, 'monitorType'>) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  return useQuery<Monitor[]>({
    queryKey: ['monitors', 'DNS', filters],
    queryFn: async () => {
        const res = await axios.get(apiUrl(`/monitorings?monitorType=DNS&${queryParams.toString()}`));
      if (Array.isArray(res.data)) return res.data;
      if (!res.data) return [];
      return [res.data];
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
}

// Get monitor history with filters
export function useMonitorHistory(monitorId: string, filters?: MonitorFilters) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          queryParams.append(key, value.toISOString());
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }

  const url = queryParams.toString()
     ? apiUrl(`/monitorings/history/${monitorId}?${queryParams.toString()}`)
     : apiUrl(`/monitorings/history/${monitorId}`);

  console.log('🚀 useMonitorHistory: Making API call:', {
    url,
    monitorId,
    filters,
    timestamp: new Date().toISOString()
  });

  return useQuery<Monitor[]>({
    queryKey: ['monitor-history', monitorId, filters],
    queryFn: async () => {
      console.log('📡 useMonitorHistory: Executing queryFn for:', { monitorId, filters });
      const res = await axios.get(url);
      console.log('📥 useMonitorHistory: Received response:', {
        status: res.status,
        dataLength: Array.isArray(res.data) ? res.data.length : 'not array',
        url
      });
      return res.data;
    },
    enabled: !!monitorId,
    keepPreviousData: true,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// Get latest monitor data
export function useLatestMonitorData(monitorId: string) {
  return useQuery<Monitor>({
    queryKey: ['monitor-latest', monitorId],
    queryFn: async () => {
      const res = await axios.get(apiUrl(`/monitors/latest/${monitorId}`));
      return res.data;
    },
    enabled: !!monitorId,
  });
}

// Mutation hooks
export function useCreateMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NewMonitor>) => {
      const res = await axios.post(apiUrl('/monitors'), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitor-stats'] });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NewMonitor> }) => {
      const res = await axios.put(apiUrl(`/monitors/${id}`), data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitor', id] });
      queryClient.invalidateQueries({ queryKey: ['monitor-stats'] });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(apiUrl(`/monitors/${id}`));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitor-stats'] });
    },
  });
}