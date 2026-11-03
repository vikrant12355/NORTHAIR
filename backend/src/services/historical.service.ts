import { dbManager } from '../config/database.js';

export class HistoricalService {
  public async getSummary() {
    const sql = `
      SELECT 
        COUNT(*) as totalObservations,
        COUNT(DISTINCT "Station ID") as stationCount,
        ROUND(AVG("AQI"), 1) as overallMeanAQI,
        ROUND(MEDIAN("AQI"), 1) as overallMedianAQI,
        MIN("Date") as minDate,
        MAX("Date") as maxDate
      FROM v_aqi_history
      WHERE "AQI" IS NOT NULL;
    `;
    const res = await dbManager.query(sql, [], true);

    // Yearly progression
    const yearlySql = `
      SELECT 
        SUBSTR("Date", 1, 4) as year,
        ROUND(AVG("AQI"), 1) as meanAQI,
        ROUND(MEDIAN("AQI"), 1) as medianAQI,
        COUNT(*) as validReads
      FROM v_aqi_history
      WHERE "AQI" IS NOT NULL
      GROUP BY year
      ORDER BY year ASC;
    `;
    const yearly = await dbManager.query(yearlySql, [], true);

    return {
      overview: res[0] || {},
      yearlyTrends: yearly,
      dataIntegrityNote:
        'Historical records (2017–2023) reflect verified CPCB publications and are kept isolated from 2025 raw hourly telemetry to prevent deceptive temporal stitching.',
    };
  }

  public async getTrends(filters: { state?: string; year?: string }) {
    let where = '"AQI" IS NOT NULL';
    const params: any[] = [];

    if (filters.state && filters.state !== 'ALL') {
      where += ' AND "State" = ?';
      params.push(filters.state);
    }

    const sql = `
      SELECT 
        SUBSTR("Date", 1, 7) as yearMonth,
        "State" as state,
        ROUND(AVG("AQI"), 1) as meanAQI
      FROM v_aqi_history
      WHERE ${where}
      GROUP BY yearMonth, "State"
      ORDER BY yearMonth ASC;
    `;
    return await dbManager.query(sql, params, true);
  }

  public async getDistribution() {
    const sql = `
      SELECT 
        CASE 
          WHEN "AQI" <= 50 THEN 'Good'
          WHEN "AQI" <= 100 THEN 'Satisfactory'
          WHEN "AQI" <= 200 THEN 'Moderate'
          WHEN "AQI" <= 300 THEN 'Poor'
          WHEN "AQI" <= 400 THEN 'Very Poor'
          ELSE 'Severe'
        END AS category,
        COUNT(*) as count
      FROM v_aqi_history
      WHERE "AQI" IS NOT NULL
      GROUP BY category;
    `;
    const rows = await dbManager.query(sql, [], true);
    const total = rows.reduce((acc, r) => acc + (r.count || 0), 0);
    return rows.map((r) => ({
      ...r,
      pct: total > 0 ? Number(((r.count / total) * 100).toFixed(1)) : 0,
    }));
  }
}

export const historicalService = new HistoricalService();

