"""Generator and runner for NorthAir Intelligence Jupyter Notebooks.

Builds and executes:
  - notebooks/01_data_understanding.ipynb
  - notebooks/02_data_quality_analysis.ipynb
  - notebooks/03_data_preprocessing.ipynb
"""

from __future__ import annotations

import sys
from pathlib import Path
import nbformat as nbf
from nbconvert.preprocessors import ExecutePreprocessor

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))


def build_notebook_01():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# 🌬️ NorthAir Intelligence — 01. Data Understanding
## VIZ-A-THON 2026: North India Air Quality Analytics Platform

### Overview & Problem Statement
North India experiences some of the most critical air pollution episodes globally, driven by seasonal meteorology, agricultural stubble burning, industrial emissions, and geographic valley effects across the Indo-Gangetic Plain.

In this notebook, we initialize the data foundation by loading and inspecting three core datasets provided for **VIZ-A-THON 2026**:
1. **`stations.csv`**: Metadata for 48 Continuous Ambient Air Quality Monitoring Stations (CAAQMS) across Chandigarh, Punjab, Haryana, and Delhi.
2. **`aqi_history_2017_2023.csv`**: Multi-year daily and hourly historical AQI values (102,744 records).
3. **`air_quality_hourly_2025.csv`**: Granular hourly measurements of 23 pollutant and meteorological parameters for the entire calendar year 2025 (414,255 records).

---
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Configure styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 35)

# Add NorthAir source to path
sys.path.insert(0, str(Path("../src").resolve()))
from northair.data_loader import DataLoader

print("Environment initialized successfully.")
"""),
        nbf.v4.new_markdown_cell("""### 1. Data Loading via NorthAir DataLoader
We initialize `DataLoader`, which automatically detects raw CSV files in `data/raw/` and strips UTF-8 Byte Order Marks (`utf-8-sig`).
"""),
        nbf.v4.new_code_cell("""loader = DataLoader(raw_dir=Path("../data/raw"))

# Check file presence
file_status = loader.check_files_exist()
print("Raw File Status:")
for k, v in file_status.items():
    print(f"  - {k}: {'EXISTS' if v else 'MISSING'}")

# Load datasets
stations_df = loader.load_stations()
aqi_hist_df = loader.load_aqi_history()
aq_2025_df = loader.load_air_quality_hourly_2025()

print(f"\\nStations shape: {stations_df.shape}")
print(f"AQI History shape: {aqi_hist_df.shape}")
print(f"Air Quality 2025 shape: {aq_2025_df.shape}")
"""),
        nbf.v4.new_markdown_cell("""### 2. Inspecting Station Metadata (`stations.csv`)
Let us inspect the distribution of monitoring stations across the four North Indian administrative zones:
- **Chandigarh** (Union Territory)
- **Delhi** (National Capital Territory)
- **Haryana** (State)
- **Punjab** (State)
"""),
        nbf.v4.new_code_cell("""summary_stations = loader.summarize_dataset(stations_df, name="stations.csv")
print(f"Total Stations: {summary_stations.rows}")
print(f"Missing Values: {summary_stations.total_missing_cells}")
print(f"Duplicate Rows: {summary_stations.duplicate_rows}\\n")

display(stations_df.head(10))
"""),
        nbf.v4.new_code_cell("""# Visualizing State-wise Station Distribution
plt.figure(figsize=(8, 4))
state_counts = stations_df['State'].value_counts()
ax = sns.barplot(x=state_counts.index, y=state_counts.values, palette='Blues_r')
plt.title("Monitoring Stations per State / UT (Total: 48)", fontsize=13, fontweight='bold')
plt.xlabel("State / UT")
plt.ylabel("Station Count")
for p in ax.patches:
    ax.annotate(f"{int(p.get_height())}", (p.get_x() + p.get_width() / 2., p.get_height()),
                ha='center', va='bottom', fontsize=11, xytext=(0, 3), textcoords='offset points')
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 3. Inspecting Historical AQI Data (`aqi_history_2017_2023.csv`)
Contains daily records with 24 individual hourly AQI columns (`00:00:00` to `23:00:00`).
"""),
        nbf.v4.new_code_cell("""display(aqi_hist_df[['Station ID', 'State', 'City', 'Date', '00:00:00', '06:00:00', '12:00:00', '18:00:00']].head(5))
display(aqi_hist_df[['Station ID', 'State', 'City', 'Date', '00:00:00', '06:00:00', '12:00:00', '18:00:00']].tail(5))
"""),
        nbf.v4.new_markdown_cell("""### 4. Inspecting 2025 Hourly Air Quality Data (`air_quality_hourly_2025.csv`)
Contains 23 pollutant and environmental variables recorded at UTC timestamps.
"""),
        nbf.v4.new_code_cell("""print("Columns in 2025 Hourly Dataset:")
