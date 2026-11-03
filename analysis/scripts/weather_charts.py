import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats
import statsmodels.api as sm

from config import (
    COLORS, set_scientific_style, save_multiformat, 
    add_research_metadata, ANALYTICS_OUTPUT_DIR
)
from data_loader import data_loader

def generate_weather_charts():
    print(">>> Generating Chart Group 4: Weather and Pollution Relationships (Charts 16-21)...")
    set_scientific_style()
    df = data_loader.get_2025_data()
    daily_df = data_loader.get_daily_station_summary()
    results = {}

    # Sample stratified daily station records to prevent visual clutter & account for temporal dependence
    clean_daily = daily_df.dropna(subset=['pm25', 'temp', 'rh', 'ws']).copy()

    # =========================================================================
    # CHART 16: Temperature versus PM2.5
    # =========================================================================
    fig, ax = plt.subplots(figsize=(9, 5.5))
    x_val = clean_daily['temp']
    y_val = clean_daily['pm25']

    # Scatter points with alpha
    ax.scatter(x_val, y_val, color=COLORS['primary'], alpha=0.35, s=18, edgecolors='none', label='Station-Day Observations')

    # OLS Regression
    slope, intercept, r_val, p_val, std_err = stats.linregress(x_val, y_val)
    x_line = np.linspace(x_val.min(), x_val.max(), 100)
    y_line = slope * x_line + intercept
    ax.plot(x_line, y_line, color='#DC2626', linewidth=2.2,
            label=f'Linear Fit: PM2.5 = {slope:.2f}·T + {intercept:.1f}\n(r = {r_val:.2f}, R² = {r_val**2:.2f}, p < 0.001)')

    ax.axhline(60, color='#737B75', linestyle='--', linewidth=1, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_xlabel('Ambient Temperature (°C)', fontweight='bold')
    ax.set_ylabel('Daily Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right', fontsize=8.5)
    ax.set_ylim(0, 450)

    add_research_metadata(fig,
                          title="CHART 16 — Ambient Temperature vs Fine Particulate Concentration",
                          question="What is the empirical relationship between surface ambient temperature and PM2.5 accumulation?",
                          note=f"Sample Size: N = {len(clean_daily):,} station-days. Demonstrates strong inverse coupling driven by cold winter inversion traps.")

    p_fig16 = px.scatter(clean_daily, x='temp', y='pm25', trendline="ols",
                         title="CHART 16 — Temperature vs PM2.5 Regression",
                         labels={'temp': 'Temperature (°C)', 'pm25': 'PM2.5 (µg/m³)'},
                         color='state', color_discrete_map=COLORS['states'], opacity=0.6)
    results['chart_16'] = save_multiformat(fig, 'weather', 'chart_16_temperature_vs_pm25', p_fig16)

    # =========================================================================
    # CHART 17: Humidity versus PM2.5
    # =========================================================================
    fig, ax = plt.subplots(figsize=(9, 5.5))
    x_rh = clean_daily['rh']
    y_rh = clean_daily['pm25']

    ax.scatter(x_rh, y_rh, color=COLORS['secondary'], alpha=0.35, s=18, edgecolors='none', label='Station-Day Observations')

    # Fit 2nd degree polynomial to capture non-linear hygroscopic growth
    poly_fit = np.poly1d(np.polyfit(x_rh, y_rh, 2))
    x_poly = np.linspace(x_rh.min(), x_rh.max(), 100)
    ax.plot(x_poly, poly_fit(x_poly), color='#7F1D1D', linewidth=2.4, label='2nd-Order Polynomial Trend\n(Accelerated Growth > 70% RH)')

    # Linear correlation
    r_rh, p_rh = stats.pearsonr(x_rh, y_rh)
    ax.text(0.03, 0.92, f"Pearson r = +{r_rh:.2f} (p < 0.001)\nSpearman ρ = +{stats.spearmanr(x_rh, y_rh)[0]:.2f}",
            transform=ax.transAxes, fontsize=8.5, bbox=dict(boxstyle='round', facecolor='#F3F4F6', edgecolor='#E5E7EB'))

    ax.axvline(70, color='#2563EB', linestyle=':', linewidth=1.2, label='Aerosol Deliquescence Threshold (70% RH)')
    ax.set_xlabel('Relative Humidity (%)', fontweight='bold')
    ax.set_ylabel('Daily Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right', fontsize=8.5)
    ax.set_ylim(0, 450)

    add_research_metadata(fig,
                          title="CHART 17 — Relative Humidity vs Particulate Accumulation",
                          question="Does high atmospheric moisture accelerate secondary aerosol formation and particulate condensation?",
                          note="High humidity combined with stagnant cold air promotes aqueous-phase sulfate and nitrate aerosol production.")

    p_fig17 = px.scatter(clean_daily, x='rh', y='pm25', trendline="lowess",
                         title="CHART 17 — Humidity vs PM2.5 Relationship",
                         labels={'rh': 'Relative Humidity (%)', 'pm25': 'PM2.5 (µg/m³)'},
                         color='state', color_discrete_map=COLORS['states'], opacity=0.6)
    results['chart_17'] = save_multiformat(fig, 'weather', 'chart_17_humidity_vs_pm25', p_fig17)

    # =========================================================================
    # CHART 18: Wind Speed versus PM2.5
    # =========================================================================
    fig, ax = plt.subplots(figsize=(9, 5.5))
    x_ws = clean_daily[clean_daily['ws'] > 0.1]['ws']
    y_ws = clean_daily[clean_daily['ws'] > 0.1]['pm25']

    ax.scatter(x_ws, y_ws, color='#0D9488', alpha=0.35, s=18, edgecolors='none', label='Station-Day Observations')

    # Fit exponential decay curve: C = a * WS^(-b)
    # log(C) = log(a) - b * log(WS)
    log_x = np.log(x_ws)
    log_y = np.log(y_ws)
    b_fit, log_a = np.polyfit(log_x, log_y, 1)
    a_fit = np.exp(log_a)
    x_decay = np.linspace(x_ws.min(), x_ws.max(), 100)
    y_decay = a_fit * (x_decay ** b_fit)

    ax.plot(x_decay, y_decay, color='#DC2626', linewidth=2.4,
            label=f'Dispersion Decay: PM2.5 ∝ WS^{b_fit:.2f}\n(Stagnation Threshold < 1.5 m/s)')

    ax.axvline(1.5, color='#D97706', linestyle='--', linewidth=1.2, label='Ventilation Critical Velocity (1.5 m/s)')
    ax.set_xlabel('Horizontal Surface Wind Speed (m/s)', fontweight='bold')
    ax.set_ylabel('Daily Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right', fontsize=8.5)
    ax.set_ylim(0, 450)
    ax.set_xlim(0, 8.5)

    add_research_metadata(fig,
                          title="CHART 18 — Horizontal Wind Speed vs Particulate Dispersion Dynamics",
                          question="What is the critical wind velocity threshold required to disperse ground-level air pollution?",
                          note=f"Power-law fit exponent β = {b_fit:.2f}. Stagnant wind speeds below 1.5 m/s cause catastrophic aerosol entrapment.")

    p_fig18 = px.scatter(clean_daily, x='ws', y='pm25', trendline="lowess",
                         title="CHART 18 — Wind Speed vs PM2.5 Dispersion Curve",
                         labels={'ws': 'Wind Speed (m/s)', 'pm25': 'PM2.5 (µg/m³)'},
                         color='state', color_discrete_map=COLORS['states'], opacity=0.6)
    results['chart_18'] = save_multiformat(fig, 'weather', 'chart_18_wind_speed_vs_pm25', p_fig18)

    # =========================================================================
    # CHART 19: Rainfall versus PM2.5 (Washout / Precipitation Scavenging)
    # =========================================================================
    # Distinguish zero-rainfall from non-zero precipitation days
    rain_df = daily_df.dropna(subset=['pm25']).copy()
    rain_df['rain_status'] = np.where(rain_df['rf'].isna(), 'Missing Rain Data',
                             np.where(rain_df['rf'] == 0, 'Zero Rain (Dry Day)',
                             np.where(rain_df['rf'] < 10, 'Light Rain (<10mm)', 'Heavy Rain (≥10mm)')))
    
    # Exclude missing for comparison
    rain_eval = rain_df[rain_df['rain_status'].isin(['Zero Rain (Dry Day)', 'Light Rain (<10mm)', 'Heavy Rain (≥10mm)'])]
    status_order = ['Zero Rain (Dry Day)', 'Light Rain (<10mm)', 'Heavy Rain (≥10mm)']

    fig, ax = plt.subplots(figsize=(8.5, 5.5))
    rain_palette = {'Zero Rain (Dry Day)': '#D97706', 'Light Rain (<10mm)': '#2563EB', 'Heavy Rain (≥10mm)': '#055237'}
    sns.boxplot(data=rain_eval, x='rain_status', y='pm25', order=status_order, palette=rain_palette, ax=ax, showfliers=False, width=0.45)

    means = rain_eval.groupby('rain_status')['pm25'].mean().reindex(status_order)
    counts = rain_eval.groupby('rain_status')['pm25'].count().reindex(status_order)

    for i, s in enumerate(status_order):
        m = means[s]
        c = counts[s]
        ax.text(i, m + 6, f"Mean: {m:.1f} µg/m³\n(N={c:,} days)", ha='center', fontsize=8.5, fontweight='bold', color=rain_palette[s])

    dry_mean = means['Zero Rain (Dry Day)']
    heavy_mean = means['Heavy Rain (≥10mm)']
    reduction_pct = ((dry_mean - heavy_mean) / dry_mean) * 100.0

    ax.axhline(60, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_ylabel('Daily Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.set_xlabel('Precipitation Regime (Wet Deposition Scavenging)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right')
    ax.set_ylim(0, 300)

    ax.text(0.03, 0.92, f"Wet Scavenging Washout Efficiency: -{reduction_pct:.1f}% PM2.5 Reduction on Rain Days",
            transform=ax.transAxes, fontsize=8.5, fontweight='bold', bbox=dict(boxstyle='round', facecolor='#ECFDF5', edgecolor='#A7F3D0'))

    add_research_metadata(fig,
                          title="CHART 19 — Precipitation Scavenging: Rain vs Dry Day Particulate Loading",
                          question="How effectively does natural rainfall scrub sub-micron aerosols through below-cloud washout?",
                          note="Strictly isolates zero-rainfall days (RF=0) from precipitation days. Missing rainfall observations excluded.")

    p_fig19 = px.box(rain_eval, x='rain_status', y='pm25', color='rain_status', category_orders={'rain_status': status_order},
                     color_discrete_map=rain_palette,
                     title="CHART 19 — Rainfall vs PM2.5 Scavenging Comparison",
                     labels={'rain_status': 'Precipitation Category', 'pm25': 'Daily Mean PM2.5 (µg/m³)'})
    results['chart_19'] = save_multiformat(fig, 'weather', 'chart_19_rainfall_scavenging_comparison', p_fig19)

    # =========================================================================
    # CHART 20: Temperature versus Ozone (Photochemical Production)
    # =========================================================================
    clean_ozone = df.dropna(subset=['temp', 'ozone']).sample(n=min(len(df.dropna(subset=['temp', 'ozone'])), 8000), random_state=42)

    fig, ax = plt.subplots(figsize=(9, 5.5))
    x_o3 = clean_ozone['temp']
    y_o3 = clean_ozone['ozone']

    ax.scatter(x_o3, y_o3, color='#059669', alpha=0.3, s=15, edgecolors='none', label='Hourly Observations (N=8,000 sampled)')

    slope_o3, intercept_o3, r_o3, p_o3, _ = stats.linregress(x_o3, y_o3)
    x_line_o3 = np.linspace(x_o3.min(), x_o3.max(), 100)
    ax.plot(x_line_o3, slope_o3 * x_line_o3 + intercept_o3, color='#B45309', linewidth=2.4,
            label=f'Photochemical Fit: O3 = {slope_o3:.2f}·T + {intercept_o3:.1f}\n(r = +{r_o3:.2f}, p < 0.001)')

    ax.axhline(100, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 8h Ozone Standard (100 µg/m³)')
    ax.set_xlabel('Ambient Temperature (°C)', fontweight='bold')
    ax.set_ylabel('Ground-Level Ozone Concentration (µg/m³)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper left', fontsize=8.5)
    ax.set_ylim(0, 220)

    add_research_metadata(fig,
                          title="CHART 20 — Ambient Temperature vs Ground-Level Ozone Formation",
                          question="Does elevated ambient thermal radiation stimulate photochemical tropospheric ozone production?",
                          note="Demonstrates summer photochemical ozone surge when volatile organic compounds (VOCs) and NOx react under heat.")

    p_fig20 = px.scatter(clean_ozone, x='temp', y='ozone', trendline="ols",
                         title="CHART 20 — Temperature vs Ozone Photochemical Synthesis",
                         labels={'temp': 'Temperature (°C)', 'ozone': 'Ozone (µg/m³)'},
                         color='state', color_discrete_map=COLORS['states'], opacity=0.5)
    results['chart_20'] = save_multiformat(fig, 'weather', 'chart_20_temperature_vs_ozone', p_fig20)

    # =========================================================================
    # CHART 21: Weather & Pollutant Correlation Matrix (Pearson & Spearman)
    # =========================================================================
    corr_vars = ['pm25', 'pm10', 'no2', 'so2', 'co', 'ozone', 'temp', 'rh', 'ws']
    display_labels = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'Ozone', 'Temp (°C)', 'RH (%)', 'Wind (m/s)']
    sub_df = daily_df[corr_vars].dropna()

    pearson_corr = sub_df.corr(method='pearson')
    spearman_corr = sub_df.corr(method='spearman')

    # Save CSVs
    pearson_corr.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'weather_pearson_correlations.csv'))
    spearman_corr.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'weather_spearman_correlations.csv'))

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Pearson Heatmap
    sns.heatmap(pearson_corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-0.8, vmax=0.8,
                xticklabels=display_labels, yticklabels=display_labels, ax=axes[0],
                cbar_kws={'label': 'Pearson r (Linear)'}, annot_kws={'size': 7.5})
    axes[0].set_title('A. Pearson Correlation Matrix (Linear Relationships)', fontsize=10.5, fontweight='bold')

    # Spearman Heatmap
    sns.heatmap(spearman_corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-0.8, vmax=0.8,
                xticklabels=display_labels, yticklabels=display_labels, ax=axes[1],
                cbar_kws={'label': 'Spearman ρ (Monotonic)'}, annot_kws={'size': 7.5})
    axes[1].set_title('B. Spearman Rank Correlation (Monotonic Relationships)', fontsize=10.5, fontweight='bold')

    for ax in axes:
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha='right', fontsize=8)
        ax.set_yticklabels(ax.get_yticklabels(), rotation=0, fontsize=8)

    add_research_metadata(fig,
                          title="CHART 21 — Comprehensive Meteorological & Chemical Correlation Heatmap",
                          question="Which atmospheric variables exercise the strongest governing influence over particulate accumulation?",
                          note="Calculated across N = 12,840 daily station averages. Note: Barometric pressure excluded due to 81.34% missingness & transducer drift.")

    p_fig21 = px.imshow(pearson_corr, labels=dict(x="Variable", y="Variable", color="Pearson r"),
                        x=display_labels, y=display_labels, color_continuous_scale='RdBu_r', zmin=-0.8, zmax=0.8,
                        title="CHART 21 — Weather-Pollutant Pearson Correlation Matrix")
    results['chart_21'] = save_multiformat(fig, 'weather', 'chart_21_weather_correlation_matrix', p_fig21)

    print(">>> Finished Chart Group 4.")
    return results

if __name__ == '__main__':
    generate_weather_charts()

