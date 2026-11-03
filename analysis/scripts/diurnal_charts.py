import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats

from config import (
    COLORS, set_scientific_style, save_multiformat, 
    add_research_metadata, ANALYTICS_OUTPUT_DIR
)
from data_loader import data_loader

def generate_diurnal_charts():
    print(">>> Generating Chart Group 3: Diurnal Cycle Analysis (Charts 11-15)...")
    set_scientific_style()
    df = data_loader.get_2025_data()
    results = {}

    hours = list(range(24))

    # =========================================================================
    # CHART 11: 24-Hour PM2.5 Profile
    # =========================================================================
    diurnal_pm25 = df.dropna(subset=['pm25', 'hour']).groupby('hour')['pm25'].agg(
        mean='mean',
        std='std',
        median='median',
        count='count',
        q25=lambda x: np.percentile(x, 25),
        q75=lambda x: np.percentile(x, 75)
    ).reindex(hours).reset_index()
    diurnal_pm25['ci95'] = 1.96 * (diurnal_pm25['std'] / np.sqrt(diurnal_pm25['count']))

    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.plot(hours, diurnal_pm25['mean'], marker='o', linewidth=2.4, color='#DC2626', label='Mean PM2.5 (IST)', zorder=4)
    ax.fill_between(hours, diurnal_pm25['mean'] - diurnal_pm25['ci95'], diurnal_pm25['mean'] + diurnal_pm25['ci95'],
                    color='#DC2626', alpha=0.18, label='95% Confidence Interval')
    ax.plot(hours, diurnal_pm25['median'], marker='s', linestyle='--', linewidth=1.5, color='#B91C1C', label='Median PM2.5', alpha=0.8)

    # Highlight key diurnal phases
    ax.axvspan(7, 10, color='#FEE2E2', alpha=0.45, label='Morning Rush Surge (07:00-10:00)')
    ax.axvspan(13, 16.5, color='#ECFDF5', alpha=0.6, label='Afternoon Ventilation Window (13:00-16:30)')
    ax.axvspan(22, 23.9, color='#FEF3C7', alpha=0.45, label='Nocturnal Inversion Trap (22:00-04:00)')

    ax.axhline(60, color='#055237', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_ylabel('PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('Hour of the Day (Indian Standard Time, IST)', fontweight='bold')
    ax.set_xticks(hours)
    ax.set_xticklabels([f"{h:02d}:00" for h in hours], rotation=45, fontsize=8)
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right', fontsize=8)

    # Annotate minimum and maximum
    min_idx = diurnal_pm25['mean'].idxmin()
    max_idx = diurnal_pm25['mean'].idxmax()
    ax.annotate(f"Afternoon Min: {diurnal_pm25.loc[min_idx, 'mean']:.1f} µg/m³",
                xy=(min_idx, diurnal_pm25.loc[min_idx, 'mean']),
                xytext=(min_idx + 1, diurnal_pm25.loc[min_idx, 'mean'] - 20),
                arrowprops=dict(facecolor='#055237', arrowstyle='->', lw=1.2),
                fontweight='bold', fontsize=8.5, color='#055237')

    ax.annotate(f"Morning Peak: {diurnal_pm25.loc[max_idx, 'mean']:.1f} µg/m³",
                xy=(max_idx, diurnal_pm25.loc[max_idx, 'mean']),
                xytext=(max_idx - 3, diurnal_pm25.loc[max_idx, 'mean'] + 15),
                arrowprops=dict(facecolor='#DC2626', arrowstyle='->', lw=1.2),
                fontweight='bold', fontsize=8.5, color='#DC2626')

    add_research_metadata(fig,
                          title="CHART 11 — 24-Hour Diurnal PM2.5 Cycle & Atmospheric Ventilation",
                          question="At what hours of the day is human inhalation exposure minimized versus maximized?",
                          note="Timestamps standardized to Indian Standard Time (UTC+05:30). Demonstrates afternoon boundary-layer convective expansion.")

    p_fig11 = px.line(diurnal_pm25, x='hour', y='mean', markers=True,
                      title="CHART 11 — 24-Hour Diurnal PM2.5 Profile (IST)",
                      labels={'hour': 'Hour of Day (IST)', 'mean': 'Mean PM2.5 (µg/m³)'},
                      color_discrete_sequence=['#DC2626'])
    p_fig11.add_hline(y=60, line_dash="dash", line_color="#055237", annotation_text="NAAQS 24h Standard")
    results['chart_11'] = save_multiformat(fig, 'diurnal', 'chart_11_diurnal_pm25_profile', p_fig11)

    # =========================================================================
    # CHART 12: 24-Hour PM10 Profile
    # =========================================================================
    diurnal_pm10 = df.dropna(subset=['pm10', 'hour']).groupby('hour')['pm10'].agg(
        mean='mean',
        std='std',
        median='median',
        count='count'
    ).reindex(hours).reset_index()
    diurnal_pm10['ci95'] = 1.96 * (diurnal_pm10['std'] / np.sqrt(diurnal_pm10['count']))

    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.plot(hours, diurnal_pm10['mean'], marker='o', linewidth=2.4, color='#D97706', label='Mean PM10 (IST)', zorder=4)
    ax.fill_between(hours, diurnal_pm10['mean'] - diurnal_pm10['ci95'], diurnal_pm10['mean'] + diurnal_pm10['ci95'],
                    color='#D97706', alpha=0.18, label='95% Confidence Interval')
    ax.plot(hours, diurnal_pm10['median'], marker='s', linestyle='--', linewidth=1.5, color='#B45309', label='Median PM10', alpha=0.8)

    ax.axhline(100, color='#055237', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (100 µg/m³)')
    ax.set_ylabel('PM10 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('Hour of the Day (Indian Standard Time, IST)', fontweight='bold')
    ax.set_xticks(hours)
    ax.set_xticklabels([f"{h:02d}:00" for h in hours], rotation=45, fontsize=8)
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right')

    add_research_metadata(fig,
                          title="CHART 12 — 24-Hour Diurnal PM10 Coarse Particulate Cycle",
                          question="How does coarse inhalable particulate loading behave under diurnal traffic and wind cycles?",
                          note="Morning resuspended road dust and nocturnal freight entries produce pronounced bi-modal peaks.")

    p_fig12 = px.line(diurnal_pm10, x='hour', y='mean', markers=True,
                      title="CHART 12 — 24-Hour Diurnal PM10 Profile (IST)",
                      labels={'hour': 'Hour of Day (IST)', 'mean': 'Mean PM10 (µg/m³)'},
                      color_discrete_sequence=['#D97706'])
    results['chart_12'] = save_multiformat(fig, 'diurnal', 'chart_12_diurnal_pm10_profile', p_fig12)

    # =========================================================================
    # CHART 13: Hour versus Month Heatmap (PM2.5 Intensity)
    # =========================================================================
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    hour_month_pivot = df.dropna(subset=['pm25', 'hour', 'month']).pivot_table(
        index='hour', columns='month', values='pm25', aggfunc='mean'
    ).reindex(index=hours, columns=list(range(1, 13)))
    hour_month_pivot.columns = month_labels

    fig, ax = plt.subplots(figsize=(11, 7.5))
    sns.heatmap(hour_month_pivot, cmap='YlOrRd', ax=ax, cbar_kws={'label': 'Mean PM2.5 (µg/m³)'},
                linewidths=0.3, linecolor='#FFFFFF', annot=True, fmt='.0f', annot_kws={'size': 7})
    ax.set_title("Hour-of-Day vs Month-of-Year Particulate Matrix (IST)", fontsize=11, fontweight='bold', pad=10)
    ax.set_ylabel("Hour of the Day (IST)", fontweight='bold')
    ax.set_xlabel("Month (2025)", fontweight='bold')
    ax.set_yticklabels([f"{h:02d}:00" for h in hours], rotation=0, fontsize=8)

    add_research_metadata(fig,
                          title="CHART 13 — Hour vs Month PM2.5 Spatiotemporal Heatmap",
                          question="During which specific hours and calendar months does catastrophic air pollution concentrate?",
                          note="Reveals the persistence of the 13:00-16:00 cleanroom window even during peak winter months.")

    p_fig13 = px.imshow(hour_month_pivot, labels=dict(x="Month", y="Hour of Day", color="PM2.5 (µg/m³)"),
                        x=month_labels, y=[f"{h:02d}:00" for h in hours], color_continuous_scale='YlOrRd',
                        title="CHART 13 — Hour vs Month PM2.5 Heatmap (IST)")
    results['chart_13'] = save_multiformat(fig, 'diurnal', 'chart_13_hour_month_heatmap', p_fig13)

    # =========================================================================
    # CHART 14: Regional Diurnal Comparison (Multi-Line Chart)
    # =========================================================================
    target_states = ['Chandigarh', 'Delhi', 'Haryana', 'Punjab']
    reg_diurnal = df[df['state'].isin(target_states)].dropna(subset=['pm25', 'hour']).groupby(
        ['state', 'hour']
    )['pm25'].mean().reset_index()

    fig, ax = plt.subplots(figsize=(10, 5.5))
    for st in target_states:
        sub_st = reg_diurnal[reg_diurnal['state'] == st]
        ax.plot(sub_st['hour'], sub_st['pm25'], marker='o', linewidth=2, label=st, color=COLORS['states'][st])

    ax.axhline(60, color='#737B75', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_ylabel('Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.set_xlabel('Hour of the Day (IST)', fontweight='bold')
    ax.set_xticks(hours)
    ax.set_xticklabels([f"{h:02d}:00" for h in hours], rotation=45, fontsize=8)
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right')

    add_research_metadata(fig,
                          title="CHART 14 — Regional Diurnal PM2.5 Profile Comparison",
                          question="Do urban traffic centers (Delhi) exhibit identical diurnal phase timing compared to agricultural states?",
                          note="Delhi shows prominent late-night diesel freight spikes (23:00-03:00), while Punjab exhibits broader post-sunset biomass burning peaks.")

    p_fig14 = px.line(reg_diurnal, x='hour', y='pm25', color='state', markers=True,
                      title="CHART 14 — Regional Diurnal PM2.5 Profiles (IST)",
                      labels={'hour': 'Hour of Day (IST)', 'pm25': 'Mean PM2.5 (µg/m³)', 'state': 'State'},
                      color_discrete_map=COLORS['states'])
    results['chart_14'] = save_multiformat(fig, 'diurnal', 'chart_14_regional_diurnal_comparison', p_fig14)

    # =========================================================================
    # CHART 15: Morning versus Evening Comparison
    # =========================================================================
    # Define time windows:
    # Morning: 06:00 - 09:59 (hours 6, 7, 8, 9)
    # Evening: 16:00 - 19:59 (hours 16, 17, 18, 19)
    df_filtered = df[df['state'].isin(target_states)].copy()
    df_filtered['rush_period'] = np.where(df_filtered['hour'].between(6, 9), 'Morning (06:00-09:59)',
                                 np.where(df_filtered['hour'].between(16, 19), 'Evening (16:00-19:59)', 'Other'))
    rush_df = df_filtered[df_filtered['rush_period'] != 'Other'].dropna(subset=['pm25'])

    rush_summary = rush_df.groupby(['state', 'rush_period'])['pm25'].agg(
        mean='mean',
        std='std',
        median='median',
        count='count'
    ).reset_index()
    rush_summary['ci95'] = 1.96 * (rush_summary['std'] / np.sqrt(rush_summary['count']))

    fig, ax = plt.subplots(figsize=(9, 5.5))
    x = np.arange(len(target_states))
    width = 0.35

    m_data = rush_summary[rush_summary['rush_period'].str.startswith('Morning')].set_index('state').reindex(target_states)
    e_data = rush_summary[rush_summary['rush_period'].str.startswith('Evening')].set_index('state').reindex(target_states)

    rects1 = ax.bar(x - width/2, m_data['mean'], width, yerr=m_data['ci95'], capsize=4,
                    label='Morning Peak (06:00-09:59 IST)', color='#2563EB', alpha=0.9)
    rects2 = ax.bar(x + width/2, e_data['mean'], width, yerr=e_data['ci95'], capsize=4,
                    label='Evening Rush (16:00-19:59 IST)', color='#D97706', alpha=0.9)

    ax.axhline(60, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_ylabel('Mean PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('State / Territory', fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(target_states)
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right')

    for bar in rects1:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:.1f}", ha='center', va='bottom', fontsize=8, fontweight='bold', color='#2563EB')
    for bar in rects2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:.1f}", ha='center', va='bottom', fontsize=8, fontweight='bold', color='#D97706')

    add_research_metadata(fig,
                          title="CHART 15 — Morning vs Evening Commute Window Particulate Comparison",
                          question="Is morning solar dissipation sufficient to mitigate commuter exposure relative to evening cooling?",
                          note="Error bars denote 95% Confidence Intervals. Evening levels surge due to combined traffic emissions and boundary-layer contraction.")

    p_fig15 = px.bar(rush_summary, x='state', y='mean', color='rush_period', barmode='group',
                     title="CHART 15 — Morning vs Evening PM2.5 Comparison",
                     labels={'state': 'State', 'mean': 'Mean PM2.5 (µg/m³)', 'rush_period': 'Time Window'},
                     color_discrete_map={'Morning (06:00-09:59)': '#2563EB', 'Evening (16:00-19:59)': '#D97706'})
    results['chart_15'] = save_multiformat(fig, 'diurnal', 'chart_15_morning_evening_comparison', p_fig15)

    print(">>> Finished Chart Group 3.")
    return results

if __name__ == '__main__':
    generate_diurnal_charts()

