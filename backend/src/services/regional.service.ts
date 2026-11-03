import { dbManager } from '../config/database.js';

// Canonical geographical coordinates for North India CAAQMS stations
const STATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Chandigarh
  site_5127: { lat: 30.7512, lng: 76.7689 }, // Sector-25
  site_5491: { lat: 30.7333, lng: 76.7794 }, // Sector 22
  site_5582: { lat: 30.7188, lng: 76.7412 }, // Sector-53
  // Delhi
  site_1420: { lat: 28.6946, lng: 77.1744 }, // Ashok Vihar
  site_1422: { lat: 28.5710, lng: 77.0673 }, // Dwarka-Sector 8
  site_1426: { lat: 28.7325, lng: 77.1706 }, // Jahangirpuri
  site_1429: { lat: 28.5632, lng: 77.1869 }, // RK Puram
  site_1431: { lat: 28.5308, lng: 77.1352 }, // Vasant Kunj
  site_1434: { lat: 28.6476, lng: 77.3158 }, // Anand Vihar
  // Punjab
  site_1437: { lat: 30.3400, lng: 76.3800 }, // Model Town, Patiala
  site_1438: { lat: 31.3260, lng: 75.5762 }, // Civil Line, Jalandhar
  site_1450: { lat: 30.7071, lng: 76.2163 }, // Kalal Majra, Khanna
  site_1538: { lat: 31.1444, lng: 76.5342 }, // Ratanpura, Rupnagar
  site_1549: { lat: 30.2110, lng: 74.9455 }, // Hardev Nagar, Bathinda
  site_253: { lat: 30.9010, lng: 75.8080 }, // PAU Ludhiana
  site_255: { lat: 30.6658, lng: 76.3056 }, // RIMT Mandi Gobindgarh
  site_256: { lat: 31.6200, lng: 74.8765 }, // Golden Temple Amritsar
  // Haryana key clusters
  site_146: { lat: 28.4595, lng: 77.0266 }, // Vikas Sadan Gurugram
  site_147: { lat: 28.8955, lng: 76.6066 }, // MD University Rohtak
  site_161: { lat: 30.6942, lng: 76.8606 }, // Sector-6 Panchkula
  site_263: { lat: 28.4089, lng: 77.3178 }, // Sector 16A Faridabad
  site_5025: { lat: 28.4230, lng: 77.0450 }, // Sector-51 Gurugram
  site_5039: { lat: 28.3610, lng: 76.9380 }, // IMT Manesar
  site_5041: { lat: 29.0270, lng: 77.0690 }, // Murthal Sonipat
  site_5043: { lat: 29.9695, lng: 76.8783 }, // Sector-7 Kurukshetra
  site_5044: { lat: 28.2056, lng: 76.7944 }, // Dharuhera
  site_5045: { lat: 28.6925, lng: 76.9230 }, // Bahadurgarh
  site_5046: { lat: 30.1290, lng: 77.2674 }, // Gobind Pura Yamuna Nagar
  site_5047: { lat: 28.7830, lng: 76.1390 }, // Bhiwani
  site_5048: { lat: 29.3909, lng: 76.9635 }, // Sector-18 Panipat
  site_5049: { lat: 29.6857, lng: 76.9905 }, // Sector-12 Karnal
  site_5050: { lat: 28.1447, lng: 77.3260 }, // Palwal
  site_5051: { lat: 29.5349, lng: 75.0298 }, // Sirsa
  site_5052: { lat: 30.3782, lng: 76.7767 }, // Patti Mehar Ambala
  site_5053: { lat: 28.0440, lng: 76.1080 }, // Narnaul
  site_5054: { lat: 29.5160, lng: 75.4530 }, // Fatehabad
  site_5055: { lat: 27.9150, lng: 77.0420 }, // Mandikhera Nuh
  site_5056: { lat: 29.3160, lng: 76.3150 }, // Jind
  site_5057: { lat: 29.1492, lng: 75.7217 }, // Hisar
  site_5060: { lat: 28.3390, lng: 77.3290 }, // Ballabgarh
  site_5072: { lat: 29.8015, lng: 76.3996 }, // Kaithal
  site_5339: { lat: 28.5921, lng: 76.2653 }, // Charkhi Dadri
  site_5340: { lat: 28.3840, lng: 77.3060 }, // Sector 11 Faridabad
  site_5341: { lat: 28.4210, lng: 77.3210 }, // Sector 30 Faridabad
  site_5342: { lat: 28.4350, lng: 77.3110 }, // New Industrial Town Faridabad
  site_5344: { lat: 28.4230, lng: 77.1470 }, // Teri Gram Gurugram
  site_5345: { lat: 28.4730, lng: 77.0170 }, // NISE Gwal Pahari Gurugram
  site_6011: { lat: 28.3150, lng: 76.8830 }, // Panchgaon
};

