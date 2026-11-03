import { dbManager } from '../config/database.js';

export class PollutantService {
  public async getSummary(filters: any) {
    const sql = `
      SELECT 
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as mean_pm25,
        ROUND(MAX("PM2.5 (µg/m³)"), 1) as max_pm25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as mean_pm10,
        ROUND(MAX("PM10 (µg/m³)"), 1) as max_pm10,
        ROUND(AVG("NO2 (µg/m³)"), 1) as mean_no2,
        ROUND(MAX("NO2 (µg/m³)"), 1) as max_no2,
        ROUND(AVG("SO2 (µg/m³)"), 1) as mean_so2,
        ROUND(MAX("SO2 (µg/m³)"), 1) as max_so2,
        ROUND(AVG("CO (mg/m³)"), 2) as mean_co,
        ROUND(MAX("CO (mg/m³)"), 2) as max_co,
        ROUND(AVG("Ozone (µg/m³)"), 1) as mean_ozone,
        ROUND(MAX("Ozone (µg/m³)"), 1) as max_ozone,
        ROUND(AVG("NH3 (µg/m³)"), 1) as mean_nh3,
        ROUND(AVG("PM2.5 (µg/m³)") / NULLIF(AVG("PM10 (µg/m³)"), 0), 2) as pmRatio
      FROM v_air_quality_2025;
    `;
    const res = await dbManager.query(sql, [], true);
    return res[0] || {};
  }

  public async getTrends(filters: any) {
    const sql = `
      SELECT 
        "Date" as date,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as pm25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as pm10,
        ROUND(AVG("NO2 (µg/m³)"), 1) as no2,
        ROUND(AVG("SO2 (µg/m³)"), 1) as so2,
        ROUND(AVG("CO (mg/m³)"), 2) as co,
        ROUND(AVG("Ozone (µg/m³)"), 1) as ozone
      FROM v_air_quality_2025
      GROUP BY "Date"
      ORDER BY "Date" ASC
      LIMIT 60;
    `;
    return await dbManager.query(sql, [], true);
  }

  public async getRelationships() {
    // Scatter sample for PM2.5 vs PM10 and NO2 vs Ozone (stratified by hour)
    const sql = `
      SELECT 
        ROUND("PM2.5 (µg/m³)", 1) as pm25,
        ROUND("PM10 (µg/m³)", 1) as pm10,
        ROUND("NO2 (µg/m³)", 1) as no2,
        ROUND("Ozone (µg/m³)", 1) as ozone,
        "State" as state,
        "Month_Name" as month
      FROM v_air_quality_2025
      WHERE "PM2.5 (µg/m³)" IS NOT NULL 
        AND "PM10 (µg/m³)" IS NOT NULL 
        AND "PM2.5 (µg/m³)" <= 500
        AND "PM10 (µg/m³)" <= 800
      USING SAMPLE 1000;
    `;
    return await dbManager.query(sql, [], true);
  }
}

export const pollutantService = new PollutantService();

