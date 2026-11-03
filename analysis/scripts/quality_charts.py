import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go

from config import (
    COLORS, set_scientific_style, save_multiformat, 
    add_research_metadata, ANALYTICS_OUTPUT_DIR
)
from data_loader import data_loader

def generate_quality_charts():
    print(">>> Generating Chart Group 7: Data Quality Visualisation (Charts 31-35)...")
    set_scientific_style()
    df = data_loader.get_2025_data()
    meta = data_loader.get_station_metadata()
    results = {}

    # =========================================================================
    # CHART 31: Missingness by Variable
    # =========================================================================
    vars_to_check = ['pm25', 'pm10', 'no2', 'so2', 'co', 'ozone', 'temp', 'rh', 'ws', 'rf', 'sr', 'bp', 'vws']
    var_labels = {
        'pm25': 'PM2.5 (Fine Particulate)',
        'pm10': 'PM10 (Coarse Particulate)',
        'no2': 'NO2 (Nitrogen Dioxide)',
        'so2': 'SO2 (Sulfur Dioxide)',
        'co': 'CO (Carbon Monoxide)',
        'ozone': 'Ozone (O3)',
        'temp': 'Ambient Temperature (AT)',
        'rh': 'Relative Humidity (RH)',
        'ws': 'Horizontal Wind Speed (WS)',
        'rf': 'Rainfall (RF)',
        'sr': 'Solar Radiation (SR)',
        'bp': 'Barometric Pressure (BP)',
        'vws': 'Vertical Wind Speed (VWS)'
    }

    missing_data = []
    total_rows = len(df)
    for v in vars_to_check:
        if v in df.columns:
            m_count = df[v].isna().sum()
            m_pct = (m_count / total_rows) * 100.0
            missing_data.append({
                'variable': v,
                'name': var_labels.get(v, v),
                'missing_count': m_count,
                'missing_pct': m_pct
            })

    missing_df = pd.DataFrame(missing_data).sort_values('missing_pct', ascending=True)
    os.makedirs(ANALYTICS_OUTPUT_DIR, exist_ok=True)
    missing_df.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'missingness_by_variable_2025.csv'), index=False)

    fig, ax = plt.subplots(figsize=(10, 6.5))
    bar_colors = ['#DC2626' if row['missing_pct'] > 50 else '#D97706' if row['missing_pct'] > 15 else '#055237'
                  for _, row in missing_df.iterrows()]
    bars = ax.barh(missing_df['name'], missing_df['missing_pct'], color=bar_colors, height=0.6, alpha=0.9)

    ax.axvline(15, color='#D97706', linestyle=':', label='Moderate Missingness (15%)')
    ax.axvline(50, color='#DC2626', linestyle='--', label='Severe Missingness (50% Exclusion Threshold)')
    ax.set_xlabel('Missing Data Percentage (%)', fontweight='bold')
    ax.set_ylabel('Chemical / Meteorological Parameter', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='lower right', fontsize=8.5)

    for bar, (_, row) in zip(bars, missing_df.iterrows()):
        xval = bar.get_width()
        ax.text(xval + 1, bar.get_y() + bar.get_height()/2.0,
                f"{xval:.1f}% ({int(row['missing_count']):,} rows)",
                va='center', fontsize=8, color=COLORS['dark_text'])

    ax.set_xlim(0, 105)
    add_research_metadata(fig,
                          title="CHART 31 — Parameter Missingness Telemetry Audit (2025 Dataset)",
                          question="Which monitored variables suffer from extensive sensor data loss or telemetry gaps?",
                          note="Barometric Pressure exhibits 81.3% missingness and is excluded from primary atmospheric models.")

    p_fig31 = px.bar(missing_df, y='name', x='missing_pct', orientation='h',
                     title="CHART 31 — Parameter Missingness Audit (2025)",
                     labels={'name': 'Parameter', 'missing_pct': 'Missing Percentage (%)'},
                     color='missing_pct', color_continuous_scale='Reds')
    results['chart_31'] = save_multiformat(fig, 'data_quality', 'chart_31_parameter_missingness_audit', p_fig31)

    # =========================================================================
    # CHART 32: Station-wise Data Coverage Heatmap (Monthly Completeness)
    # =========================================================================
    # Calculate monthly uptime per station
    # Theoretical hours per month: [744, 672, 744, 720, 744, 720, 744, 744, 720, 744, 720, 744]
    days_in_month = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
    stn_month_counts = df.groupby(['station_name', 'month'])['pm25'].count().unstack(level='month')
    
    # Calculate coverage %
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    stn_month_coverage = pd.DataFrame(index=stn_month_counts.index)
    for m in range(1, 13):
        expected_hrs = days_in_month[m] * 24
        stn_month_coverage[month_labels[m-1]] = (stn_month_counts[m] / expected_hrs * 100.0).clip(upper=100.0)

    # Sort stations by average coverage
    stn_month_coverage['mean_cov'] = stn_month_coverage.mean(axis=1)
    stn_month_coverage = stn_month_coverage.sort_values('mean_cov', ascending=False).drop(columns=['mean_cov'])

    fig, ax = plt.subplots(figsize=(11, 12))
    sns.heatmap(stn_month_coverage, cmap='RdYlGn', vmin=70, vmax=100, ax=ax,
                cbar_kws={'label': 'Data Completeness (% of Expected Hours)'},
                linewidths=0.2, linecolor='#FFFFFF', annot=True, fmt='.0f', annot_kws={'size': 6.5})
    ax.set_title("Station-by-Month Operating Completeness Heatmap Matrix", fontsize=11, fontweight='bold', pad=10)
    ax.set_ylabel("CAAQMS Monitoring Site", fontweight='bold')
    ax.set_xlabel("Month (2025)", fontweight='bold')

    add_research_metadata(fig,
                          title="CHART 32 — CAAQMS Station Data Coverage & Completeness Matrix",
                          question="Do all 48 monitoring stations meet the statutory CPCB 85% operating uptime threshold?",
                          note="Statutory guideline: >85% annual data capture required for regulatory compliance certification.")

    p_fig32 = px.imshow(stn_month_coverage, labels=dict(x="Month", y="Station", color="Coverage %"),
                        x=month_labels, y=stn_month_coverage.index, color_continuous_scale='RdYlGn', zmin=70, zmax=100,
                        title="CHART 32 — Station-by-Month Uptime Matrix")
    results['chart_32'] = save_multiformat(fig, 'data_quality', 'chart_32_station_coverage_heatmap', p_fig32)

    # =========================================================================
    # CHART 33: Sensor Saturation Analysis (Ceiling Ceilings)
    # =========================================================================
    pm25_ceil_count = (df['pm25'] >= 999.9).sum()
    pm10_ceil_count = (df['pm10'] >= 1000.0).sum()
    co_ceil_count = (df['co'] >= 10.0).sum()

    ceil_df = pd.DataFrame([
        {'Pollutant': 'PM2.5 (999.9 µg/m³)', 'Count': pm25_ceil_count, 'Limit': '999.9 µg/m³', 'Color': '#DC2626'},
        {'Pollutant': 'PM10 (1000.0 µg/m³)', 'Count': pm10_ceil_count, 'Limit': '1000.0 µg/m³', 'Color': '#D97706'},
        {'Pollutant': 'CO (10.0 mg/m³)', 'Count': co_ceil_count, 'Limit': '10.0 mg/m³', 'Color': '#7C3AED'},
    ])

    fig, ax = plt.subplots(figsize=(8.5, 5))
    bars = ax.bar(ceil_df['Pollutant'], ceil_df['Count'], color=ceil_df['Color'], width=0.45, alpha=0.9)

    ax.set_ylabel('Number of Right-Censored Saturated Hours', fontweight='bold')
    ax.set_xlabel('Sensor Ceilings & ADC Thresholds', fontweight='bold')
    ax.set_yscale('log')
    ax.set_ylim(1, max(ceil_df['Count']) * 5)

    for bar, (_, row) in zip(bars, ceil_df.iterrows()):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval * 1.3,
                f"{int(yval):,} hours\n(Ceiling: {row['Limit']})",
                ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    add_research_metadata(fig,
                          title="CHART 33 — Instrument Right-Censoring: CAAQMS Detector Saturation Limits",
                          question="How frequently do catastrophic pollution episodes exceed the physical measurement limits of CAAQMS sensors?",
                          note="Log scale. Right-censored values represent sensor limits of detection, not absolute environmental ceilings.")

    p_fig33 = px.bar(ceil_df, x='Pollutant', y='Count', color='Pollutant',
                     color_discrete_map={'PM2.5 (999.9 µg/m³)': '#DC2626', 'PM10 (1000.0 µg/m³)': '#D97706', 'CO (10.0 mg/m³)': '#7C3AED'},
                     title="CHART 33 — Sensor Saturation Frequency (Right-Censored Hours)",
                     labels={'Count': 'Saturated Hours (Log Scale)', 'Pollutant': 'Sensor Threshold'})
    p_fig33.update_yaxes(type="log")
    results['chart_33'] = save_multiformat(fig, 'data_quality', 'chart_33_sensor_saturation_analysis', p_fig33)

    # =========================================================================
    # CHART 34: Barometric Pressure Distribution & Anomaly Labeling
    # =========================================================================
    bp_valid = df['bp'].dropna()

    fig, ax = plt.subplots(figsize=(9, 5.5))
    sns.histplot(bp_valid, bins=60, kde=True, color='#2563EB', ax=ax, alpha=0.6)

    # Standard sea level / Indo-Gangetic Plain reference: ~740 - 760 mmHg
    ax.axvspan(735, 765, color='#10B981', alpha=0.2, label='Expected Indo-Gangetic Plain Range (735-765 mmHg)')
    ax.axvline(800, color='#DC2626', linestyle='--', linewidth=1.5, label='Transducer Drift Boundary (>800 mmHg)')

    # Count anomalous values
    drift_count = (bp_valid > 800).sum()
    drift_pct = (drift_count / len(bp_valid)) * 100.0

    ax.text(0.72, 0.75, f"Uncalibrated Transducer Drift:\n{drift_count:,} hours ({drift_pct:.1f}%)\nexceed 800 mmHg\n(Physically Implausible)",
            transform=ax.transAxes, fontsize=8, bbox=dict(facecolor='#FEF2F2', edgecolor='#FCA5A5', boxstyle='round,pad=0.3'))

    ax.set_xlabel('Barometric Pressure (mmHg)', fontweight='bold')
    ax.set_ylabel('Measurement Frequency (Hours)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper left', fontsize=8.5)

    add_research_metadata(fig,
                          title="CHART 34 — Barometric Pressure Telemetry Distribution & Transducer Drift Anomaly",
                          question="Why must barometric pressure telemetry be excluded from physical regression models?",
                          note="81.34% missingness combined with sensor drift >800 mmHg indicates transducer calibration failure.")

    p_fig34 = px.histogram(bp_valid, nbins=60, title="CHART 34 — Barometric Pressure Distribution",
                           labels={'value': 'Barometric Pressure (mmHg)'}, color_discrete_sequence=['#2563EB'])
    results['chart_34'] = save_multiformat(fig, 'data_quality', 'chart_34_barometric_pressure_anomaly', p_fig34)

    # =========================================================================
    # CHART 35: Vertical Wind Speed (VWS) Distribution (Valid Downdrafts)
    # =========================================================================
    vws_valid = df['vws'].dropna()

    fig, ax = plt.subplots(figsize=(9, 5.5))
    # Separate positive and negative VWS
    sns.histplot(vws_valid, bins=80, kde=True, color=COLORS['primary'], ax=ax, alpha=0.55)

    ax.axvline(0, color='#DC2626', linestyle='-', linewidth=1.8, label='Zero Reference Velocity (v_z = 0 m/s)')
    ax.axvspan(-4.5, 0, color='#FEF3C7', alpha=0.3, label='Negative VWS: Atmospheric Subsidence / Downdrafts (Trapping)')
    ax.axvspan(0, 4.5, color='#ECFDF5', alpha=0.3, label='Positive VWS: Convective Updrafts (Dispersion)')

    neg_count = (vws_valid < 0).sum()
    neg_pct = (neg_count / len(vws_valid)) * 100.0

    ax.text(0.04, 0.78, f"Valid Physical Downdrafts:\n{neg_count:,} hours ({neg_pct:.1f}%)\nNegative vertical velocity\nsuppresses vertical dispersion",
            transform=ax.transAxes, fontsize=8, bbox=dict(facecolor='#FFFBEB', edgecolor='#FDE68A', boxstyle='round,pad=0.3'))

    ax.set_xlabel('Vertical Wind Speed (VWS, m/s)', fontweight='bold')
    ax.set_ylabel('Measurement Frequency (Hours)', fontweight='bold')
    ax.set_xlim(-4.5, 4.5)
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right', fontsize=8.5)

    add_research_metadata(fig,
                          title="CHART 35 — Vertical Wind Speed: Convective Updrafts vs Subsidence Downdrafts",
                          question="Are negative vertical wind speed measurements sensor errors or valid atmospheric phenomena?",
                          note="Negative VWS signifies air subsidence (downward movement) which creates thermodynamic capping during smog episodes.")

    p_fig35 = px.histogram(vws_valid, nbins=80, title="CHART 35 — Vertical Wind Speed Distribution",
                           labels={'value': 'Vertical Wind Speed (m/s)'}, color_discrete_sequence=[COLORS['primary']])
    p_fig35.add_vline(x=0, line_color="#DC2626", annotation_text="v_z = 0 m/s")
    results['chart_35'] = save_multiformat(fig, 'data_quality', 'chart_35_vertical_wind_speed_distribution', p_fig35)

    print(">>> Finished Chart Group 7.")
    return results

if __name__ == '__main__':
    generate_quality_charts()

