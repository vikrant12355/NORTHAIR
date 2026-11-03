export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    count?: number;
    total?: number;
    generatedAt: string;
    source: string;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface GlobalFilters {
  state: string;
  city: string;
  stationId: string;
  startDate?: string;
  endDate?: string;
  pollutant: string;
  resolution: string;
}

export interface AirQualityTier {
  category: AQICategory;
  count: number;
  percentage: number;
}

export interface OverviewSummary {
  stationsOnline: number;
  stationsReporting: number;
  totalTelemetryPoints: number;
  completenessPct: number;
  regionalMeanPM25: number;
  regionalMedianPM25: number;
  naaqsPM25Std: number;
  pm25ExceedancePct: number;
  regionalMeanPM10: number;
  regionalMedianPM10: number;
  naaqsPM10Std: number;
  pm10ExceedancePct: number;
  peakRecord: {
    stationName: string;
    city: string;
    state: string;
    value: number;
  };
  airQualityTiers: AirQualityTier[];
  findings: Array<{
    id: string;
    tag: string;
    correlation?: string;
    variance?: string;
    title: string;
    description: string;
  }>;
}

export interface TrajectoryPoint {
  date: string;
  pm25: number;
  pm10: number;
  windSpeed: number;
  temperature: number;
}

export interface StateComparison {
  state: string;
  stationCount: number;
  meanPM25: number;
  medianPM25: number;
  meanPM10: number;
  maxPM25: number;
  exceedanceRate: number;
  cpcbTier?: AQICategory;
}

export interface StationItem {
  rank: number;
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  hoursRecorded: number;
  dataCapturePct: number;
  avgPM25: number;
  avgPM10: number;
  maxPM25: number;
  maxPM10: number;
  status: string;
  tier: AQICategory;
  lat?: number;
  lng?: number;
}

export interface StationProfile {
  metadata: {
    stationId: string;
    stationName: string;
    city: string;
    state: string;
    hoursRecorded2025: number;
    dataCapturePct: number;
    inHistory: boolean;
    daysHistory: number;
  };
  stats: {
    totalPoints: number;
    avgPM25: number;
    medianPM25: number;
    maxPM25: number;
    avgPM10: number;
    medianPM10: number;
    maxPM10: number;
    avgNO2: number;
    avgSO2: number;
    avgCO: number;
    avgOzone: number;
    avgNH3: number;
    avgTemp: number;
    avgRH: number;
    avgWS: number;
    avgSR: number;
    pm25SaturatedHours: number;
    pm10SaturatedHours: number;
    coSaturatedHours: number;
    vwsNegativeHours: number;
  };
}

export interface HotspotRank {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  pm25Mean: number;
  pm25P90: number;
  pm25Max: number;
  exceed60Pct: number;
  exceed120Pct: number;
  exceed250Pct: number;
  pm10Mean: number;
  pm10P90: number;
  pm10Max: number;
  compositeRank: number;
}

export interface HeatmapStation {
  stationName: string;
  city: string;
  state: string;
  months: Record<number, number>;
}

export interface WeatherSummary {
  metrics: {
    avgTemp: number;
    minTemp: number;
    maxTemp: number;
    avgHumidity: number;
    avgWindSpeed: number;
    maxWindSpeed: number;
    avgSolarRadiation: number;
    totalRainfall: number;
    negativeVwsReadings: number;
    bpMissingnessPct: number;
  };
  dataIntegrityAlerts: Array<{
    param: string;
    status: string;
    issue: string;
  }>;
}

export interface WeatherCorrelation {
  description: string;
  variable1: string;
  variable2: string;
  subset: string;
  sampleSizeN: number;
  pearsonR: number;
  pearsonPValue: number;
  spearmanRho: number;
  interpretation: string;
}

export interface HistoricalSummary {
  overview: {
    totalObservations: number;
    stationCount: number;
    overallMeanAQI: number;
    overallMedianAQI: number;
    minDate: string;
    maxDate: string;
  };
  yearlyTrends: Array<{
    year: string;
    meanAQI: number;
    medianAQI: number;
    validReads: number;
  }>;
  dataIntegrityNote: string;
}

export interface QualitySummary {
  totalRows2025: number;
  totalStations: number;
  networkCompletenessPct: number;
  statutory85PctCompliant: number;
  exactDuplicates: number;
  sanitizedDuplicates: number;
  saturationCounts: {
    pm25Censored: number;
    pm10Censored: number;
    coCensored: number;
    vwsNegativeValid: number;
  };
}

export interface MissingnessItem {
  parameter: string;
  missingCount: number;
  missingPercentage: number;
}

export interface StationCoverageItem {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
  recordedHours: number;
  expectedHours: number;
  coveragePct: number;
  cpcbCompliance: string;
}

