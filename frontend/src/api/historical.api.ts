import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { HistoricalSummary } from '../types';

export const historicalApi = {
  getSummary: () => apiClient<HistoricalSummary>(ENDPOINTS.HISTORICAL_AQI),
  getTrends: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters);
    return apiClient<any[]>(`${ENDPOINTS.HISTORICAL_TRENDS}?${params.toString()}`);
  },
  getDistribution: () => apiClient<any[]>(ENDPOINTS.HISTORICAL_DISTRIBUTION),
};

