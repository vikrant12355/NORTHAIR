import { Response } from 'express';
import { dbManager } from '../config/database.js';

export class ExportService {
  public async exportMeasurements(res: Response, filters: { state?: string; limit?: number }) {
    let where = '1=1';
    const params: any[] = [];
    if (filters.state && filters.state !== 'ALL') {
      where += ' AND "State" = ?';
      params.push(filters.state);
    }
    const limit = Math.min(Number(filters.limit) || 10000, 50000);

    const sql = `
      SELECT 
        "Station ID", "State", "City", "Station Name", "Date", "Hour",
        "PM2.5 (µg/m³)", "PM10 (µg/m³)", "NO2 (µg/m³)", "SO2 (µg/m³)", "CO (mg/m³)", "Ozone (µg/m³)",
        "AT (°C)", "RH (%)", "WS (m/s)"
      FROM v_air_quality_2025
      WHERE ${where}
      LIMIT ${limit};
    `;

    const rows = await dbManager.query(sql, params, false);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="northair_measurements_2025.csv"');

    if (rows.length === 0) {
      res.send('');
      return;
    }

    const headers = Object.keys(rows[0]);
    res.write(headers.join(',') + '\n');

    for (const row of rows) {
      const line = headers.map((h) => {
        const val = (row as any)[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      }).join(',');
      res.write(line + '\n');
    }
    res.end();
  }

  public async exportStations(res: Response) {
    const sql = `
      SELECT 
        "Station ID", "Station Name", "City", "State",
        "Hours_Recorded_2025", "In_2025_Data", "In_Historical_Data"
      FROM v_station_metadata
      ORDER BY "State", "City", "Station Name";
    `;
    const rows = await dbManager.query(sql, [], true);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="northair_station_registry.csv"');

    if (rows.length === 0) {
      res.send('');
      return;
    }

    const headers = Object.keys(rows[0]);
    res.write(headers.join(',') + '\n');
    for (const row of rows) {
      const line = headers.map((h) => {
        const val = (row as any)[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return String(val);
      }).join(',');
      res.write(line + '\n');
    }
    res.end();
  }
}

export const exportService = new ExportService();

