# NorthAir Intelligence — Key Empirical Discoveries
**VIZ-A-THON 2026: Research Findings**

---

## Finding 1: Transboundary Agricultural Residue Plume Advection & Fine Fraction Surge
* **Research Question:** How does post-monsoon agricultural crop residue burning in Punjab and Haryana influence downwind particulate composition in the Delhi National Capital Region?
* **Numerical Result:** During the late autumn post-monsoon biomass burning window (October 20 – November 25), fine particulate concentrations surging in northern Punjab stations (Amritsar, Jalandhar) lead Delhi NCR peak episodes by 24 to 36 hours. Concurrently, the regional $PM_{2.5} / PM_{10}$ ratio shifts dramatically from a summer crustal dust baseline of **0.42** to a combustion-dominated ratio of **0.78** ($\pm 0.04$, $p < 0.001$).
* **Supporting Chart:** `CHART_05` (State-wise PM2.5 and PM10 Comparison) and `CHART_06` (Monthly PM2.5 Trajectory).
* **Sample Size:** $N = 414,255$ hourly continuous telemetry observations across 48 CAAQMS stations.
* **Analytical Methodology:** Chronological lag correlation analysis combined with fine-to-coarse particulate ratio ($PM_{2.5}/PM_{10}$) tracking stratified by 10-degree wind direction bins (focused along the 315° northwesterly transport vector).
* **Atmospheric Interpretation:** Fine organic carbon (OC) and elemental carbon (EC) aerosols emitted from open field combustion of paddy straw (pusa-44 varieties) are injected into the nocturnal boundary layer. Under steady 15–25 km/h northwesterly winds down the low-friction Indus-Ganges drainage axis, these aerosols undergo rapid secondary nitrate and sulfate nucleation, dramatically amplifying aerosol optical depth and respirable toxicity upon arrival in the Delhi basin.
* **Limitation:** In situ ground-level CAAQMS telemetry cannot directly measure plume vertical injection height; integration with satellite LIDAR (e.g. CALIOP) or satellite fire radiative power (MODIS/VIIRS) is required for 3D boundary-layer flux verification.

---

## Finding 2: Nocturnal Urban Canyon Trapping & Heavy Diesel Freight Resonance
* **Research Question:** Why do urban monitoring stations consistently record acute particulate and gaseous surges between 22:00 and 04:00 IST, outstripping daytime rush hours?
* **Numerical Result:** Surface $NO_2$ and $PM_{2.5}$ exhibit a synchronized nocturnal surge peaking between 23:00 and 03:00 IST, exceeding daytime peak rush-hour concentrations (08:00–09:00 IST) by **+65.2%** (Mean nocturnal $PM_{2.5} = 224.8$ µg/m³ vs Daytime $PM_{2.5} = 136.1$ µg/m³). In arterial freight corridors (Anand Vihar, Bawana), nocturnal hourly means exceed **420 µg/m³**.
* **Supporting Chart:** `CHART_11` (24-Hour Diurnal PM2.5 Profile) and `CHART_14` (Regional Diurnal Comparison).
* **Sample Size:** $N = 138,085$ nocturnal hours across 48 stations in 2025.
* **Analytical Methodology:** Diurnal harmonic decomposition and rush-hour window segmentation comparing Daytime Commute (07:00–10:00 IST) against Nocturnal Freight Transit (22:00–04:00 IST) cross-referenced against ultrasonic Vertical Wind Speed (VWS).
* **Atmospheric Interpretation:** This severe nighttime surge is driven by a fatal resonance between anthropogenic freight scheduling and atmospheric thermodynamics. At 22:00 IST, municipal borders open for >60,000 non-destined commercial diesel freight vehicles. Simultaneously, nocturnal radiational cooling triggers a severe ground-level thermal inversion, compressing the planetary boundary layer from >1,800m to <200m. Diesel exhaust is thus injected directly into an unventilated ground volume with near-zero vertical mixing ($VWS \le 0$ m/s).
* **Limitation:** Traffic count telemetry is currently uncoupled at the individual vehicle classification level; commercial diesel counts are estimated based on toll plaza transponder records.

---

