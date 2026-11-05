import { apiClient } from './client';

export interface MapStation {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  hasCoords: boolean;
  hoursRecorded: number;
  dataCapturePct: number;
  avgValue: number | null;
  medianValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  p90Value?: number | null;
  obsCount: number;
  avgPM25: number | null;
  avgPM10: number | null;
  pollutant: string;
  unit: string;
  colour: string;
  tier: string;
}

export interface MapLegendClass {
  label: string;
  colour: string;
  range: [number | null, number | null];
}

export interface MapLegend {
  pollutant: string;
  unit: string;
  method: string;
  breakpoints: number[];
  classes: MapLegendClass[];
  dataMin: number | null;
  dataMax: number | null;
  dataMedian: number | null;
  palette?: string[];
}

export interface MapStats {
  totalStations: number;
  verifiedCoordsCount: number;
  coordinateCoveragePct: number;
  filteredCount: number;
  activeState: string;
  activeCity: string;
}

export interface MapStationsResponse {
  stations: MapStation[];
  legend: MapLegend;
  stats: MapStats;
}

export interface MapRegion {
  state: string;
  stationCount: number;
  avgValue: number | null;
  medianValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  obsCount: number;
  pollutant: string;
  unit: string;
  colour: string;
  lat: number;
  lng: number;
  bounds?: [[number, number], [number, number]];
}

export interface MapRegionsResponse {
  regions: MapRegion[];
  legend: MapLegend;
}

export interface MapSummaryResponse {
  stats: MapStats;
  pollutant: string;
  unit: string;
  networkMean: number | null;
  dataMin: number | null;
  dataMax: number | null;
  dataMedian: number | null;
  topHotspot: {
    stationId: string;
    stationName: string;
    city: string;
    state: string;
    avgValue: number;
  } | null;
  cleanest: {
    stationId: string;
    stationName: string;
    city: string;
    state: string;
    avgValue: number;
  } | null;
  targetRegions: string[];
}

export interface StationDetailResponse extends MapStation {
  avgNO2?: number | null;
  avgSO2?: number | null;
  avgCO?: number | null;
  avgOzone?: number | null;
  avgNH3?: number | null;
}

export const mapApi = {
  getMapStations: (params?: {
    state?: string;
    city?: string;
    pollutant?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<MapStationsResponse>(`/map/stations${qs}`);
  },

  getMapRegions: (params?: { pollutant?: string; startDate?: string; endDate?: string }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<MapRegionsResponse>(`/map/regions${qs}`);
  },

  getMapSummary: (params?: {
    state?: string;
    city?: string;
    pollutant?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<MapSummaryResponse>(`/map/summary${qs}`);
  },

  getMapLegend: (params?: { pollutant?: string; state?: string; city?: string }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<MapLegend>(`/map/legend${qs}`);
  },

  getMapFeatureValues: (params?: { pollutant?: string; state?: string }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<{ features: Record<string, any>; legend: MapLegend }>(`/map/feature-values${qs}`);
  },

  getStationDetail: (stationId: string, params?: { pollutant?: string }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<StationDetailResponse>(`/map/stations/${encodeURIComponent(stationId)}${qs}`);
  },
};
