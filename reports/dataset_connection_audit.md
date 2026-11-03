# NorthAir Intelligence — Dataset Connection Audit

**Project**: NorthAir Intelligence — VIZ-A-THON 2026  
**Auditor**: Senior Data Engineer & Database Architect  
**Engine**: DuckDB v1.2.0 Columnar Query Engine  
**Status**: Verified & Connected  

---

## 1. Primary Processed Datasets

### A. 2025 Ambient Telemetry (`air_quality_2025_ist.parquet`)
* **File Path**: `data/processed/air_quality_2025_ist.parquet`
* **Size**: 8,073,272 bytes (8.07 MB, Snappy compressed)
* **Row Count**: 414,255 records
* **Column Count**: 36 columns
* **Timestamp Format**: Indian Standard Time (`Timestamp_IST`: UTC + 05:30)
* **Monitoring Stations**: 48 accredited CAAQMS nodes across Chandigarh (3), Delhi (6), Haryana (31), and Punjab (8).
* **Date Range**: 2025-01-01 05:30:00 to 2026-01-01 04:30:00 IST (covering the full 8,760 hours of calendar year 2025).
* **Network Completeness**: **98.52%** (414,255 recorded vs. 420,480 theoretical station-hours).
* **Duplicate Rows**: Exactly 0.
* **Actual Schema**:
  1. `Station ID` (VARCHAR)
  2. `State` (VARCHAR)
  3. `City` (VARCHAR)
  4. `Station Name` (VARCHAR)
  5. `Timestamp` (VARCHAR - UTC original)
  6. `PM2.5 (µg/m³)` (DOUBLE)
  7. `PM10 (µg/m³)` (DOUBLE)
  8. `NO (µg/m³)` (DOUBLE)
  9. `NO2 (µg/m³)` (DOUBLE)
  10. `NOx (ppb)` (DOUBLE)
  11. `NH3 (µg/m³)` (DOUBLE)
  12. `SO2 (µg/m³)` (DOUBLE)
  13. `CO (mg/m³)` (DOUBLE)
  14. `Ozone (µg/m³)` (DOUBLE)
  15. `Benzene (µg/m³)` (DOUBLE)
  16. `Toluene (µg/m³)` (DOUBLE)
  17. `Xylene (µg/m³)` (DOUBLE)
  18. `Eth-Benzene (µg/m³)` (DOUBLE)
  19. `MP-Xylene (µg/m³)` (DOUBLE)
  20. `AT (°C)` (DOUBLE)
  21. `RH (%)` (DOUBLE)
  22. `WS (m/s)` (DOUBLE)
  23. `WD (deg)` (DOUBLE)
  24. `RF (mm)` (DOUBLE)
  25. `TOT-RF (mm)` (DOUBLE)
  26. `SR (W/mt2)` (DOUBLE)
  27. `BP (mmHg)` (DOUBLE)
  28. `VWS (m/s)` (DOUBLE)
  29. `Timestamp_IST` (VARCHAR)
  30. `Date` (VARCHAR - YYYY-MM-DD)
  31. `Year` (BIGINT)
  32. `Month` (BIGINT: 1..12)
  33. `Month_Name` (VARCHAR)
  34. `Day` (BIGINT: 1..31)
  35. `Hour` (BIGINT: 0..23)
  36. `Day_of_Week` (VARCHAR)
* **Data Quality Flags Enforced**:
  - `PM2.5 Saturation`: Ceiling preserved at 999.99 µg/m³ (censored BAM analyzer limit).
  - `PM10 Saturation`: Ceiling preserved at 1000.00 µg/m³.
  - `CO Saturation`: Ceiling preserved at 10.00 mg/m³.
  - `Barometric Pressure`: 81.34% missingness and uncalibrated values >800 mmHg isolated from primary regressions.
  - `Vertical Wind Speed`: 5,950 negative observations preserved as downdraft/subsidence physical phenomena.
* **Connection Status**: **CONNECTED** (Verified through DuckDB view `v_air_quality_2025`).

---

