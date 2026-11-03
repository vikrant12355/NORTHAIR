import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { OverviewSummary, TrajectoryPoint, StateComparison } from '../types';

export const overviewApi = {
  getSummary: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters);
    return apiClient<OverviewSummary>(`${ENDPOINTS.OVERVIEW_SUMMARY}?${params.toString()}`);
  },
  getTrends: (filters?: Record<string, any>) => {
    const params = new URLSearchParams(filters);
    return apiClient<TrajectoryPoint[]>(`${ENDPOINTS.OVERVIEW_TRENDS}?${params.toString()}`);
  },
  getRegionalComparison: () => {
    return apiClient<StateComparison[]>(ENDPOINTS.OVERVIEW_REGIONAL);
  },
};

