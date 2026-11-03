import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../dist/app.js';
import { dbManager } from '../dist/config/database.js';
import type { Server } from 'http';

describe('NorthAir Intelligence API Integration Tests', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    try {
      await dbManager.initialize();
      const app = createApp();
      await new Promise<void>((resolve, reject) => {
        server = app.listen(0, () => {
          const address = server.address();
          if (typeof address === 'object' && address !== null) {
            baseUrl = `http://localhost:${address.port}`;
          }
          resolve();
        });
        server.on('error', reject);
      });
    } catch (err) {
      console.error('Test before error:', err);
      throw err;
    }
  });

  it('GET /api/health should return status healthy and DuckDB information', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'healthy');
    assert.ok(body.data.uptime >= 0);
  });

  it('GET /api/meta should return project metadata and dataset dimensions', async () => {
    const res = await fetch(`${baseUrl}/api/meta`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.project, 'NorthAir Intelligence');
    assert.strictEqual(body.data.event, 'VIZ-A-THON 2026');
  });

  it('GET /api/filters should return distinct states, cities, stations and pollutants', async () => {
    const res = await fetch(`${baseUrl}/api/filters`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.states.length >= 4);
    assert.strictEqual(body.data.stations.length, 48);
    assert.ok(body.data.pollutants.length >= 8);
  });

  it('GET /api/overview should return calculated regional metrics from 2025 parquet', async () => {
    const res = await fetch(`${baseUrl}/api/overview`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.stationsOnline, 48);
    assert.strictEqual(body.data.totalTelemetryPoints, 414255);
    assert.strictEqual(body.data.completenessPct, 98.52);
    assert.ok(body.data.regionalMeanPM25 > 40 && body.data.regionalMeanPM25 < 150);
    assert.ok(body.data.regionalMeanPM10 > 80 && body.data.regionalMeanPM10 < 300);
    assert.ok(body.data.peakRecord.value > 300);
    assert.strictEqual(body.data.airQualityTiers.length, 6);
  });

  it('GET /api/overview/trends should return chronological daily averages', async () => {
    const res = await fetch(`${baseUrl}/api/overview/trends?limit=10`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length <= 10);
    assert.ok(body.data[0].pm25 !== undefined);
    assert.ok(body.data[0].pm10 !== undefined);
  });

  it('GET /api/stations should return 48 stations with pagination and real averages', async () => {
    const res = await fetch(`${baseUrl}/api/stations?limit=5`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 5);
    assert.strictEqual(body.meta.total, 48);
    assert.ok(body.data[0].avgPM25 > 0);
  });

  it('GET /api/stations/:stationId should return 360 profile for valid station', async () => {
    const res = await fetch(`${baseUrl}/api/stations/site_1434`); // Anand Vihar
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.metadata.stationId, 'site_1434');
    assert.ok(body.data.stats.totalPoints > 8000);
    assert.ok(body.data.stats.maxPM25 >= 390);
  });

  it('GET /api/hotspots/rankings should return hotspot ranks from hotspot_rankings.parquet', async () => {
    const res = await fetch(`${baseUrl}/api/hotspots/rankings?limit=5`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 5);
    assert.strictEqual(body.data[0].compositeRank, 1);
  });

  it('GET /api/weather/correlation should return empirical correlation matrix', async () => {
    const res = await fetch(`${baseUrl}/api/weather/correlation`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length > 0);
    assert.ok(body.data[0].pearsonR !== undefined);
  });

  it('GET /api/historical/aqi should return longitudinal 2017-2023 summary', async () => {
    const res = await fetch(`${baseUrl}/api/historical/aqi`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.overview.totalObservations > 2000000);
    assert.strictEqual(body.data.yearlyTrends.length, 7); // 2017 to 2023
  });

  it('GET /api/quality/summary should return data quality indicators and censoring counts', async () => {
    const res = await fetch(`${baseUrl}/api/quality/summary`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.totalStations, 48);
    assert.strictEqual(body.data.statutory85PctCompliant, 48);
    assert.ok(body.data.saturationCounts.pm25Censored > 0);
  });

  it('GET /api/exports/stations.csv should stream downloadable CSV', async () => {
    const res = await fetch(`${baseUrl}/api/exports/stations.csv`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'text/csv; charset=utf-8');
    const text = await res.text();
    assert.ok(text.includes('Station ID'));
    assert.ok(text.includes('Station Name'));
  });

  it('404 on non-existent station ID', async () => {
    const res = await fetch(`${baseUrl}/api/stations/non_existent_id_9999`);
    assert.strictEqual(res.status, 404);
    const body: any = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'NOT_FOUND');
  });

  after(() => {
    if (server) {
      server.close();
    }
  });
});
