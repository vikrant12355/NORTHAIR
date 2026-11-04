# NorthAir Intelligence — Phase 2 Executive Report
**VIZ-A-THON 2026: Data Intelligence, Station Reconciliation & Empirical EDA**
**Author**: NorthAir Senior Data Engineering & Scientific Research Team
**Date**: November 2026

---

## 1. Phase 2 Overview & Mandate

Phase 1 established the technical foundation of NorthAir Intelligence (data loading with UTF-8 BOM resolution, UTC-to-IST timestamp conversion, 24-hour historical AQI reshaping, and 13 hermetic unit tests).

**Phase 2** elevates the platform from pure data processing into an empirical environmental intelligence system. The core mandate was to:
1. **Resolve the Station Identity Crisis**: Unpack the 42,257 duplicate `['Station ID', 'Date']` historical pairs and establish a canonical crosswalk.
2. **Execute Deep Audits**: Quantify spatial-temporal coverage, sensor saturation thresholds, and barometric transducer drift.
3. **Analyze Multi-Scale Dynamics**: Perform spatio-temporal, diurnal (IST), meteorological, and longitudinal historical analyses.
4. **Detect Air Pollution Hotspots**: Identify persistent and acute regional pollution epicenters using multi-criteria ranking.
5. **Implement the Official CPCB NAQI Engine**: Develop a verified calculation engine strictly adhering to the 2014 CPCB breakpoint methodology.
6. **Produce 10 Standardized Analytical Deliverables**: Export all analytical tables to `data/processed/analytics/`.

---

## 2. Station Identity Reconciliation Findings

### The Structural Problem
The historical archive (`aqi_history_2017_2023.csv`) contained **42,257 duplicate `['Station ID', 'Date']` entries** despite having zero exact duplicate rows. Our forensic audit discovered that this was not caused by duplicate sensor reads, but by **source-data compiler identifier multiplexing across four specific Station IDs**:

| Mislabeled Station ID | City / State in Raw File | Distinct Names in History | Root Cause & Canonical Resolution |
|---|---|:---:|---|
| `site_5582` | Chandigarh | 3 | Grouped all 3 Chandigarh stations (`site_5491`, `site_5127`, `site_5582`). Disambiguated via Station Name. |
| `site_5341` | Faridabad, Haryana | 4 | Grouped all 4 Faridabad stations (`site_5340`, `site_5342`, `site_5341`, `site_263`). Disambiguated via Station Name. |
| `site_5344` | Gurugram, Haryana | 4 | Grouped all 4 Gurugram stations (`site_5025`, `site_5345`, `site_5344`, `site_146`). Disambiguated via Station Name. |
| `site_5046` | Yamuna Nagar, Haryana | **40** | **Severe Multiplexing**: Grouped 3 Haryana stations (`site_5046` Yamuna Nagar, `site_5045` Bahadurgarh, `site_5050` Palwal) alongside **37 out-of-region stations** from Rajasthan, UP, Bihar, MP, Maharashtra, Karnataka, and Tamil Nadu. |

### Reconciliation Crosswalk (`reports/data_quality/station_identity_crosswalk.csv`)
- **`EXACT_MATCH` (31 combinations)**: 1:1 match with canonical `stations.csv`.
- **`VERIFIED_MATCH` (10 combinations)**: North Indian stations recovered from multiplexed IDs (`site_5491`, `site_5127`, `site_5340`, `site_5342`, `site_263`, `site_5025`, `site_5345`, `site_146`, `site_5045`, `site_5050`).
- **`UNRESOLVED` (37 combinations)**: Non-target stations outside North India ($33,724$ historical day records) safely isolated from North Indian analytics.
- **Truly Absent Stations (7 stations)**: All 6 Delhi DPCC stations (`site_1420`, `site_1422`, `site_1426`, `site_1429`, `site_1431`, `site_1434`) and 1 Panchgaon station (`site_6011`) were established post-2023.

---

## 3. Data Coverage & Network Completeness

### 2025 Hourly Dataset
- **Total Records**: 414,255 hourly rows across 48 stations.
- **Unique Calendar Timestamps**: 8,760 hours (January 1, 2025 00:00:00 to December 31, 2025 23:00:00 UTC).
- **Duplicate Station-Timestamps**: Exactly **0**.
- **Network Completeness**: **$98.52\%$** (414,255 recorded vs. 420,480 theoretical station-hours).

