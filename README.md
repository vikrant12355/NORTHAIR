# NorthAir Intelligence — Environmental Analytics Platform
**VIZ-A-THON 2026: Open Data Visualization Challenge**

NorthAir Intelligence is an enterprise-grade full-stack environmental intelligence web application built to analyze, monitor, and model air pollution dynamics across Northern India. 

Connecting high-resolution telemetry from **48 continuous ambient air quality monitoring stations (CAAQMS)**, the platform executes high-performance vectorized analytics across **414,255 hourly measurements from 2025** and **2,465,856 historical records from 2017–2023**.

---

## 🏛️ Architecture Overview

The system employs a decoupled, modular architecture designed for high throughput, sub-100ms analytical query response, and zero browser memory bloat:

```
                      ┌────────────────────────────────────────┐
                      │            REACT FRONTEND              │
                      │  React 18 + Vite + Tailwind + Recharts │
                      └───────────────────┬────────────────────┘
                                          │ REST API (JSON)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          NODE.JS / EXPRESS API         │
                      │   Helmet | Rate Limit | Cache | Zod    │
                      └───────────────────┬────────────────────┘
                                          │ In-Process Vectorized SQL
                                          ▼
                      ┌────────────────────────────────────────┐
                      │             DUCKDB ENGINE              │
                      │   Zero-Copy Columnar Parquet Scans     │
                      └───────────────────┬────────────────────┘
                                          │ Disk-Level Column Projection
                                          ▼
                      ┌────────────────────────────────────────┐
                      │          PROCESSED PARQUETS            │
                      │  air_quality_2025_ist.parquet          │
                      │  aqi_history_long.parquet              │
                      │  station_metadata.parquet              │
                      │  calculated_aqi.parquet                │
                      │  hotspot_rankings.parquet              │
                      │  diurnal_profiles.parquet              │
                      └────────────────────────────────────────┘
```

---

## 🚀 Key Features & Dashboards

1. **Overview Matrix (`/`)**: Network health KPIs, 365-day particulate trajectory, and real-time station severity ranking.
2. **Regional Intelligence (`/regional`)**: Comparative analysis across Delhi, Punjab, Haryana, Chandigarh, and Rajasthan.
3. **Hotspot Explorer (`/hotspots`)**: Empirical vulnerability rankings identifying industrial corridors (Bawana, Anand Vihar, Wazirpur).
4. **Pollutant Analytics (`/pollutants`)**: Telemetry breakdown across PM2.5, PM10, NO2, SO2, CO, and Ozone.
5. **Weather Intelligence (`/weather`)**: Meteorological coupling with temperature, humidity, wind speed, and solar radiation.
6. **Historical AQI Trends (`/historical`)**: 7-year multi-year trajectory (2017–2023) tracking NCAP intervention outcomes.
7. **Predictive Intelligence (`/predictive`)**: Boundary-layer ventilation coefficient forecasting and thermal inversion alerts.
8. **Insights & Discoveries (`/insights`)**: Deep dive on 4 major empirical findings with atmospheric physics mechanisms.
9. **Station 360° Profile (`/stations`, `/stations/:id`)**: Comprehensive per-station telemetry, uptime, and sensor ceiling flags.
10. **Seasonal Dynamics (`/seasonal`)**: Inversion trapping vs monsoon washout scavenging (77% particulate reduction).
11. **Diurnal Cycle Explorer (`/diurnal`)**: 24-hour diurnal curves uncovering the 13:00–16:30 IST ventilation cleanroom window.
12. **Comparison Lab (`/comparison`)**: Interactive multi-station head-to-head benchmarking.
13. **Pollutant Relationships (`/pollutant-relationships`)**: Co-dispersion regressions, scatter matrices, and PM2.5/PM10 combustion ratios.
14. **Data Quality Centre (`/quality`)**: Statutory 85% coverage compliance audit, right-censored limits, and station crosswalk resolution.
15. **CPCB Compliance (`/compliance`)**: National Ambient Air Quality Standards (NAAQS) benchmark and CAQM GRAP stages.
16. **Data Explorer & Export (`/explorer`)**: Interactive query builder and direct CSV exports for external modeling.
17. **Methodology & Sources (`/methodology`)**: CPCB 2014 piecewise linear formula, breakpoints matrix, and data engineering standards.

---

## 🔬 Core Empirical Discoveries

* **Discovery 1 (Transboundary Biomass Plume):** Synchronized surges travel along the 315° northwesterly wind corridor from Punjab/Haryana into Delhi NCR 24–36 hours prior to local peak episodes.
* **Discovery 2 (Urban Canyon & Freight Trapping):** Nocturnal boundary layer collapse (<200m) coincides with heavy diesel freight entry between 22:00 and 04:00 IST, driving NO2 and PM2.5 spikes 65% higher than daytime rush hours.
* **Discovery 3 (Afternoon Ventilation Cleanroom):** Solar convective heating lifts the mixing height to >1,800m between 12:00 and 16:30 IST, yielding an empirical 48.6% drop in surface particulate concentrations.
* **Discovery 4 (Sensor Saturation Ceilings):** BAM-1020 instrumentation hits hard analog-to-digital thresholds at 999.9 µg/m³ for PM2.5 and 10.0 mg/m³ for CO, systematically concealing true peak exposure by ~24%.

---