### B. Historical AQI Tidy Archive (`aqi_history_long.parquet`)
* **File Path**: `data/processed/aqi_history_long.parquet`
* **Size**: 4,032,309 bytes (4.03 MB, Snappy compressed)
* **Row Count**: 2,465,856 records
* **Column Count**: 7 columns
* **Non-Null Observations**: 2,291,589 valid AQI measurements (7.07% missing).
* **Date Range**: 2017-01-01 to 2023-12-31 (7 full calendar years).
* **Actual Schema**:
  1. `Station ID` (VARCHAR)
  2. `State` (VARCHAR)
  3. `City` (VARCHAR)
  4. `Station Name` (VARCHAR)
  5. `Date` (VARCHAR - YYYY-MM-DD)
  6. `Hour` (BIGINT: 0..23)
  7. `AQI` (DOUBLE)
* **Station Multiplexing Resolution**:
  - The historical archive contains compiler multiplexing on IDs `site_5046`, `site_5341`, `site_5344`, and `site_5582`.
  - Forensic crosswalk (`data/reports/data_quality/station_identity_crosswalk.csv`) resolves 41 North Indian stations and isolates 37 out-of-region multiplexed stations (33,724 day records).
  - Unresolved stations are strictly excluded from regional geographic aggregations.
* **Connection Status**: **CONNECTED** (Verified through DuckDB view `v_aqi_history`).

---

### C. Station Registry & Metadata (`station_metadata.parquet`)
* **File Path**: `data/processed/station_metadata.parquet`
* **Size**: 9,749 bytes (9.75 KB)
* **Row Count**: 48 station records
* **Column Count**: 12 columns
* **Coverage**: Chandigarh (3), Delhi (6), Haryana (31), Punjab (8).
* **Actual Schema**:
  1. `State` (VARCHAR)
  2. `Station ID` (VARCHAR)
  3. `City` (VARCHAR)
  4. `Station Name` (VARCHAR)
  5. `Hours_Recorded_2025` (BIGINT: range 8,561 to 8,760 hours)
  6. `Min_UTC_2025` (VARCHAR)
  7. `Max_UTC_2025` (VARCHAR)
  8. `In_2025_Data` (BOOLEAN: 100% TRUE for all 48 stations)
  9. `Days_Recorded_History` (BIGINT)
  10. `Min_Date_History` (VARCHAR)
  11. `Max_Date_History` (VARCHAR)
  12. `In_Historical_Data` (BOOLEAN: 31 stations TRUE, 17 FALSE)
* **Connection Status**: **CONNECTED** (Verified through DuckDB view `v_station_metadata`).

---

## 2. Derived Analytical Deliverables (`data/processed/analytics/`)

| Dataset File | Rows | Key Columns | Connection Status | Purpose |
|---|---|---|---|---|
| `calculated_aqi.parquet` | 414,255 | 55 cols: SubIndex_*, Calculated_AQI, Prominent_Pollutant, AQI_Category | CONNECTED | CPCB 2014 breakpoint AQI evaluation |
| `hotspot_rankings.parquet` | 48 | PM25_Mean, PM25_P90, Exceed_60_Pct, Composite_Hotspot_Rank | CONNECTED | Hotspot Explorer rankings & severity tiers |
| `diurnal_profiles.parquet` | 384 | State, Season, Hour, Diurnal_Window, PM25_Mean, WS_Mean | CONNECTED | 24h diurnal curve in IST |
| `monthly_pollution.parquet` | 48 | State, Month, Season, PM25_Mean, PM10_Mean, NO2_Mean | CONNECTED | Seasonal Intelligence regime shifts |
| `state_comparison.parquet` | 4 | State, Station_Count, PM25_Mean, PM10_Mean, Exceedance_Rate | CONNECTED | Regional state exposure disparity |
| `city_comparison.parquet` | 24 | City, State, PM25_Mean, PM10_Mean | CONNECTED | Urban cluster comparison |
| `weather_correlations.csv` | 24 | Variable_1, Variable_2, Pearson_R, Spearman_Rho, Interpretation | CONNECTED | Weather Intelligence correlation tables |

---

## 3. Data Integrity & Verification Summary

1. **Parquet Columnar Engine**: Query execution is offloaded to DuckDB in-memory database views. No large Parquet file is loaded entirely into JavaScript memory.
2. **Deterministic Outputs**: All analytical results are derived directly from the verified CPCB datasets without synthetic figure injection.
3. **Temporal Partitioning**: 2025 hourly measurements (IST) and 2017–2023 historical AQI remain completely separate.

