# NorthAir Intelligence — Key Data Quality Findings & Limitations

This document formalizes empirical observations, structural inconsistencies, and sensor artifacts identified during technical audit.

## 1. Station ID Multiplexing in Historical AQI (`aqi_history_2017_2023.csv`)

- **Symptom**: `aqi_history_2017_2023.csv` contains 42,257 duplicate `['Station ID', 'Date']` entries despite having 0 exact duplicate rows.
- **Root Cause**: Specific station IDs have multiple distinct Station Names and State/City metadata attached across different rows.
  - For example, `site_5046` (identified as *Gobind Pura, Yamuna Nagar - HSPCB* in `stations.csv`) is associated with **40 different station names** in the historical file, including stations in Rajasthan (Adarsh Nagar Jaipur) and UP (Nehru Nagar Kanpur).
  - Similar multiplexing exists for `site_5341` (4 names), `site_5344` (4 names), and `site_5582` (3 names).
- **Analytical Recommendation**: Analysts joining historical AQI data must disambiguate records by both `Station ID` and `Station Name`, or isolate the canonical station matching `stations.csv`.

## 2. Sensor Saturation & Upper Clipping Thresholds

- **PM2.5**: Upper bound reaches exactly `999.99 µg/m³`, representing the optical/BAM instrument hard saturation limit.
- **PM10**: Upper bound reaches exactly `1000.00 µg/m³`, representing the analyzer's upper measurement limit.
- **CO**: Upper bound is capped at `10.00 mg/m³` in 6,028 recorded observations.
- **Analytical Recommendation**: Models predicting extreme peak events should recognize these values as right-censored rather than absolute measurements.

## 3. Barometric Pressure (BP) Sensor Anomalies

- **Symptom**: `BP (mmHg)` ranges up to `1069.30 mmHg` (~1425 hPa).
- **Impact**: Highest recorded barometric pressure on Earth is ~815 mmHg (1085 hPa) in Siberia. Normal plain atmospheric pressure across Punjab/Haryana is 740–765 mmHg. Readings > 800 mmHg represent uncalibrated transducer offsets.
- **Missingness**: BP has 81.34% missing values across the 2025 dataset.

## 4. Vertical Wind Speed (VWS) Sign Conventions

- **Symptom**: `VWS (m/s)` contains 5,950 negative values (minimum -4.10 m/s).
- **Scientific Context**: In atmospheric science, vertical wind velocity follows the Cartesian z-axis where positive represents updraft and negative represents subsidence/downdraft. These are physically valid and indicate thermal inversions.

## 5. Coverage Disparity Between Datasets

- All 48 stations in `stations.csv` are present in `air_quality_hourly_2025.csv` (100% station match).
- Only 31 stations are present in `aqi_history_2017_2023.csv`.
- 17 stations have no historical record prior to 2024, representing newer CAAQMS network expansion.