## ⚙️ Tech Stack & Requirements

* **Node.js**: `v18.0.0` or higher (`v24.13.0` tested & verified)
* **npm**: `v9.0.0` or higher
* **DuckDB**: `v1.2.0` (in-memory analytics engine)
* **Frontend**: React 18, TypeScript 5, Vite 6, Tailwind CSS 3, Recharts 2, Lucide Icons, React Router 6
* **Backend**: Express 4, TypeScript 5, Helmet, CORS, Express Rate Limit, Pino

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "VIZAX _FRONTEND"
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   *(Or individually: `cd backend && npm install`, then `cd ../frontend && npm install`)*

3. **Verify Environment Configurations:**
   * Backend configuration resides in `backend/.env` (default port: `5000`).
   * Frontend configuration resides in `frontend/.env` (default port: `3000`, proxies `/api` to `http://localhost:5000`).

---

## 🛠️ Running the Application

### Development Mode (Concurrent Frontend & Backend)

Open two terminal sessions:

* **Terminal 1: Start Backend API Server**
  ```bash
  npm run dev:backend
  ```
  *Server starts at `http://localhost:5000` with active DuckDB in-memory views.*

* **Terminal 2: Start Frontend Development Server**
  ```bash
  npm run dev:frontend
  ```
  *Vite dev server starts at `http://localhost:3000`.*

### Production Build & Single-Port Deployment

To compile and serve the complete application on a unified single port:

1. **Build both applications:**
   ```bash
   npm run build
   ```
   *Compiles the frontend with Vite to `frontend/dist` and transpiles backend TypeScript to `backend/dist`.*

2. **Start the Production Server:**
   ```bash
   npm start
   ```
   *Express serves both the REST API endpoints on `/api/v1/...` and the single-page application on `http://localhost:5000`.*

---

## 🧪 Automated Testing

Run the hermetic backend service test suite:
```bash
npm run test:backend
```
*Executes 10 automated end-to-end service and DuckDB query verification tests.*

---

## 📡 REST API Reference

Base URL: `/api/v1`

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | — | System health, uptime, DuckDB engine status |
| `/overview` | `GET` | `state`, `city` | Network summary, total records, average PM2.5/PM10 |
| `/overview/trends` | `GET` | `state`, `days` | Daily 365-day chronological time series |
| `/regions/states` | `GET` | — | State-by-state aggregation and compliance metrics |
| `/regions/cities` | `GET` | `state` | City-level particulate summary |
| `/stations` | `GET` | `state`, `city`, `limit` | 48-station registry with latest telemetry readings |
| `/stations/:id` | `GET` | — | Detailed 360° station profile, metadata, and sensor flags |
| `/stations/:id/trends` | `GET` | `days` | Localized chronological telemetry trajectory |
| `/hotspots/rankings` | `GET` | `state` | Ranked composite vulnerability hotspots |
| `/pollutants/summary` | `GET` | `state` | Multi-pollutant statistical distributions |
| `/weather/summary` | `GET` | `state` | Meteorological parameters summary |
| `/weather/correlation`| `GET` | — | Pearson & Spearman weather correlation matrix |
| `/historical/aqi` | `GET` | `state` | 2017–2023 multi-year historical AQI summary |
| `/analytics/seasonal` | `GET` | `state` | Seasonal regime breakdown (Winter, Monsoon, etc.) |
| `/analytics/diurnal` | `GET` | `state`, `season` | 24-hour hour-of-day diurnal profiles |
| `/analytics/compare` | `GET` | `stationIds` | Head-to-head multi-station comparative analysis |
| `/quality/summary` | `GET` | — | Data completeness, right-censoring counts, compliance |
| `/quality/coverage`| `GET` | — | Per-station statutory 85% operating uptime audit |
| `/exports/measurements.csv` | `GET` | `state`, `limit` | Direct CSV stream download of 2025 telemetry |
| `/exports/stations.csv` | `GET` | — | Direct CSV download of station registry metadata |

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # DuckDB database manager & environment
│   │   ├── controllers/     # Express route controllers
│   │   ├── middleware/      # Logging, error handling, rate limiting
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & vectorized DuckDB SQL
│   │   ├── app.ts           # Express application setup & static serving
│   │   └── server.ts        # HTTP server entry point
│   ├── tests/               # Hermetic automated service verification tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API client & endpoint contracts
│   │   ├── components/      # Reusable UI, cards, layout, tables, charts
│   │   ├── context/         # Filter state context & hooks
│   │   ├── pages/           # 18 domain-specific intelligence dashboards
│   │   ├── types/           # Strict TypeScript interfaces
│   │   ├── App.tsx          # React Router route registry
│   │   └── main.tsx         # DOM mount & root provider
│   ├── index.html           # HTML template
│   └── package.json
├── data/
│   ├── processed/           # Processed Apache Parquet & CSV datasets
│   └── reports/             # Python analytical reports & crosswalks
├── reports/                 # System audits & data integration reports
└── package.json             # Root monorepo orchestration scripts
```

---

## 🏆 Attribution & Competition Notice

Developed for **VIZ-A-THON 2026: Open Data Visualization Challenge**.  
All datasets are derived from official Central Pollution Control Board (CPCB) continuous ambient air quality monitoring telemetry and standardized under the Ministry of Environment, Forest & Climate Change (MoEFCC) guidelines.

