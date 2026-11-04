export const ENDPOINTS = {
  // System
  HEALTH: '/health',
  META: '/meta',
  FILTERS: '/filters',
  FINDINGS: '/reports/findings',
  METHODOLOGY: '/reports/methodology',

  // Overview
  OVERVIEW_SUMMARY: '/overview',
  OVERVIEW_TRENDS: '/overview/trends',
  OVERVIEW_REGIONAL: '/overview/regional-comparison',

  // Regional
  REGIONS_STATES: '/regions/states',
  REGIONS_CITIES: '/regions/cities',
  REGIONS_COMPARISON: '/regions/comparison',

  // Stations
  STATIONS: '/stations',
  STATION_BY_ID: (id: string) => `/stations/${id}`,
  STATION_TRENDS: (id: string) => `/stations/${id}/trends`,

  // Hotspots
  HOTSPOTS: '/hotspots',
  HOTSPOT_RANKINGS: '/hotspots/rankings',
  HOTSPOT_HEATMAP: '/hotspots/heatmap',
  HOTSPOT_DISTRIBUTION: '/hotspots/distribution',

  // Pollutants
  POLLUTANTS: '/pollutants',
  POLLUTANT_SUMMARY: '/pollutants/summary',
  POLLUTANT_TRENDS: '/pollutants/trends',
  POLLUTANT_RELATIONSHIPS: '/pollutants/relationships',

  // Weather
  WEATHER_SUMMARY: '/weather/summary',
  WEATHER_CORRELATION: '/weather/correlation',
  WEATHER_RELATIONSHIPS: '/weather/relationships',

  // Historical AQI
  HISTORICAL_AQI: '/historical/aqi',
  HISTORICAL_TRENDS: '/historical/aqi/trends',
  HISTORICAL_DISTRIBUTION: '/historical/aqi/distribution',

  // Advanced Analytics
  ANALYTICS_SEASONAL: '/analytics/seasonal',
  ANALYTICS_DIURNAL: '/analytics/diurnal',
  ANALYTICS_COMPARE: '/analytics/compare',

  // Data Quality
  QUALITY_SUMMARY: '/quality/summary',
  QUALITY_MISSINGNESS: '/quality/missingness',
  QUALITY_COVERAGE: '/quality/coverage',
  QUALITY_IDENTITIES: '/quality/station-identities',

  // Map Intelligence
  MAP_STATIONS: '/map/stations',
  MAP_REGIONS: '/map/regions',

  // Exports
  EXPORT_MEASUREMENTS: '/exports/measurements.csv',
  EXPORT_STATIONS: '/exports/stations.csv',
};

