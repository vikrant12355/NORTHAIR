# NorthAir Intelligence — Comprehensive Chart Interpretation Guide
**Detailed Analytical Guide for Charts 1 to 35**

---

### Group 1: Regional Pollution Analysis (Charts 1–5)
* **CHART 1 (State-wise PM2.5 Comparison):** Compares measurement-weighted vs station-balanced summaries. Delhi leads with 124.8 µg/m³ (measurement-weighted) and 122.4 µg/m³ (station-balanced), followed by Haryana (112.6 vs 108.9 µg/m³), Punjab (98.4 vs 101.2 µg/m³), and Chandigarh (68.2 µg/m³). Error bars indicate 95% confidence intervals. Demonstrates that station density can distort state rankings by up to 3.7 µg/m³.
* **CHART 2 (State-wise PM10 Comparison):** Reveals massive regional coarse dust loading. Delhi records 218.4 µg/m³ PM10, Haryana 194.2 µg/m³, Punjab 162.8 µg/m³, and Chandigarh 114.5 µg/m³. All states fail the NAAQS 24h standard (100 µg/m³).
* **CHART 3 (City-wise Pollution Ranking):** Ranks North Indian urban centers. Delhi (124.8 µg/m³), Faridabad (118.2 µg/m³), and Ghaziabad (116.5 µg/m³) occupy the highest concentration tiers, while Chandigarh (68.2 µg/m³) and Patiala (72.4 µg/m³) represent cleaner regional baselines.
* **CHART 4 (Station-wise PM2.5 Distribution):** Boxplot of 48 stations ordered by median concentration. Highlights extreme positive tail skewness at industrial stations like Bawana (P90 = 312.4 µg/m³) and Anand Vihar (P90 = 294.8 µg/m³).
* **CHART 5 (State-wise PM2.5 vs PM10 Comparison):** Illustrates fine-to-coarse particulate partitioning. Delhi displays a high PM2.5/PM10 combustion ratio of 0.57, while Punjab and Haryana display ratios of 0.61 and 0.56, indicating intense combustion and secondary aerosol formation.

---

### Group 2: Monthly and Temporal Analysis (Charts 6–10)
* **CHART 6 (Monthly PM2.5 Trend):** 12-month trajectory showing catastrophic winter and post-monsoon peaks (November: 224.6 µg/m³, December: 218.4 µg/m³, January: 194.2 µg/m³) contrasted against clean monsoon baselines (July: 38.4 µg/m³, August: 34.2 µg/m³).
* **CHART 7 (Monthly PM10 Trend):** Exhibits a bimodal distribution with a prominent secondary peak during the dry pre-monsoon summer (May: 228.4 µg/m³, June: 212.1 µg/m³) driven by Thar desert convective dust storms.
* **CHART 8 (Multiple Pollutant Monthly Trends):** Small multiples across PM2.5, PM10, NO2, and SO2. Demonstrates that NO2 mirrors PM2.5 winter surges due to freight emissions, whereas SO2 remains relatively stable year-round (12–18 µg/m³) complying with statutory limits.
* **CHART 9 (Monthly Pollution Heatmap):** Matrix of top 30 stations across 12 months. Highlights that even during clean summer months, industrial clusters (Bawana, Wazirpur, Mundka) remain trapped in elevated Moderate categories.
* **CHART 10 (Seasonal Comparison Boxplot):** Demonstrates profound seasonal contrast. Winter mean (184.2 µg/m³) is 4.3x higher than Monsoon mean (42.6 µg/m³), verified with One-Way ANOVA ($F = 842.6, p < 10^{-15}$).

---

### Group 3: Diurnal Cycle Analysis (Charts 11–15)
* **CHART 11 (24-Hour PM2.5 Profile):** Documents the daily diurnal cycle in Indian Standard Time (IST). Morning rush hour peaks at 08:30 IST (168.4 µg/m³), followed by a steep afternoon decline to 86.5 µg/m³ at 15:00 IST (cleanroom window), before surging to 224.8 µg/m³ at 23:00 IST (nocturnal freight surge).
* **CHART 12 (24-Hour PM10 Profile):** Coarse particulate matter mirrors the bimodal pattern with morning traffic resuspension peaking at 09:00 IST (248.2 µg/m³).
* **CHART 13 (Hour versus Month Heatmap):** 24-hour x 12-month matrix proving that the afternoon 13:00–16:30 cleanroom window persists across every month of the year.
* **CHART 14 (Regional Diurnal Comparison):** Shows that Delhi experiences a sharper nocturnal spike than Punjab due to heavy diesel truck transit across peripheral expressways.
* **CHART 15 (Morning vs Evening Comparison):** Paired analysis shows Morning Peak (164.2 µg/m³) exceeds Evening Rush (142.8 µg/m³) across all states ($t = 28.4, p < 10^{-12}$) because the morning boundary layer has not yet broken through nocturnal inversions.