## Finding 3: The Afternoon Planetary Boundary Layer Ventilation Cleanroom Window
* **Research Question:** Across diurnal cycles, what is the optimal window of minimum human aerosol inhalation exposure, and what physical mechanism governs it?
* **Numerical Result:** Across all 48 monitoring stations and all four climatic seasons, a reliable atmospheric decontamination cleanroom window emerges between **13:00 and 16:30 IST**. Ambient $PM_{2.5}$ concentrations decline by an average of **48.6%** ($\pm 5.2\%$) relative to the morning peak (declining from a network morning mean of $168.4$ µg/m³ at 08:30 IST to an afternoon minimum of $86.5$ µg/m³ at 15:00 IST).
* **Supporting Chart:** `CHART_11` (24-Hour PM2.5 Profile) and `CHART_13` (Hour vs Month Heatmap).
* **Sample Size:** $N = 414,255$ hourly observations across 365 calendar days.
* **Analytical Methodology:** Harmonic diurnal boundary tracking, minimum-variance inflection detection, and cross-correlation with horizontal wind speed ($WS$) and solar radiation ($SR$).
* **Atmospheric Interpretation:** Diurnal solar insolation peaks between 12:00 and 14:00 IST, heating the ground surface and driving vigorous convective thermal updrafts ($VWS > 0$). This thermal forcing lifts the planetary boundary layer from 200m to 1,800–2,200m. The effective atmospheric dilution volume expands by 9-fold, dispersing ground-level aerosols upwards despite continued daytime vehicular emissions.
* **Limitation:** While particulate matter ($PM_{2.5}, PM_{10}$) drops by nearly half during this window, photochemical production of ground-level tropospheric ozone ($O_3$) simultaneously peaks ($r = +0.58$ with temperature), creating a physiological trade-off between particulate and oxidant exposure.

---

## Finding 4: Natural Below-Cloud Precipitation Scavenging & Monsoon Washout Dynamics
* **Research Question:** To what quantitative degree does precipitation remove suspended fine and coarse aerosols across Northern India?
* **Numerical Result:** Precipitation events ($\ge 10$ mm/day) reduce ambient $PM_{2.5}$ concentrations by **76.8%** compared to dry baseline periods (Mean dry-day $PM_{2.5} = 138.4$ µg/m³ vs Heavy-rain $PM_{2.5} = 32.1$ µg/m³, two-sample $t = 48.2$, $p < 10^{-15}$). Monsoon season (July–August) registers the lowest annual 24-hour mean concentrations network-wide ($42.6$ µg/m³), achieving statutory NAAQS attainment.
* **Supporting Chart:** `CHART_10` (Seasonal Comparison Boxplot) and `CHART_19` (Rainfall Scavenging Comparison).
* **Sample Size:** $N = 11,420$ precipitation-audited station-days.
* **Analytical Methodology:** Rigorous partitioning isolating verified zero-rainfall days ($RF = 0.0$ mm) from precipitation events ($RF > 0$ mm and $RF \ge 10$ mm), combined with One-Way ANOVA and post-hoc Tukey HSD testing.
* **Atmospheric Interpretation:** Falling raindrops capture suspended particulates through two distinct physical mechanisms: inertial impaction (dominant for coarse $PM_{10}$) and Brownian diffusion / thermo-phoretic capture (dominant for sub-micron $PM_{2.5}$). Furthermore, wet ground surfaces suppress resuspension of mechanical crustal dust.
* **Limitation:** 18.2% of rain gauge telemetry across CAAQMS stations was unrecorded or displayed missing flags; analyses were strictly restricted to stations with co-located operational tipping-bucket rain gauges.

---

## Finding 5: CAAQMS Detector Limit Saturation & Systematic Peak Underestimation
* **Research Question:** Are extreme episodic pollution spikes accurately captured by standard continuous ambient monitoring instrumentation?
* **Numerical Result:** Continuous beta-attenuation monitors (BAM-1020) and optical particulate sensors saturate at exact hardware limits: **46 station-hours at 999.9 µg/m³ for $PM_{2.5}$**, **72 station-hours at 1000.0 µg/m³ for $PM_{10}$**, and **6,028 hours at 10.0 mg/m³ for Carbon Monoxide**. In hotspot corridors (Bawana, Anand Vihar), this right-censoring causes official arithmetic averages to systematically underestimate true acute peak exposure by **18% to 26%**.
* **Supporting Chart:** `CHART_33` (Sensor Saturation Analysis) and `CHART_22` (Top PM2.5 Hotspots).
* **Sample Size:** $N = 414,255$ hourly records; right-censored ceiling flags verified.
* **Analytical Methodology:** Survival-analysis distribution modeling, Tobit right-censored maximum likelihood estimation (MLE), and frequency analysis of zero-variance ceiling strings.
* **Atmospheric Interpretation:** Standard CAAQMS BAM-1020 instrumentation uses a beta-radiation detector measuring radiometric attenuation across a continuous glass-fiber filter tape. During catastrophic winter episodes, particulate mass loading on the filter tape exceeds optical transmittance thresholds, triggering analog-to-digital converter (ADC) ceiling clamping at 999.9 µg/m³.
* **Limitation:** True unconstrained atmospheric concentrations during these 46 saturated hours cannot be determined post hoc without auxiliary aerosol optical depth (AOD) satellite calibration.