| State / UT | Station Count | Recorded Hours | Expected Hours | Completeness % |
|---|:---:|:---:|:---:|:---:|
| **Chandigarh** | 3 | 25,972 | 26,280 | **98.83%** |
| **Delhi** | 6 | 51,962 | 52,560 | **98.86%** |
| **Haryana** | 31 | 267,314 | 271,560 | **98.44%** |
| **Punjab** | 8 | 69,007 | 70,080 | **98.47%** |

### Historical Dataset (2017–2023)
- **Total Historical Days**: 102,744 ($2,465,856$ hourly AQI observations).
- **Verified North Indian Records**: 69,020 station-days ($1,656,480$ hourly observations; $1,538,011$ valid AQI values).
- **Out-of-Region Excluded Records**: 33,724 station-days ($753,578$ valid AQI values from external states isolated).

---

## 4. Empirical Data Quality Decisions

| Parameter / Phenomenon | Empirical Observation | Scientific Impact | Enforced Platform Decision |
|---|---|---|---|
| **$PM_{2.5}$ Saturation** | Values clip at exactly $999.99 \, \mu\text{g/m}^3$ | BAM/optical counter measurement ceiling | **PRESERVE + FLAG**: Added `Flag_PM25_Censored`. Never truncate or impute; model as right-censored. |
| **$PM_{10}$ Saturation** | Values clip at exactly $1000.00 \, \mu\text{g/m}^3$ | Analyzer full-scale limit | **PRESERVE + FLAG**: Added `Flag_PM10_Censored`. |
| **$CO$ Saturation** | Values cap at $10.00 \, \text{mg/m}^3$ ($6,028$ obs) | NDIR detector output saturation | **PRESERVE + FLAG**: Added `Flag_CO_Censored`. |
| **Barometric Pressure** | Up to $1069.30 \, \text{mmHg}$ (~1425 hPa); 81.34% missing | Transducer calibration offset ($>800 \, \text{mmHg}$ unphysical) | **EXCLUDE FROM PRIMARY WEATHER ML**: Flagged via `Flag_BP_Suspect`. Retained for auditability. |
| **Vertical Wind Speed** | $5,950$ negative readings (down to $-4.10 \, \text{m/s}$) | Negative velocity represents atmospheric downdraft/subsidence | **PRESERVE AS VALID**: Flagged via `Flag_VWS_Negative`. Inversion association documented without asserting strict causation. |
| **Missing Readings** | Various parameter dropouts (up to 98% in VWS) | Sensor maintenance/telemetry loss | **STRICT BAN ON ZERO-IMPUTATION**: All missing values preserved as `NaN` to avoid skewing baseline statistics. |

---

## 5. Spatio-Temporal Analysis Findings (2025)

### Regional Pollution Hierarchy

| State / UT | Station Count | Mean $PM_{2.5}$ ($\mu\text{g/m}^3$) | Median $PM_{2.5}$ | 90th %ile $PM_{2.5}$ | Exceedance $>60 \, \mu\text{g/m}^3$ (%) | Mean $PM_{10}$ ($\mu\text{g/m}^3$) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Delhi** | 6 | **98.49** | **70.00** | **232.00** | **56.44%** | **225.14** |
| **Haryana** | 31 | **94.75** | **73.00** | **206.00** | **64.99%** | **165.79** |
| **Chandigarh** | 3 | **49.44** | **39.00** | **104.00** | **34.08%** | **92.72** |
| **Punjab** | 8 | **46.88** | **37.00** | **99.00** | **25.19%** | **95.78** |

### Seasonal Regime Shifts
- **Monsoon Baseline (July–August)**: Network-wide mean $PM_{2.5}$ is **$25.43\text{--}25.89 \, \mu\text{g/m}^3$** (100% compliant with CPCB standards).
- **Post-Monsoon / Winter Surge (November–December)**: Network-wide mean $PM_{2.5}$ surges to **$125.58\text{--}128.74 \, \mu\text{g/m}^3$** (**$>5\times$ increase**), driven by shallow boundary layer heights, low wind ventilation, and agricultural burning emissions.

---

## 6. Diurnal Cycle Analysis (Indian Standard Time)

Pollution exhibits a recurring bimodal diurnal cycle across North India:
1. **Afternoon Trough (13:00–16:00 IST)**: Network median $PM_{2.5}$ falls to **$39.00 \, \mu\text{g/m}^3$**, coinciding with peak solar thermal convective mixing and maximum wind speed (mean $2.31 \, \text{m/s}$).
2. **Morning Commute Peak (07:00–09:00 IST)**: Median $PM_{2.5}$ rises to **$70.00 \, \mu\text{g/m}^3$** (79.5% increase).
3. **Late Evening Nocturnal Peak (21:00–23:00 IST)**: Median $PM_{2.5}$ reaches **$71.00 \, \mu\text{g/m}^3$** (82.1% increase), remaining elevated throughout the night due to atmospheric ground-layer compression.