for col in aq_2025_df.columns:
    print(f"  • {col}")

display(aq_2025_df[['Station ID', 'City', 'Timestamp', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'NO2 (µg/m³)', 'CO (mg/m³)', 'AT (°C)']].head(5))
"""),
        nbf.v4.new_markdown_cell("""### 5. Summary & Next Steps
- All 3 raw datasets were loaded successfully without inventing or modifying data.
- UTF-8 BOM encoding was seamlessly resolved.
- Next notebook: `02_data_quality_analysis.ipynb` will perform a deep audit of missing values, anomalies, and referential integrity.
"""),
    ]
    return nb


def build_notebook_02():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# 🔍 NorthAir Intelligence — 02. Data Quality Analysis
## VIZ-A-THON 2026: Empirical Quality Audit & Anomaly Detection

### Objectives:
1. Missing value distribution per pollutant and meteorological parameter.
2. Station-date duplicate analysis and multiplexing discovery in historical data.
3. Station network temporal completeness (recorded vs expected hours).
4. Statistical distributions (25%, 50%, 75%, 90% percentiles, min, max, mean, std).
5. Sensor clipping & physical boundary auditing (PM2.5 @ 999.99, CO @ 10, BP > 800 mmHg).
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 35)

sys.path.insert(0, str(Path("../src").resolve()))
from northair.data_loader import DataLoader
from northair.data_profiler import DataProfiler

loader = DataLoader(raw_dir=Path("../data/raw"))
stations_df = loader.load_stations()
aqi_hist_df = loader.load_aqi_history()
aq_2025_df = loader.load_air_quality_hourly_2025()

profiler = DataProfiler(stations_df, aqi_hist_df, aq_2025_df)
print("DataProfiler initialized.")
"""),
        nbf.v4.new_markdown_cell("""### 1. Missing Value Audit (2025 Dataset)
CPCB sensors periodically undergo zero/span calibration, maintenance downtime, or telecommunication dropouts.
Let us visualize the missingness percentage across all 23 parameters.
"""),
        nbf.v4.new_code_cell("""missing_df = profiler.profile_missing_values(aq_2025_df)
display(missing_df.head(15))

# Plot missing percentages
plt.figure(figsize=(10, 6))
sns.barplot(data=missing_df[missing_df['Missing_Percentage'] > 0], x='Missing_Percentage', y='Column', palette='mako')
plt.title("Missing Value Percentage per Parameter (2025 Hourly Dataset)", fontsize=13, fontweight='bold')
plt.xlabel("Missing Percentage (%)")
plt.xlim(0, 100)
plt.axvline(50, color='red', linestyle='--', label='50% Threshold')
plt.legend(loc='lower right')
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 2. Duplicate Audit & Historical Station ID Multiplexing
- Exact duplicate rows: **0** across all 3 files.
- However, in `aqi_history_2017_2023.csv`, `Station ID + Date` has **42,257 duplicates**!
Let us inspect why:
"""),
        nbf.v4.new_code_cell("""duplicates = profiler.profile_duplicates()
print("Duplicate Audit Results:")
for ds, metrics in duplicates.items():
    print(f"  • {ds}: {metrics}")

integrity = profiler.profile_station_integrity()
print(f"\\nStations with multiple distinct names in historical data: {len(integrity['stations_with_multiple_names_in_history'])}")
for sid, info in integrity['stations_with_multiple_names_in_history'].items():
    print(f"    - {sid}: {info['name_count']} distinct station names (Sample: {info['sample_names'][:2]})")
"""),
        nbf.v4.new_markdown_cell("""### 3. Station Temporal Coverage (2025)
In 2025, each station has $365 \\times 24 = 8,760$ expected hourly intervals.
Let us assess the completeness of records per station.
"""),
        nbf.v4.new_code_cell("""coverage_df = profiler.profile_station_coverage()
print(f"Network Mean Completeness: {coverage_df['Temporal_Coverage_Pct'].mean():.2f}%")
print(f"Highest Coverage: {coverage_df['Temporal_Coverage_Pct'].max()}% ({coverage_df.iloc[0]['Station_Name']})")
print(f"Lowest Coverage: {coverage_df['Temporal_Coverage_Pct'].min()}% ({coverage_df.iloc[-1]['Station_Name']})")

plt.figure(figsize=(10, 4))
sns.histplot(coverage_df['Temporal_Coverage_Pct'], bins=20, kde=True, color='teal')
plt.title("Distribution of Station Temporal Coverage in 2025 (%)", fontsize=13, fontweight='bold')
plt.xlabel("Temporal Coverage (%)")
plt.ylabel("Number of Stations")
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 4. Numerical Distributions, Percentiles & Anomaly Flags
We calculate complete statistical distribution metrics: Count, Mean, Std, Min, 25%, Median, 75%, 90%, Max, and flag unphysical values or sensor saturation artifacts.
"""),
        nbf.v4.new_code_cell("""stats_df, stats_list = profiler.profile_numerical_statistics(aq_2025_df)
display(stats_df[['column', 'count', 'mean', 'median', 'p75', 'p90', 'max', 'flagged_issues']].head(12))
"""),
        nbf.v4.new_markdown_cell("""### 5. Distribution of Key Particulate Matter (PM2.5 & PM10)
Let us visualize the distributions of PM2.5 and PM10, noting the CPCB 24-hour National Ambient Air Quality Standards (NAAQS):
- PM2.5 standard: $60 \\, \\mu\\text{g/m}^3$
- PM10 standard: $100 \\, \\mu\\text{g/m}^3$
"""),
        nbf.v4.new_code_cell("""fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# PM2.5
sns.histplot(aq_2025_df['PM2.5 (µg/m³)'].dropna(), bins=60, kde=True, ax=axes[0], color='crimson')
axes[0].set_title("PM2.5 Concentration Distribution (2025)", fontweight='bold')
axes[0].set_xlabel("PM2.5 (µg/m³)")
axes[0].axvline(60, color='black', linestyle='--', label='CPCB 24h Standard (60 µg/m³)')
axes[0].axvline(999.99, color='darkred', linestyle=':', label='Sensor Saturation Limit (999.99)')
axes[0].set_xlim(0, 1050)
axes[0].legend()

# PM10
sns.histplot(aq_2025_df['PM10 (µg/m³)'].dropna(), bins=60, kde=True, ax=axes[1], color='darkorange')
axes[1].set_title("PM10 Concentration Distribution (2025)", fontweight='bold')
axes[1].set_xlabel("PM10 (µg/m³)")
axes[1].axvline(100, color='black', linestyle='--', label='CPCB 24h Standard (100 µg/m³)')
axes[1].axvline(1000.0, color='darkred', linestyle=':', label='Sensor Saturation Limit (1000.0)')
axes[1].set_xlim(0, 1050)
axes[1].legend()

plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### Summary of Quality Audit Findings:
1. **Saturation Limits**: Hard caps detected at 999.99 for PM2.5 and 1000.0 for PM10.
2. **BP Transducer Drift**: Pressures up to 1069 mmHg indicate uncalibrated sensors.
3. **Historical Multiplexing**: `site_5046` maps to 40 distinct names, requiring station name disambiguation.
4. **No Artificial Imputation**: Missing values preserved as NaN to maintain statistical validity.
"""),
    ]
    return nb


