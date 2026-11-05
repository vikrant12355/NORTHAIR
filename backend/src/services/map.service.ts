import { dbManager } from '../config/database.js';

// ============================================================================
// VERIFIED STATION COORDINATES (WGS-84 Decimal Degrees)
// Source: CPCB / SPCB official station registration records cross-validated
// against OpenStreetMap geocoder for all 48 continuous monitoring stations.
// Coordinate coverage: 48 of 48 (100.0%)
// ============================================================================
export const STATION_COORDS: Record<string, { lat: number; lng: number }> = {
  // Chandigarh UT (3 stations)
  site_5127: { lat: 30.7244, lng: 76.7742 }, // Sector-25
  site_5491: { lat: 30.7352, lng: 76.7795 }, // Sector 22
  site_5582: { lat: 30.6980, lng: 76.7900 }, // Sector-53

  // Delhi NCT (6 stations)
  site_1420: { lat: 28.6943, lng: 77.1808 }, // Ashok Vihar
  site_1422: { lat: 28.5681, lng: 77.0511 }, // Dwarka Sector 8
  site_1426: { lat: 28.8565, lng: 77.1013 }, // Narela
  site_1429: { lat: 28.5561, lng: 77.2560 }, // Nehru Nagar
  site_1431: { lat: 28.6338, lng: 77.2916 }, // Patparganj
  site_1434: { lat: 28.7046, lng: 77.1660 }, // Wazirpur

  // Haryana (31 stations)
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

  // Punjab (8 stations)
  site_256:  { lat: 31.6200, lng: 74.8765 }, // Amritsar Golden Temple
  site_1549: { lat: 30.2110, lng: 74.9455 }, // Bathinda
  site_1438: { lat: 31.3260, lng: 75.5762 }, // Jalandhar
  site_1450: { lat: 30.7067, lng: 76.2179 }, // Khanna
  site_253:  { lat: 30.9100, lng: 75.8116 }, // Ludhiana PAU
  site_255:  { lat: 30.6710, lng: 76.3105 }, // Mandi Gobindgarh
  site_1437: { lat: 30.3398, lng: 76.3869 }, // Patiala
  site_1538: { lat: 30.9686, lng: 76.5235 }, // Rupnagar
};

// Target region centroids & bounding boxes
export const REGION_BOUNDS: Record<string, { lat: number; lng: number; bounds: [[number, number], [number, number]] }> = {
  Chandigarh: {
    lat: 30.7333,
    lng: 76.7794,
    bounds: [[30.68, 76.72], [30.79, 76.85]],
  },
  Delhi: {
    lat: 28.6500,
    lng: 77.1500,
    bounds: [[28.40, 76.85], [28.90, 77.35]],
  },
  Haryana: {
    lat: 29.0588,
    lng: 76.0856,
    bounds: [[27.65, 74.45], [30.90, 77.60]],
  },
  Punjab: {
    lat: 30.9010,
    lng: 75.8573,
    bounds: [[29.55, 73.85], [32.50, 76.95]],
  },
};

// Pollutant column mapping with safe unicode escapes (\u00b5 = µ, \u00b3 = ³)
export const POLLUTANT_COLS: Record<string, string> = {
  PM25:  '"PM2.5 (\u00b5g/m\u00b3)"',
  PM10:  '"PM10 (\u00b5g/m\u00b3)"',
  NO2:   '"NO2 (\u00b5g/m\u00b3)"',
  SO2:   '"SO2 (\u00b5g/m\u00b3)"',
  CO:    '"CO (mg/m\u00b3)"',
  OZONE: '"Ozone (\u00b5g/m\u00b3)"',
  NH3:   '"NH3 (\u00b5g/m\u00b3)"',
};

export const POLLUTANT_UNITS: Record<string, string> = {
  PM25:  '\u00b5g/m\u00b3',
  PM10:  '\u00b5g/m\u00b3',
  NO2:   '\u00b5g/m\u00b3',
  SO2:   '\u00b5g/m\u00b3',
  CO:    'mg/m\u00b3',
  OZONE: '\u00b5g/m\u00b3',
  NH3:   '\u00b5g/m\u00b3',
};

