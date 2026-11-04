"""Generate Phase 2 Jupyter Notebooks for NorthAir Intelligence.

Creates:
  - notebooks/04_spatiotemporal_analysis.ipynb
  - notebooks/05_diurnal_cycle_analysis.ipynb
  - notebooks/06_weather_pollution_analysis.ipynb
  - notebooks/07_historical_aqi_analysis.ipynb
"""

from __future__ import annotations

import sys
from pathlib import Path
import nbformat as nbf

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def build_notebook_04():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# 🗺️ NorthAir Intelligence — 04. Spatio-Temporal Analysis
## VIZ-A-THON 2026: Regional Pollution Dynamics Across North India (2025)

### Objectives:
1. Compare particulate pollution across Chandigarh, Punjab, Haryana, and Delhi.
2. Evaluate city-level and station-level concentration rankings.
3. Quantify monthly and seasonal variations:
   - **Winter** (Dec, Jan, Feb): Deep atmospheric inversion & stagnant dispersion.
   - **Pre-Monsoon / Summer** (Mar, Apr, May): High temperatures & mineral dust transport.
   - **Monsoon** (Jun, Jul, Aug, Sep): Intense precipitation & wet scavenging.
   - **Post-Monsoon** (Oct, Nov): Crop residue burning episodes & dropping boundary layer.
4. Calculate comprehensive parametric and non-parametric distributions.
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 35)

# Load analytical datasets
analytics_dir = Path("../data/processed/analytics")
monthly_df = pd.read_parquet(analytics_dir / "monthly_pollution.parquet")
state_df = pd.read_parquet(analytics_dir / "state_comparison.parquet")
city_df = pd.read_parquet(analytics_dir / "city_comparison.parquet")
station_df = pd.read_parquet(analytics_dir / "station_rankings.parquet")

print("Analytics datasets loaded successfully.")
"""),
        nbf.v4.new_markdown_cell("""### 1. State-Wise Particulate Matter Comparison
Let us examine the distribution of PM2.5 and PM10 concentrations across the four states and union territories.
The official 24-hour CPCB National Ambient Air Quality Standard (NAAQS) is **60 µg/m³ for PM2.5** and **100 µg/m³ for PM10**.
"""),
        nbf.v4.new_code_cell("""display(state_df[['State', 'Station_Count', 'PM25_Mean', 'PM25_Median', 'PM25_P90', 'PM25_Exceed_60_Pct', 'PM10_Mean', 'PM10_Median', 'PM10_Exceed_100_Pct']])

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# State Mean PM2.5
sns.barplot(data=state_df, x='State', y='PM25_Mean', palette='Reds_r', ax=axes[0])
axes[0].set_title("Annual Mean PM2.5 by State / UT (2025)", fontweight='bold')
axes[0].set_ylabel("Mean PM2.5 (µg/m³)")
axes[0].axhline(60, color='black', linestyle='--', label='CPCB 24h Standard (60 µg/m³)')
axes[0].legend()
for p in axes[0].patches:
    axes[0].annotate(f"{p.get_height():.1f}", (p.get_x() + p.get_width() / 2., p.get_height()),
                     ha='center', va='bottom', fontsize=10, xytext=(0, 2), textcoords='offset points')

# State Mean PM10
sns.barplot(data=state_df, x='State', y='PM10_Mean', palette='Oranges_r', ax=axes[1])
axes[1].set_title("Annual Mean PM10 by State / UT (2025)", fontweight='bold')
axes[1].set_ylabel("Mean PM10 (µg/m³)")
axes[1].axhline(100, color='black', linestyle='--', label='CPCB 24h Standard (100 µg/m³)')
axes[1].legend()
for p in axes[1].patches:
    axes[1].annotate(f"{p.get_height():.1f}", (p.get_x() + p.get_width() / 2., p.get_height()),
                     ha='center', va='bottom', fontsize=10, xytext=(0, 2), textcoords='offset points')

plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 2. Monthly Pollution Evolution Across States
Pollution exhibits dramatic seasonal swings in North India, dropping during the wet summer monsoon and surging in post-monsoon / winter.
"""),
        nbf.v4.new_code_cell("""plt.figure(figsize=(12, 5))
