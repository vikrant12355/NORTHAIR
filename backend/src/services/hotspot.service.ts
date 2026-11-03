import { dbManager } from '../config/database.js';

export class HotspotService {
  public async getHotspotRankings(limit = 20) {
    const sql = `
      SELECT 
        "Station ID" as stationId,
        "Station Name" as stationName,
        "City" as city,
        "State" as state,
        ROUND("PM25_Mean", 1) as pm25Mean,
        ROUND("PM25_P90", 1) as pm25P90,
        ROUND("PM25_Max", 1) as pm25Max,
        ROUND("PM25_Exceed_60_Pct", 1) as exceed60Pct,
        ROUND("PM25_Exceed_120_Pct", 1) as exceed120Pct,
        ROUND("PM25_Exceed_250_Pct", 1) as exceed250Pct,
        ROUND("PM10_Mean", 1) as pm10Mean,
        ROUND("PM10_P90", 1) as pm10P90,
        ROUND("PM10_Max", 1) as pm10Max,
        "Composite_Hotspot_Rank" as compositeRank
      FROM v_hotspot_rankings
      ORDER BY "Composite_Hotspot_Rank" ASC
      LIMIT ${limit};
    `;
    return await dbManager.query(sql, [], true);
  }

  public async getHeatmapMatrix() {
    // Generate monthly PM2.5 average for top hotspot stations
    const sql = `
      SELECT 
        q."Station Name" as stationName,
        q."City" as city,
        q."State" as state,
        q."Month" as month,
        ROUND(AVG(q."PM2.5 (µg/m³)"), 1) as pm25
      FROM v_air_quality_2025 q
      WHERE q."PM2.5 (µg/m³)" IS NOT NULL
      GROUP BY q."Station Name", q."City", q."State", q."Month"
      ORDER BY q."Station Name", q."Month";
    `;
    const rows = await dbManager.query(sql, [], true);

    // Group by station
    const stationsMap = new Map<string, { stationName: string; city: string; state: string; months: Record<number, number> }>();
    for (const r of rows) {
      if (!stationsMap.has(r.stationName)) {
        stationsMap.set(r.stationName, {
          stationName: r.stationName,
          city: r.city,
          state: r.state,
          months: {},
        });
      }
      stationsMap.get(r.stationName)!.months[r.month] = r.pm25;
    }

    return Array.from(stationsMap.values());
  }

  public async getDistribution() {
    const sql = `
      SELECT 
        "State" as state,
        COUNT(CASE WHEN "Composite_Hotspot_Rank" <= 10 THEN 1 END) as top10Count,
        COUNT(CASE WHEN "Composite_Hotspot_Rank" <= 20 THEN 1 END) as top20Count,
        COUNT(*) as totalStations
      FROM v_hotspot_rankings
      GROUP BY "State";
    `;
    return await dbManager.query(sql, [], true);
  }
}

export const hotspotService = new HotspotService();

