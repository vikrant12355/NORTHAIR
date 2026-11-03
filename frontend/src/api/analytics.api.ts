import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const analyticsApi = {
  getSeasonal: (state?: string) => {
    const query = state && state !== 'ALL' ? `?state=${encodeURIComponent(state)}` : '';
    return apiClient<any[]>(`${ENDPOINTS.ANALYTICS_SEASONAL}${query}`);
  },
  getDiurnal: (state?: string, season?: string) => {
    const params = new URLSearchParams();
    if (state && state !== 'ALL') params.set('state', state);
    if (season && season !== 'ALL') params.set('season', season);
    return apiClient<any[]>(`${ENDPOINTS.ANALYTICS_DIURNAL}?${params.toString()}`);
  },
  compare: (stationIds: string[]) => {
    return apiClient<any[]>(`${ENDPOINTS.ANALYTICS_COMPARE}?stationIds=${stationIds.join(',')}`);
  },
};

