# NorthAir Intelligence — CPCB AQI Engine Specification
**Software Architecture, Algorithms & Validation Rules**
**Module**: `src/northair/analytics/aqi_engine.py`

---

## 1. Engine Architecture & Module Contract

The CPCB AQI Calculation Engine enforces the official Ministry of Environment & Forests / Central Pollution Control Board standard for continuous ambient monitoring stations.

```
Raw Hourly Telemetry (IST)
          │
          ▼
   Rolling Aggregator
   ├── 24-hour rolling window (min_periods = 16) for PM2.5, PM10, NO2, SO2, NH3
   └── 8-hour rolling window (min_periods = 6) for CO, Ozone
          │
          ▼
   Sub-Index Interpolator
   ├── Breakpoint lookup tables for 7 pollutants
   └── Piecewise linear formula: I_p = I_low + [(I_high - I_low)/(B_high - B_low)] * (C_p - B_low)
          │
          ▼
   Data Sufficiency Gatekeeper
   ├── Count valid sub-indices >= 3
   └── Verify (PM2.5 in available) OR (PM10 in available)
          │
     ┌────┴──────────────┐
     │ Sufficient        │ Insufficient
     ▼                   ▼
AQI = max(Sub-Indices)   AQI = NaN (Undetermined)
Prominent Pollutant = argmax(Sub-Indices)
```

---

## 2. API Contract & Function Specifications

### A. `calculate_sub_index(pollutant: str, concentration: float) -> Optional[float]`
- Maps single rolling-average concentration to its numerical sub-index [0, 500].
- Returns `NaN` if concentration is negative or `NaN`.
- Handles boundary transitions smoothly.

### B. `calculate_rolling_concentrations(df: pd.DataFrame, station_col: str, time_col: str) -> pd.DataFrame`
- Partitions telemetry by station to prevent cross-station bleeding.
- Sorts by timestamp.
- Applies `rolling(window=24, min_periods=16).mean()` to 24h pollutants.
- Applies `rolling(window=8, min_periods=6).mean()` to 8h pollutants.

### C. `compute_official_aqi(rolling_df: pd.DataFrame) -> pd.DataFrame`
- Computes 7 sub-indices for every row:
  - `SubIndex_PM25`, `SubIndex_PM10`, `SubIndex_NO2`, `SubIndex_SO2`, `SubIndex_NH3`, `SubIndex_CO`, `SubIndex_Ozone`
- Computes `Valid_SubIndex_Count` = number of non-null sub-indices.
- Computes `Particulate_Present` = (`SubIndex_PM25.notna()` | `SubIndex_PM10.notna()`).
- Applies sufficiency condition:
  ```python
  condition = (Valid_SubIndex_Count >= 3) & Particulate_Present
  AQI = np.where(condition, max_sub_index, np.nan)
  ```
- Assigns `Prominent_Pollutant` and `AQI_Category` (`Good`, `Satisfactory`, `Moderate`, `Poor`, `Very Poor`, `Severe`).

---

## 3. Boundary & Unit Test Matrix

| Test ID | Test Scenario | Input Concentration | Expected Sub-Index / Result |
|---|---|---|---|
| `TEST-BP-01` | PM2.5 at Good ceiling | 30.0 µg/m³ | Exactly 50.0 |
| `TEST-BP-02` | PM2.5 at Satisfactory ceiling | 60.0 µg/m³ | Exactly 100.0 |
| `TEST-BP-03` | PM2.5 in Moderate bracket | 75.0 µg/m³ | 150.0 ($100 + \frac{100}{30} \times 15$) |
| `TEST-BP-04` | PM10 at Good ceiling | 50.0 µg/m³ | Exactly 50.0 |
| `TEST-BP-05` | CO at Moderate ceiling | 10.0 mg/m³ | Exactly 200.0 |
| `TEST-SUFF-01`| Sufficient: PM2.5 + PM10 + NO2 | Available | Valid AQI calculated |
| `TEST-SUFF-02`| Insufficient: Only PM2.5 + NO2 (2 pollutants) | Available | AQI = `NaN` |
| `TEST-SUFF-03`| Insufficient: NO2 + SO2 + CO (3 pollutants, NO PM) | Available | AQI = `NaN` (Particulate rule violated) |
| `TEST-SUFF-04`| Insufficient: Window < 16 hours for 24h avg | 10 hours valid | Rolling avg = `NaN`, AQI = `NaN` |
