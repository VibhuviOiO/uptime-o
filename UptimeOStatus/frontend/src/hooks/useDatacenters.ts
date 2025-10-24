import { useState, useEffect } from 'react';

export interface Datacenter {
  id: number;
  code: string;
  name: string;
  regionId: number;
}

export function useDatacenters() {
  const [data, setData] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatacenters() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8077/datacenters');
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

    fetchDatacenters();
  }, []);

  return { data, loading, error };
}