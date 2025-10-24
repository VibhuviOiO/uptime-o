import { useState, useEffect } from 'react';

export interface HeartbeatData {
  timestamp: string;
  success: boolean;
  responseTimeMs: number;
}

export function useHeartbeats(monitorId: number, datacenterId?: number, window: string = '1h', limit: number = 10) {
  const [data, setData] = useState<HeartbeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeartbeats() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          window,
          limit: limit.toString(),
        });
        if (datacenterId) {
          params.append('datacenterId', datacenterId.toString());
        }
        const response = await fetch(`http://localhost:8077/monitors/${monitorId}/heartbeats?${params}`);
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

    fetchHeartbeats();
  }, [monitorId, datacenterId, window, limit]);

  return { data, loading, error };
}