import { useState, useEffect } from 'react';

export interface AppConfig {
  navbarTitle: string;
  statusPageTitle: string;
  statusPageSubtitle: string;
}

export function useConfig() {
  const [data, setData] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8077/config');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const configData = await response.json();
        setData(configData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { data, loading, error };
}