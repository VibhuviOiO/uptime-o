import { useState, useEffect } from 'react';

export interface StatusData {
  monitorId: number;
  monitorName: string;
  region_id: number;
  region: string;
  datacenter_id: number;
  datacenter: string;
  status: string;
  success: string;
  successRate: number;
  avgLatencyMs: number;
  warningThresholdMs: number;
  criticalThresholdMs: number;
}

export function useStatus(window: string = '1h', regionId?: number, datacenterId?: number) {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ window });
        if (regionId) params.append('regionId', regionId.toString());
        if (datacenterId) params.append('datacenterId', datacenterId.toString());

        const response = await fetch(`http://localhost:8077/status?${params}`);
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
  }, [window, regionId, datacenterId]);

  return { data, loading, error };
}