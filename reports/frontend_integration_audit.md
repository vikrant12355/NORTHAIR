# NorthAir Intelligence — Frontend Integration Audit

**Project**: NorthAir Intelligence — VIZ-A-THON 2026  
**Auditor**: Lead Full-Stack Architect & Data Engineer  
**Date**: November 2026  
**Status**: Complete  

---

## 1. Existing Frontend Screens

The existing design in `stitch_northair_intelligence_dashboard/` and the target architecture comprise 17 coordinated intelligence views:

### Core Screens (Designed & Specified):
1. **Executive Overview** (`/` or `/overview`): High-level basin telemetry, 6 scientific KPI cards, dual particulate trajectory chart (PM2.5 vs PM10 with NAAQS limits 60 and 100 µg/m³), state-by-state exposure disparity bars, air quality tiers breakdown (Good, Satisfactory, Moderate, Poor, Very Poor, Severe), and top monitoring stations table with data capture %.
2. **Regional Intelligence** (`/regional`): Sub-continental GIS mesh with 48 CAAQMS station markers, interactive station selection drawer, state-level and city-level comparative metrics, and spatial plume overlays.
3. **Hotspot Explorer** (`/hotspots`): Station vs month (Jan–Dec) pollution severity heatmap matrix, multi-criteria composite hotspot ranking table (mean, 90th percentile, exceedance rates), and distribution by state.
4. **Pollutant Analytics** (`/pollutants`): Multi-vector analysis covering PM2.5, PM10, NO, NO2, NOx, NH3, SO2, CO, Ozone, and VOCs with correct scientific units, longitudinal trends, and PM2.5/PM10 particulate ratio.
5. **Weather Intelligence** (`/weather`): Ambient temperature, relative humidity, wind speed, wind direction, solar radiation, rainfall, and vertical wind speed (VWS). Empirical correlation matrices, wind dispersion curves, and documented transducer flags.
6. **Historical AQI** (`/historical`): 7-year longitudinal AQI records (2017–2023), multi-year trends, seasonal cycles, and isolation of unresolved multiplexed stations.
7. **Predictive Intelligence** (`/predictive`): Atmospheric risk forecasting, seasonal transition projections, and winter thermal inversion alert indices.
8. **Insights & Reports** (`/insights`): Empirical discoveries including transboundary winter stagnation, urban-suburban gradients, agricultural stubble burning episodic spikes, and policy recommendations.
9. **Station 360° Profile** (`/stations` & `/stations/:id`): Deep forensic inspection of individual CAAQMS nodes with 24h rolling averages, multi-pollutant profiles, sensor saturation ceilings (999.99 for PM2.5, 1000.0 for PM10, 10.0 for CO), and operational metadata.
10. **Seasonal Intelligence** (`/seasonal`): Monsoon washout dynamics vs. winter anticyclonic stagnation regime shifts across seasons.
11. **Diurnal Cycle Explorer** (`/diurnal`): 24-hour diurnal curves in Indian Standard Time (IST UTC+05:30), highlighting the afternoon convective dispersion trough (13:00–16:00 IST) and nocturnal inversion peaks (21:00–23:00 IST).
12. **Comparison Lab** (`/comparison`): Station-to-station and city-to-city head-to-head analytical benchmarking.
13. **Pollutant Relationship Lab** (`/pollutant-relationships`): Scatter diagrams, regressions, PM2.5/PM10 ratios, and NO2-O3 photochemical titration dynamics.
14. **Data Quality Centre** (`/quality`): Parameter-wise missingness analysis, station uptime compliance (>85% statutory threshold), sensor saturation audit, and historical station identity crosswalk.
15. **CPCB Standards & Compliance** (`/compliance`): National Ambient Air Quality Standards (NAAQS) compliance tracking, annual and 24h statutory thresholds.
16. **Data Explorer** (`/explorer`): High-performance searchable, filterable data browser with DuckDB server-side pagination and CSV export.
17. **Methodology & Sources** (`/methodology`): Technical documentation of the CPCB 2014 AQI sub-index calculation engine, UTC-to-IST conversion, and data cleaning protocols.

---

## 2. Components Requiring Real Data

