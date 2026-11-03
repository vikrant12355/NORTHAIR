# NorthAir Intelligence — Rigorous Statistical Analysis & Methodology
**VIZ-A-THON 2026: Mathematical & Empirical Foundation**

---

## 1. Data Dimensions & Aggregation Protocol

The primary analytical dataset consists of **414,255 hourly records** collected across **48 continuous ambient air quality monitoring stations (CAAQMS)** spanning the calendar year 2025 (January 1 – December 31).

### Temporal Autocorrelation & Station-Day Aggregation
Treating repeated hourly measurements from adjacent sensors as independent and identically distributed ($i.i.d.$) samples introduces severe pseudo-replication and artificially deflates standard errors. To preserve statistical defensibility:
* **Hourly Telemetry:** Utilized strictly for diurnal harmonic cycle analysis, rush-hour comparisons, and sensor saturation detection.
* **Daily Station-Day Summaries:** Used for regional comparisons, seasonal ANOVA models, and meteorological regression scatter plots ($N = 12,840$ eligible station-days).

---

## 2. Measurement-Weighted vs. Station-Balanced Regional Summaries

A critical methodological pitfall in environmental spatial analysis is allowing monitoring stations with high data capture or dense municipal clustering (e.g., Delhi with 24 stations) to silently dominate regional averages over rural states with fewer stations (e.g., Chandigarh with 2 stations, Punjab with 8 stations).

NorthAir Intelligence evaluates both aggregation methodologies:

### Formulation:
1. **Measurement-Weighted Regional Mean ($\bar{X}_{\text{meas}}$):**
   $$\bar{X}_{\text{meas}} = \frac{1}{\sum_{s=1}^{S} N_s} \sum_{s=1}^{S} \sum_{i=1}^{N_s} x_{s,i}$$
   *(Sensitive to per-station missingness and municipal station clustering).*

2. **Station-Balanced Regional Mean ($\bar{X}_{\text{bal}}$):**
   $$\bar{X}_{\text{bal}} = \frac{1}{S} \sum_{s=1}^{S} \left( \frac{1}{N_s} \sum_{i=1}^{N_s} x_{s,i} \right) = \frac{1}{S} \sum_{s=1}^{S} \bar{x}_s$$
   *(Every verified monitoring station contributes equal spatial weight).*

### Empirical Results Comparison (2025 Full-Year PM2.5):

| State / Territory | Active Stations ($S$) | Total Valid Observations ($N$) | Measurement-Weighted Mean ($\mu \pm 95\% \text{ CI}$) | Station-Balanced Mean ($\mu \pm 95\% \text{ CI}$) | Median PM2.5 | 90th Percentile Tail |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Delhi** | 24 | 114,840 | **124.8 ± 0.6 µg/m³** | **122.4 ± 4.2 µg/m³** | 98.4 µg/m³ | 268.0 µg/m³ |
| **Haryana** | 14 | 64,120 | **112.6 ± 0.8 µg/m³** | **108.9 ± 5.6 µg/m³** | 86.2 µg/m³ | 242.5 µg/m³ |
| **Punjab** | 8 | 32,840 | **98.4 ± 1.1 µg/m³** | **101.2 ± 6.8 µg/m³** | 76.8 µg/m³ | 228.4 µg/m³ |
| **Chandigarh** | 2 | 7,117 | **68.2 ± 1.8 µg/m³** | **68.2 ± 3.4 µg/m³** | 54.6 µg/m³ | 148.2 µg/m³ |

*Interpretation:* In Haryana, station-balanced mean (108.9 µg/m³) is 3.7 µg/m³ lower than measurement-weighted mean (112.6 µg/m³) because industrial hotspot stations (Faridabad Sector 11) recorded higher uptime than cleaner background suburban stations. Conversely, in Punjab, station-balanced mean (101.2 µg/m³) is slightly higher due to agricultural stations in the south possessing lower uptime during power curtailments.

---

## 3. Parametric (Pearson) & Non-Parametric (Spearman) Correlation Analysis

To determine how atmospheric variables govern aerosol accumulation, both linear (Pearson $r$) and monotonic rank-order (Spearman $\rho$) correlation coefficients were computed across all 12,840 station-days:

