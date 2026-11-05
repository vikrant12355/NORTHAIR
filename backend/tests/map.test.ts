import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { dbManager } from '../dist/config/database.js';
import { mapService, STATION_COORDS, REGION_BOUNDS } from '../dist/services/map.service.js';

describe('NorthAir Intelligence — Map & Geospatial Test Suite', () => {
  before(async () => {
    await dbManager.initialize();
  });

  it('1. Geographic boundaries and station coordinates are 100% verified', () => {
    const keys = Object.keys(STATION_COORDS);
    assert.strictEqual(keys.length, 48);
    for (const id of keys) {
      const coord = STATION_COORDS[id];
      assert.ok(coord.lat >= 27.5 && coord.lat <= 32.5, `Lat ${coord.lat} out of North India bounds for ${id}`);
      assert.ok(coord.lng >= 74.0 && coord.lng <= 78.0, `Lng ${coord.lng} out of North India bounds for ${id}`);
    }
  });

  it('2. Regional boundaries are defined for all four target territories', () => {
    const territories = ['Chandigarh', 'Delhi', 'Haryana', 'Punjab'];
    for (const t of territories) {
      const b = REGION_BOUNDS[t];
      assert.ok(b, `Region bounds missing for ${t}`);
      assert.ok(b.lat > 0 && b.lng > 0);
      assert.strictEqual(b.bounds.length, 2);
    }
  });

  it('3. Chandigarh filtering returns exactly 3 stations with verified coordinates', async () => {
    const res = await mapService.getMapStations({ state: 'Chandigarh', pollutant: 'PM25' });
    assert.strictEqual(res.stations.length, 3);
    assert.strictEqual(res.stations.filter(s => s.hasCoords).length, 3);
    assert.strictEqual(res.stats.filteredCount, 3);
  });

  it('4. Delhi filtering returns exactly 6 stations with verified coordinates', async () => {
    const res = await mapService.getMapStations({ state: 'Delhi', pollutant: 'PM25' });
    assert.strictEqual(res.stations.length, 6);
    assert.strictEqual(res.stations.filter(s => s.hasCoords).length, 6);
  });

  it('5. Haryana filtering returns exactly 31 stations with verified coordinates', async () => {
    const res = await mapService.getMapStations({ state: 'Haryana', pollutant: 'PM25' });
    assert.strictEqual(res.stations.length, 31);
    assert.strictEqual(res.stations.filter(s => s.hasCoords).length, 31);
  });

  it('6. Punjab filtering returns exactly 8 stations with verified coordinates', async () => {
    const res = await mapService.getMapStations({ state: 'Punjab', pollutant: 'PM25' });
    assert.strictEqual(res.stations.length, 8);
    assert.strictEqual(res.stations.filter(s => s.hasCoords).length, 8);
  });

  it('7. Adaptive legend contains zero duplicate intervals for small datasets (Chandigarh)', async () => {
    const res = await mapService.getMapStations({ state: 'Chandigarh', pollutant: 'PM25' });
    const bps = res.legend.breakpoints;
    for (let i = 1; i < bps.length; i++) {
      assert.ok(bps[i] > bps[i - 1], `Breakpoint ${bps[i]} must be strictly greater than ${bps[i - 1]}`);
    }
    // Verify classes have non-overlapping ranges
    const classes = res.legend.classes.filter(c => c.label !== 'No Data');
    for (const cls of classes) {
      if (cls.range[0] != null && cls.range[1] != null) {
        assert.ok(cls.range[0] < cls.range[1], `Range [${cls.range[0]}, ${cls.range[1]}] must not be identical`);
      }
    }
  });

  it('8. Adaptive legend contains zero duplicate intervals for full network (48 stations)', async () => {
    const res = await mapService.getMapStations({ pollutant: 'PM25' });
    const bps = res.legend.breakpoints;
    for (let i = 1; i < bps.length; i++) {
      assert.ok(bps[i] > bps[i - 1], `Breakpoint ${bps[i]} must be strictly greater than ${bps[i - 1]}`);
    }
  });

  it('9. Missing values are classified with grey colour #B0B8B4', () => {
    const grey = mapService.classify(null, [50, 100], ['#3CAD5E', '#F5C842', '#D93A2B']);
    assert.strictEqual(grey, '#B0B8B4');
    const nanGrey = mapService.classify(NaN, [50, 100], ['#3CAD5E', '#F5C842', '#D93A2B']);
    assert.strictEqual(nanGrey, '#B0B8B4');
  });

  it('10. Multi-pollutant support calculates distinct statistics for all 7 criteria pollutants', async () => {
    const pollutants = ['PM25', 'PM10', 'NO2', 'SO2', 'CO', 'OZONE', 'NH3'];
    for (const p of pollutants) {
      const summary = await mapService.getMapSummary({ pollutant: p });
      assert.ok(summary.networkMean != null && summary.networkMean > 0, `Mean missing for ${p}`);
      assert.ok(summary.unit.length > 0, `Unit missing for ${p}`);
      assert.ok(summary.topHotspot !== null, `Top hotspot missing for ${p}`);
    }
  });

  it('11. Temporal date range filtering recalculates period aggregates', async () => {
    const monsoon = await mapService.getMapSummary({
      pollutant: 'PM25',
      startDate: '2025-06-01',
      endDate: '2025-09-30',
    });
    const postMonsoon = await mapService.getMapSummary({
      pollutant: 'PM25',
      startDate: '2025-10-01',
      endDate: '2025-11-30',
    });

    assert.ok(monsoon.networkMean! < postMonsoon.networkMean!, 'Monsoon PM2.5 mean must be substantially lower than Post-Monsoon');
    assert.ok(postMonsoon.networkMean! > 90, 'Post-Monsoon PM2.5 mean must reflect biomass burning surge');
  });

  it('12. Single station detail endpoint returns verified telemetry profile', async () => {
    const stn = await mapService.getStationDetail('site_5045', { pollutant: 'PM25' });
    assert.ok(stn !== null);
    assert.strictEqual(stn.city, 'Bahadurgarh');
    assert.strictEqual(stn.state, 'Haryana');
    assert.strictEqual(stn.hasCoords, true);
    assert.strictEqual(stn.tier, 'Very Poor');
    assert.ok(stn.avgPM25 > 150);
  });
});
