import axios from 'axios';
import { HttpMetricsDTO } from './http-metrics.model';

export interface MetricsQueryParams {
  page?: number;
  size?: number;
  search?: string;
  startTime?: string;
  endTime?: string;
  region?: string;
  datacenter?: string;
  agent?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class HttpMetricsService {
  private static readonly API_URL = '/api/http-metrics';

  // Use existing method signature
  static async getAggregatedMetrics(
    searchName?: string,
    regionName?: string,
    datacenterName?: string,
    agentName?: string,
  ): Promise<HttpMetricsDTO[]> {
    const response = await axios.get(`${this.API_URL}/paginated`, {
      params: {
        search: searchName,
        region: regionName,
        datacenter: datacenterName,
        agent: agentName,
        page: 0,
        size: 1000,
      },
    });
    return response.data.content || response.data;
  }

  // Optimized paginated endpoint with server-side filtering
  static async getAggregatedMetricsPaginated(params: MetricsQueryParams): Promise<PaginatedResponse<HttpMetricsDTO>> {
    const queryParams = new URLSearchParams();

    // Add pagination
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    // Add time range filters (crucial for performance)
    if (params.startTime) queryParams.append('startTime', params.startTime);
    if (params.endTime) queryParams.append('endTime', params.endTime);

    // Add search filters
    if (params.search) queryParams.append('search', params.search);
    if (params.region) queryParams.append('region', params.region);
    if (params.datacenter) queryParams.append('datacenter', params.datacenter);
    if (params.agent) queryParams.append('agent', params.agent);

    const response = await axios.get(`${this.API_URL}/paginated?${queryParams}`);
    return response.data;
  }

  // Lightweight stats endpoint (no detailed data)
  static async getMetricsStats(timeRange: string): Promise<{
    upCount: number;
    downCount: number;
    avgLatency: number;
    totalCount: number;
  }> {
    const response = await axios.get(`${this.API_URL}/stats?timeRange=${timeRange}`);
    return response.data;
  }

  // Real-time updates with timestamp filtering
  static async getLatestMetrics(lastUpdateTime: string): Promise<HttpMetricsDTO[]> {
    const response = await axios.get(`${this.API_URL}/latest?since=${lastUpdateTime}`);
    return response.data;
  }
}
