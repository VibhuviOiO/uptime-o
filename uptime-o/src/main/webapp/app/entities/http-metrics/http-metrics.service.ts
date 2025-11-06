import axios from 'axios';
import { HttpMetricsDTO } from './http-metrics.model';

const API_URL = 'api/http-metrics';

const getAggregatedMetrics = async (filters?: {
  searchName?: string;
  regionName?: string;
  datacenterName?: string;
  agentName?: string;
}): Promise<HttpMetricsDTO[]> => {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.searchName) params.append('searchName', filters.searchName);
    if (filters.regionName) params.append('regionName', filters.regionName);
    if (filters.datacenterName) params.append('datacenterName', filters.datacenterName);
    if (filters.agentName) params.append('agentName', filters.agentName);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await axios.get<HttpMetricsDTO[]>(`${API_URL}/aggregated${query}`);
  return response.data;
};

export const HttpMetricsService = {
  getAggregatedMetrics,
};
