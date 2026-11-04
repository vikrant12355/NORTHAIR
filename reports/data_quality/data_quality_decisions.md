# NorthAir Intelligence — Data Quality Control Decisions

**VIZ-A-THON 2026 — Phase 2: Scientific & Methodological Standards**

This document formalizes empirical quality-control decisions, sensor limits, and analytical guardrails.

## 1. Sensor Saturation & Right-Censoring Policy

### PM2.5 Saturation Ceiling
- **Threshold**: `>= 999.00 µg/m³ (Instrument max 999.99)`
- **Observations at Ceiling**: **11** (0.005% of valid observations)
- **Affected Stations**: 1 stations
- **Peak Months**: ['July', 'June']
- **Decision**: **PRESERVE VALUE + ADD FLAG (`Flag_PM25_Censored`)**. Do not truncate, delete, or treat as unbounded absolute maxima. Models should account for right-censoring.

### PM10 Saturation Ceiling
- **Threshold**: `>= 999.90 µg/m³ (Instrument max 1000.00)`
- **Observations at Ceiling**: **2** (0.0009% of valid observations)
- **Affected Stations**: 2 stations
- **Peak Months**: ['October']
- **Decision**: **PRESERVE VALUE + ADD FLAG (`Flag_PM10_Censored`)**. Do not truncate, delete, or treat as unbounded absolute maxima. Models should account for right-censoring.

### CO Saturation Ceiling
- **Threshold**: `>= 10.00 mg/m³`
- **Observations at Ceiling**: **10** (0.0048% of valid observations)
- **Affected Stations**: 1 stations
- **Peak Months**: ['September']
- **Decision**: **PRESERVE VALUE + ADD FLAG (`Flag_CO_Censored`)**. Do not truncate, delete, or treat as unbounded absolute maxima. Models should account for right-censoring.

## 2. Barometric Pressure (BP) Treatment

- **Missingness**: **81.34%** missing across network.
- **Range**: Min = `700.0 mmHg`, Max = `1069.3 mmHg`.
- **Stations with BP > 800 mmHg**: 10 stations.
- **Decision**: **EXCLUDE FROM PRIMARY WEATHER-AIR QUALITY CORRELATION**. Due to severe missingness and transducer offset (>800 mmHg exceeds standard surface barometric bounds), BP is preserved with `Flag_BP_Suspect` but excluded from primary meteorological modeling.

## 3. Vertical Wind Speed (VWS) Sign Convention & Interpretation

- **Valid Observations**: 7,035 (98.30% missing across network, only available at select meteorological stations).
- **Negative Observations**: **5,950** (84.58% of valid).
- **Range**: Min = `-4.1 m/s`, Median = `-0.06 m/s`, Max = `17.28 m/s`.
- **Decision**: **PRESERVE AS METEOROLOGICALLY VALID**. Negative VWS indicates downward subsidence in sonic anemometer coordinates. We report correlations with PM2.5/PM10 as observational evidence without claiming definitive causation.

## 4. Summary Table of Quality-Control Rules

| Variable | Observed Condition | Quality Action | Implementation Flag |
|---|---|---|---|
| $PM_{2.5}$ | $\ge 999.0 \,\mu\text{g/m}^3$ | Preserve value, flag right-censoring | `Flag_PM25_Censored` |
| $PM_{10}$ | $\ge 999.9 \,\mu\text{g/m}^3$ | Preserve value, flag right-censoring | `Flag_PM10_Censored` |
| $CO$ | $\ge 10.0 \,\text{mg/m}^3$ | Preserve value, flag right-censoring | `Flag_CO_Censored` |
| $BP$ | $> 800 \,\text{mmHg}$ or $< 650 \,\text{mmHg}$ | Flag suspect calibration; exclude from primary ML | `Flag_BP_Suspect` |
| $VWS$ | $< 0.0 \,\text{m/s}$ | Retain as valid downward draft | `Flag_VWS_Negative` |
| Missing Values | Telemetry dropouts / maintenance | Keep as `NaN`, strictly ban zero-imputation | `notna()` masking |
| Out-of-Region Historical | 37 non-target stations under site_5046 | Filter out of North India historical analysis | `Mapping Status == 'UNRESOLVED'` |