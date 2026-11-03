import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { StateComparison, StationItem } from '../types';

export const regionalApi = {
  getStates: () => apiClient<StateComparison[]>(ENDPOINTS.REGIONS_STATES),
  getCities: () => apiClient<any[]>(ENDPOINTS.REGIONS_CITIES),
  getMesh: () => apiClient<StationItem[]>(ENDPOINTS.REGIONS_COMPARISON),
};

