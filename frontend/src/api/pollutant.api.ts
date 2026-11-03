import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const pollutantApi = {
  getSummary: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters);
    return apiClient<any>(`${ENDPOINTS.POLLUTANT_SUMMARY}?${params.toString()}`);
  },
  getTrends: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters);
    return apiClient<any[]>(`${ENDPOINTS.POLLUTANT_TRENDS}?${params.toString()}`);
  },
  getRelationships: () => apiClient<any[]>(ENDPOINTS.POLLUTANT_RELATIONSHIPS),
};