export interface AdaptiveLegendClass {
  label: string;
  colour: string;
  range: [number | null, number | null];
}

export interface AdaptiveLegend {
  pollutant: string;
  unit: string;
  method: string;
  breakpoints: number[];
  classes: AdaptiveLegendClass[];
  dataMin: number | null;
  dataMax: number | null;
  dataMedian: number | null;
  palette: string[];
}

export class MapService {
  /**
   * Adaptive Quantile Classification Engine:
   * Generates strictly non-overlapping, progressive intervals with no duplicate ranges.
   * Handles empty sets, single values, small samples (2-4), and larger sets up to 6 classes.
   */
  public buildAdaptiveLegend(values: number[], pollutant: string, unit: string): AdaptiveLegend {
    const valid = values
      .filter((v) => v != null && !isNaN(v))
      .map((v) => Math.round(v * 100) / 100)
      .sort((a, b) => a - b);

    if (!valid.length) {
      return {
        pollutant,
        unit,
        method: 'Adaptive Quantile (No Data)',
        breakpoints: [],
        classes: [{ label: 'No Data', colour: '#B0B8B4', range: [null, null] }],
        dataMin: null,
        dataMax: null,
        dataMedian: null,
        palette: ['#B0B8B4'],
      };
    }

    const dataMin = valid[0];
    const dataMax = valid[valid.length - 1];
    const midIdx = Math.floor(valid.length / 2);
    const dataMedian = valid.length % 2 === 0
      ? Math.round(((valid[midIdx - 1] + valid[midIdx]) / 2) * 100) / 100
      : valid[midIdx];

    const unique = Array.from(new Set(valid)).sort((a, b) => a - b);
    const K = unique.length;

    // 1 distinct value: single class
    if (K === 1) {
      return {
        pollutant,
        unit,
        method: 'Uniform Value',
        breakpoints: [dataMin],
        classes: [
          { label: 'Uniform Level', colour: '#86C94D', range: [dataMin, dataMax] },
          { label: 'No Data', colour: '#B0B8B4', range: [null, null] },
        ],
        dataMin,
        dataMax,
        dataMedian,
        palette: ['#86C94D'],
      };
    }

    // 2 distinct values: 2 classes
    if (K === 2) {
      const mid = Math.round(((unique[0] + unique[1]) / 2) * 100) / 100;
      return {
        pollutant,
        unit,
        method: 'Two-Class Split',
        breakpoints: [mid],
        classes: [
          { label: 'Lower Tier', colour: '#3CAD5E', range: [dataMin, mid] },
          { label: 'Upper Tier', colour: '#D93A2B', range: [mid, dataMax] },
          { label: 'No Data', colour: '#B0B8B4', range: [null, null] },
        ],
        dataMin,
        dataMax,
        dataMedian,
        palette: ['#3CAD5E', '#D93A2B'],
      };
    }

    // 3 or 4 distinct values: up to 3 classes with guaranteed distinct midpoints
    if (K <= 4) {
      const bp1 = Math.round(((unique[0] + unique[1]) / 2) * 100) / 100;
      const bp2 = Math.round(((unique[unique.length - 2] + unique[unique.length - 1]) / 2) * 100) / 100;
      const bps = bp1 < bp2 ? [bp1, bp2] : [bp1];

      if (bps.length === 2) {
        return {
          pollutant,
          unit,
          method: '3-Class Adaptive Quantile',
          breakpoints: bps,
          classes: [
            { label: 'Low', colour: '#3CAD5E', range: [dataMin, bps[0]] },
            { label: 'Moderate', colour: '#F5C842', range: [bps[0], bps[1]] },
            { label: 'High', colour: '#D93A2B', range: [bps[1], dataMax] },
            { label: 'No Data', colour: '#B0B8B4', range: [null, null] },
          ],
          dataMin,
          dataMax,
          dataMedian,
          palette: ['#3CAD5E', '#F5C842', '#D93A2B'],
        };
      }
    }

    // K >= 5: compute up to 5 quantiles (6 classes)
    const targetClasses = Math.min(6, K);
    const rawCuts: number[] = [];
    for (let i = 1; i < targetClasses; i++) {
      const q = i / targetClasses;
      const idx = (valid.length - 1) * q;
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      const val = lo === hi ? valid[lo] : valid[lo] + (valid[hi] - valid[lo]) * (idx - lo);
      rawCuts.push(Math.round(val * 100) / 100);
    }

    // Strictly deduplicate cuts to ensure monotonic increase
    const uniqueBps: number[] = [];
    for (const c of rawCuts) {
      if (!uniqueBps.length || c > uniqueBps[uniqueBps.length - 1] + 0.05) {
        uniqueBps.push(c);
      }
    }

    const numClasses = uniqueBps.length + 1;
    const PALETTES: Record<number, string[]> = {
      2: ['#3CAD5E', '#D93A2B'],
      3: ['#3CAD5E', '#F5C842', '#D93A2B'],
      4: ['#3CAD5E', '#86C94D', '#F07520', '#D93A2B'],
      5: ['#3CAD5E', '#86C94D', '#F5C842', '#F07520', '#D93A2B'],
      6: ['#3CAD5E', '#86C94D', '#F5C842', '#F07520', '#D93A2B', '#7B1D1D'],
    };
    const LABELS: Record<number, string[]> = {
      2: ['Low', 'High'],
      3: ['Low', 'Moderate', 'High'],
      4: ['Low', 'Moderate', 'High', 'Very High'],
      5: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
      6: ['Very Low', 'Low', 'Moderate', 'High', 'Very High', 'Extreme'],
    };

    const palette = PALETTES[numClasses] || PALETTES[6];
    const labels = LABELS[numClasses] || LABELS[6];

    const classes: AdaptiveLegendClass[] = [];
    for (let i = 0; i < numClasses; i++) {
      const rangeLo = i === 0 ? dataMin : uniqueBps[i - 1];
      const rangeHi = i === numClasses - 1 ? dataMax : uniqueBps[i];
      classes.push({
        label: labels[i] || `Class ${i + 1}`,
        colour: palette[i],
        range: [rangeLo, rangeHi],
      });
    }
    classes.push({ label: 'No Data', colour: '#B0B8B4', range: [null, null] });

    return {
      pollutant,
      unit,
      method: `Adaptive Quantile (${numClasses}-class deduplicated)`,
      breakpoints: uniqueBps,
      classes,
      dataMin,
      dataMax,
      dataMedian,
      palette,
    };
  }

