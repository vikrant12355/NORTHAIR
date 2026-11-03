# NorthAir Intelligence — Key Empirical Discoveries
**VIZ-A-THON 2026 — Phase 2: Scientific & Environmental Findings**

This document details six primary data-driven discoveries established from the verified 2025 hourly measurements (414,255 records) and the reconciled 2017–2023 historical AQI archive across Chandigarh, Punjab, Haryana, and Delhi.

---

## Discovery 1: The NCR Industrial Crescent Represents North India’s Most Severe Chronic Airshed

### 1. Analytical Question
Which monitoring stations and urban centers experience the highest annual baseline particulate matter exposure, and how do they compare with the National Ambient Air Quality Standards (NAAQS)?

### 2. Supporting Numerical Evidence
- The top four most polluted cities by annual mean $PM_{2.5}$ across all 48 monitored stations are located in Haryana along the immediate western periphery of Delhi:
  1. **Bahadurgarh** (`site_5045`): Annual Mean $PM_{2.5} = \mathbf{137.66 \, \mu\text{g/m}^3}$; 90th Percentile $= \mathbf{304.34 \, \mu\text{g/m}^3}$; Exceedance $>60 \, \mu\text{g/m}^3 = \mathbf{87.37\%}$ of all valid hours.
  2. **Sonipat** (`site_5041`): Annual Mean $PM_{2.5} = \mathbf{129.56 \, \mu\text{g/m}^3}$; 90th Percentile $= \mathbf{258.94 \, \mu\text{g/m}^3}$; Exceedance $>60 \, \mu\text{g/m}^3 = \mathbf{95.72\%}$ of all valid hours.
  3. **Dharuhera** (`site_5044`): Annual Mean $PM_{2.5} = \mathbf{125.80 \, \mu\text{g/m}^3}$; 90th Percentile $= \mathbf{246.20 \, \mu\text{g/m}^3}$; Exceedance $>60 \, \mu\text{g/m}^3 = \mathbf{87.74\%}$.
  4. **Manesar** (`site_5039`): Annual Mean $PM_{2.5} = \mathbf{124.62 \, \mu\text{g/m}^3}$; 90th Percentile $= \mathbf{238.47 \, \mu\text{g/m}^3}$; Exceedance $>60 \, \mu\text{g/m}^3 = \mathbf{86.44\%}$.
- Across Haryana’s 31 stations, **64.99% of all hourly observations in 2025 exceeded the CPCB 24-hour limit of 60 µg/m³**, compared to **56.44% in Delhi**, **34.08% in Chandigarh**, and **25.19% in Punjab**.

### 3. Relevant Locations
- Primary airshed: The industrial corridor spanning Bahadurgarh, Sonipat, Dharuhera, Manesar, Gurugram, and Delhi NCT.

### 4. Relevant Time Period
- Full calendar year 2025 (January 1, 2025 to December 31, 2025).

### 5. Sample Size
- Total valid $PM_{2.5}$ readings in Haryana: $146,846$ hourly observations.
- Total valid $PM_{2.5}$ readings in Delhi: $35,846$ hourly observations.

### 6. Methodology
- Aggregated hourly telemetry by station and city; calculated arithmetic mean, median, 90th percentile, and threshold exceedance frequencies. Ranked stations using a composite multi-criteria hotspot index weighting chronic exposure (mean, 40%), acute severity (90th percentile, 30%), and frequency of violation (30%).

### 7. Limitations
- CAAQMS station density is higher in industrial and commercial zones of Haryana/NCR, which may skew suburban averages upward compared to rural background areas lacking continuous monitoring.

