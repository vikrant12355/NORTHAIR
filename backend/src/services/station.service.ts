import { dbManager } from '../config/database.js';

export class StationService {
  public async getStations(filters: { state?: string; city?: string; search?: string; limit?: number; offset?: number }) {
    const conditions = ['1=1'];
    const params: any[] = [];

    if (filters.state && filters.state !== 'ALL') {
      conditions.push('m."State" = ?');
      params.push(filters.state);
    }
    if (filters.city && filters.city !== 'ALL') {
      conditions.push('m."City" = ?');
      params.push(filters.city);
    }
    if (filters.search) {
      conditions.push('(LOWER(m."Station Name") LIKE ? OR LOWER(m."City") LIKE ? OR LOWER(m."Station ID") LIKE ?)');
      const s = `%${filters.search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    const where = conditions.join(' AND ');
    const limit = filters.limit ? Math.min(Number(filters.limit), 100) : 50;
    const offset = filters.offset ? Number(filters.offset) : 0;

    const sql = `
      SELECT 
        m."Station ID" as stationId,
        m."Station Name" as stationName,
        m."City" as city,
        m."State" as state,
        m.Hours_Recorded_2025 as hoursRecorded,
        ROUND((m.Hours_Recorded_2025::DOUBLE / 8760.0) * 100.0, 1) as dataCapturePct,
        ROUND(AVG(q."PM2.5 (µg/m³)"), 1) as avgPM25,
        ROUND(AVG(q."PM10 (µg/m³)"), 1) as avgPM10,
        ROUND(MAX(q."PM2.5 (µg/m³)"), 1) as maxPM25,
        ROUND(MAX(q."PM10 (µg/m³)"), 1) as maxPM10,
        'Operational' as status
      FROM v_station_metadata m
      LEFT JOIN v_air_quality_2025 q ON m."Station ID" = q."Station ID"
      WHERE ${where}
      GROUP BY m."Station ID", m."Station Name", m."City", m."State", m.Hours_Recorded_2025
      ORDER BY avgPM25 DESC NULLS LAST
      LIMIT ${limit} OFFSET ${offset};
    `;

    const countSql = `
      SELECT COUNT(DISTINCT m."Station ID") as total
      FROM v_station_metadata m
      WHERE ${where};
    `;

    const [rows, countRes] = await Promise.all([
      dbManager.query(sql, params, true),
      dbManager.query(countSql, params, true),
    ]);

    return {
      total: countRes[0]?.total || 0,
      limit,
      offset,
      stations: rows.map((r, i) => ({
        ...r,
        rank: offset + i + 1,
        tier:
          r.avgPM25 <= 30
            ? 'Good'
            : r.avgPM25 <= 60
            ? 'Satisfactory'
            : r.avgPM25 <= 90
            ? 'Moderate'
            : r.avgPM25 <= 120
            ? 'Poor'
            : r.avgPM25 <= 250
            ? 'Very Poor'
            : 'Severe',
      })),
    };
  }

  public async getStationProfile(stationId: string) {
    const metaSql = `
      SELECT * FROM v_station_metadata WHERE "Station ID" = ? LIMIT 1;
    `;
    const meta = await dbManager.query(metaSql, [stationId], true);
    if (!meta || meta.length === 0) return null;

    // Station statistics for 2025
    const statsSql = `
      SELECT 
        COUNT(*) as totalPoints,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as avgPM25,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as medianPM25,
        ROUND(MAX("PM2.5 (µg/m³)"), 1) as maxPM25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as avgPM10,
        ROUND(MEDIAN("PM10 (µg/m³)"), 1) as medianPM10,
        ROUND(MAX("PM10 (µg/m³)"), 1) as maxPM10,
        ROUND(AVG("NO2 (µg/m³)"), 1) as avgNO2,
        ROUND(AVG("SO2 (µg/m³)"), 1) as avgSO2,
        ROUND(AVG("CO (mg/m³)"), 2) as avgCO,
        ROUND(AVG("Ozone (µg/m³)"), 1) as avgOzone,
        ROUND(AVG("NH3 (µg/m³)"), 1) as avgNH3,
        ROUND(AVG("AT (°C)"), 1) as avgTemp,
        ROUND(AVG("RH (%)"), 1) as avgRH,
        ROUND(AVG("WS (m/s)"), 1) as avgWS,
        ROUND(AVG("SR (W/mt2)"), 1) as avgSR,
        SUM(CASE WHEN "PM2.5 (µg/m³)" >= 999.9 THEN 1 ELSE 0 END) as pm25SaturatedHours,
        SUM(CASE WHEN "PM10 (µg/m³)" >= 1000.0 THEN 1 ELSE 0 END) as pm10SaturatedHours,
        SUM(CASE WHEN "CO (mg/m³)" >= 10.0 THEN 1 ELSE 0 END) as coSaturatedHours,
        SUM(CASE WHEN "VWS (m/s)" < 0 THEN 1 ELSE 0 END) as vwsNegativeHours
      FROM v_air_quality_2025
      WHERE "Station ID" = ?;
    `;
    const stats = await dbManager.query(statsSql, [stationId], true);

    return {
      metadata: {
        stationId: meta[0]['Station ID'],
        stationName: meta[0]['Station Name'],
        city: meta[0].City,
        state: meta[0].State,
        hoursRecorded2025: meta[0].Hours_Recorded_2025,
        dataCapturePct: Number(((Number(meta[0].Hours_Recorded_2025) / 8760) * 100).toFixed(1)),
        inHistory: meta[0].In_Historical_Data,
        daysHistory: meta[0].Days_Recorded_History,
      },
      stats: stats[0] || {},
    };
  }

  public async getStationTrends(stationId: string, limitDays = 30) {
    const sql = `
      SELECT 
        "Date" as date,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as pm25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as pm10,
        ROUND(AVG("NO2 (µg/m³)"), 1) as no2,
        ROUND(AVG("Ozone (µg/m³)"), 1) as ozone,
        ROUND(AVG("AT (°C)"), 1) as temperature,
        ROUND(AVG("RH (%)"), 1) as humidity,
        ROUND(AVG("WS (m/s)"), 1) as windSpeed
      FROM v_air_quality_2025
      WHERE "Station ID" = ?
      GROUP BY "Date"
      ORDER BY "Date" DESC
      LIMIT ${limitDays};
    `;
    const rows = await dbManager.query(sql, [stationId], true);
    return rows.reverse();
  }
}

export const stationService = new StationService();

