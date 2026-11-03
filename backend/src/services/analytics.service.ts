import { dbManager } from '../config/database.js';

export class AnalyticsService {
  public async getSeasonal(state?: string) {
    let where = '1=1';
    const params: any[] = [];
    if (state && state !== 'ALL') {
      where += ' AND "State" = ?';
      params.push(state);
    }

    const sql = `
      SELECT 
        "Season" as season,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as meanPM25,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as medianPM25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as meanPM10,
        ROUND(AVG("AT (°C)"), 1) as meanTemp,
        ROUND(AVG("RH (%)"), 1) as meanRH,
        ROUND(AVG("WS (m/s)"), 2) as meanWindSpeed,
        COUNT(*) as sampleCount
      FROM v_calculated_aqi
      WHERE ${where} AND "Season" IS NOT NULL
      GROUP BY "Season"
      ORDER BY meanPM25 DESC;
    `;
    return await dbManager.query(sql, params, true);
  }

  public async getDiurnal(state?: string, season?: string) {
    let where = '1=1';
    const params: any[] = [];
    if (state && state !== 'ALL') {
      where += ' AND "State" = ?';
      params.push(state);
    }
    if (season && season !== 'ALL') {
      where += ' AND "Season" = ?';
      params.push(season);
    }

    const sql = `
      SELECT 
        "Hour" as hour,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as pm25Mean,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as pm25Median,
        ROUND(AVG("PM10 (µg/m³)"), 1) as pm10Mean,
        ROUND(AVG("WS (m/s)"), 2) as wsMean,
        ROUND(STDDEV_SAMP("PM2.5 (µg/m³)"), 1) as pm25StdDev,
        COUNT(*) as count
      FROM v_air_quality_2025
      WHERE ${where} AND "PM2.5 (µg/m³)" IS NOT NULL
      GROUP BY "Hour"
      ORDER BY "Hour" ASC;
    `;
    return await dbManager.query(sql, params, true);
  }

  public async compare(stationIds: string[]) {
    if (!stationIds || stationIds.length === 0) return [];
    const placeholders = stationIds.map(() => '?').join(',');

    const sql = `
      SELECT 
        "Station ID" as stationId,
        "Station Name" as stationName,
        "City" as city,
        "State" as state,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as avgPM25,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as medianPM25,
        ROUND(MAX("PM2.5 (µg/m³)"), 1) as maxPM25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as avgPM10,
        ROUND(AVG("NO2 (µg/m³)"), 1) as avgNO2,
        ROUND(AVG("Ozone (µg/m³)"), 1) as avgOzone,
        ROUND(AVG("WS (m/s)"), 2) as avgWS,
        COUNT(*) as totalPoints
      FROM v_air_quality_2025
      WHERE "Station ID" IN (${placeholders})
      GROUP BY "Station ID", "Station Name", "City", "State";
    `;
    return await dbManager.query(sql, stationIds, true);
  }
}

export const analyticsService = new AnalyticsService();

