import path from 'path';
import fs from 'fs';
import { dbManager } from '../config/database.js';
import { ENV } from '../config/env.js';

export class WeatherService {
  public async getSummary() {
    const sql = `
      SELECT 
        ROUND(AVG("AT (°C)"), 1) as avgTemp,
        ROUND(MIN("AT (°C)"), 1) as minTemp,
        ROUND(MAX("AT (°C)"), 1) as maxTemp,
        ROUND(AVG("RH (%)"), 1) as avgHumidity,
        ROUND(AVG("WS (m/s)"), 2) as avgWindSpeed,
        ROUND(MAX("WS (m/s)"), 2) as maxWindSpeed,
        ROUND(AVG("SR (W/mt2)"), 1) as avgSolarRadiation,
        ROUND(SUM("RF (mm)"), 1) as totalRainfall,
        COUNT(CASE WHEN "VWS (m/s)" < 0 THEN 1 END) as negativeVwsReadings,
        ROUND((COUNT(CASE WHEN "BP (mmHg)" IS NULL THEN 1 END)::DOUBLE / COUNT(*)::DOUBLE) * 100.0, 1) as bpMissingnessPct
      FROM v_air_quality_2025;
    `;
    const rows = await dbManager.query(sql, [], true);
    return {
      metrics: rows[0] || {},
      dataIntegrityAlerts: [
        {
          param: 'BP (mmHg)',
          status: 'Restricted / Audit-Only',
          issue: '81.34% missingness and uncalibrated values >800 mmHg observed. Excluded from primary environmental modeling.',
        },
        {
          param: 'VWS (m/s)',
          status: 'Valid Physical Negative',
          issue: 'Negative vertical wind speed values represent atmospheric downdraft/subsidence rather than instrumentation error.',
        },
      ],
    };
  }

  public async getCorrelations() {
    const csvPath = path.join(ENV.DATA_DIR, 'processed', 'analytics', 'weather_correlations.csv');
    if (!fs.existsSync(csvPath)) return [];

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');

    const correlations = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 10) {
        correlations.push({
          description: parts[0],
          variable1: parts[1],
          variable2: parts[2],
          subset: parts[3],
          sampleSizeN: parseInt(parts[4], 10) || 0,
          pearsonR: parseFloat(parts[5]) || 0,
          pearsonPValue: parseFloat(parts[6]) || 0,
          spearmanRho: parseFloat(parts[7]) || 0,
          interpretation: parts[9],
        });
      }
    }
    return correlations;
  }

  public async getRelationships() {
    // Dispersion curve: Wind speed vs PM2.5 aggregated in 0.5 m/s bins
    const sql = `
      SELECT 
        FLOOR("WS (m/s)" * 2) / 2.0 as windSpeedBin,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as meanPM25,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as medianPM25,
        COUNT(*) as sampleCount
      FROM v_air_quality_2025
      WHERE "WS (m/s)" IS NOT NULL AND "WS (m/s)" >= 0 AND "WS (m/s)" <= 10
        AND "PM2.5 (µg/m³)" IS NOT NULL
      GROUP BY windSpeedBin
      HAVING sampleCount > 50
      ORDER BY windSpeedBin ASC;
    `;
    return await dbManager.query(sql, [], true);
  }
}

export const weatherService = new WeatherService();

