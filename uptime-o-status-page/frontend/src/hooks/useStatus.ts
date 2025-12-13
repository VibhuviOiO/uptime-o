import { useState, useEffect } from 'react';
import { useConfig } from './useConfig';

export interface Indicator {
  type: string;
  enabled: boolean;
  label: string;
  color: string;
  threshold?: number;
}

export interface RegionHealth {
  status: string;
  responseTimeMs: number;
  lastChecked: string;
  successRate?: number;
  totalCalls?: number;
}

export interface ApiStatus {
  monitorId: number;
  apiName: string;
  regionHealth: Record<string, RegionHealth>;
}

export interface StatusResponse {
  apis: ApiStatus[];
  regions: string[];
}

const parseRefreshTime = (value: string): { ms: number; display: string } => {
  const match = value.match(/^(\d+)\s*(s|m|h)?$/i);
  if (!match) return { ms: 120000, display: '2m' };
  
  const num = parseInt(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  
  if (unit === 'h') return { ms: num * 3600000, display: `${num}h` };
  if (unit === 'm') return { ms: num * 60000, display: `${num}m` };
  return { ms: num * 1000, display: `${num}s` };
};

export function useStatus() {
  const [data, setData] = useState<StatusResponse>({ apis: [], regions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: config } = useConfig();
  const { ms: refreshInterval, display: refreshDisplay } = parseRefreshTime(config?.refreshTime || '2m');

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/public/status');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error, refreshDisplay };
}