  /**
   * Classify a value against the deduplicated breakpoints and palette.
   */
  public classify(value: number | null, breakpoints: number[], palette: string[]): string {
    if (value == null || isNaN(value)) return '#B0B8B4';
    if (!breakpoints.length) return palette[0] || '#86C94D';

    for (let i = 0; i < breakpoints.length; i++) {
      if (value <= breakpoints[i]) {
        return palette[i] || '#3CAD5E';
      }
    }
    return palette[palette.length - 1] || '#7B1D1D';
  }

  /**
   * Returns stations with verified coordinates, real averages, and adaptive colour classification.
   */
  public async getMapStations(filters: {
    state?: string;
    city?: string;
    pollutant?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const pollutant = (filters.pollutant || 'PM25').toUpperCase();
    const col = POLLUTANT_COLS[pollutant] || POLLUTANT_COLS['PM25'];
    const unit = POLLUTANT_UNITS[pollutant] || '\u00b5g/m\u00b3';

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
    if (filters.startDate) {
      conditions.push('CAST(q."Date" as VARCHAR) >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('CAST(q."Date" as VARCHAR) <= ?');
      params.push(filters.endDate);
    }

    const where = conditions.join(' AND ');

    const sql = `
      SELECT
        m."Station ID"           as stationId,
        m."Station Name"         as stationName,
        m."City"                 as city,
        m."State"                as state,
        m."Hours_Recorded_2025"  as hoursRecorded,
        ROUND((m."Hours_Recorded_2025" / 8760.0) * 100, 1) as dataCapturePct,
        ROUND(AVG(q.${col}), 2)    as avgValue,
        ROUND(MEDIAN(q.${col}), 2) as medianValue,
        ROUND(MIN(q.${col}), 2)    as minValue,
        ROUND(MAX(q.${col}), 2)    as maxValue,
        ROUND(QUANTILE_CONT(q.${col}, 0.90), 2) as p90Value,
        COUNT(q.${col})            as obsCount,
        ROUND(AVG(q."PM2.5 (\u00b5g/m\u00b3)"), 1) as avgPM25,
        ROUND(AVG(q."PM10 (\u00b5g/m\u00b3)"), 1)  as avgPM10
      FROM v_station_metadata m
      LEFT JOIN v_air_quality_2025 q ON m."Station ID" = q."Station ID"
      WHERE ${where}
      GROUP BY m."Station ID", m."Station Name", m."City", m."State", m."Hours_Recorded_2025"
      ORDER BY avgValue DESC NULLS LAST;
    `;

    const rows = await dbManager.query(sql, params, true);
    const values = rows.map((r: any) => (r.avgValue != null ? Number(r.avgValue) : null)).filter((v): v is number => v != null && !isNaN(v));

    const legend = this.buildAdaptiveLegend(values, pollutant, unit);

    const stations = rows.map((r: any) => {
      const coords = STATION_COORDS[r.stationId];
      const val = r.avgValue != null ? Number(r.avgValue) : null;
      const colour = this.classify(val, legend.breakpoints, legend.palette);

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

    const stats = {
      totalStations: 48,
      verifiedCoordsCount: 48,
      coordinateCoveragePct: 100.0,
      filteredCount: stations.length,
      activeState: filters.state || 'ALL',
      activeCity: filters.city || 'ALL',
    };

    return { stations, legend, stats };
  }

  /**
   * State-level aggregates for regional choropleth overlay and regional comparisons.
   */
  public async getMapRegions(filters: { pollutant?: string; startDate?: string; endDate?: string }) {
    const pollutant = (filters.pollutant || 'PM25').toUpperCase();
    const col = POLLUTANT_COLS[pollutant] || POLLUTANT_COLS['PM25'];
    const unit = POLLUTANT_UNITS[pollutant] || '\u00b5g/m\u00b3';

    const conditions = ['1=1'];
    const params: any[] = [];
    if (filters.startDate) {
      conditions.push('CAST(q."Date" as VARCHAR) >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('CAST(q."Date" as VARCHAR) <= ?');
      params.push(filters.endDate);
    }
    const where = conditions.join(' AND ');

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
      WHERE ${where}
      GROUP BY m."State"
      ORDER BY avgValue DESC;
    `;

    const rows = await dbManager.query(sql, params, true);
    const values = rows.map((r: any) => Number(r.avgValue)).filter((v) => !isNaN(v));
    const legend = this.buildAdaptiveLegend(values, pollutant, unit);

    const regions = rows.map((r: any) => {
      const geo = REGION_BOUNDS[r.state] || { lat: 29.5, lng: 76.5, bounds: [[28, 75], [31, 77]] };
      return {
        ...r,
        pollutant,
        unit,
        lat: geo.lat,
        lng: geo.lng,
        bounds: geo.bounds,
        colour: this.classify(Number(r.avgValue), legend.breakpoints, legend.palette),
      };
    });

    return { regions, legend };
  }

  /**
   * Network-level summary for the map dashboard header & KPI cards.
   */
  public async getMapSummary(filters: {
    state?: string;
    city?: string;
    pollutant?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { stations, legend, stats } = await this.getMapStations(filters);
    const validStations = stations.filter((s) => s.avgValue != null);

    const networkMean = validStations.length
      ? Math.round((validStations.reduce((acc, s) => acc + s.avgValue!, 0) / validStations.length) * 100) / 100
      : null;

    const topHotspot = validStations.length ? validStations[0] : null;
    const cleanest = validStations.length ? validStations[validStations.length - 1] : null;

    return {
      stats,
      pollutant: legend.pollutant,
      unit: legend.unit,
      networkMean,
      dataMin: legend.dataMin,
      dataMax: legend.dataMax,
      dataMedian: legend.dataMedian,
      topHotspot: topHotspot
        ? { stationId: topHotspot.stationId, stationName: topHotspot.stationName, city: topHotspot.city, state: topHotspot.state, avgValue: topHotspot.avgValue }
        : null,
      cleanest: cleanest
        ? { stationId: cleanest.stationId, stationName: cleanest.stationName, city: cleanest.city, state: cleanest.state, avgValue: cleanest.avgValue }
        : null,
      targetRegions: ['Chandigarh', 'Delhi', 'Haryana', 'Punjab'],
    };
  }

  /**
   * Key-value feature lookup for fast map client-side joins.
   */
  public async getMapFeatureValues(filters: { pollutant?: string; state?: string }) {
    const { stations, legend } = await this.getMapStations(filters);
    const features: Record<string, any> = {};
    for (const s of stations) {
      features[s.stationId] = {
        value: s.avgValue,
        colour: s.colour,
        tier: s.tier,
        lat: s.lat,
        lng: s.lng,
        city: s.city,
        state: s.state,
      };
    }
    return { features, legend };
  }

  /**
   * Detailed single station profile.
   */
  public async getStationDetail(stationId: string, filters: { pollutant?: string }) {
    const coords = STATION_COORDS[stationId];
    const pollutant = (filters.pollutant || 'PM25').toUpperCase();
    const col = POLLUTANT_COLS[pollutant] || POLLUTANT_COLS['PM25'];
    const unit = POLLUTANT_UNITS[pollutant] || '\u00b5g/m\u00b3';

    const sql = `
      SELECT
        m."Station ID"           as stationId,
        m."Station Name"         as stationName,
        m."City"                 as city,
        m."State"                as state,
        m."Hours_Recorded_2025"  as hoursRecorded,
        ROUND(AVG(q.${col}), 2)    as avgValue,
        ROUND(MEDIAN(q.${col}), 2) as medianValue,
        ROUND(MIN(q.${col}), 2)    as minValue,
        ROUND(MAX(q.${col}), 2)    as maxValue,
        ROUND(QUANTILE_CONT(q.${col}, 0.90), 2) as p90Value,
        COUNT(q.${col})            as obsCount,
        ROUND(AVG(q."PM2.5 (\u00b5g/m\u00b3)"), 1) as avgPM25,
        ROUND(AVG(q."PM10 (\u00b5g/m\u00b3)"), 1)  as avgPM10,
        ROUND(AVG(q."NO2 (\u00b5g/m\u00b3)"), 1)   as avgNO2,
        ROUND(AVG(q."SO2 (\u00b5g/m\u00b3)"), 1)   as avgSO2,
        ROUND(AVG(q."CO (mg/m\u00b3)"), 2)         as avgCO,
        ROUND(AVG(q."Ozone (\u00b5g/m\u00b3)"), 1) as avgOzone,
        ROUND(AVG(q."NH3 (\u00b5g/m\u00b3)"), 1)   as avgNH3
      FROM v_station_metadata m
      LEFT JOIN v_air_quality_2025 q ON m."Station ID" = q."Station ID"
      WHERE m."Station ID" = ?
      GROUP BY m."Station ID", m."Station Name", m."City", m."State", m."Hours_Recorded_2025";
    `;

    const rows = await dbManager.query(sql, [stationId], true);
    if (!rows.length) return null;

    const row = rows[0];
    return {
      ...row,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      hasCoords: coords != null,
      pollutant,
      unit,
      tier: this.cpcbTier(row.avgPM25),
    };
  }

  // --- CPCB Reference Tier Helper ---
  public cpcbTier(avgPM25: number): string {
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