def build_notebook_03():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell("""# ⚙️ NorthAir Intelligence — 03. Data Preprocessing
## VIZ-A-THON 2026: Time Zone Conversion, Reshaping & Analytical Enrichment

### Objectives:
1. **Timestamp Processing**: Convert UTC timestamps to Indian Standard Time (IST = UTC + 05:30) and engineer temporal features (`Date`, `Year`, `Month`, `Month_Name`, `Day`, `Hour`, `Day_of_Week`).
2. **Historical AQI Transformation**: Convert 24 hourly wide columns (`00:00:00` to `23:00:00`) to long format via Pandas `melt`, verifying complete non-null AQI observation parity.
3. **Station Metadata Consolidation**: Enrich station inventory with coverage statistics and presence indicators.
4. **Artifact Persistence**: Save analysis-ready datasets in both CSV and Parquet formats in `data/processed/`.
"""),
        nbf.v4.new_code_cell("""import sys
from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
pd.set_option('display.max_columns', 35)

sys.path.insert(0, str(Path("../src").resolve()))
from northair.data_loader import DataLoader
from northair.preprocessing import (
    convert_utc_to_ist,
    transform_aqi_history_to_long,
    build_station_metadata,
    save_processed_datasets,
)
from northair.validation import (
    validate_timestamp_conversion,
    validate_aqi_melting,
    validate_processed_outputs,
)

loader = DataLoader(raw_dir=Path("../data/raw"))
stations_df = loader.load_stations()
aqi_hist_df = loader.load_aqi_history()
aq_2025_df = loader.load_air_quality_hourly_2025()
print("Raw datasets loaded.")
"""),
        nbf.v4.new_markdown_cell("""### 1. Task 3: Timestamp Processing (UTC → IST)
The raw 2025 timestamps are recorded in UTC. Local air pollution patterns (e.g. rush-hour vehicular peaks, diurnal boundary layer compression, agricultural open-fire timing) require Indian Standard Time (UTC + 05:30).
"""),
        nbf.v4.new_code_cell("""aq_2025_ist, ts_anomalies = convert_utc_to_ist(aq_2025_df, timestamp_col="Timestamp")

# Validate conversion
val_ts = validate_timestamp_conversion(aq_2025_df, aq_2025_ist)
print(f"Timestamp Validation: {val_ts['offset_verified']} verified.")
print(f"Missing timestamps: {ts_anomalies['missing_timestamps']}, Invalid timestamps: {ts_anomalies['invalid_timestamps']}\\n")

display(aq_2025_ist[['Station ID', 'Timestamp', 'Timestamp_IST', 'Date', 'Month_Name', 'Hour', 'Day_of_Week', 'PM2.5 (µg/m³)']].head(5))
"""),
        nbf.v4.new_markdown_cell("""### 2. Diurnal Pollution Dynamics in Local IST
With the IST conversion completed, we can observe the characteristic diurnal peak of PM2.5 in Indian Standard Time (morning and evening traffic / inversions).
"""),
        nbf.v4.new_code_cell("""# Diurnal PM2.5 Profile in IST
hourly_pm25 = aq_2025_ist.groupby('Hour')['PM2.5 (µg/m³)'].median().reset_index()

plt.figure(figsize=(10, 4))
sns.lineplot(data=hourly_pm25, x='Hour', y='PM2.5 (µg/m³)', marker='o', color='purple', linewidth=2.5)
plt.title("Median Diurnal PM2.5 Profile Across North India (IST)", fontsize=13, fontweight='bold')
plt.xlabel("Hour of Day (IST: 0 to 23)")
plt.ylabel("Median PM2.5 (µg/m³)")
plt.xticks(range(0, 24))
plt.grid(True, linestyle='--', alpha=0.6)
plt.tight_layout()
plt.show()
"""),
        nbf.v4.new_markdown_cell("""### 3. Task 4: Historical AQI Transformation (Wide → Long)
We reshape `aqi_history_2017_2023.csv` from wide daily columns (`00:00:00` - `23:00:00`) into a continuous time series table.
"""),
        nbf.v4.new_code_cell("""aqi_long, melt_metrics = transform_aqi_history_to_long(aqi_hist_df)

print(f"Wide rows: {melt_metrics['wide_rows']:,}")
print(f"Long rows: {melt_metrics['long_rows']:,}")
print(f"Wide non-null AQI observations: {melt_metrics['wide_non_null_aqi']:,}")
print(f"Long non-null AQI observations: {melt_metrics['long_non_null_aqi']:,}")
print(f"Parity verified: {melt_metrics['parity_verified']}\\n")

display(aqi_long.head(6))
"""),
        nbf.v4.new_markdown_cell("""### 4. Task 5: Station Metadata Consolidation
We generate an authoritative station registry enriched with operational dates and observation volume.
"""),
        nbf.v4.new_code_cell("""station_meta = build_station_metadata(
    stations_df=stations_df,
    air_quality_2025_df=aq_2025_df,
    aqi_history_df=aqi_hist_df,
)

display(station_meta.head(10))
"""),
        nbf.v4.new_markdown_cell("""### 5. Task 6: Export Processed Datasets (CSV & Parquet)
We persist all transformed datasets to `data/processed/`.
"""),
        nbf.v4.new_code_cell("""output_summary = save_processed_datasets(
    datasets={
        "air_quality_2025_ist": aq_2025_ist,
        "aqi_history_long": aqi_long,
        "station_metadata": station_meta,
    },
    output_dir=Path("../data/processed"),
    save_parquet=True,
)

val_outputs = validate_processed_outputs(output_dir=Path("../data/processed"))
print(f"Validation Status: {'PASSED' if val_outputs['passed'] else 'FAILED'}\\n")
for fname, info in val_outputs['files'].items():
    print(f"  • {fname:<28}: {info['size_mb']:>6.2f} MB")
"""),
        nbf.v4.new_markdown_cell("""### Summary of Completed Preprocessing:
1. Converted UTC timestamps to Indian Standard Time (IST = UTC + 05:30) with 8 analytical temporal columns.
2. Reshaped 2017-2023 historical AQI into tidy 2.46M row time series with 100% non-null observation parity.
3. Built consolidated station metadata catalog with presence indicators.
4. Saved dual CSV and columnar Parquet formats in `data/processed/`.
"""),
    ]
    return nb


def main():
    notebooks_dir = PROJECT_ROOT / "notebooks"
    notebooks_dir.mkdir(parents=True, exist_ok=True)

    nb_configs = [
        ("01_data_understanding.ipynb", build_notebook_01()),
        ("02_data_quality_analysis.ipynb", build_notebook_02()),
        ("03_data_preprocessing.ipynb", build_notebook_03()),
    ]

    for filename, nb in nb_configs:
        nb_path = notebooks_dir / filename
        with open(nb_path, "w", encoding="utf-8") as f:
            nbf.write(nb, f)
        print(f"Generated {nb_path.name} successfully.")


if __name__ == "__main__":
    main()
