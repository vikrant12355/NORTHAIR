import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { StationItem, StationProfile, TrajectoryPoint } from '../types';

export const stationApi = {
  getStations: (params?: Record<string, any>) => {
    const search = new URLSearchParams(params);
    return apiClient<StationItem[]>(`${ENDPOINTS.STATIONS}?${search.toString()}`);
  },
  getStationById: (stationId: string) => {
    return apiClient<StationProfile>(ENDPOINTS.STATION_BY_ID(stationId));
  },
  getStationTrends: (stationId: string, limitDays = 30) => {
    return apiClient<TrajectoryPoint[]>(`${ENDPOINTS.STATION_TRENDS(stationId)}?limit=${limitDays}`);
  },
};

