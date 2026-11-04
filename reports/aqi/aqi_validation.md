# NorthAir Intelligence — Official CPCB NAQI Engine Validation Report
**VIZ-A-THON 2026 — Scientific Methodology & Verification Audit**
**Standard Reference**: Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) Guidelines (October 2014)

---

## 1. Scope & Architectural Mandate

The NorthAir CPCB AQI Engine (`src/northair/analytics/aqi_engine.py`) implements the complete statutory National Air Quality Index calculation methodology. This report validates the engine against manual benchmark calculations and verifies strict compliance with CPCB data sufficiency rules.

---

## 2. Core Methodology & Mathematical Formulation

### A. Linear Sub-Index Interpolation
For each pollutant $p$, the sub-index $I_p$ is calculated using piecewise linear interpolation across statutory breakpoint concentrations:

$$I_p = \frac{I_{\text{hi}} - I_{\text{lo}}}{B_{\text{hi}} - B_{\text{lo}}} \cdot (C_p - B_{\text{lo}}) + I_{\text{lo}}$$

Where:
- $C_p$: Measured pollutant concentration.
- $B_{\text{hi}}, B_{\text{lo}}$: Breakpoint range containing $C_p$.
- $I_{\text{hi}}, I_{\text{lo}}$: Corresponding AQI category index range.

### B. Official CPCB Breakpoint Matrix

| AQI Category | Sub-Index Range | PM2.5 (24h, µg/m³) | PM10 (24h, µg/m³) | NO2 (24h, µg/m³) | SO2 (24h, µg/m³) | CO (8h, mg/m³) | Ozone (8h, µg/m³) | NH3 (24h, µg/m³) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Good** | 0 – 50 | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0 – 1.0 | 0 – 50 | 0 – 200 |
| **Satisfactory** | 51 – 100 | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 | 201 – 400 |
| **Moderate** | 101 – 200 | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 | 401 – 800 |
| **Poor** | 201 – 300 | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 | 801 – 1200 |
| **Very Poor** | 301 – 400 | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 | 1201 – 1800 |
| **Severe** | 401 – 500 | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ | 1800+ |

### C. Statutory Data Sufficiency Rules (Gatekeeper)
The engine strictly enforces both statutory CPCB validity rules:
1. **Minimum 3 Pollutants Rule**: At least 3 pollutants must be validly measured at the station-hour.
2. **Particulate Requirement**: At least ONE of the valid pollutants must be a particulate matter indicator (either $\text{PM}_{2.5}$ or $\text{PM}_{10}$).
3. **Overall AQI Rule**: If sufficiency conditions are met:

$$\text{AQI} = \max(I_{PM2.5}, I_{PM10}, I_{NO2}, I_{SO2}, I_{CO}, I_{O3}, I_{NH3})$$

The pollutant attaining the maximum sub-index is designated as the **Prominent Pollutant**.

---

## 3. Manual Calculation Benchmarks & Unit Test Validation

All calculations were cross-validated against manual mathematical benchmarks:

| Case | Test Parameters | Measured Value | Theoretical Expected Sub-Index | Engine Calculated Sub-Index | Status |
|:---:|:---|:---:|:---:|:---:|:---:|
| 1 | PM2.5 Good Boundary | 30.0 µg/m³ | 50.00 | 50.00 | **MATCH (100%)** |
| 2 | PM2.5 Satisfactory Boundary | 60.0 µg/m³ | 100.00 | 100.00 | **MATCH (100%)** |
| 3 | PM2.5 Moderate Midpoint | 75.0 µg/m³ | 150.00 | 150.00 | **MATCH (100%)** |
| 4 | PM10 Moderate Boundary | 250.0 µg/m³ | 200.00 | 200.00 | **MATCH (100%)** |
| 5 | CO Moderate Boundary | 10.0 mg/m³ | 200.00 | 200.00 | **MATCH (100%)** |
| 6 | Gatekeeper: Only 2 Pollutants | PM2.5=45, NO2=50 | NaN (Insufficient) | NaN (Undetermined) | **MATCH (100%)** |
| 7 | Gatekeeper: No Particulate | NO2=50, SO2=30, CO=1.5 | NaN (Insufficient) | NaN (Undetermined) | **MATCH (100%)** |

---

## 4. Verification Output
- Engine Implementation: `src/northair/analytics/aqi_engine.py`
- Calculated Output: `data/processed/analytics/calculated_aqi.parquet`
- Unit Test Coverage: `tests/test_analytics_phase2.py` (Functions: `test_cpcb_sub_index_boundary_interpolation`, `test_aqi_category_mapping`, `test_cpcb_sufficiency_gatekeeper` — all passing).