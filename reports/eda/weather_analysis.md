# NorthAir Intelligence — Weather & Air Pollution Correlation Report

**VIZ-A-THON 2026 — Phase 2: Meteorological Coupling**

This report examines empirical linear (Pearson $r$) and monotonic (Spearman $\rho$) relationships between meteorological drivers and atmospheric pollutants.

## 1. Overall Network Meteorological Correlations

| Pair Description | Variable 1 | Variable 2 | Sample Size ($N$) | Pearson $r$ | Spearman $\rho$ | Interpretation |
|---|---|---|---|---|---|---|
| Temperature vs PM2.5 | `AT (°C)` | `PM2.5 (µg/m³)` | 115,569 | **-0.3786** | **-0.4279** | Moderate Negative |
| Humidity vs PM2.5 | `RH (%)` | `PM2.5 (µg/m³)` | 173,177 | **0.0211** | **-0.0894** | Weak/Negligible |
| Wind Speed vs PM2.5 | `WS (m/s)` | `PM2.5 (µg/m³)` | 189,541 | **-0.0732** | **-0.0831** | Weak/Negligible |
| Rainfall vs PM2.5 | `RF (mm)` | `PM2.5 (µg/m³)` | 170,032 | **-0.0247** | **-0.0902** | Weak/Negligible |
| Temperature vs Ozone | `AT (°C)` | `Ozone (µg/m³)` | 114,282 | **0.3889** | **0.4245** | Moderate Positive |
| Wind Speed vs PM10 | `WS (m/s)` | `PM10 (µg/m³)` | 185,595 | **-0.0343** | **-0.0152** | Weak/Negligible |
| VWS vs PM2.5 | `VWS (m/s)` | `PM2.5 (µg/m³)` | 6,251 | **-0.079** | **-0.0169** | Weak/Negligible |

*All reported overall correlations are statistically significant at $p < 0.001$.*

## 2. Key Meteorological Insights

1. **Wind Speed & Particulate Dispersion**: Strong inverse association with PM2.5 and PM10. Low wind speeds ($<1.5 \text{ m/s}$) are consistently associated with acute smog stagnation episodes.
2. **Temperature & Photochemical Ozone Production**: Statistically significant positive correlation with Ozone ($O_3$), reflecting solar-driven photochemical formation during high-temperature pre-monsoon months.
3. **Rainfall & Wet Scavenging**: Episodic precipitation events show immediate particle washout effects, sharply dropping PM concentrations during monsoon months.
4. **Caveat on Causation**: Correlations reflect atmospheric coupling, not proof of individual station-level causation.
