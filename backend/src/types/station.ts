export interface StationMetadata {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  operator?: string;
  status: 'Operational' | 'Intermittent' | 'Offline';
  establishedYear?: number;
  completeness2025?: number;
  recordedHours2025?: number;
  expectedHours2025?: number;
}

