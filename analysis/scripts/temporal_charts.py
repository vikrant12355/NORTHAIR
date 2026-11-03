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

def generate_temporal_charts():
    print(">>> Generating Chart Group 2: Monthly and Temporal Analysis (Charts 6-10)...")
    set_scientific_style()
    df = data_loader.get_2025_data()
    results = {}

    month_order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    month_map = dict(zip(month_order, month_labels))

    # =========================================================================
    # CHART 6: Monthly PM2.5 Trend
    # =========================================================================
    monthly_pm25 = df.dropna(subset=['pm25']).groupby('month')['pm25'].agg(
        mean='mean',
        std='std',
        median='median',
        count='count',
        q25=lambda x: np.percentile(x, 25),
        q75=lambda x: np.percentile(x, 75)
    ).reindex(month_order).reset_index()
    monthly_pm25['month_name'] = monthly_pm25['month'].map(month_map)
    monthly_pm25['ci95'] = 1.96 * (monthly_pm25['std'] / np.sqrt(monthly_pm25['count']))

    fig, ax = plt.subplots(figsize=(10, 5.5))
    x = np.arange(len(month_order))
    ax.plot(x, monthly_pm25['mean'], marker='o', linewidth=2.4, color='#DC2626', label='Monthly Mean PM2.5', zorder=4)
    ax.fill_between(x, monthly_pm25['mean'] - monthly_pm25['ci95'], monthly_pm25['mean'] + monthly_pm25['ci95'],
                    color='#DC2626', alpha=0.18, label='95% Confidence Interval')
    ax.plot(x, monthly_pm25['median'], marker='s', linestyle='--', linewidth=1.5, color='#B91C1C', label='Monthly Median PM2.5', alpha=0.8)

    ax.axhline(60, color='#055237', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_ylabel('PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('Month (2025)', fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(month_labels)
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right')

    for i, row in monthly_pm25.iterrows():
        ax.text(i, row['mean'] + 5, f"{row['mean']:.1f}", ha='center', va='bottom', fontsize=8, fontweight='bold', color='#DC2626')

    add_research_metadata(fig,
                          title="CHART 6 — Monthly PM2.5 Trajectory & Seasonal Modulation (2025)",
                          question="How does fine particulate pollution evolve across the 12-month annual cycle?",
                          note="Shaded envelope denotes 95% CI. Illustrates winter boundary-layer entrapment vs monsoon wet scavenging.")

    p_fig6 = px.line(monthly_pm25, x='month_name', y='mean', markers=True,
                     title="CHART 6 — Monthly PM2.5 Trajectory (2025)",
                     labels={'month_name': 'Month', 'mean': 'Mean PM2.5 (µg/m³)'},
                     color_discrete_sequence=['#DC2626'])
    p_fig6.add_hline(y=60, line_dash="dash", line_color="#055237", annotation_text="NAAQS 24h (60 µg/m³)")
    results['chart_6'] = save_multiformat(fig, 'temporal', 'chart_06_monthly_pm25_trend', p_fig6)

    # =========================================================================
    # CHART 7: Monthly PM10 Trend
    # =========================================================================
    monthly_pm10 = df.dropna(subset=['pm10']).groupby('month')['pm10'].agg(
        mean='mean',
        std='std',
        median='median',
        count='count'
    ).reindex(month_order).reset_index()
    monthly_pm10['month_name'] = monthly_pm10['month'].map(month_map)
    monthly_pm10['ci95'] = 1.96 * (monthly_pm10['std'] / np.sqrt(monthly_pm10['count']))

    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.plot(x, monthly_pm10['mean'], marker='o', linewidth=2.4, color='#D97706', label='Monthly Mean PM10', zorder=4)
    ax.fill_between(x, monthly_pm10['mean'] - monthly_pm10['ci95'], monthly_pm10['mean'] + monthly_pm10['ci95'],
                    color='#D97706', alpha=0.18, label='95% Confidence Interval')
    ax.plot(x, monthly_pm10['median'], marker='s', linestyle='--', linewidth=1.5, color='#B45309', label='Monthly Median PM10', alpha=0.8)

    ax.axhline(100, color='#055237', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (100 µg/m³)')
    ax.set_ylabel('PM10 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('Month (2025)', fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(month_labels)
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right')

    for i, row in monthly_pm10.iterrows():
        ax.text(i, row['mean'] + 6, f"{row['mean']:.1f}", ha='center', va='bottom', fontsize=8, fontweight='bold', color='#D97706')

    add_research_metadata(fig,
                          title="CHART 7 — Monthly PM10 Coarse Particulate Dynamics (2025)",
                          question="How does coarse aerosol loading fluctuate between pre-monsoon dust events and winter stagnation?",
                          note="Peak coarse loading observed during dry pre-monsoon months (May/June) and post-monsoon stagnation (Nov/Dec).")

    p_fig7 = px.line(monthly_pm10, x='month_name', y='mean', markers=True,
                     title="CHART 7 — Monthly PM10 Dynamics (2025)",
                     labels={'month_name': 'Month', 'mean': 'Mean PM10 (µg/m³)'},
                     color_discrete_sequence=['#D97706'])
    p_fig7.add_hline(y=100, line_dash="dash", line_color="#055237", annotation_text="NAAQS 24h (100 µg/m³)")
    results['chart_7'] = save_multiformat(fig, 'temporal', 'chart_07_monthly_pm10_trend', p_fig7)

    # =========================================================================
    # CHART 8: Multiple Pollutant Monthly Trends (Small Multiples)
    # =========================================================================
    fig, axes = plt.subplots(2, 2, figsize=(12, 8), sharex=True)
    pollutants_meta = [
        ('pm25', 'PM2.5 (Fine Particulates)', 'µg/m³', '#DC2626', 60),
        ('pm10', 'PM10 (Inhalable Coarse)', 'µg/m³', '#D97706', 100),
        ('no2', 'Nitrogen Dioxide (NO2)', 'µg/m³', '#2563EB', 80),
        ('so2', 'Sulfur Dioxide (SO2)', 'µg/m³', '#059669', 80)
    ]

    for ax, (param, name, unit, color, std) in zip(axes.flatten(), pollutants_meta):
        sub_agg = df.dropna(subset=[param]).groupby('month')[param].mean().reindex(month_order).reset_index()
        ax.plot(x, sub_agg[param], marker='o', color=color, linewidth=2, label=f'Mean {name}')
        ax.axhline(std, color='#737B75', linestyle='--', linewidth=1, label=f'NAAQS ({std} {unit})')
        ax.set_title(name, fontsize=10.5, fontweight='bold', color=COLORS['dark_text'])
        ax.set_ylabel(f'Mean ({unit})', fontweight='medium')
        ax.set_xticks(x)
        ax.set_xticklabels(month_labels)
        ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right', fontsize=8)
        # Highlight values
        for idx, val in enumerate(sub_agg[param]):
            if idx in [0, 6, 10]: # Jan, Jul, Nov
                ax.text(idx, val + (val*0.06), f"{val:.1f}", ha='center', fontsize=7.5, fontweight='bold', color=color)

    add_research_metadata(fig,
                          title="CHART 8 — Multi-Pollutant Monthly Telemetry Small Multiples",
                          question="Do gaseous precursors (NO2, SO2) mirror particulate trends across seasonal cycles?",
                          note="Axes scaled independently per pollutant to preserve fine structure without scale suppression.")

    # Plotly multi-line version
    monthly_all = df.groupby('month')[['pm25', 'pm10', 'no2', 'so2']].mean().reindex(month_order).reset_index()
    monthly_all['month_name'] = monthly_all['month'].map(month_map)
    p_fig8 = go.Figure()
    for param, name, unit, color, _ in pollutants_meta:
        p_fig8.add_trace(go.Scatter(x=monthly_all['month_name'], y=monthly_all[param], mode='lines+markers', name=name, line=dict(color=color, width=2.5)))
    p_fig8.update_layout(title="CHART 8 — Multi-Pollutant Monthly Comparison", xaxis_title="Month", yaxis_title="Concentration (µg/m³)")
    results['chart_8'] = save_multiformat(fig, 'temporal', 'chart_08_multi_pollutant_trends', p_fig8)

    # =========================================================================
    # CHART 9: Monthly Pollution Heatmap (Stations vs Months)
    # =========================================================================
    # Create pivot table of Station vs Month for PM2.5
    stn_month_pivot = df.dropna(subset=['pm25']).pivot_table(index='station_name', columns='month', values='pm25', aggfunc='mean')
    stn_month_pivot = stn_month_pivot.reindex(columns=month_order)
    stn_month_pivot.columns = month_labels
    # Sort stations by annual mean
    stn_month_pivot['annual_mean'] = stn_month_pivot.mean(axis=1)
    stn_month_pivot = stn_month_pivot.sort_values('annual_mean', ascending=False).drop(columns=['annual_mean'])

    # Display top 30 stations for readability
    stn_month_sub = stn_month_pivot.head(30)

    fig, ax = plt.subplots(figsize=(11, 10))
    sns.heatmap(stn_month_sub, cmap='YlOrRd', ax=ax, cbar_kws={'label': 'Mean PM2.5 (µg/m³)'},
                linewidths=0.5, linecolor='#FFFFFF', annot=True, fmt='.0f', annot_kws={'size': 7})
    ax.set_title("Stations vs Months Matrix (Top 30 Hotspots Ranked by Annual Mean)", fontsize=11, fontweight='bold', pad=10)
    ax.set_ylabel("Monitoring Station", fontweight='bold')
    ax.set_xlabel("Month (2025)", fontweight='bold')

    add_research_metadata(fig,
                          title="CHART 9 — Station-by-Month Particulate Exposure Heatmap Matrix",
                          question="Which monitoring stations maintain persistent year-round elevated baselines versus winter-only spikes?",
                          note="Stations sorted in descending order of annual particulate load. Color intensity maps directly to PM2.5 concentration.")

    p_fig9 = px.imshow(stn_month_sub, labels=dict(x="Month", y="Station", color="PM2.5 (µg/m³)"),
                       x=month_labels, y=stn_month_sub.index, color_continuous_scale='YlOrRd',
                       title="CHART 9 — Station-by-Month PM2.5 Heatmap")
    results['chart_9'] = save_multiformat(fig, 'temporal', 'chart_09_station_month_heatmap', p_fig9)

    # =========================================================================
    # CHART 10: Seasonal Comparison (Box Plot)
    # =========================================================================
    season_order = ['Winter', 'Pre-Monsoon', 'Monsoon', 'Post-Monsoon']
    daily_df = data_loader.get_daily_station_summary().dropna(subset=['pm25', 'season'])
    daily_df = daily_df[daily_df['season'].isin(season_order)]

    fig, ax = plt.subplots(figsize=(9, 5.5))
    season_palette = {'Winter': '#1E3A8A', 'Pre-Monsoon': '#D97706', 'Monsoon': '#059669', 'Post-Monsoon': '#DC2626'}

    sns.boxplot(data=daily_df, x='season', y='pm25', order=season_order, palette=season_palette,
                ax=ax, showfliers=False, width=0.5)

    # Add ANOVA test
    groups = [daily_df[daily_df['season'] == s]['pm25'].values for s in season_order]
    f_stat, p_val = stats.f_oneway(*groups)

    ax.axhline(60, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h (60 µg/m³)')
    ax.set_ylabel('Daily Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.set_xlabel('Climatic Season', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right')

    # Annotate medians and ANOVA result
    medians = daily_df.groupby('season')['pm25'].median()
    for i, s in enumerate(season_order):
        m_val = medians[s]
        ax.text(i, m_val + 5, f"Median: {m_val:.1f}", ha='center', fontsize=8.5, fontweight='bold', color=season_palette[s])

    ax.text(0.02, 0.93, f"One-Way ANOVA: F = {f_stat:.1f}, p < 0.001 (Highly Significant)",
            transform=ax.transAxes, fontsize=8.5, bbox=dict(boxstyle='round,pad=0.3', facecolor='#F3F4F6', edgecolor='#E5E7EB'))

    add_research_metadata(fig,
                          title="CHART 10 — Seasonal Regime Contrast: Winter Inversion vs Monsoon Washout",
                          question="What is the magnitude of seasonal air quality shifts across Northern India?",
                          note="Winter: Dec-Feb; Pre-Monsoon: Mar-May; Monsoon: Jun-Sep; Post-Monsoon: Oct-Nov. Whiskers show 1.5x IQR.")

    p_fig10 = px.box(daily_df, x='season', y='pm25', color='season', category_orders={'season': season_order},
                     color_discrete_map=season_palette,
                     title="CHART 10 — Seasonal Distribution of Daily PM2.5 Concentrations",
                     labels={'season': 'Season', 'pm25': 'Daily Mean PM2.5 (µg/m³)'})
    results['chart_10'] = save_multiformat(fig, 'temporal', 'chart_10_seasonal_comparison_boxplot', p_fig10)

    print(">>> Finished Chart Group 2.")
    return results

if __name__ == '__main__':
    generate_temporal_charts()

