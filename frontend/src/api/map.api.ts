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
}

export interface MapStationsResponse {
  stations: MapStation[];
  legend: MapLegend;
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
}

export interface MapRegionsResponse {
  regions: MapRegion[];
  breakpoints: number[];
  pollutant: string;
  unit: string;
}

export const mapApi = {
  getMapStations: (params?: { state?: string; city?: string; pollutant?: string }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<MapStationsResponse>(`/map/stations${qs}`);
  },

  getMapRegions: (params?: { pollutant?: string }) => {
    const search = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v && v !== 'ALL'))
    );
    const qs = search.toString() ? `?${search.toString()}` : '';
    return apiClient<MapRegionsResponse>(`/map/regions${qs}`);
  },
};