---

### Group 4: Weather and Pollution Relationships (Charts 16–21)
* **CHART 16 (Temperature vs PM2.5):** OLS linear regression proves strong inverse relationship ($r = -0.58, R^2 = 0.34, p < 0.001$). Colder surface temperatures suppress mixing height.
* **CHART 17 (Humidity vs PM2.5):** Non-linear polynomial regression demonstrates accelerated particulate growth when relative humidity exceeds the 70% aerosol deliquescence threshold ($r = +0.44$).
* **CHART 18 (Wind Speed vs PM2.5):** Power-law decay regression ($PM_{2.5} \propto WS^{-0.54}$) proves that wind speeds below 1.5 m/s prevent horizontal ventilation.
* **CHART 19 (Rainfall Scavenging Comparison):** Proves that precipitation ($\ge 10$ mm) scrubs 76.8% of sub-micron aerosols through below-cloud wet deposition ($p < 10^{-15}$).
* **CHART 20 (Temperature vs Ozone):** Positive photochemical regression ($r = +0.58, p < 0.001$) shows ground-level ozone formation accelerates during hot summer months (>35°C).
* **CHART 21 (Weather Correlation Matrix):** Dual Pearson and Spearman heatmaps confirming that Temperature, Humidity, and Wind Speed are the governing meteorological parameters.

---

### Group 5: Pollution Hotspot Analysis (Charts 22–26)
* **CHART 22 (Top PM2.5 Hotspots):** Identifies Bawana (Mean 162.4 µg/m³, P90 312.4 µg/m³) and Anand Vihar (Mean 154.2 µg/m³, P90 294.8 µg/m³) as the top chronic fine particulate hotspots.
* **CHART 23 (Top PM10 Hotspots):** Identifies Anand Vihar, Jahangirpuri, and Wazirpur as top coarse dust hotspots exceeding 260 µg/m³ annual mean.
* **CHART 24 (Pollution Persistence):** Ranks stations by proportion of days violating NAAQS 60 µg/m³. Bawana and Anand Vihar violate statutory standards on >82% of eligible days.
* **CHART 25 (Average vs 90th Percentile Scatter):** Separates chronic baseline stations from volatile episodic sites (points above the 2:1 line).
* **CHART 26 (Hotspot Classification Matrix):** Four-quadrant matrix classifying monitoring sites into Chronic Severe Hotspots, Episodic Spike Sites, Moderate Stagnant Sites, and Regional Cleanrooms.

---

### Group 6: Historical AQI Analysis (Charts 27–30)
* **CHART 27 (Annual AQI Trend 2017–2023):** Multi-year median progression tracks the initial launch of NCAP in 2019, the sharp 2020 COVID lockdown drop (median AQI 158), and subsequent post-lockdown industrial recovery.
* **CHART 28 (Monthly Historical AQI Heatmap):** 7-year x 12-month heatmap confirms that catastrophic winter spikes occur in November–January in every recorded year without exception.
* **CHART 29 (Hourly AQI Distribution):** Proves the 24-hour diurnal pattern (afternoon dip and nocturnal surge) has remained structurally consistent across all 7 historical years.
* **CHART 30 (AQI Category Distribution):** Analyzes 2.46M historical measurements against CPCB categories: only 18.2% of hours achieved Good or Satisfactory air quality.

---

### Group 7: Data Quality Visualisation (Charts 31–35)
* **CHART 31 (Parameter Missingness Audit):** Documents missingness across 13 variables; flags Barometric Pressure (81.34% missing) and justifies its exclusion from physical models.
* **CHART 32 (Station-wise Data Coverage Heatmap):** Proves 100% of 48 CAAQMS stations exceed the CPCB statutory 85% annual operating uptime requirement.
* **CHART 33 (Sensor Saturation Analysis):** Quantifies right-censored BAM-1020 detector limits (46 hours at 999.9 µg/m³ PM2.5, 72 hours at 1000.0 µg/m³ PM10, 6,028 hours at 10.0 mg/m³ CO).
* **CHART 34 (Barometric Pressure Distribution):** Visualizes the uncalibrated transducer drift anomaly where 24.8% of valid readings exceed 800 mmHg.
* **CHART 35 (Vertical Wind Speed Distribution):** Bimodal distribution confirming that negative VWS readings (down to -4.1 m/s) represent physical subsidence downdrafts that trap pollution.

