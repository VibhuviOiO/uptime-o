import { useEffect, useState } from 'react';
import axios from 'axios';
import { IHttpMonitor } from 'app/shared/model/http-monitor.model';

export interface DashboardMetricsDTO {
  uptimePercentage: number;
  averageResponseTime: number;
  successCount: number;
  failedCount: number;
  totalMonitors: number;
  degradedCount: number;
}

export interface TimelinePointDTO {
  timestamp: string;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
}

export interface TimelineDTO {
  points: TimelinePointDTO[];
  startTime: string;
  endTime: string;
  period: string;
}

export interface DatacenterStatusDTO {
  id: number;
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  uptimePercentage: number;
  totalMonitors: number;
  healthyMonitors: number;
  degradedMonitors: number;
  failedMonitors: number;
  agentStatus: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
  avgResponseTime: number;
  issueCount: number;
  lastUpdated: string;
}

export interface HealthSummaryDTO {
  healthyCount: number;
  degradedCount: number;
  failedCount: number;
  totalCount: number;
}

export interface DashboardData {
  metrics: DashboardMetricsDTO | null;
  timeline: TimelineDTO | null;
  datacenters: DatacenterStatusDTO[];
  healthSummary: HealthSummaryDTO | null;
  topMonitors: IHttpMonitor[];
  loading: boolean;
  error: string | null;
}

export const useDashboardMetrics = (refreshInterval: number = 30000) => {
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    timeline: null,
    datacenters: [],
    healthSummary: null,
    topMonitors: [],
    loading: true,
    error: null,
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, error: null }));

      // Fetch all dashboard data in parallel
      const responses = await Promise.all([
        axios.get<DashboardMetricsDTO>('/api/dashboard/metrics'),
        axios.get<TimelineDTO>('/api/dashboard/timeline?period=24h&intervalMinutes=15'),
        axios.get<DatacenterStatusDTO[]>('/api/dashboard/datacenter-status'),
        axios.get<HealthSummaryDTO>('/api/dashboard/health-summary'),
        axios.get<IHttpMonitor[]>('/api/dashboard/top-monitors?limit=5&orderBy=failureRate'),
      ]);

      const [metricsRes, timelineRes, datacentersRes, healthRes, monitorsRes] = responses;

      setData({
        metrics: metricsRes.data,
        timeline: timelineRes.data,
        datacenters: datacentersRes.data || [],
        healthSummary: healthRes.data,
        topMonitors: monitorsRes.data || [],
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error('Dashboard data fetch error:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    ...data,
    refetch: fetchDashboardData,
  };
};
