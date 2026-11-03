import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { HotspotRank, HeatmapStation } from '../types';

export const hotspotApi = {
  getRankings: (limit = 20) => apiClient<HotspotRank[]>(`${ENDPOINTS.HOTSPOT_RANKINGS}?limit=${limit}`),
  getHeatmap: () => apiClient<HeatmapStation[]>(ENDPOINTS.HOTSPOT_HEATMAP),
  getDistribution: () => apiClient<any[]>(ENDPOINTS.HOTSPOT_DISTRIBUTION),
};