```
               PM2.5    PM10     NO2     SO2      CO   Ozone    Temp      RH    Wind
-------------------------------------------------------------------------------------
PM2.5          1.00    +0.88   +0.62   +0.28   +0.54   +0.12   -0.58   +0.44   -0.42
PM10          +0.88    1.00    +0.58   +0.32   +0.48   +0.18   -0.42   +0.31   -0.34
NO2           +0.62   +0.58    1.00    +0.34   +0.68   -0.08   -0.46   +0.36   -0.38
SO2           +0.28   +0.32   +0.34    1.00   +0.22   +0.04   -0.18   +0.14   -0.12
CO            +0.54   +0.48   +0.68   +0.22    1.00   -0.14   -0.52   +0.41   -0.44
Ozone         +0.12   +0.18   -0.08   +0.04   -0.14    1.00   +0.58   -0.38   +0.18
Temp (°C)     -0.58   -0.42   -0.46   -0.18   -0.52   +0.58    1.00   -0.62   +0.38
RH (%)        +0.44   +0.31   +0.36   +0.14   +0.41   -0.38   -0.62    1.00   -0.32
Wind (m/s)    -0.42   -0.34   -0.38   -0.12   -0.44   +0.18   +0.38   -0.32    1.00
-------------------------------------------------------------------------------------
All reported correlations |r| > 0.10 have p < 0.0001
```

### Statistical Observations:
1. **$PM_{2.5}$ vs. Temperature ($r = -0.58, \rho = -0.62$):** Strongest individual meteorological predictor. Cold winter temperatures correlate with reduced boundary layer heights and thermal inversion capping.
2. **$PM_{2.5}$ vs. Relative Humidity ($r = +0.44, \rho = +0.48$):** High moisture accelerates deliquescence and aqueous-phase nitrate/sulfate secondary aerosol conversion.
3. **$PM_{2.5}$ vs. Wind Speed ($r = -0.42, \rho = -0.51$):** Non-linear power-law decay ($PM_{2.5} \propto WS^{-0.54}$); wind speeds under 1.5 m/s result in catastrophic aerosol entrapment.
4. **Temperature vs. Ozone ($r = +0.58, \rho = +0.64$):** Photochemical production of $O_3$ accelerates under solar radiation and heat, contrasting with the primary particulate pattern.

---

## 4. Hypothesis Testing & Significance Models

### Test 1: One-Way ANOVA on Seasonal Regime Shifts
* **Null Hypothesis ($H_0$):** Mean daily $PM_{2.5}$ concentrations across Winter, Pre-Monsoon, Monsoon, and Post-Monsoon are statistically identical.
* **Alternative Hypothesis ($H_1$):** At least one seasonal regime has a significantly different mean particulate loading.
* **Calculated Values:**
  * Winter Mean: **184.2 µg/m³** ($\pm 42.1$)
  * Post-Monsoon Mean: **168.9 µg/m³** ($\pm 58.4$)
  * Pre-Monsoon Mean: **92.4 µg/m³** ($\pm 28.6$)
  * Monsoon Mean: **42.6 µg/m³** ($\pm 18.2$)
  * Degrees of Freedom: Between groups $k-1 = 3$, Within groups $N-k = 12,836$.
  * **$F$-Statistic = 842.64**
  * **$p$-Value < 1.0 × 10⁻¹⁵** (Reject $H_0$ with overwhelming statistical significance).

### Test 2: Commute Window Paired Analysis (Morning vs. Evening)
* **Null Hypothesis ($H_0$):** Commuter exposure between Morning (06:00–09:59 IST) and Evening (16:00–19:59 IST) is equivalent.
* **Calculated Values:**
  * Morning Peak Mean: **164.2 µg/m³**
  * Evening Peak Mean: **142.8 µg/m³**
  * Paired Student's $t$-statistic = **28.4**
  * Two-tailed $p$-value < 1.0 × 10⁻¹² (Reject $H_0$). Morning rush coincides with low nocturnal mixing height before solar breakup, producing significantly higher commuter particulate exposure than evening rush.

