import { useEffect, useState } from 'react';
import axios from 'axios';

export interface DashboardMetric {
  value: number | string;
  label: string;
  loading: boolean;
  error: string | null;
}

interface UseMetricOptions {
  endpoint: string;
  transform?: (data: any) => number | string;
  debounceMs?: number;
}

/**
 * Custom hook for lazy loading individual metrics
 * Loads data only when component is visible in viewport
 */
export const useDashboardMetric = (options: UseMetricOptions): DashboardMetric => {
  const { endpoint, transform, debounceMs = 500 } = options;
  const [metric, setMetric] = useState<DashboardMetric>({
    value: '—',
    label: '',
    loading: false,
    error: null,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!isVisible || hasLoaded) return;

    const loadMetric = async () => {
      setMetric(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axios.get(endpoint, {
          timeout: 5000, // 5 second timeout
        });

        const value = transform ? transform(response.data) : response.data.count || 0;

        setMetric(prev => ({
          ...prev,
          value,
          loading: false,
        }));

        setHasLoaded(true);
      } catch (err: any) {
        // Skip logging 401/404 errors to reduce noise
        if (err.response?.status !== 401 && err.response?.status !== 404) {
          setMetric(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to load',
          }));
        } else {
          setMetric(prev => ({
            ...prev,
            loading: false,
            error: null,
          }));
        }
      }
    };

    const timer = setTimeout(loadMetric, debounceMs);
    return () => clearTimeout(timer);
  }, [isVisible, hasLoaded, endpoint, transform, debounceMs]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      },
    );

    const element = document.querySelector(`[data-metric="${endpoint}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [endpoint]);

  return metric;
};

/**
 * Hook for regions count with lazy loading
 */
export const useRegionsCount = (): DashboardMetric => {
  return useDashboardMetric({
    endpoint: '/api/regions/count',
    transform: data => data.totalCount || 0,
  });
};

/**
 * Hook for datacenters count with lazy loading
 */
export const useDatacentersCount = (): DashboardMetric => {
  return useDashboardMetric({
    endpoint: '/api/datacenters/count',
    transform: data => data.totalCount || 0,
  });
};

/**
 * Hook for agents count with lazy loading
 */
export const useAgentsCount = (): DashboardMetric => {
  return useDashboardMetric({
    endpoint: '/api/agents/count',
    transform: data => data.totalCount || 0,
  });
};

/**
 * Hook for monitors count with lazy loading
 */
export const useMonitorsCount = (): DashboardMetric => {
  return useDashboardMetric({
    endpoint: '/api/http-monitors/count',
    transform: data => data.totalCount || 0,
  });
};
/**
 * Hook for system health status
 */
export const useSystemHealth = (): DashboardMetric => {
  return useDashboardMetric({
    endpoint: '/management/health',
    transform(data) {
      if (data.status === 'UP') return 'Healthy';
      if (data.status === 'DOWN') return 'Down';
      return 'Unknown';
    },
  });
};