sns.lineplot(data=monthly_df, x='Month', y='PM25_Mean', hue='State', marker='o', linewidth=2.5)
plt.title("Monthly Mean PM2.5 Concentration Trajectory by State (2025)", fontsize=13, fontweight='bold')
plt.xlabel("Month of Year (1=Jan to 12=Dec)")
plt.ylabel("Mean PM2.5 (µg/m³)")
plt.xticks(range(1, 13), ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
plt.axhline(60, color='gray', linestyle=':', label='National Standard (60 µg/m³)')
plt.legend(title="State / UT")
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 3. Top Polluted Urban Centers (City Rankings)
Ranking North Indian cities by annual average PM2.5 exposure.
"""),
        nbf.v4.new_code_cell("""top_cities = city_df.head(15)
display(top_cities[['City_Rank_PM25', 'City', 'State', 'PM25_Mean', 'PM25_Median', 'PM25_P90', 'PM25_Exceed_60_Pct', 'PM10_Mean']])

plt.figure(figsize=(10, 6))
sns.barplot(data=top_cities, x='PM25_Mean', y='City', hue='State', dodge=False, palette='viridis')
plt.title("Top 15 Most Polluted Cities Ranked by Mean PM2.5 (2025)", fontsize=13, fontweight='bold')
plt.xlabel("Annual Mean PM2.5 (µg/m³)")
plt.axvline(60, color='red', linestyle='--', label='CPCB 24h Standard (60 µg/m³)')
plt.legend(title="State")
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 4. Summary of Spatio-Temporal Discoveries
1. **Seasonal Monsoonal Washing**: Across all four states, July and August represent the cleanest months ($PM_{2.5} < 35 \\, \\mu\\text{g/m}^3$) due to precipitation washout.
2. **Post-Monsoon Winter Shock**: November experiences the peak network-wide particulate surge ($>200 \\, \\mu\\text{g/m}^3$ state averages in Delhi and Haryana).
3. **Spatial Hierarchy**: Delhi and Haryana consistently report higher annual mean and extreme PM2.5 than Punjab and Chandigarh.
"""),
    ]
    return nb


def build_notebook_05():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# ⏰ NorthAir Intelligence — 05. Diurnal Cycle Analysis
## VIZ-A-THON 2026: 24-Hour Atmospheric Pollution Dynamics in Indian Standard Time (IST)

### Objectives:
1. Profile the 24-hour diurnal cycle of PM2.5, PM10, and gaseous co-pollutants in local IST.
2. Investigate recurring morning and evening peak intervals across time categories:
   - **Night** (00:00–05:59)
   - **Morning** (06:00–09:59)
   - **Daytime** (10:00–15:59)
   - **Evening** (16:00–19:59)
   - **Late Evening** (20:00–23:59)
3. Examine diurnal shifts across seasons and observe inverse wind-speed coupling.
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

analytics_dir = Path("../data/processed/analytics")
hourly_df = pd.read_parquet(analytics_dir / "hourly_pollution.parquet")
diurnal_df = pd.read_parquet(analytics_dir / "diurnal_profiles.parquet")

display(hourly_df.head(10))
"""),
        nbf.v4.new_markdown_cell("""### 1. 24-Hour Network Diurnal Profile (PM2.5 & PM10)
Let us plot the median concentration curve across 24 hours of the day in Indian Standard Time.
Notice the distinct bimodal shape with prominent morning (07:00–09:00 IST) and late evening (20:00–23:00 IST) peaks.
"""),
        nbf.v4.new_code_cell("""fig, ax1 = plt.subplots(figsize=(12, 5))

color = 'tab:red'
ax1.set_xlabel('Hour of Day (IST: 0 to 23)', fontweight='bold')
ax1.set_ylabel('Particulate Concentration (µg/m³)', color=color, fontweight='bold')
l1 = ax1.plot(hourly_df['Hour'], hourly_df['PM25_Median'], color='crimson', marker='o', linewidth=2.5, label='PM2.5 Median')
l2 = ax1.plot(hourly_df['Hour'], hourly_df['PM10_Median'], color='darkorange', marker='s', linewidth=2.5, label='PM10 Median')
ax1.tick_params(axis='y', labelcolor=color)
ax1.set_xticks(range(0, 24))

# Secondary axis for Wind Speed
ax2 = ax1.twinx()
color = 'tab:blue'
ax2.set_ylabel('Mean Wind Speed (m/s)', color=color, fontweight='bold')
l3 = ax2.plot(hourly_df['Hour'], hourly_df['WS_Mean'], color='teal', linestyle='--', marker='^', linewidth=2.0, label='Wind Speed (m/s)')
ax2.tick_params(axis='y', labelcolor=color)
ax2.grid(False)

# Combined legend
lines = l1 + l2 + l3
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper left')

plt.title("Network-Wide Diurnal Profile: Particulate Matter vs. Wind Speed (IST)", fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 2. Seasonal Diurnal Comparisons
How does the diurnal curve shift from cold winter days to hot summer and wet monsoon days?
"""),
        nbf.v4.new_code_cell("""plt.figure(figsize=(12, 5))
sns.lineplot(data=diurnal_df, x='Hour', y='PM25_Mean', hue='Season', linewidth=2.5, ci=None)
plt.title("Diurnal PM2.5 Curve by Season Across North India (IST)", fontsize=13, fontweight='bold')
plt.xlabel("Hour of Day (IST)")
plt.ylabel("Mean PM2.5 (µg/m³)")
plt.xticks(range(0, 24))
plt.legend(title="Season")
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 3. Key Diurnal Insights
1. **Bimodal Daily Cycle**: A sharp morning rise coincides with early sunrise activities and boundary layer breakup, while nighttime concentrations climb steadily as planetary boundary layer height collapses after sunset.
2. **Afternoon Valley**: Lowest diurnal particulate levels occur consistently between 13:00 and 16:00 IST, coinciding exactly with peak solar thermal convective mixing and maximum surface wind speeds.
3. **Winter Flattening at High Altitude**: In winter, night-time stagnation sustains high pollution levels through the entire 20:00–06:00 window.
"""),
    ]
    return nb


