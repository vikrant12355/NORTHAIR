import { dbManager } from '../config/database.js';

// ─────────────────────────────────────────────────────────────────────────────
// VERIFIED STATION COORDINATES
// Source: CPCB / SPCB official station registration records cross-validated
// against OpenStreetMap geocoder for 48 continuous monitoring stations in
// Chandigarh, Punjab, Haryana, and Delhi NCT (North India telemetry network).
// All coordinates are WGS-84 decimal degrees (NAD83 compatible).
// ─────────────────────────────────────────────────────────────────────────────
const STATION_COORDS: Record<string, { lat: number; lng: number }> = {
  // Chandigarh UT
  site_5127: { lat: 30.7244, lng: 76.7742 }, // Sector-25
  site_5491: { lat: 30.7352, lng: 76.7795 }, // Sector 22
  site_5582: { lat: 30.6980, lng: 76.7900 }, // Sector-53

  // Delhi NCT
  site_1420: { lat: 28.6943, lng: 77.1808 }, // Ashok Vihar
  site_1422: { lat: 28.5681, lng: 77.0511 }, // Dwarka Sector 8
  site_1426: { lat: 28.8565, lng: 77.1013 }, // Narela
  site_1429: { lat: 28.5561, lng: 77.2560 }, // Nehru Nagar
  site_1431: { lat: 28.6338, lng: 77.2916 }, // Patparganj
  site_1434: { lat: 28.7046, lng: 77.1660 }, // Wazirpur

  // Haryana
  site_5052: { lat: 30.3783, lng: 76.7762 }, // Ambala
  site_5045: { lat: 28.6986, lng: 76.9358 }, // Bahadurgarh
  site_5060: { lat: 28.3382, lng: 77.3230 }, // Ballabgarh
  site_5047: { lat: 28.7893, lng: 76.1319 }, // Bhiwani
  site_5339: { lat: 28.5926, lng: 76.2691 }, // Charkhi Dadri
  site_5044: { lat: 28.2113, lng: 76.9601 }, // Dharuhera
  site_263:  { lat: 28.4089, lng: 77.3178 }, // Faridabad Sector-16A
  site_5340: { lat: 28.4104, lng: 77.2990 }, // Faridabad NIT
  site_5341: { lat: 28.4040, lng: 77.3123 }, // Faridabad Sector 30
  site_5342: { lat: 28.4360, lng: 77.3250 }, // Faridabad Sector 11
  site_5054: { lat: 29.5214, lng: 75.4594 }, // Fatehabad
  site_146:  { lat: 28.4595, lng: 77.0266 }, // Gurugram Vikas Sadan
  site_5025: { lat: 28.4257, lng: 77.1536 }, // Gwal Pahari
  site_5344: { lat: 28.3677, lng: 77.0516 }, // Teri Gram
  site_5345: { lat: 28.4484, lng: 77.0626 }, // Sector-51 Gurugram
  site_5057: { lat: 29.1492, lng: 75.7217 }, // Hisar
  site_5056: { lat: 29.3159, lng: 76.3202 }, // Jind
  site_5072: { lat: 29.8014, lng: 76.3998 }, // Kaithal
  site_5049: { lat: 29.6857, lng: 76.9905 }, // Karnal
  site_5043: { lat: 29.9695, lng: 76.8783 }, // Kurukshetra
  site_5055: { lat: 28.1053, lng: 77.0027 }, // Mandikhera (Nuh)
  site_5039: { lat: 28.3570, lng: 76.9358 }, // Manesar
  site_5053: { lat: 28.0442, lng: 76.1079 }, // Narnaul
  site_5050: { lat: 28.1515, lng: 77.3233 }, // Palwal
  site_6011: { lat: 28.3760, lng: 76.9830 }, // Panchgaon
  site_161:  { lat: 30.6943, lng: 76.8605 }, // Panchkula
  site_5048: { lat: 29.3909, lng: 76.9636 }, // Panipat
  site_147:  { lat: 28.8955, lng: 76.5826 }, // Rohtak
  site_5051: { lat: 29.5351, lng: 75.0269 }, // Sirsa
  site_5041: { lat: 28.9975, lng: 77.1026 }, // Sonipat (Murthal)
  site_5046: { lat: 30.1250, lng: 77.2823 }, // Yamuna Nagar

  // Punjab
  site_256:  { lat: 31.6200, lng: 74.8765 }, // Amritsar Golden Temple
  site_1549: { lat: 30.2110, lng: 74.9455 }, // Bathinda
  site_1438: { lat: 31.3260, lng: 75.5762 }, // Jalandhar
  site_1450: { lat: 30.7067, lng: 76.2179 }, // Khanna
  site_253:  { lat: 30.9100, lng: 75.8116 }, // Ludhiana PAU
  site_255:  { lat: 30.6710, lng: 76.3105 }, // Mandi Gobindgarh
  site_1437: { lat: 30.3398, lng: 76.3869 }, // Patiala
  site_1538: { lat: 30.9686, lng: 76.5235 }, // Rupnagar
};

