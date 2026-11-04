# NorthAir Intelligence — Data Quality Report

**VIZ-A-THON 2026 — Air Quality in North India**

Generated across 48 CPCB CAAQM stations across Chandigarh, Punjab, Haryana, and Delhi.

## 1. Dataset Dimensions & Duplicate Audit

| Dataset | Rows | Columns | Exact Duplicates | Key Duplicates |
|---|---|---|---|---|
| `stations.csv` | 48 | 4 | 0 | 0 (Station ID) |
| `air_quality_hourly_2025.csv` | 414,255 | 28 | 0 | 0 (Station + Timestamp) |
| `aqi_history_2017_2023.csv` | 102,744 | 29 | 0 | **42,257** (Station + Date) |

## 2. Station ID Referential Integrity

- **Unique stations in `stations.csv`**: 48
- **Unique stations in `air_quality_hourly_2025.csv`**: 48
- **Unique stations in `aqi_history_2017_2023.csv`**: 31
- **Stations in metadata absent from 2025 measurements**: 0 (100% matched)
- **Stations in metadata absent from historical data**: 17 stations (newer stations commissioned post-2023)
- **Stations in history with multiple distinct station names**: 4 stations (critical data quality finding, e.g. `site_5046` contains 40 different regional station names in history).

### State-wise Station Distribution:
- **Haryana**: 31 stations
- **Punjab**: 8 stations
- **Delhi**: 6 stations
- **Chandigarh**: 3 stations

## 3. Timestamp & Temporal Coverage

- **2025 Timestamp Range (UTC)**: `2025-01-01 00:00:00` to `2025-12-31 23:00:00`
- **Invalid Timestamps**: 0
- **Expected Station-Hours in 2025**: 48 stations × 8,760 hours = **420,480**
- **Actual Recorded Station-Hours**: **414,255** (6,225 station-hours unrecorded across the network)
- **Average Network Temporal Coverage**: 98.52%

- **Historical Date Range**: `2017-01-01` to `2023-12-31`
- **Invalid Historical Dates**: 0

## 4. Missing Value Analysis (2025 Hourly Dataset)

| Column | Missing Rows | Missing % | Status |
|---|---|---|---|
| `VWS (m/s)` | 407,220 | 98.30% | High (>50%) |
| `Xylene (µg/m³)` | 355,132 | 85.73% | High (>50%) |
| `BP (mmHg)` | 336,968 | 81.34% | High (>50%) |
| `AT (°C)` | 295,005 | 71.21% | High (>50%) |
| `Eth-Benzene (µg/m³)` | 293,973 | 70.96% | High (>50%) |
| `MP-Xylene (µg/m³)` | 293,299 | 70.80% | High (>50%) |
| `SR (W/mt2)` | 243,503 | 58.78% | High (>50%) |
| `RH (%)` | 234,211 | 56.54% | High (>50%) |
| `RF (mm)` | 233,377 | 56.34% | High (>50%) |
| `NH3 (µg/m³)` | 228,389 | 55.13% | High (>50%) |
| `Benzene (µg/m³)` | 222,076 | 53.61% | High (>50%) |
| `Toluene (µg/m³)` | 218,192 | 52.67% | High (>50%) |
| `SO2 (µg/m³)` | 217,464 | 52.50% | High (>50%) |
| `WS (m/s)` | 213,801 | 51.61% | High (>50%) |
| `WD (deg)` | 213,618 | 51.57% | High (>50%) |
| `CO (mg/m³)` | 207,162 | 50.01% | High (>50%) |
| `Ozone (µg/m³)` | 205,944 | 49.71% | Moderate (10-50%) |
| `NO (µg/m³)` | 200,007 | 48.28% | Moderate (10-50%) |
| `PM10 (µg/m³)` | 199,380 | 48.13% | Moderate (10-50%) |
| `NO2 (µg/m³)` | 198,989 | 48.04% | Moderate (10-50%) |
| `PM2.5 (µg/m³)` | 195,338 | 47.15% | Moderate (10-50%) |
| `NOx (ppb)` | 194,478 | 46.95% | Moderate (10-50%) |
| `TOT-RF (mm)` | 20,055 | 4.84% | Low (<10%) |
| `Timestamp` | 0 | 0.00% | Low (<10%) |
| `Station ID` | 0 | 0.00% | Low (<10%) |
| `State` | 0 | 0.00% | Low (<10%) |
| `City` | 0 | 0.00% | Low (<10%) |
| `Station Name` | 0 | 0.00% | Low (<10%) |

## 5. Statistical Distributions & Anomaly Flags (2025 Data)

