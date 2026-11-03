# Central Pollution Control Board (CPCB) — National Air Quality Index (NAQI) Methodology
**NorthAir Intelligence Technical Reference**
**Source**: Central Pollution Control Board, Ministry of Environment, Forest & Climate Change, Government of India (2014)

---

## 1. Overview of India's National Air Quality Index

India's National Air Quality Index (NAQI) transforms complex, multi-pollutant atmospheric measurements into a single non-dimensional index ranging from 0 to 500+. The index operates on a piecewise linear segmented scheme with six designated public health categories:

| AQI Category | Numerical Range | Health Implication Description |
|---|:---:|---|
| **Good** | 0 – 50 | Minimal health impact. |
| **Satisfactory** | 51 – 100 | Minor breathing discomfort to sensitive people. |
| **Moderate** | 101 – 200 | Breathing discomfort to people with lungs, asthma, and heart diseases. |
| **Poor** | 201 – 300 | Breathing discomfort to most people on prolonged exposure. |
| **Very Poor** | 301 – 400 | Respiratory illness on prolonged exposure. |
| **Severe** | 401 – 500+ | Affects healthy people and seriously impacts those with existing diseases. |

---

## 2. Pollutants & Averaging Periods

The CPCB methodology designates eight primary pollutants, of which seven are recorded in continuous ambient monitoring networks and provided in the NorthAir 2025 dataset:

| Pollutant | Chemical Formula | Averaging Period | Unit | Primary Health & Physiological Pathway |
|---|:---:|:---:|:---:|---|
| **Fine Particulate Matter** | $PM_{2.5}$ | **24 hours** (rolling) | $\mu\text{g/m}^3$ | Alveolar penetration, systemic cardiovascular inflammation |
| **Coarse Particulate Matter** | $PM_{10}$ | **24 hours** (rolling) | $\mu\text{g/m}^3$ | Thoracic deposition, upper airway irritation |
| **Nitrogen Dioxide** | $NO_2$ | **24 hours** (rolling) | $\mu\text{g/m}^3$ | Bronchoconstriction, airway hyperresponsiveness |
| **Sulphur Dioxide** | $SO_2$ | **24 hours** (rolling) | $\mu\text{g/m}^3$ | Bronchospasm, sensory irritation |
| **Ammonia** | $NH_3$ | **24 hours** (rolling) | $\mu\text{g/m}^3$ | Secondary inorganic aerosol precursor, eye/lung irritation |
| **Carbon Monoxide** | $CO$ | **8 hours** (rolling) | $\text{mg/m}^3$ | Carboxyhemoglobin formation, tissue hypoxia |
| **Ground-Level Ozone** | $O_3$ | **8 hours** (rolling) | $\mu\text{g/m}^3$ | Potent pulmonary oxidant, reduced lung vital capacity |

*(Note: Lead ($Pb$) is measured via 24-hour gravimetric filter collection and is not captured via real-time telemetry).*

---

## 3. Concentration Breakpoints ($B_{low} - B_{high}$)

The official concentration break-points mapping to sub-index ranges ($I_{low} - I_{high}$) are:

| Sub-Index Range ($I_{low} - I_{high}$) | $PM_{2.5}$ (24h) | $PM_{10}$ (24h) | $NO_2$ (24h) | $NH_3$ (24h) | $SO_2$ (24h) | $CO$ (8h, mg/m³) | $O_3$ (8h) |
|---|---|---|---|---|---|---|---|
| **0 – 50 (Good)** | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 200 | 0 – 40 | 0 – 1.0 | 0 – 50 |
| **51 – 100 (Satisfactory)** | 31 – 60 | 51 – 100 | 41 – 80 | 201 – 400 | 41 – 80 | 1.1 – 2.0 | 51 – 100 |
| **101 – 200 (Moderate)** | 61 – 90 | 101 – 250 | 81 – 180 | 401 – 800 | 81 – 380 | 2.1 – 10.0 | 101 – 168 |
| **201 – 300 (Poor)** | 91 – 120 | 251 – 350 | 181 – 280 | 801 – 1200 | 381 – 800 | 10.1 – 17.0 | 169 – 208 |
| **301 – 400 (Very Poor)** | 121 – 250 | 351 – 430 | 281 – 400 | 1201 – 1800 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 |
| **401 – 500 (Severe)** | 250+ | 430+ | 400+ | 1800+ | 1600+ | 34.0+ | 748+ |

---

## 4. Mathematical Sub-Index Interpolation Formula

For a given pollutant concentration $C_p$, the sub-index $I_p$ is calculated via linear interpolation within its enclosing breakpoint segment:

$$I_p = I_{low} + \left[ \frac{I_{high} - I_{low}}{B_{high} - B_{low}} \right] \times (C_p - B_{low})$$

Where:
* $C_p$ = Truncated/rounded concentration of pollutant $p$ (averaged over its required window).
* $B_{high}$ = Breakpoint concentration boundary $\ge C_p$.
* $B_{low}$ = Breakpoint concentration boundary $\le C_p$.
* $I_{high}$ = Sub-index value corresponding to $B_{high}$.
* $I_{low}$ = Sub-index value corresponding to $B_{low}$.

For concentrations exceeding the lower bound of the **Severe** category ($B_{severe}$), the sub-index extrapolates linearly based on the slope of the 401–500 interval, capped or flagged appropriately.

---

## 5. Strict Data Sufficiency & Minimum Requirements

1. **Window Completeness (The CPCB 70% Rule)**:
   - **24-hour averages** ($PM_{2.5}, PM_{10}, NO_2, SO_2, NH_3$) require a minimum of **16 hourly valid readings** within the 24-hour window ($16 / 24 \approx 66.7\%$).
   - **8-hour averages** ($CO, O_3$) require a minimum of **6 hourly valid readings** within the 8-hour window ($6 / 8 = 75.0\%$).
   - If minimum hourly readings are not met, the rolling average is `NaN` and the sub-index cannot be computed.

2. **Final Aggregation Rule (CPCB 3-Pollutant Gate)**:
   - An overall AQI can **only** be declared if:
     1. Valid sub-indices exist for **at least 3 pollutants**.
     2. **At least one** of the available pollutants is particulate matter ($PM_{2.5}$ or $PM_{10}$).
   - If either condition is violated, the official AQI is declared **UNDETERMINED (`NaN`)**.

3. **Max-Operator Principle**:
   When data sufficiency is satisfied:
   $$\text{AQI} = \max\left(I_{PM2.5}, I_{PM10}, I_{NO2}, I_{SO2}, I_{NH3}, I_{CO}, I_{O3}\right)$$
   The pollutant yielding the maximum sub-index is designated as the **Prominent / Driving Pollutant**.
