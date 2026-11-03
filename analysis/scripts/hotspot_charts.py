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

def generate_hotspot_charts():
    print(">>> Generating Chart Group 5: Pollution Hotspot Analysis (Charts 22-26)...")
    set_scientific_style()
    df = data_loader.get_2025_data()
    daily_df = data_loader.get_daily_station_summary()
    meta = data_loader.get_station_metadata()
    results = {}

    # Calculate comprehensive station statistics
    stn_stats = df.dropna(subset=['pm25']).groupby(['station_id', 'station_name', 'city', 'state'])['pm25'].agg(
        mean='mean',
        median='median',
        p90=lambda x: np.percentile(x, 90),
        p95=lambda x: np.percentile(x, 95),
        count='count',
        std='std'
    ).reset_index()

    # Data capture percentage (out of 8,760 hours in 2025)
    stn_stats['data_capture_pct'] = ((stn_stats['count'] / 8760.0) * 100.0).round(2)

    # Persistence: Proportion of days exceeding NAAQS 24h limit (60 µg/m³)
    daily_valid = daily_df.dropna(subset=['pm25']).copy()
    persistence = daily_valid.groupby('station_id').apply(
        lambda g: (g['pm25'] > 60.0).mean() * 100.0
    ).reset_index(name='pct_days_exceeding_60')
    stn_stats = pd.merge(stn_stats, persistence, on='station_id', how='left')

    # Save hotspot rankings table
    os.makedirs(ANALYTICS_OUTPUT_DIR, exist_ok=True)
    stn_stats.sort_values('mean', ascending=False).to_csv(
        os.path.join(ANALYTICS_OUTPUT_DIR, 'station_vulnerability_and_persistence_metrics.csv'), index=False
    )

    # =========================================================================
    # CHART 22: Top PM2.5 Stations (Horizontal Ranking)
    # =========================================================================
    top15_pm25 = stn_stats.sort_values('mean', ascending=True).tail(15)

    fig, ax = plt.subplots(figsize=(11, 7))
    bars = ax.barh(top15_pm25['station_name'], top15_pm25['mean'], color='#DC2626', height=0.6, alpha=0.9)
    ax.scatter(top15_pm25['p90'], top15_pm25['station_name'], color='#7F1D1D', s=45, zorder=5, label='90th Percentile Tail')

    ax.axvline(60, color='#055237', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.set_xlabel('Mean PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_ylabel('CAAQMS Monitoring Site', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='lower right', fontsize=8.5)

    for bar, (_, row) in zip(bars, top15_pm25.iterrows()):
        xval = bar.get_width()
        ax.text(xval + 2, bar.get_y() + bar.get_height()/2.0,
                f"{xval:.1f} (P90: {row['p90']:.0f}, Uptime: {row['data_capture_pct']:.1f}%)",
                va='center', fontsize=7.5, color=COLORS['dark_text'])

    ax.set_xlim(0, top15_pm25['p90'].max() * 1.15)
    add_research_metadata(fig,
                          title="CHART 22 — Top 15 Chronic PM2.5 Pollution Hotspots",
                          question="Which specific monitoring locations in North India endure the highest annual aerosol burdens?",
                          note="Red circles indicate the 90th percentile tail concentration. Labels denote mean, P90, and sensor completeness.")

    p_fig22 = px.bar(top15_pm25, y='station_name', x='mean', orientation='h',
                     title="CHART 22 — Top 15 Chronic PM2.5 Hotspots",
                     labels={'station_name': 'Station', 'mean': 'Mean PM2.5 (µg/m³)'},
                     color='mean', color_continuous_scale='Reds')
    results['chart_22'] = save_multiformat(fig, 'hotspots', 'chart_22_top_pm25_hotspots', p_fig22)

    # =========================================================================
    # CHART 23: Top PM10 Stations (Horizontal Ranking)
    # =========================================================================
    stn_pm10 = df.dropna(subset=['pm10']).groupby(['station_id', 'station_name', 'city', 'state'])['pm10'].agg(
        mean='mean',
        median='median',
        p90=lambda x: np.percentile(x, 90),
        count='count'
    ).reset_index().sort_values('mean', ascending=True).tail(15)

    fig, ax = plt.subplots(figsize=(11, 7))
    bars = ax.barh(stn_pm10['station_name'], stn_pm10['mean'], color='#D97706', height=0.6, alpha=0.9)
    ax.scatter(stn_pm10['p90'], stn_pm10['station_name'], color='#92400E', s=45, zorder=5, label='90th Percentile Tail')

    ax.axvline(100, color='#055237', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (100 µg/m³)')
    ax.set_xlabel('Mean PM10 Concentration (µg/m³)', fontweight='bold')
    ax.set_ylabel('CAAQMS Monitoring Site', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='lower right', fontsize=8.5)

    for bar, (_, row) in zip(bars, stn_pm10.iterrows()):
        xval = bar.get_width()
        ax.text(xval + 3, bar.get_y() + bar.get_height()/2.0,
                f"{xval:.1f} (P90: {row['p90']:.0f})",
                va='center', fontsize=7.5, color=COLORS['dark_text'])

    ax.set_xlim(0, stn_pm10['p90'].max() * 1.15)
    add_research_metadata(fig,
                          title="CHART 23 — Top 15 Inhalable Coarse PM10 Hotspots",
                          question="Which industrial and traffic sites experience the highest coarse dust and particulate resuspension?",
                          note="High PM10 hotspots correspond to unpaved road corridors and heavy freight transit rings.")

    p_fig23 = px.bar(stn_pm10, y='station_name', x='mean', orientation='h',
                     title="CHART 23 — Top 15 PM10 Hotspots",
                     labels={'station_name': 'Station', 'mean': 'Mean PM10 (µg/m³)'},
                     color='mean', color_continuous_scale='Oranges')
    results['chart_23'] = save_multiformat(fig, 'hotspots', 'chart_23_top_pm10_hotspots', p_fig23)

    # =========================================================================
    # CHART 24: Pollution Persistence (% Eligible Days > 60 µg/m³)
    # =========================================================================
    top_persistence = stn_stats.sort_values('pct_days_exceeding_60', ascending=True).tail(20)

    fig, ax = plt.subplots(figsize=(11, 7.5))
    bars = ax.barh(top_persistence['station_name'], top_persistence['pct_days_exceeding_60'], color='#991B1B', height=0.6, alpha=0.9)

    ax.set_xlabel('Proportion of Eligible Days Exceeding NAAQS 24h Standard (%)', fontweight='bold')
    ax.set_ylabel('CAAQMS Monitoring Site', fontweight='bold')
    ax.axvline(75, color='#DC2626', linestyle=':', label='Chronic Persistence Benchmark (75% of Days)')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='lower right')

    for bar in bars:
        xval = bar.get_width()
        ax.text(xval + 1, bar.get_y() + bar.get_height()/2.0, f"{xval:.1f}%", va='center', fontsize=8, fontweight='bold', color='#991B1B')

    ax.set_xlim(0, 105)
    add_research_metadata(fig,
                          title="CHART 24 — Station Chronic Pollution Persistence (% Days > 60 µg/m³)",
                          question="What percentage of days in 2025 violated statutory air quality standards at each monitoring site?",
                          note="Evaluates chronic continuous exposure. Analytical threshold 60 µg/m³ reflects official CPCB 24-hour statutory limit.")

    p_fig24 = px.bar(top_persistence, y='station_name', x='pct_days_exceeding_60', orientation='h',
                     title="CHART 24 — Chronic Pollution Persistence (% Days > 60 µg/m³)",
                     labels={'station_name': 'Station', 'pct_days_exceeding_60': 'Days Exceeding 60 µg/m³ (%)'},
                     color='pct_days_exceeding_60', color_continuous_scale='Reds')
    results['chart_24'] = save_multiformat(fig, 'hotspots', 'chart_24_pollution_persistence_ranking', p_fig24)

    # =========================================================================
    # CHART 25: Average versus 90th Percentile PM2.5 Scatter
    # =========================================================================
    fig, ax = plt.subplots(figsize=(9, 6))
    x_mean = stn_stats['mean']
    y_p90 = stn_stats['p90']

    # Scatter by State
    for st in ['Delhi', 'Haryana', 'Punjab', 'Chandigarh']:
        sub = stn_stats[stn_stats['state'] == st]
        ax.scatter(sub['mean'], sub['p90'], color=COLORS['states'][st], s=sub['data_capture_pct']*0.8,
                   alpha=0.8, edgecolors='#4B5563', linewidths=0.7, label=f"{st} (Bubble Size: Uptime)")

    # 1:1 Reference Line and 2:1 Line
    min_val = min(x_mean.min(), y_p90.min()) * 0.9
    max_val = max(x_mean.max(), y_p90.max()) * 1.05
    ax.plot([min_val, 200], [min_val*2, 400], color='#737B75', linestyle='--', linewidth=1, label='P90 = 2 × Mean (High Volatility)')

    # Label prominent hotspots
    notable = stn_stats.sort_values('mean', ascending=False).head(5)
    for _, row in notable.iterrows():
        ax.annotate(row['station_name'], (row['mean'], row['p90']),
                    xytext=(row['mean'] + 2, row['p90'] - 4),
                    fontsize=7.5, fontweight='bold', color=COLORS['dark_text'])

    ax.set_xlabel('Station Annual Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.set_ylabel('Station 90th Percentile Tail PM2.5 (µg/m³)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper left', fontsize=8)

    add_research_metadata(fig,
                          title="CHART 25 — Chronic Baseline vs Episodic Upper-Tail Severity",
                          question="Which stations suffer from sustained elevated baselines versus acute, volatile episodic spikes?",
                          note="Points above the 2x line represent high episodic volatility (e.g. crop burning plume pathways).")

    p_fig25 = px.scatter(stn_stats, x='mean', y='p90', color='state', size='data_capture_pct', hover_name='station_name',
                         color_discrete_map=COLORS['states'],
                         title="CHART 25 — Baseline Mean vs 90th Percentile Tail Severity",
                         labels={'mean': 'Annual Mean PM2.5', 'p90': '90th Percentile PM2.5', 'data_capture_pct': 'Uptime %'})
    results['chart_25'] = save_multiformat(fig, 'hotspots', 'chart_25_mean_vs_p90_scatter', p_fig25)

    # =========================================================================
    # CHART 26: Hotspot Classification Matrix (Multi-Metric Quadrant)
    # =========================================================================
    # Quadrant analysis based on network medians:
    # X: Persistence (% Days > 60)
    # Y: Concentration (Mean PM2.5)
    median_persist = stn_stats['pct_days_exceeding_60'].median()
    median_conc = stn_stats['mean'].median()

    fig, ax = plt.subplots(figsize=(10, 6.5))

    ax.axvline(median_persist, color='#9CA3AF', linestyle=':', linewidth=1.2)
    ax.axhline(median_conc, color='#9CA3AF', linestyle=':', linewidth=1.2)

    # Quadrant annotations
    ax.text(0.97, 0.96, "Quadrant I: Chronic Severe Hotspots\n(High Mean & High Persistence)",
            transform=ax.transAxes, ha='right', va='top', fontsize=8.5, fontweight='bold', color='#7F1D1D',
            bbox=dict(facecolor='#FEF2F2', edgecolor='#FCA5A5', boxstyle='round,pad=0.3'))
    ax.text(0.03, 0.96, "Quadrant II: Episodic Spike Sites\n(High Mean & Lower Persistence)",
            transform=ax.transAxes, ha='left', va='top', fontsize=8.5, fontweight='bold', color='#D97706',
            bbox=dict(facecolor='#FFFBEB', edgecolor='#FDE68A', boxstyle='round,pad=0.3'))
    ax.text(0.03, 0.04, "Quadrant III: Regional Cleanrooms\n(Low Mean & Low Persistence)",
            transform=ax.transAxes, ha='left', va='bottom', fontsize=8.5, fontweight='bold', color='#055237',
            bbox=dict(facecolor='#ECFDF5', edgecolor='#A7F3D0', boxstyle='round,pad=0.3'))
    ax.text(0.97, 0.04, "Quadrant IV: Moderate Stagnant Sites\n(Moderate Mean & High Persistence)",
            transform=ax.transAxes, ha='right', va='bottom', fontsize=8.5, fontweight='bold', color='#2563EB',
            bbox=dict(facecolor='#EFF6FF', edgecolor='#BFDBFE', boxstyle='round,pad=0.3'))

    for st in ['Delhi', 'Haryana', 'Punjab', 'Chandigarh']:
        sub = stn_stats[stn_stats['state'] == st]
        ax.scatter(sub['pct_days_exceeding_60'], sub['mean'], color=COLORS['states'][st], s=40,
                   alpha=0.85, edgecolors='#4B5563', label=st)

    # Label top 4 Quadrant I stations
    quad1_top = stn_stats[(stn_stats['pct_days_exceeding_60'] > median_persist) & (stn_stats['mean'] > median_conc)].sort_values('mean', ascending=False).head(4)
    for _, row in quad1_top.iterrows():
        ax.annotate(row['station_name'], (row['pct_days_exceeding_60'], row['mean']),
                    xytext=(row['pct_days_exceeding_60'] - 8, row['mean'] + 3),
                    fontsize=7.5, fontweight='bold', color='#7F1D1D')

    ax.set_xlabel('Pollution Persistence (% Days with PM2.5 > 60 µg/m³)', fontweight='bold')
    ax.set_ylabel('Annual Mean PM2.5 (µg/m³)', fontweight='bold')
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='center left', fontsize=8.5)

    add_research_metadata(fig,
                          title="CHART 26 — Empirical Hotspot Vulnerability Classification Matrix",
                          question="How can continuous air quality monitoring sites be classified based on concentration and persistence?",
                          note="Dashed lines denote network median values. Avoids arbitrary scoring in favor of transparent statistical quadrant partitioning.")

    p_fig26 = px.scatter(stn_stats, x='pct_days_exceeding_60', y='mean', color='state', hover_name='station_name',
                         color_discrete_map=COLORS['states'],
                         title="CHART 26 — Hotspot Classification Matrix",
                         labels={'pct_days_exceeding_60': 'Persistence (% Days > 60)', 'mean': 'Mean PM2.5 (µg/m³)'})
    results['chart_26'] = save_multiformat(fig, 'hotspots', 'chart_26_hotspot_classification_matrix', p_fig26)

    print(">>> Finished Chart Group 5.")
    return results

if __name__ == '__main__':
    generate_hotspot_charts()