| Component | Target Screen(s) | Real Metric / Data Source |
|---|---|---|
| **6 Metric KPI Cards** | Overview | Stations reporting (48), total points (414,255), mean PM2.5 (84.6 µg/m³), mean PM10 (162.3 µg/m³), peak record (394.0 µg/m³ Anand Vihar), completeness (98.52%) from `air_quality_2025_ist.parquet`. |
| **Trajectory Chart** | Overview, Stations | Longitudinal daily PM2.5 & PM10 averages with NAAQS reference lines. |
| **Exposure Disparity Bars** | Overview, Regional | State-level mean PM2.5: Delhi (98.5), Haryana (94.8), Chandigarh (49.4), Punjab (46.9). |
| **Air Quality Tiers Stack** | Overview | Empirical CPCB category distribution (% and counts). |
| **Top Stations Table** | Overview, Stations | Real ranked list of all 48 CAAQMS nodes with valid PM2.5, PM10, and capture %. |
| **GIS Mesh Markers** | Regional Intelligence | 48 monitored station nodes with precise geographic coordinates, current readings, and severity tiers. |
| **Hotspot Heatmap Matrix** | Hotspot Explorer | 48 stations × 12 months (Jan–Dec 2025) real PM2.5 averages color-coded by CPCB tiers. |
| **Hotspot Ranking Table** | Hotspot Explorer | `hotspot_rankings.parquet` composite ranking scores, P90 PM2.5, and exceedance percentages. |
| **Diurnal 24h Trajectory** | Diurnal Cycle Explorer | `diurnal_profiles.parquet` 24-hour mean/median curves in Indian Standard Time (IST). |
| **Meteorological Curves** | Weather Intelligence | Real correlations from `weather_correlations.csv` and wind speed vs PM2.5 dispersion curves. |
| **Historical Trends** | Historical AQI | `aqi_history_long.parquet` 2017–2023 yearly and monthly AQI averages. |
| **Data Quality Gauges** | Data Quality Centre | Parameter missingness percentages, duplicate audit counts, and station coverage. |

---

## 3. Existing Dummy-Data Locations

In the prototype mockups (`code.html`), hardcoded values were present in:
- Metric cards: hardcoded text strings (e.g. `84.6`, `162.3`, `394.0`).
- SVG trajectory vectors: static hardcoded bezier paths (`M 0,110 Q 75,70 ...`).
- Heatmap cells: static div blocks with manual numbers (`382`, `245`, `142`).
- Table rows: static HTML `<tr>` elements representing 5 hardcoded stations.
- Filters: UI select dropdowns without active API query triggers.

**Resolution**: All these hardcoded representations are replaced with typed React components powered by real data fetched from the Express + DuckDB REST API.

---

## 4. Existing API Integrations & Missing Backend

- Previously, no REST API backend existed to serve the processed Parquet files to a web frontend.
- Required Backend: A Node.js + Express + TypeScript service powered by DuckDB in-memory querying of Apache Parquet datasets.
- Required Endpoints:
  - System: `/api/health`, `/api/meta`, `/api/filters`
  - Overview: `/api/overview`, `/api/overview/trends`, `/api/overview/regional-comparison`
  - Regional: `/api/regions/states`, `/api/regions/cities`, `/api/regions/comparison`
  - Stations: `/api/stations`, `/api/stations/:stationId`, `/api/stations/:stationId/trends`
  - Hotspots: `/api/hotspots`, `/api/hotspots/rankings`, `/api/hotspots/distribution`
  - Pollutants: `/api/pollutants`, `/api/pollutants/summary`, `/api/pollutants/trends`, `/api/pollutants/relationships`
  - Weather: `/api/weather/summary`, `/api/weather/correlation`, `/api/weather/relationships`
  - Historical: `/api/historical/aqi`, `/api/historical/aqi/trends`, `/api/historical/aqi/distribution`
  - Advanced: `/api/analytics/seasonal`, `/api/analytics/diurnal`, `/api/analytics/comparison`
  - Quality: `/api/quality/summary`, `/api/quality/coverage`, `/api/quality/missingness`, `/api/quality/station-identities`
  - Exports: `/api/exports/measurements.csv`, `/api/exports/stations.csv`, `/api/exports/summary.csv`

---

## 5. Integration Plan

1. **Backend Foundation**: Complete the Express + DuckDB backend with all controllers, services, routes, middleware, and tests.
2. **Central Frontend API Client**: Create `src/api/client.ts`, `endpoints.ts`, and specialized API modules with React hooks.
3. **Reusable Design Components**: Build React components mirroring the NorthAir design system tokens:
   - `Sidebar` & `Header` layout shell
   - `KpiMetricCard` & `SeverityChip`
   - `FilterStation` global filter bar
   - Recharts-based `TrajectoryChart`, `DiurnalCurve`, `HeatmapMatrix`, and `CorrelationMatrix`
   - High-density `DataTable` with pagination and search
4. **All 17 Screens Connected**: Implement every screen with real data, loading states, error states, and empty states.
5. **Interactive Global Filters**: Connect State, City, Station, Date Range, Pollutant, and Resolution to live API re-queries.
6. **Exports & Verification**: Validate CSV streaming downloads and verify automated unit/integration tests.

