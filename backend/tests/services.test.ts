import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { dbManager } from '../dist/config/database.js';
import { overviewService } from '../dist/services/overview.service.js';
import { regionalService } from '../dist/services/regional.service.js';
import { stationService } from '../dist/services/station.service.js';
import { hotspotService } from '../dist/services/hotspot.service.js';
import { pollutantService } from '../dist/services/pollutant.service.js';
import { weatherService } from '../dist/services/weather.service.js';
import { historicalService } from '../dist/services/historical.service.js';
import { qualityService } from '../dist/services/quality.service.js';

describe('NorthAir Intelligence DuckDB & Services Verification', () => {
  before(async () => {
    await dbManager.initialize();
  });

  it('OverviewService.getSummary() returns valid 2025 calculations', async () => {
    const summary = await overviewService.getSummary({});
    assert.strictEqual(summary.stationsOnline, 48);
    assert.strictEqual(summary.totalTelemetryPoints, 414255);
    assert.strictEqual(summary.completenessPct, 98.52);
    assert.ok(summary.regionalMeanPM25 >= 70 && summary.regionalMeanPM25 <= 100);
    assert.ok(summary.regionalMeanPM10 >= 140 && summary.regionalMeanPM10 <= 180);
    assert.strictEqual(summary.airQualityTiers.length, 6);
  });

  it('OverviewService.getTrends() returns daily trajectory', async () => {
    const trends = await overviewService.getTrends({ limit: 10 });
    assert.ok(trends.length <= 10);
    assert.ok(trends.length > 0);
    assert.ok(typeof trends[0].pm25 === 'number');
  });

  it('RegionalService.getStates() aggregates all 4 territories', async () => {
    const states = await regionalService.getStates();
    assert.strictEqual(states.length, 4);
    const names = states.map((s) => s.state);
    assert.ok(names.includes('Delhi'));
    assert.ok(names.includes('Haryana'));
    assert.ok(names.includes('Punjab'));
    assert.ok(names.includes('Chandigarh'));
  });

  it('StationService.getStations() returns canonical 48 stations', async () => {
    const res = await stationService.getStations({ limit: 50 });
    assert.strictEqual(res.total, 48);
    assert.strictEqual(res.stations.length, 48);
  });

  it('StationService.getStationProfile() returns detailed telemetry for Anand Vihar', async () => {
    const profile = await stationService.getStationProfile('site_1434');
    assert.ok(profile !== null);
    assert.strictEqual(profile?.metadata.stationId, 'site_1434');
    assert.ok(profile?.stats.totalPoints > 8000);
  });

  it('HotspotService.getHotspotRankings() returns ranked hotspots', async () => {
    const rankings = await hotspotService.getHotspotRankings(10);
    assert.strictEqual(rankings.length, 10);
    assert.strictEqual(rankings[0].compositeRank, 1);
  });

  it('PollutantService.getSummary() returns multi-pollutant metrics', async () => {
    const pols = await pollutantService.getSummary({});
    assert.ok(pols.mean_pm25 > 0);
    assert.ok(pols.mean_pm10 > 0);
    assert.ok(pols.mean_no2 > 0);
    assert.ok(pols.mean_so2 > 0);
  });

  it('WeatherService.getCorrelations() parses correlation table', async () => {
    const corrs = await weatherService.getCorrelations();
    assert.ok(corrs.length > 0);
    assert.ok(typeof corrs[0].pearsonR === 'number');
  });

  it('HistoricalService.getSummary() returns multi-year AQI trends', async () => {
    const hist = await historicalService.getSummary();
    assert.ok(hist.overview.totalObservations > 2000000);
    assert.strictEqual(hist.yearlyTrends.length, 7);
  });

  it('QualityService.getSummary() returns sensor flags and coverage', async () => {
    const quality = await qualityService.getSummary();
    assert.strictEqual(quality.totalStations, 48);
    assert.strictEqual(quality.statutory85PctCompliant, 48);
    assert.ok(quality.saturationCounts.pm25Censored > 0);
  });
});