---

## 7. Meteorological & Weather Coupling

| Weather Pair | Sample Size ($N$) | Pearson $r$ | Spearman $\rho$ | Statistical & Physical Interpretation |
|---|:---:|:---:|:---:|---|
| **Temperature vs. $PM_{2.5}$** | 115,569 | **-0.3786** | **-0.4279** | Moderate inverse coupling: cold winter conditions suppress vertical dispersion. |
| **Temperature vs. Ozone ($O_3$)** | 114,282 | **+0.3889** | **+0.4245** | Moderate positive coupling: high temperature accelerates photochemical ozone synthesis. |
| **Wind Speed vs. $PM_{2.5}$** | 189,541 | **-0.0732** | **-0.0831** | Negative ventilation association: low winds ($<1.5\text{ m/s}$) correlate with smog stagnation. |
| **Humidity vs. $PM_{2.5}$** | 173,177 | **+0.0211** | **-0.0894** | Seasonally bifurcated: positive in winter (hygroscopic growth), negative in monsoon. |

---

## 8. Pollution Hotspot Detection (Composite Ranking)

Combining chronic exposure (Annual Mean $PM_{2.5}$, 40%), acute peak severity (90th Percentile $PM_{2.5}$, 30%), and frequency of violation (Exceedance $>60 \, \mu\text{g/m}^3$, 30%), the top 5 most vulnerable pollution epicenters in North India are:

| Rank | Station ID | Station Name | City | State | Mean $PM_{2.5}$ | 90th %ile $PM_{2.5}$ | Exceedance % |
|:---:|---|---|---|---|:---:|:---:|:---:|
| **1** | `site_5045` | Arya Nagar, Bahadurgarh - HSPCB | Bahadurgarh | Haryana | **137.66** | **304.34** | **87.37%** |
| **2** | `site_5041` | Murthal, Sonipat - HSPCB | Sonipat | Haryana | **129.56** | **258.94** | **95.72%** |
| **3** | `site_5044` | Municipal Corporation Office, Dharuhera | Dharuhera | Haryana | **125.80** | **246.20** | **87.74%** |
| **4** | `site_5039` | Sector-2 IMT, Manesar - HSPCB | Manesar | Haryana | **124.62** | **238.47** | **86.44%** |
| **5** | `site_1434` | Wazirpur, Delhi - DPCC | Delhi | Delhi | **123.86** | **282.80** | **62.68%** |

---

## 9. Official CPCB AQI Engine Implementation Status

- **Engine Status**: **VERIFIED & OPERATIONAL** (`src/northair/analytics/aqi_engine.py`).
- **Mathematical Specification**: Exact 2014 CPCB piecewise linear breakpoints implemented for 7 pollutants.
- **Sufficiency Gatekeeping**:
  - Requires 24h rolling average ($\ge 16$ valid hours) for $PM_{2.5}, PM_{10}, NO_2, SO_2, NH_3$.
  - Requires 8h rolling average ($\ge 6$ valid hours) for $CO, O_3$.
  - Requires $\ge 3$ valid sub-indices with mandatory presence of $PM_{2.5}$ or $PM_{10}$.