// ─────────────────────────────────────────────────────────────────────────────
// POLLUTANT column mapping to DuckDB column names
// ─────────────────────────────────────────────────────────────────────────────
export const POLLUTANT_COLS: Record<string, string> = {
  PM25:  '"PM2.5 (µg/m³)"',
  PM10:  '"PM10 (µg/m³)"',
  NO2:   '"NO2 (µg/m³)"',
  SO2:   '"SO2 (µg/m³)"',
  CO:    '"CO (mg/m³)"',
  OZONE: '"Ozone (µg/m³)"',
  NH3:   '"NH3 (µg/m³)"',
};

export const POLLUTANT_UNITS: Record<string, string> = {
  PM25:  'µg/m³',
  PM10:  'µg/m³',
  NO2:   'µg/m³',
  SO2:   'µg/m³',
  CO:    'mg/m³',
  OZONE: 'µg/m³',
  NH3:   'µg/m³',
};

export class MapService {
  /**
   * Returns all 48 stations with verified lat/lng, real pollutant averages
   * for the requested pollutant, and data-driven colour classification.
   */
  public async getMapStations(filters: {
    state?: string;
    city?: string;
    pollutant?: string;
  }) {
    const pollutant = (filters.pollutant || 'PM25').toUpperCase();
    const col = POLLUTANT_COLS[pollutant] || POLLUTANT_COLS['PM25'];
    const unit = POLLUTANT_UNITS[pollutant] || 'µg/m³';

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

    const where = conditions.join(' AND ');

    const sql = `
      SELECT
        m."Station ID"       as stationId,
        m."Station Name"     as stationName,
        m."City"             as city,
        m."State"            as state,
        m.Hours_Recorded_2025 as hoursRecorded,
        ROUND((m.Hours_Recorded_2025::DOUBLE / 8760.0) * 100.0, 1) as dataCapturePct,
        ROUND(AVG(q.${col}), 2)   as avgValue,
        ROUND(MEDIAN(q.${col}), 2) as medianValue,
        ROUND(MIN(q.${col}), 2)   as minValue,
        ROUND(MAX(q.${col}), 2)   as maxValue,
        COUNT(q.${col})           as obsCount,
        ROUND(AVG(q."PM2.5 (µg/m³)"), 1) as avgPM25,
        ROUND(AVG(q."PM10 (µg/m³)"), 1)  as avgPM10
      FROM v_station_metadata m
      LEFT JOIN v_air_quality_2025 q ON m."Station ID" = q."Station ID"
      WHERE ${where}
      GROUP BY m."Station ID", m."Station Name", m."City", m."State", m.Hours_Recorded_2025
      ORDER BY avgValue DESC NULLS LAST;
    `;

    const rows = await dbManager.query(sql, params, true);

    // Compute quantile breakpoints from actual data for colour classification
    const values = rows.map((r: any) => Number(r.avgValue)).filter((v) => v != null && !isNaN(v));
    values.sort((a, b) => a - b);

    const breakpoints = this.quantileBreakpoints(values, 6);

    // Attach coordinates and colour classification
    const stations = rows.map((r: any) => {
      const coords = STATION_COORDS[r.stationId];
      const val = Number(r.avgValue);
      const colour = this.classify(val, breakpoints);

      return {
        ...r,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        hasCoords: coords != null,
        pollutant,
        unit,
        colour,
        tier: this.cpcbTier(r.avgPM25),
      };
    });

    // Network-level legend metadata
    const legend = {
      pollutant,
      unit,
      method: 'Quantile (6-class) — equal-count intervals from 2025 annual mean measurements',
      breakpoints,
      classes: [
        { label: 'Very Low',  colour: '#3CAD5E', range: [breakpoints[0], breakpoints[1]] },
        { label: 'Low',       colour: '#86C94D', range: [breakpoints[1], breakpoints[2]] },
        { label: 'Moderate',  colour: '#F5C842', range: [breakpoints[2], breakpoints[3]] },
        { label: 'High',      colour: '#F07520', range: [breakpoints[3], breakpoints[4]] },
        { label: 'Very High', colour: '#D93A2B', range: [breakpoints[4], breakpoints[5]] },
        { label: 'Extreme',   colour: '#7B1D1D', range: [breakpoints[5], null]           },
        { label: 'No Data',   colour: '#B0B8B4', range: [null, null]                     },
      ],
      dataMin: values[0] ?? null,
      dataMax: values[values.length - 1] ?? null,
      dataMedian: values.length ? values[Math.floor(values.length / 2)] : null,
    };

    return { stations, legend };
  }

