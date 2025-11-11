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

export function useStatus() {
  const [data, setData] = useState<StatusResponse>({ apis: [], regions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('http://localhost:8077/api/public/status');
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
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}