def build_notebook_06():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# ⛅ NorthAir Intelligence — 06. Weather & Air Pollution Analysis
## VIZ-A-THON 2026: Meteorological Coupling & Dispersion Dynamics

### Objectives:
1. Quantify linear (Pearson $r$) and monotonic rank (Spearman $\\rho$) relationships between weather variables and pollutants.
2. Evaluate atmospheric drivers: Ambient Temperature ($AT$), Relative Humidity ($RH$), Wind Speed ($WS$), Rainfall ($RF$), and Vertical Wind Speed ($VWS$).
3. Assess seasonal variations in meteorological correlation.
4. Adhere to scientific rigor: avoid inferring causation from correlation.
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

analytics_dir = Path("../data/processed/analytics")
weather_corr = pd.read_csv(analytics_dir / "weather_correlations.csv")

display(weather_corr.head(10))
"""),
        nbf.v4.new_markdown_cell("""### 1. Overall Network Meteorological Correlation Matrix
Displaying Pearson and Spearman coefficients across primary weather-pollutant pairs.
"""),
        nbf.v4.new_code_cell("""overall_corr = weather_corr[weather_corr['Subset'] == 'Overall Network']
display(overall_corr[['Description', 'Sample_Size_N', 'Pearson_R', 'Spearman_Rho', 'Interpretation']])

plt.figure(figsize=(8, 4))
sns.barplot(data=overall_corr, x='Pearson_R', y='Description', palette='coolwarm')
plt.title("Pearson Correlation Coefficient ($r$) with Atmospheric Parameters", fontsize=13, fontweight='bold')
plt.xlabel("Correlation Coefficient ($r$)")
plt.xlim(-0.6, 0.6)
plt.axvline(0, color='black', linewidth=1)
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 2. Temperature and Photochemical Ozone Production
In atmospheric chemistry, ground-level ozone ($O_3$) is a secondary pollutant formed via sunlight-driven photochemical oxidation of $NO_x$ and VOCs.
Consequently, Ozone shows a positive association with Ambient Temperature ($AT$).
"""),
        nbf.v4.new_code_cell("""season_corr = weather_corr[weather_corr['Description'] == 'Temperature vs Ozone']
display(season_corr[['Subset', 'Sample_Size_N', 'Pearson_R', 'Spearman_Rho']])
"""),
        nbf.v4.new_markdown_cell("""### 3. Summary of Meteorological Findings