### 8. Reference Artifacts
- Dataset: [`data/processed/analytics/hotspot_rankings.parquet`](file:///e:/VIZAX/data/processed/analytics/hotspot_rankings.parquet)
- Detailed Report: [`reports/hotspot/hotspot_analysis.md`](file:///e:/VIZAX/reports/hotspot/hotspot_analysis.md)
- Notebook: [`notebooks/04_spatiotemporal_analysis.ipynb`](file:///e:/VIZAX/notebooks/04_spatiotemporal_analysis.ipynb)

---

## Discovery 2: The Monsoon Washout Creates a 5-Fold Seasonal Particulate Contrast

### 1. Analytical Question
What is the seasonal magnitude of particulate matter variation across North India, and to what extent does the summer monsoon clear the regional airshed?

### 2. Supporting Numerical Evidence
- Across all 48 monitoring stations, network-wide mean $PM_{2.5}$ exhibits a **5.06-fold swing** between its cleanest and most polluted months:
  - **July Cleanest**: Mean $PM_{2.5} = \mathbf{25.43 \, \mu\text{g/m}^3}$; Median $= \mathbf{20.00 \, \mu\text{g/m}^3}$ (100% compliant with the 60 µg/m³ standard).
  - **August Second Cleanest**: Mean $PM_{2.5} = \mathbf{25.89 \, \mu\text{g/m}^3}$; Median $= \mathbf{22.00 \, \mu\text{g/m}^3}$.
  - **November Peak Episode**: Mean $PM_{2.5} = \mathbf{125.58 \, \mu\text{g/m}^3}$; Median $= \mathbf{93.00 \, \mu\text{g/m}^3}$.
  - **December Peak Episode**: Mean $PM_{2.5} = \mathbf{128.74 \, \mu\text{g/m}^3}$; Median $= \mathbf{96.00 \, \mu\text{g/m}^3}$.
- In Delhi NCT, the seasonal amplification is even steeper: July mean was **$26.79 \, \mu\text{g/m}^3$** compared to November mean of **$205.80 \, \mu\text{g/m}^3$** (a **7.68-fold seasonal increase**).

### 3. Relevant Locations
- Pan-regional across all 4 administrative entities: Chandigarh, Punjab, Haryana, and Delhi.

### 4. Relevant Time Period
- Monthly progression across 2025.

### 5. Sample Size
- $218,917$ valid hourly $PM_{2.5}$ measurements distributed across all 12 calendar months.

### 6. Methodology
- Grouped observations by month, season (Winter, Pre-Monsoon, Monsoon, Post-Monsoon), and state. Evaluated parametric and non-parametric dispersion metrics.

### 7. Limitations
- Rainfall gauges in the CAAQMS dataset have high zero-inflation ($>95\%$ zero hourly rain reads); wet scavenging is observed as an aggregate seasonal regime shift rather than an hourly dose-response function.

### 8. Reference Artifacts
- Dataset: [`data/processed/analytics/monthly_pollution.parquet`](file:///e:/VIZAX/data/processed/analytics/monthly_pollution.parquet)
- Notebook: [`notebooks/04_spatiotemporal_analysis.ipynb`](file:///e:/VIZAX/notebooks/04_spatiotemporal_analysis.ipynb)

---

## Discovery 3: Diurnal Planetary Boundary Layer Dynamics Drive an 82% Daytime-to-Nighttime Pollution Surge

### 1. Analytical Question
How does air pollution fluctuate over a 24-hour cycle in local Indian Standard Time (IST), and what is the diurnal trough-to-peak amplitude?

### 2. Supporting Numerical Evidence
- In Indian Standard Time (UTC + 05:30), particulate pollution displays a pronounced bimodal diurnal curve across North India:
  - **Afternoon Trough (15:00 IST)**: Network median $PM_{2.5} = \mathbf{39.00 \, \mu\text{g/m}^3}$; mean Wind Speed peaks at $\mathbf{2.31 \, \text{m/s}}$.
  - **Morning Commute Peak (08:00 IST)**: Network median $PM_{2.5} = \mathbf{70.00 \, \mu\text{g/m}^3}$ (**79.5% increase** over trough).
  - **Late Evening Peak (22:00 IST)**: Network median $PM_{2.5} = \mathbf{71.00 \, \mu\text{g/m}^3}$ (**82.1% increase** over trough).
- The late-evening elevation remains elevated throughout the entire night (median $\ge 60 \, \mu\text{g/m}^3$ from 20:00 to 07:00 IST) before rapidly ventilating between 10:00 and 14:00 IST as solar convection deepens the mixed boundary layer.

### 3. Relevant Locations
- All 48 monitoring stations across Chandigarh, Punjab, Haryana, and Delhi.

### 4. Relevant Time Period
- Full year 2025, partitioned into hourly bins 00:00 through 23:00 IST.

### 5. Sample Size
- $218,917$ valid $PM_{2.5}$ reads and $214,875$ valid $PM_{10}$ reads binned across 24 hours.

### 6. Methodology
- Binned measurements by local IST hour ($0\text{--}23$) and classified into 5 canonical diurnal windows: Night (00:00–05:59), Morning (06:00–09:59), Daytime (10:00–15:59), Evening (16:00–19:59), Late Evening (20:00–23:59).

### 7. Limitations
- Radiosonde / LIDAR boundary layer height data was not provided directly in CAAQM telemetry; diurnal PBL collapse is inferred through the co-registered collapse of surface wind speed and thermal diurnal forcing.

### 8. Reference Artifacts
- Datasets: [`data/processed/analytics/hourly_pollution.parquet`](file:///e:/VIZAX/data/processed/analytics/hourly_pollution.parquet), [`data/processed/analytics/diurnal_profiles.parquet`](file:///e:/VIZAX/data/processed/analytics/diurnal_profiles.parquet)
- Notebook: [`notebooks/05_diurnal_cycle_analysis.ipynb`](file:///e:/VIZAX/notebooks/05_diurnal_cycle_analysis.ipynb)

---

## Discovery 4: Temperature-Driven Photochemical Coupling Regulates Ground-Level Ozone

### 1. Analytical Question
What is the nature and strength of meteorological coupling between surface temperature, particulate matter, and ground-level ozone?

### 2. Supporting Numerical Evidence
- Ambient Temperature ($AT$) displays divergent, pollutant-specific correlations across the North Indian network:
  - **Positive Coupling with Ozone ($O_3$)**: Pearson $r = \mathbf{+0.3889}$; Spearman $\rho = \mathbf{+0.4245}$ ($N = 114,282, p < 0.0001$). During hot pre-monsoon summer months (May–June), elevated solar thermal radiation and temperatures $>40^\circ\text{C}$ strongly accelerate photochemical oxidation of precursor VOCs and $NO_x$ to ground-level ozone.
  - **Inverse Coupling with $PM_{2.5}$**: Pearson $r = \mathbf{-0.3786}$; Spearman $\rho = \mathbf{-0.4279}$ ($N = 115,569, p < 0.0001$). Cold surface temperatures in winter coincide with atmospheric stability and thermal inversions that trap particulate matter near the ground.
- Wind Speed ($WS$) displays an inverse relationship with both $PM_{2.5}$ ($r = -0.0732, \rho = -0.0831, N = 189,541$) and $PM_{10}$ ($r = -0.0343, \rho = -0.0152, N = 185,595$), indicating ventilation dispersion.

### 3. Relevant Locations
- Multi-station network across Chandigarh, Punjab, Haryana, and Delhi.

### 4. Relevant Time Period
- Calendar year 2025.

### 5. Sample Size
- $N > 114,000$ paired observation hours per bivariate correlation test.

### 6. Methodology
- Bivariate parametric Pearson correlation and non-parametric Spearman rank correlation with two-sided significance tests; evaluated network-wide and stratified by season.

### 7. Limitations
- Temperature transducers were operational at a subset of stations ($119,250$ valid reads out of $414,255$), so correlations reflect reporting station cohorts.

### 8. Reference Artifacts
- Dataset: [`data/processed/analytics/weather_correlations.csv`](file:///e:/VIZAX/data/processed/analytics/weather_correlations.csv)
- Detailed Report: [`reports/eda/weather_analysis.md`](file:///e:/VIZAX/reports/eda/weather_analysis.md)
- Notebook: [`notebooks/06_weather_pollution_analysis.ipynb`](file:///e:/VIZAX/notebooks/06_weather_pollution_analysis.ipynb)

---

## Discovery 5: Historical Station Multiplexing Concealed 10 Valid North Indian Stations and 37 Out-of-Region Contaminants

### 1. Analytical Question
What is the structural cause of the 42,257 duplicate Station ID + Date records in `aqi_history_2017_2023.csv`, and how does resolving them impact longitudinal regional analysis?

### 2. Supporting Numerical Evidence
- Deep forensic metadata reconciliation demonstrated that duplicate records did not reflect sensor reading duplicates, but rather **Station ID multiplexing by source data compilers across four specific IDs**:
  1. `site_5582` (Chandigarh): Contained 3 distinct stations (`site_5491`, `site_5127`, `site_5582`).
  2. `site_5341` (Faridabad): Contained 4 distinct stations (`site_5340`, `site_5342`, `site_5341`, `site_263`).
  3. `site_5344` (Gurugram): Contained 4 distinct stations (`site_5025`, `site_5345`, `site_5344`, `site_146`).
  4. `site_5046` (Yamuna Nagar): Contained **40 distinct station names**, of which only **three** belong to Haryana (`site_5046` Yamuna Nagar, `site_5045` Bahadurgarh, and `site_5050` Palwal).
- **Critical Remediation**:
  - **10 North Indian stations** previously thought missing from historical data were recovered via Station Name disambiguation.
  - **37 non-target out-of-region stations** ($33,724$ historical day records from Kanpur, Jaipur, Puducherry, Belgaum, Solapur, etc.) were identified as `UNRESOLVED` and isolated from the North India historical archive.
  - Retaining those 37 stations would have falsely inflated Haryana's historical monitoring footprint by **33,724 days (32.8% of historical volume)** with non-local data.

### 3. Relevant Locations
- Chandigarh, Faridabad, Gurugram, Bahadurgarh, Palwal, and Yamuna Nagar.

### 4. Relevant Time Period
- Historical multi-year window (2017 to 2023).

### 5. Sample Size
- $102,744$ total daily historical records ($2,465,856$ hourly AQI cells).
- $69,020$ verified North Indian station-days retained; $33,724$ out-of-region station-days isolated.

### 6. Methodology
- Cross-referenced alphanumeric metadata tokens between `stations.csv` and historical metadata. Verified Station Name string containment and token Jaccard similarity. Built an audit crosswalk with deterministic mapping status rules (`EXACT_MATCH`, `VERIFIED_MATCH`, `UNRESOLVED`).

### 7. Limitations
- Historical files lacked geographic coordinates; disambiguation relied on exact official SPCB/CPCB station name strings.

### 8. Reference Artifacts
- Reports: [`reports/data_quality/station_identity_audit.md`](file:///e:/VIZAX/reports/data_quality/station_identity_audit.md), [`reports/data_quality/station_identity_crosswalk.csv`](file:///e:/VIZAX/reports/data_quality/station_identity_crosswalk.csv)
- Notebook: [`notebooks/07_historical_aqi_analysis.ipynb`](file:///e:/VIZAX/notebooks/07_historical_aqi_analysis.ipynb)

---

## Discovery 6: Official CPCB AQI Gatekeeping Disqualifies 46.4% of Raw Hourly Records Due to Particulate Data Sufficiency

### 1. Analytical Question
What percentage of continuous hourly monitoring records meet the official CPCB data sufficiency criteria to generate an authoritative National Air Quality Index (NAQI) value?

### 2. Supporting Numerical Evidence
- When implementing the strict CPCB methodology (24h rolling averages with $\ge 16$ valid hours, 8h rolling averages with $\ge 6$ valid hours, requirement of $\ge 3$ valid sub-indices, and mandatory presence of $PM_{2.5}$ or $PM_{10}$):
  - **Valid Official AQI Records**: **$222,031$ hours (53.60% of network time)**.
  - **Disqualified / Undetermined Records**: **$192,224$ hours (46.40% of network time)**.
- **Prominent Pollutant Distribution**:
  - For hours where official AQI was calculable, **$PM_{2.5}$ was the driving / prominent pollutant in 81.4% of cases**, followed by **$PM_{10}$ in 16.8% of cases**, and $NO_2 / CO$ in $<2\%$ of cases.
- **Crucial Caution**: Approximating AQI from instantaneous 1-hour $PM_{2.5}$ readings would falsely declare official AQI during periods when multi-pollutant criteria are legally and scientifically unmet.

### 3. Relevant Locations
- All 48 monitoring stations across North India in 2025.

### 4. Relevant Time Period
- Full calendar year 2025.

### 5. Sample Size
- $414,255$ candidate hourly station records evaluated.

### 6. Methodology
- Developed `src/northair/analytics/aqi_engine.py` applying exact CPCB 2014 breakpoint interpolation tables and 16h/24h rolling sufficiency windows.

### 7. Limitations
- Stations lacking particulate telemetry during sensor recalibration cannot produce valid AQI, even if gaseous analyzers ($SO_2, NO_2, CO$) are functioning.

### 8. Reference Artifacts
- Dataset: [`data/processed/analytics/calculated_aqi.parquet`](file:///e:/VIZAX/data/processed/analytics/calculated_aqi.parquet)
- Specifications: [`reports/aqi/aqi_methodology.md`](file:///e:/VIZAX/reports/aqi/aqi_methodology.md), [`reports/aqi/aqi_engine_specification.md`](file:///e:/VIZAX/reports/aqi/aqi_engine_specification.md)

