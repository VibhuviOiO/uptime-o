import { useState, useEffect } from 'react';

export interface RegionHealth {
  status: string;
  responseTimeMs: number;
  lastChecked: string;
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

const parseRefreshTime = (value: string | number): { ms: number; display: string } => {
  if (typeof value === 'number') {
    return { ms: value * 1000, display: `${value}s` };
  }
  
  const match = value.match(/^(\d+)\s*(s|m|h|hour|hours|minute|minutes|second|seconds)?$/i);
  if (!match) {
    return { ms: 30000, display: '30s' };
  }
  
  const num = parseInt(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  
  if (unit.startsWith('h')) {
    return { ms: num * 3600000, display: `${num}h` };
  } else if (unit.startsWith('m')) {
    return { ms: num * 60000, display: `${num}m` };
  } else {
    return { ms: num * 1000, display: `${num}s` };
  }
};

export function useStatus() {
  const [data, setData] = useState<StatusResponse>({ apis: [], regions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ms: refreshInterval, display: refreshDisplay } = parseRefreshTime(import.meta.env.VITE_STATUS_PAGE_REFRESH_TIME || 30);

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