export class RegionalService {
  public async getStates() {
    const sql = `
      SELECT 
        "State" as state,
        COUNT(DISTINCT "Station ID") as stationCount,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as meanPM25,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as medianPM25,
        ROUND(MAX("PM2.5 (µg/m³)"), 1) as maxPM25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as meanPM10,
        ROUND(AVG(CASE WHEN "PM2.5 (µg/m³)" > 60 THEN 1.0 ELSE 0.0 END) * 100, 1) as exceedancePct
      FROM v_air_quality_2025
      GROUP BY "State"
      ORDER BY meanPM25 DESC;
    `;
    const states = await dbManager.query(sql, [], true);
    return states.map((s) => ({
      ...s,
      cpcbTier: s.meanPM25 <= 30 ? 'Good' : s.meanPM25 <= 60 ? 'Satisfactory' : s.meanPM25 <= 90 ? 'Moderate' : s.meanPM25 <= 120 ? 'Poor' : 'Very Poor',
    }));
  }

  public async getCities() {
    const sql = `
      SELECT 
        "City" as city,
        "State" as state,
        COUNT(DISTINCT "Station ID") as stationCount,
        ROUND(AVG("PM2.5 (µg/m³)"), 1) as meanPM25,
        ROUND(MEDIAN("PM2.5 (µg/m³)"), 1) as medianPM25,
        ROUND(MAX("PM2.5 (µg/m³)"), 1) as maxPM25,
        ROUND(AVG("PM10 (µg/m³)"), 1) as meanPM10
      FROM v_air_quality_2025
      GROUP BY "City", "State"
      ORDER BY meanPM25 DESC;
    `;
    return await dbManager.query(sql, [], true);
  }

  public async getRegionalMesh() {
    const sql = `
      SELECT 
        m."Station ID" as stationId,
        m."Station Name" as stationName,
        m."City" as city,
        m."State" as state,
        ROUND(AVG(q."PM2.5 (µg/m³)"), 1) as pm25,
        ROUND(AVG(q."PM10 (µg/m³)"), 1) as pm10,
        ROUND(AVG(q."WS (m/s)"), 1) as windSpeed,
        ROUND(AVG(q."RH (%)"), 1) as humidity
      FROM v_station_metadata m
      LEFT JOIN v_air_quality_2025 q ON m."Station ID" = q."Station ID"
      GROUP BY m."Station ID", m."Station Name", m."City", m."State"
      ORDER BY pm25 DESC;
    `;
    const stations = await dbManager.query(sql, [], true);
    return stations.map((stn) => {
      const coords = STATION_COORDINATES[stn.stationId] || { lat: 29.5, lng: 76.5 };
      return {
        ...stn,
        lat: coords.lat,
        lng: coords.lng,
        category:
          stn.pm25 <= 30 ? 'Good' : stn.pm25 <= 60 ? 'Satisfactory' : stn.pm25 <= 90 ? 'Moderate' : stn.pm25 <= 120 ? 'Poor' : stn.pm25 <= 250 ? 'Very Poor' : 'Severe',
      };
    });
  }
}

export const regionalService = new RegionalService();

