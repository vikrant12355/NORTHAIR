import path from 'path';
import fs from 'fs';
import duckdb from 'duckdb';
import { ENV } from './env.js';

class DatabaseManager {
  private db: duckdb.Database;
  private connection: duckdb.Connection;
  private isInitialized = false;
  private cache = new Map<string, { timestamp: number; data: any }>();

  constructor() {
    this.db = new duckdb.Database(':memory:');
    this.connection = this.db.connect();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const dataDir = ENV.DATA_DIR;
    const p2025 = path.join(dataDir, 'processed', 'air_quality_2025_ist.parquet').replace(/\\/g, '/');
    const pCalc = path.join(dataDir, 'processed', 'analytics', 'calculated_aqi.parquet').replace(/\\/g, '/');
    const pHist = path.join(dataDir, 'processed', 'aqi_history_long.parquet').replace(/\\/g, '/');
    const pMeta = path.join(dataDir, 'processed', 'station_metadata.parquet').replace(/\\/g, '/');
    const pHotspots = path.join(dataDir, 'processed', 'analytics', 'hotspot_rankings.parquet').replace(/\\/g, '/');
    const pDiurnal = path.join(dataDir, 'processed', 'analytics', 'diurnal_profiles.parquet').replace(/\\/g, '/');
    const pMonthly = path.join(dataDir, 'processed', 'analytics', 'monthly_pollution.parquet').replace(/\\/g, '/');
    const pState = path.join(dataDir, 'processed', 'analytics', 'state_comparison.parquet').replace(/\\/g, '/');
    const pCity = path.join(dataDir, 'processed', 'analytics', 'city_comparison.parquet').replace(/\\/g, '/');

    // Create database views for fast and clean SQL
    if (fs.existsSync(p2025)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_air_quality_2025 AS SELECT * FROM read_parquet('${p2025}');`);
    }
    if (fs.existsSync(pCalc)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_calculated_aqi AS SELECT * FROM read_parquet('${pCalc}');`);
    }
    if (fs.existsSync(pHist)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_aqi_history AS SELECT * FROM read_parquet('${pHist}');`);
    }
    if (fs.existsSync(pMeta)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_station_metadata AS SELECT * FROM read_parquet('${pMeta}');`);
    }
    if (fs.existsSync(pHotspots)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_hotspot_rankings AS SELECT * FROM read_parquet('${pHotspots}');`);
    }
    if (fs.existsSync(pDiurnal)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_diurnal_profiles AS SELECT * FROM read_parquet('${pDiurnal}');`);
    }
    if (fs.existsSync(pMonthly)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_monthly_pollution AS SELECT * FROM read_parquet('${pMonthly}');`);
    }
    if (fs.existsSync(pState)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_state_comparison AS SELECT * FROM read_parquet('${pState}');`);
    }
    if (fs.existsSync(pCity)) {
      await this.rawExec(`CREATE OR REPLACE VIEW v_city_comparison AS SELECT * FROM read_parquet('${pCity}');`);
    }

    this.isInitialized = true;
  }

  private rawExec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public async query<T = any>(sql: string, params: any[] = [], useCache = false): Promise<T[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cacheKey = useCache ? `${sql}::${JSON.stringify(params)}` : '';
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < ENV.CACHE_TTL_MS) {
        return Promise.resolve(cached.data);
      }
    }

    return new Promise((resolve, reject) => {
      // If params provided, use prepare statement
      if (params && params.length > 0) {
        const stmt = this.connection.prepare(sql, (prepErr) => {
          if (prepErr) return reject(prepErr);
          stmt.all(...params, (err, rows) => {
            stmt.finalize();
            if (err) return reject(err);
            const sanitized = this.sanitizeBigInt(rows);
            if (useCache) {
              this.cache.set(cacheKey, { timestamp: Date.now(), data: sanitized });
            }
            resolve(sanitized);
          });
        });
      } else {
        this.connection.all(sql, (err, rows) => {
          if (err) return reject(err);
          const sanitized = this.sanitizeBigInt(rows);
          if (useCache) {
            this.cache.set(cacheKey, { timestamp: Date.now(), data: sanitized });
          }
          resolve(sanitized);
        });
      }
    });
  }

  private sanitizeBigInt(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data === 'bigint') {
      return Number(data);
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeBigInt(item));
    }
    if (typeof data === 'object') {
      const res: Record<string, any> = {};
      for (const key of Object.keys(data)) {
        res[key] = this.sanitizeBigInt(data[key]);
      }
      return res;
    }
    return data;
  }

  public getRawConnection(): duckdb.Connection {
    return this.connection;
  }
}

export const dbManager = new DatabaseManager();