  /**
   * State-level aggregates for regional choropleth overlay.
   */
  public async getMapRegions(filters: { pollutant?: string }) {
    const pollutant = (filters.pollutant || 'PM25').toUpperCase();
    const col = POLLUTANT_COLS[pollutant] || POLLUTANT_COLS['PM25'];
    const unit = POLLUTANT_UNITS[pollutant] || 'µg/m³';

    const sql = `
      SELECT
        m."State"             as state,
        COUNT(DISTINCT m."Station ID") as stationCount,
        ROUND(AVG(q.${col}), 2)    as avgValue,
        ROUND(MEDIAN(q.${col}), 2) as medianValue,
        ROUND(MIN(q.${col}), 2)    as minValue,
        ROUND(MAX(q.${col}), 2)    as maxValue,
        COUNT(q.${col})            as obsCount
      FROM v_station_metadata m
      LEFT JOIN v_air_quality_2025 q ON m."Station ID" = q."Station ID"
      GROUP BY m."State"
      ORDER BY avgValue DESC;
    `;

    const rows = await dbManager.query(sql, [], true);
    const values = rows.map((r: any) => Number(r.avgValue)).filter((v) => !isNaN(v));
    values.sort((a, b) => a - b);
    const breakpoints = this.quantileBreakpoints(values, 6);

    const regions = rows.map((r: any) => ({
      ...r,
      pollutant,
      unit,
      colour: this.classify(Number(r.avgValue), breakpoints),
    }));

    return { regions, breakpoints, pollutant, unit };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private quantileBreakpoints(sortedValues: number[], classes: number): number[] {
    if (!sortedValues.length) return Array(classes - 1).fill(0);
    const n = sortedValues.length;
    const bps: number[] = [];
    for (let i = 1; i < classes; i++) {
      const idx = Math.floor((i / classes) * n);
      bps.push(sortedValues[Math.min(idx, n - 1)]);
    }
    return bps;
  }

  private classify(value: number, breakpoints: number[]): string {
    if (value == null || isNaN(value)) return '#B0B8B4';
    if (value <= breakpoints[0]) return '#3CAD5E';
    if (value <= breakpoints[1]) return '#86C94D';
    if (value <= breakpoints[2]) return '#F5C842';
    if (value <= breakpoints[3]) return '#F07520';
    if (value <= breakpoints[4]) return '#D93A2B';
    return '#7B1D1D';
  }

  private cpcbTier(avgPM25: number): string {
    if (avgPM25 == null || isNaN(avgPM25)) return 'Unknown';
    if (avgPM25 <= 30)  return 'Good';
    if (avgPM25 <= 60)  return 'Satisfactory';
    if (avgPM25 <= 90)  return 'Moderate';
    if (avgPM25 <= 120) return 'Poor';
    if (avgPM25 <= 250) return 'Very Poor';
    return 'Severe';
  }
}

export const mapService = new MapService();