- **Performance**:
  - Processed 414,255 hourly records in **12.8 seconds**.
  - Generated **222,031 valid official AQI records** (53.60% network time).
  - 192,224 records disqualified as Undetermined due to insufficient co-pollutants.
  - Driving pollutant: **$PM_{2.5}$ in 81.4% of valid hours**, $PM_{10}$ in 16.8%, gaseous pollutants in $<2\%$.
  - Exported to [`data/processed/analytics/calculated_aqi.parquet`](file:///e:/VIZAX/data/processed/analytics/calculated_aqi.parquet) (16.21 MB).

---

## 10. Summary of Generated Phase 2 Artifacts

### A. Analytical Datasets (`data/processed/analytics/`)
1. [`monthly_pollution.parquet`](file:///e:/VIZAX/data/processed/analytics/monthly_pollution.parquet) (14.9 KB)
2. [`state_comparison.parquet`](file:///e:/VIZAX/data/processed/analytics/state_comparison.parquet) (11.6 KB)
3. [`city_comparison.parquet`](file:///e:/VIZAX/data/processed/analytics/city_comparison.parquet) (9.9 KB)
4. [`station_rankings.parquet`](file:///e:/VIZAX/data/processed/analytics/station_rankings.parquet) (29.2 KB)
5. [`hourly_pollution.parquet`](file:///e:/VIZAX/data/processed/analytics/hourly_pollution.parquet) (10.0 KB)
6. [`diurnal_profiles.parquet`](file:///e:/VIZAX/data/processed/analytics/diurnal_profiles.parquet) (13.2 KB)
7. [`weather_correlations.csv`](file:///e:/VIZAX/data/processed/analytics/weather_correlations.csv) (5.4 KB)
8. [`historical_aqi_summary.parquet`](file:///e:/VIZAX/data/processed/analytics/historical_aqi_summary.parquet) (9.5 KB)
9. [`hotspot_rankings.parquet`](file:///e:/VIZAX/data/processed/analytics/hotspot_rankings.parquet) (29.2 KB)
10. [`calculated_aqi.parquet`](file:///e:/VIZAX/data/processed/analytics/calculated_aqi.parquet) (16.21 MB, 222,031 valid AQI rows)

### B. Analytical Reports & Specifications
- [`station_identity_audit.md`](file:///e:/VIZAX/reports/data_quality/station_identity_audit.md)
- [`station_identity_crosswalk.csv`](file:///e:/VIZAX/reports/data_quality/station_identity_crosswalk.csv)
- [`station_identity_conflicts.csv`](file:///e:/VIZAX/reports/data_quality/station_identity_conflicts.csv)
- [`data_coverage_report.md`](file:///e:/VIZAX/reports/data_quality/data_coverage_report.md)
- [`data_quality_decisions.md`](file:///e:/VIZAX/reports/data_quality/data_quality_decisions.md)
- [`hotspot_analysis.md`](file:///e:/VIZAX/reports/hotspot/hotspot_analysis.md)
- [`aqi_methodology.md`](file:///e:/VIZAX/reports/aqi/aqi_methodology.md)
- [`aqi_engine_specification.md`](file:///e:/VIZAX/reports/aqi/aqi_engine_specification.md)
- [`weather_analysis.md`](file:///e:/VIZAX/reports/eda/weather_analysis.md)
- [`historical_aqi_analysis.md`](file:///e:/VIZAX/reports/eda/historical_aqi_analysis.md)
- [`key_discoveries.md`](file:///e:/VIZAX/reports/findings/key_discoveries.md)

### C. Jupyter Notebooks (`notebooks/`)
- [`04_spatiotemporal_analysis.ipynb`](file:///e:/VIZAX/notebooks/04_spatiotemporal_analysis.ipynb)
- [`05_diurnal_cycle_analysis.ipynb`](file:///e:/VIZAX/notebooks/05_diurnal_cycle_analysis.ipynb)
- [`06_weather_pollution_analysis.ipynb`](file:///e:/VIZAX/notebooks/06_weather_pollution_analysis.ipynb)
- [`07_historical_aqi_analysis.ipynb`](file:///e:/VIZAX/notebooks/07_historical_aqi_analysis.ipynb)

---

## 11. Automated Validation Test Results

The testing suite was expanded to 22 hermetic unit and integration tests:

```
tests/test_data_loading.py ....                                          [ 18%]
tests/test_preprocessing.py .....                                        [ 40%]
tests/test_validation.py ....                                            [ 59%]
tests/test_analytics_phase2.py .........                                 [100%]

============================== 22 passed in 11.58s ==============================
```
- Station identity crosswalk & exact token normalization: **PASSED**
- Conflict detection across multiplexed IDs: **PASSED**
- Out-of-region station filtering: **PASSED**
- Meteorological season & diurnal window categorization: **PASSED**
- Sensor saturation ceiling detection: **PASSED**
- Hotspot multi-criteria ranking: **PASSED**
- CPCB sub-index boundary linear interpolation: **PASSED**
- CPCB AQI categorical mapping: **PASSED**
- CPCB sufficiency 3-pollutant gatekeeping: **PASSED**

---

## 12. Recommended Next Development Phase (Phase 3)

With verified data intelligence, canonical station identities, and official CPCB AQI tables established, the NorthAir Intelligence platform is ready for **Phase 3**:
1. **Interactive Analytics Dashboard**: Build a Streamlit or Plotly Dash interface integrating spatial hotspot maps, real-time diurnal curves, and air quality risk warnings.
2. **Predictive Modeling Engine**: Develop machine-learning models (XGBoost / LightGBM / LSTM) to forecast next-day $PM_{2.5}$ and AQI categories using meteorological lag features and seasonal agricultural fire indicators.
3. **Policy & Public Health Simulator**: Simulate the impact of intervention thresholds (e.g. Graded Response Action Plan - GRAP stages) based on verified diurnal and meteorological triggers.

