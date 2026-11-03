import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { WeatherSummary, WeatherCorrelation } from '../types';

export const weatherApi = {
  getSummary: () => apiClient<WeatherSummary>(ENDPOINTS.WEATHER_SUMMARY),
  getCorrelations: () => apiClient<WeatherCorrelation[]>(ENDPOINTS.WEATHER_CORRELATION),
  getRelationships: () => apiClient<any[]>(ENDPOINTS.WEATHER_RELATIONSHIPS),
};

