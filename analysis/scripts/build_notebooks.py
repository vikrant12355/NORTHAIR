import os
import json

notebooks_dir = os.path.join(os.path.dirname(__file__), '..', 'notebooks')
os.makedirs(notebooks_dir, exist_ok=True)

notebook_specs = [
    {
        'filename': '01_regional_analysis.ipynb',
        'title': '01 — Regional Air Pollution Analysis',
        'desc': 'Investigating geographical divergence in particulate concentrations across Chandigarh, Punjab, Haryana, and Delhi. Evaluating Measurement-Weighted vs Station-Balanced regional summaries.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from regional_charts import generate_regional_charts

# Generate research charts 1 to 5
results = generate_regional_charts()
print("Regional charts generated:", list(results.keys()))

# Inspect regional comparison dataframe
reg_df = data_loader.get_regional_comparison('pm25')
display(reg_df)
'''
    },
    {
        'filename': '02_temporal_analysis.ipynb',
        'title': '02 — Monthly and Temporal Pollution Analysis',
        'desc': 'Evaluating chronological evolution across 12 calendar months in 2025. Analyzing multi-pollutant trends (PM2.5, PM10, NO2, SO2) and station-month exposure heatmaps.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from temporal_charts import generate_temporal_charts

results = generate_temporal_charts()
print("Temporal charts generated:", list(results.keys()))

df = data_loader.get_2025_data()
monthly = df.groupby('month')[['pm25', 'pm10', 'no2', 'so2']].mean()
display(monthly)
'''
    },
    {
        'filename': '03_diurnal_analysis.ipynb',
        'title': '03 — Diurnal Cycle & Boundary Layer Ventilation Analysis',
        'desc': 'Hour-of-day (IST) telemetry analysis from 00:00 to 23:00. Uncovering the 13:00-16:30 cleanroom ventilation window and morning/evening commute spikes.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from diurnal_charts import generate_diurnal_charts

results = generate_diurnal_charts()
print("Diurnal charts generated:", list(results.keys()))

df = data_loader.get_2025_data()
hourly = df.groupby('hour')[['pm25', 'pm10', 'ws']].mean()
display(hourly)
'''
    },
    {
        'filename': '04_seasonal_analysis.ipynb',
        'title': '04 — Seasonal Dynamics & Monsoon Washout Scavenging',
        'desc': 'Comparing atmospheric regimes: Winter, Pre-Monsoon, Monsoon, and Post-Monsoon. Quantifying below-cloud precipitation scavenging and boundary layer compression.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader

daily_df = data_loader.get_daily_station_summary()
seasonal_stats = daily_df.groupby('season')[['pm25', 'pm10', 'temp', 'rh', 'ws']].mean()
display(seasonal_stats)
'''
    },
    {
        'filename': '05_weather_analysis.ipynb',
        'title': '05 — Meteorological Drivers & Chemical Coupling',
        'desc': 'Bivariate regressions and Pearson/Spearman correlations across Temperature, Humidity, Wind Speed, Rainfall, and Ozone.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from weather_charts import generate_weather_charts

results = generate_weather_charts()
print("Weather charts generated:", list(results.keys()))

daily_df = data_loader.get_daily_station_summary()
display(daily_df[['pm25', 'temp', 'rh', 'ws']].corr(method='pearson'))
'''
    },
    {
        'filename': '06_hotspot_analysis.ipynb',
        'title': '06 — Pollution Hotspot Identification & Persistence Matrix',
        'desc': 'Ranking monitoring sites by Mean, P90, and Persistence (% Days > 60 µg/m³). Four-quadrant classification of chronic hotspots vs cleanrooms.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from hotspot_charts import generate_hotspot_charts

results = generate_hotspot_charts()
print("Hotspot charts generated:", list(results.keys()))
'''
    },
    {
        'filename': '07_historical_aqi_analysis.ipynb',
        'title': '07 — Historical AQI Macro Trajectory (2017–2023)',
        'desc': 'Multi-year retrospective evaluation across 2.46M records tracking NCAP (2019) impacts, COVID lockdown anomaly (2020), and recurring smog cycles.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from historical_charts import generate_historical_charts

results = generate_historical_charts()
print("Historical charts generated:", list(results.keys()))

df_hist = data_loader.get_historical_data()
annual = df_hist.groupby('year')['aqi'].describe()
display(annual)
'''
    },
    {
        'filename': '08_data_quality_visualisation.ipynb',
        'title': '08 — Data Quality Governance & Sensor Integrity Audit',
        'desc': 'Auditing parameter missingness, 100% CPCB statutory 85% uptime compliance, BAM-1020 sensor saturation ceilings, and Barometric Pressure transducer drift.',
        'code': '''import sys, os
sys.path.append(os.path.abspath('../scripts'))
from data_loader import data_loader
from quality_charts import generate_quality_charts

results = generate_quality_charts()
print("Data quality charts generated:", list(results.keys()))
'''
    }
]

for spec in notebook_specs:
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    f"# {spec['title']}\n",
                    f"**NorthAir Intelligence — VIZ-A-THON 2026**\n\n",
                    f"{spec['desc']}\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [spec['code']]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {"name": "ipython", "version": 3},
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.12.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    nb_path = os.path.join(notebooks_dir, spec['filename'])
    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2)
    print(f"Created notebook: {nb_path}")

print("All 8 research notebooks created successfully.")