| Variable | Count | Mean | Median | Std | Min | 25% | 75% | 90% | Max | Flags |
|---|---|---|---|---|---|---|---|---|---|---|
| `PM2.5 (µg/m³)` | 218,917 | 78.6674 | 58.0 | 74.8745 | 0.01 | 31.72 | 97.21 | 161.92 | 999.99 | Max value 999.99 indicates potential sensor saturation/clipping at 999.0 |
| `PM10 (µg/m³)` | 214,875 | 151.8767 | 121.84 | 119.0197 | 0.06 | 70.105 | 195.265 | 299.39 | 1000.0 | Max value 1000.0 indicates potential sensor saturation/clipping at 1000.0 |
| `NO (µg/m³)` | 214,248 | 17.4649 | 8.91 | 33.7689 | 0.01 | 5.62 | 16.1 | 33.5 | 496.8 | Max value 496.8 indicates potential sensor saturation/clipping at 490.0 |
| `NO2 (µg/m³)` | 215,266 | 28.2025 | 21.08 | 24.975 | 0.01 | 14.74 | 32.1 | 56.5 | 497.13 | Max value 497.13 indicates potential sensor saturation/clipping at 490.0 |
| `NOx (ppb)` | 219,777 | 33.1092 | 25.31 | 35.2628 | 0.0 | 16.65 | 37.41 | 54.5 | 499.4 | Max value 499.4 indicates potential sensor saturation/clipping at 499.0 |
| `NH3 (µg/m³)` | 185,866 | 38.5328 | 29.49 | 36.1104 | 0.02 | 21.5 | 46.0 | 67.2 | 499.68 | Max value 499.68 indicates potential sensor saturation/clipping at 499.0 |
| `SO2 (µg/m³)` | 196,791 | 10.7579 | 8.65 | 8.9739 | 0.01 | 5.6 | 13.27 | 20.1 | 198.22 | Max value 198.22 indicates potential sensor saturation/clipping at 195.0 |
| `CO (mg/m³)` | 207,093 | 1.0574 | 0.9 | 0.9065 | 0.0 | 0.53 | 1.27 | 1.91 | 10.0 | Max value 10.0 indicates potential sensor saturation/clipping at 10.0 |
| `Ozone (µg/m³)` | 208,311 | 36.25 | 26.6 | 33.8428 | 0.01 | 14.89 | 46.89 | 75.8 | 495.4 | Max value 495.4 indicates potential sensor saturation/clipping at 495.0 |
| `Benzene (µg/m³)` | 192,179 | 2.6141 | 1.83 | 3.6069 | 0.0 | 0.7 | 3.1 | 6.9 | 232.1 | None |
| `Toluene (µg/m³)` | 196,063 | 12.4061 | 3.5 | 37.4579 | 0.0 | 1.3 | 9.38 | 23.48 | 499.6 | None |
| `Xylene (µg/m³)` | 59,123 | 2.4115 | 1.8 | 2.4206 | 0.0 | 0.7 | 3.15 | 5.44 | 31.0 | None |
| `Eth-Benzene (µg/m³)` | 120,282 | 3.1653 | 2.05 | 3.4216 | 0.01 | 1.3 | 4.14 | 6.49 | 128.58 | None |
| `MP-Xylene (µg/m³)` | 120,956 | 3.2631 | 2.46 | 3.1267 | 0.01 | 1.09 | 4.86 | 6.53 | 74.35 | None |
| `AT (°C)` | 119,250 | 23.5143 | 24.69 | 7.5445 | 0.16 | 17.13 | 29.4 | 32.4 | 48.35 | None |
| `RH (%)` | 180,044 | 66.648 | 67.06 | 23.0483 | 0.11 | 49.0 | 87.46 | 97.97 | 100.0 | None |
| `WS (m/s)` | 200,454 | 1.2904 | 0.9 | 1.4792 | 0.01 | 0.39 | 1.76 | 2.89 | 49.74 | Max value 49.74 exceeds standard physical boundary 40.0 |
| `WD (deg)` | 200,637 | 189.6343 | 188.09 | 101.7535 | 0.01 | 104.0 | 280.45 | 319.71 | 360.0 | None |
| `RF (mm)` | 180,878 | 0.0177 | 0.0 | 0.4328 | 0.0 | 0.0 | 0.0 | 0.0 | 50.0 | None |
| `TOT-RF (mm)` | 394,200 | 0.0081 | 0.0 | 0.2933 | 0.0 | 0.0 | 0.0 | 0.0 | 50.0 | None |
| `SR (W/mt2)` | 170,752 | 143.6865 | 79.0 | 185.2042 | 0.0 | 16.0 | 175.86 | 406.13 | 1502.9 | Max value 1502.9 exceeds standard physical boundary 1400.0 |
| `BP (mmHg)` | 77,287 | 952.0935 | 973.0 | 56.3669 | 700.0 | 946.0 | 983.0 | 989.0 | 1069.3 | Max value 1069.3 exceeds standard physical boundary 800.0 |
| `VWS (m/s)` | 7,035 | -0.0983 | -0.06 | 1.3096 | -4.1 | -0.67 | -0.06 | 0.48 | 17.28 | Contains 5950 negative values (indicates downdraft/subsidence in VWS); Min value -4.1 is below physical boundary 0.0 |

*Note: Flagged records are documented for transparent scientific reporting. No records were deleted or imputed with zero.*