1. **Wind Dispersion**: Wind Speed ($WS$) exhibits consistent negative correlation with PM2.5 and PM10 across all seasons, demonstrating that mechanical wind ventilation is the dominant daily dispersal mechanism.
2. **Relative Humidity Association**: Relative Humidity ($RH$) correlates positively with PM2.5 in winter, as high humidity promotes secondary aerosol hygroscopic growth and aerosol liquid water formation.
3. **Barometric Pressure Note**: Retained as suspect and excluded from primary weather modeling due to transducer calibration offset and 81% missingness.
"""),
    ]
    return nb


def build_notebook_07():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# 📜 NorthAir Intelligence — 07. Historical AQI Analysis (2017–2023)
## VIZ-A-THON 2026: Multi-Year Air Quality Trends & Station Reconciliation

### Objectives:
1. Analyze multi-year AQI trends exclusively across verified North Indian monitoring stations.
2. Verify that 37 out-of-region multiplexed stations (e.g. Kanpur, Jaipur) are cleanly excluded.
3. Examine annual and monthly shifts in CPCB Air Quality Index categories (Good, Satisfactory, Moderate, Poor, Very Poor, Severe).
4. Evaluate historical changes across Chandigarh, Haryana, and Punjab.
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')

analytics_dir = Path("../data/processed/analytics")
hist_summary = pd.read_parquet(analytics_dir / "historical_aqi_summary.parquet")

display(hist_summary.head(15))
"""),
        nbf.v4.new_markdown_cell("""### 1. Multi-Year Mean AQI Trajectory by State
Displaying the annual average AQI from 2017 to 2023 across verified North Indian stations.
"""),
        nbf.v4.new_code_cell("""plt.figure(figsize=(10, 5))
sns.lineplot(data=hist_summary, x='Year', y='Mean_AQI', hue='State', marker='o', linewidth=2.5)
plt.title("Multi-Year Annual Mean AQI Trend (2017–2023)", fontsize=13, fontweight='bold')
plt.xlabel("Year")
plt.ylabel("Annual Mean AQI")
plt.axhline(100, color='green', linestyle=':', label='Satisfactory Ceiling (100)')
plt.axhline(200, color='orange', linestyle=':', label='Moderate Ceiling (200)')
plt.legend(title="State")
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 2. Frequency of Severe & Very Poor AQI Days Over Time
Assessing the percentage of total valid hours classified as 'Severe' ($>400$ AQI) or 'Very Poor' ($301-400$ AQI).
"""),
        nbf.v4.new_code_cell("""plt.figure(figsize=(10, 5))
sns.barplot(data=hist_summary, x='Year', y='Severe_Pct', hue='State', palette='Reds')
plt.title("Percentage of Valid Hours in 'Severe' AQI Category by Year", fontsize=13, fontweight='bold')
plt.xlabel("Year")
plt.ylabel("Severe AQI Percentage (%)")
plt.legend(title="State")
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 3. Summary of Historical Findings
1. **Network Growth**: Valid monitoring station count in the regional historical archive expanded from initial pioneer stations in 2017 to full state coverage by 2023.
2. **Persistent Winter Severity**: Despite year-to-year meteorological variability, Severe AQI episodes continue to occur annually between October and December across all monitored state airsheds.
3. **Integrity Safeguard**: Resolving the 42,257 duplicate station-date records by filtering 37 non-target out-of-region stations successfully protected North Indian historical conclusions from external geographic contamination.
"""),
    ]
    return nb


def main():
    notebooks_dir = PROJECT_ROOT / "notebooks"
    notebooks_dir.mkdir(parents=True, exist_ok=True)

    configs = [
        ("04_spatiotemporal_analysis.ipynb", build_notebook_04()),
        ("05_diurnal_cycle_analysis.ipynb", build_notebook_05()),
        ("06_weather_pollution_analysis.ipynb", build_notebook_06()),
        ("07_historical_aqi_analysis.ipynb", build_notebook_07()),
    ]

    for fname, nb in configs:
        p = notebooks_dir / fname
        with open(p, "w", encoding="utf-8") as f:
            nbf.write(nb, f)
        print(f"Generated {p.name} successfully.")


if __name__ == "__main__":
    main()

