import { useState, useEffect } from 'react';

export interface Region {
  id: number;
  name: string;
  regionCode: string;
  group: string;
}

export function useRegions() {
  const [data, setData] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegions() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8077/regions');
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

    fetchRegions();
  }, []);

  return { data, loading, error };
}