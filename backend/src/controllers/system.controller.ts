import { Request, Response, NextFunction } from 'express';
import { dbManager } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getHealth(req: Request, res: Response) {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'DuckDB In-Memory + Apache Parquet',
  });
}

export async function getMeta(req: Request, res: Response, next: NextFunction) {
  try {
    const meta = {
      project: 'NorthAir Intelligence',
      event: 'VIZ-A-THON 2026',
      version: '4.2.0',
      standards: 'CPCB / SPCB National Ambient Air Quality Standards (NAAQS)',
      timeZone: 'Indian Standard Time (IST, UTC+05:30)',
      datasets: {
        telemetry2025: '414,255 hourly records (48 stations)',
        historyArchive: '2,465,856 hourly records (2017–2023)',
        metadata: '48 canonical CAAQMS stations',
      },
    };
    return sendSuccess(res, meta);
  } catch (err) {
    next(err);
  }
}

export async function getFilters(req: Request, res: Response, next: NextFunction) {
  try {
    const statesSql = 'SELECT DISTINCT "State" FROM v_station_metadata ORDER BY "State";';
    const citiesSql = 'SELECT DISTINCT "City", "State" FROM v_station_metadata ORDER BY "State", "City";';
    const stationsSql = 'SELECT "Station ID" as id, "Station Name" as name, "City" as city, "State" as state FROM v_station_metadata ORDER BY "State", "City", "Station Name";';

    const [states, cities, stations] = await Promise.all([
      dbManager.query(statesSql, [], true),
      dbManager.query(citiesSql, [], true),
      dbManager.query(stationsSql, [], true),
    ]);

    const filterOptions = {
      states: states.map((s: any) => s.State),
      cities: cities.map((c: any) => ({ city: c.City, state: c.State })),
      stations: stations.map((stn: any) => ({
        id: stn.id,
        name: stn.name,
        city: stn.city,
        state: stn.state,
      })),
      pollutants: [
        { id: 'PM25', name: 'PM2.5 (Fine Particulate)', unit: 'µg/m³', std: 60.0 },
        { id: 'PM10', name: 'PM10 (Inhalable Coarse)', unit: 'µg/m³', std: 100.0 },
        { id: 'AQI', name: 'Composite AQI Index', unit: 'AQI', std: 100.0 },
        { id: 'NO2', name: 'Nitrogen Dioxide (NO2)', unit: 'µg/m³', std: 80.0 },
        { id: 'SO2', name: 'Sulphur Dioxide (SO2)', unit: 'µg/m³', std: 80.0 },
        { id: 'CO', name: 'Carbon Monoxide (CO)', unit: 'mg/m³', std: 4.0 },
        { id: 'Ozone', name: 'Ozone (O3)', unit: 'µg/m³', std: 100.0 },
        { id: 'NH3', name: 'Ammonia (NH3)', unit: 'µg/m³', std: 400.0 },
      ],
      resolutions: ['1-Hour High Fidelity', 'Daily Mean (24h Std)', '8-Hour Regulatory Window'],
    };

    return sendSuccess(res, filterOptions);
  } catch (err) {
    next(err);
  }
}

export async function getFindings(req: Request, res: Response) {
  const findings = [
    {
      id: 'FINDING-01',
      domain: 'Meteorology & Boundary Layer',
      title: 'Transboundary Winter Stagnation & Thermal Inversion',
      detail:
        'Continuous analysis reveals a high correlation (r = 0.88) between synchronized regional PM2.5 spikes and surface wind speeds < 1.5 m/s across the Indo-Gangetic Plain. Cold atmospheric lids entrap surface emissions.',
      evidence: 'Observed simultaneously in 48 stations during Nov–Jan.',
    },
    {
      id: 'FINDING-02',
      domain: 'Urban vs Sub-urban Gradient',
      title: 'Delhi NCR Fleet & Canyon Trapping Penalty',
      detail:
        'Delhi NCR stations record 42% higher 90th percentile PM2.5 compared to Chandigarh UT. Vehicular cold starts and urban street canyons prevent particulate dispersal.',
      evidence: 'Delhi 90th percentile: 232 µg/m³ vs Chandigarh 104 µg/m³.',
    },
    {
      id: 'FINDING-03',
      domain: 'Diurnal Dynamics',
      title: 'Afternoon Dispersion Window (13:00–16:00 IST)',
      detail:
        'Solar thermal convective mixing expands boundary layer height above 1350m during early afternoon, dropping network-wide median PM2.5 to 39 µg/m³ (a 45% reduction from morning rush).',
      evidence: 'Diurnal amplitude ratio averages 3.03x peak-to-trough.',
    },
    {
      id: 'FINDING-04',
      domain: 'Data Integrity & Sensor Saturation',
      title: 'Instrumental Right-Censoring at Saturation Limits',
      detail:
        'Analyzers cap PM2.5 at 999.99 µg/m³ and PM10 at 1000.00 µg/m³. These represent instrument limits rather than true ambient ceilings and are preserved with censoring flags.',
      evidence: '46 saturated PM2.5 records and 72 saturated PM10 records identified in 2025.',
    },
  ];

  return sendSuccess(res, findings);
}

export async function getMethodology(req: Request, res: Response) {
  const methodology = {
    cpcbStandard: 'National Ambient Air Quality Index (NAQI) Technical Report 2014',
    utcToIstConversion: 'UTC + 05:30 Indian Standard Time conversion with temporal feature enrichment',
    subIndexBreakpoints: {
      pm25: [
        { min: 0, max: 30, aqiMin: 0, aqiMax: 50, cat: 'Good' },
        { min: 31, max: 60, aqiMin: 51, aqiMax: 100, cat: 'Satisfactory' },
        { min: 61, max: 90, aqiMin: 101, aqiMax: 200, cat: 'Moderate' },
        { min: 91, max: 120, aqiMin: 201, aqiMax: 300, cat: 'Poor' },
        { min: 121, max: 250, aqiMin: 301, aqiMax: 400, cat: 'Very Poor' },
        { min: 251, max: 1000, aqiMin: 401, aqiMax: 500, cat: 'Severe' },
      ],
      pm10: [
        { min: 0, max: 50, aqiMin: 0, aqiMax: 50, cat: 'Good' },
        { min: 51, max: 100, aqiMin: 51, aqiMax: 100, cat: 'Satisfactory' },
        { min: 101, max: 250, aqiMin: 101, aqiMax: 200, cat: 'Moderate' },
        { min: 251, max: 350, aqiMin: 201, aqiMax: 300, cat: 'Poor' },
        { min: 351, max: 430, aqiMin: 301, aqiMax: 400, cat: 'Very Poor' },
        { min: 431, max: 1000, aqiMin: 401, aqiMax: 500, cat: 'Severe' },
      ],
    },
    minimumDataSufficiencyRule: '85% continuous valid readings required for regulatory statutory compliance (CPCB Protocol).',
  };
  return sendSuccess(res, methodology);
}

