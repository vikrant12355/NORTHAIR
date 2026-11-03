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

def generate_regional_charts():
    print(">>> Generating Chart Group 1: Regional Pollution Analysis (Charts 1-5)...")
    set_scientific_style()
    df = data_loader.get_2025_data()
    meta = data_loader.get_station_metadata()
    results = {}

    # Target states
    target_states = ['Chandigarh', 'Delhi', 'Haryana', 'Punjab']
    df_filtered = df[df['state'].isin(target_states)].copy()

    # =========================================================================
    # CHART 1: State-wise PM2.5 Comparison (Measurement-Weighted vs Station-Balanced)
    # =========================================================================
    reg_summary = data_loader.get_regional_comparison('pm25')
    reg_summary = reg_summary[reg_summary['state'].isin(target_states)].sort_values('mean_meas', ascending=False)
    
    # Save numerical summary
    os.makedirs(ANALYTICS_OUTPUT_DIR, exist_ok=True)
    reg_summary.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'state_pm25_statistical_comparison.csv'), index=False)

    fig, ax = plt.subplots(figsize=(9, 5.5))
    x = np.arange(len(reg_summary))
    width = 0.36

    # 95% Confidence Intervals for measurement-weighted
    ci_meas = 1.96 * (reg_summary['std_meas'] / np.sqrt(reg_summary['count_meas']))
    # 95% CI for station-balanced
    ci_bal = 1.96 * (reg_summary['std_balanced'] / np.sqrt(reg_summary['station_count']))

    rects1 = ax.bar(x - width/2, reg_summary['mean_meas'], width, yerr=ci_meas, capsize=4,
                    label='Measurement-Weighted Mean', color=COLORS['primary'], edgecolor='none', alpha=0.9)
    rects2 = ax.bar(x + width/2, reg_summary['mean_balanced'], width, yerr=ci_bal, capsize=4,
                    label='Station-Balanced Mean', color=COLORS['secondary'], edgecolor='none', alpha=0.9)

    # Reference line: CPCB 24h Standard (60 µg/m³) & Annual Standard (40 µg/m³)
    ax.axhline(60, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (60 µg/m³)')
    ax.axhline(40, color='#D97706', linestyle=':', linewidth=1.2, label='NAAQS Annual Standard (40 µg/m³)')

    ax.set_ylabel('Mean PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([f"{row['state']}\n(Stations: {int(row['station_count'])}, N={int(row['count_meas']):,})" 
                        for _, row in reg_summary.iterrows()], fontsize=9)
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right')

    for bar in rects1:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:.1f}", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color=COLORS['primary'])
    for bar in rects2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:.1f}", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color=COLORS['secondary'])

    ax.set_ylim(0, max(reg_summary['mean_meas'].max(), reg_summary['mean_balanced'].max()) * 1.25)
    add_research_metadata(fig, 
                          title="CHART 1 — State-wise PM2.5 Comparison: Measurement vs Station Weighting",
                          question="How does state-level PM2.5 exposure vary, and does station density bias regional averages?",
                          note="Error bars denote 95% Confidence Intervals. Station-balanced weights each station equally.")
    
    # Plotly interactive version
    plotly_df = pd.melt(reg_summary, id_vars=['state', 'station_count', 'count_meas'], 
                        value_vars=['mean_meas', 'mean_balanced'], var_name='Metric', value_name='PM2.5')
    plotly_df['Metric'] = plotly_df['Metric'].map({'mean_meas': 'Measurement-Weighted Mean', 'mean_balanced': 'Station-Balanced Mean'})
    p_fig1 = px.bar(plotly_df, x='state', y='PM2.5', color='Metric', barmode='group',
                    color_discrete_map={'Measurement-Weighted Mean': COLORS['primary'], 'Station-Balanced Mean': COLORS['secondary']},
                    title="CHART 1 — State-wise PM2.5 Comparison",
                    labels={'state': 'State', 'PM2.5': 'PM2.5 (µg/m³)'})
    p_fig1.add_hline(y=60, line_dash="dash", line_color="#DC2626", annotation_text="NAAQS 24h Standard (60 µg/m³)")

    results['chart_1'] = save_multiformat(fig, 'regional', 'chart_01_state_pm25_comparison', p_fig1)

    # =========================================================================
    # CHART 2: State-wise PM10 Comparison
    # =========================================================================
    reg_pm10 = data_loader.get_regional_comparison('pm10')
    reg_pm10 = reg_pm10[reg_pm10['state'].isin(target_states)].sort_values('mean_meas', ascending=False)
    reg_pm10.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'state_pm10_statistical_comparison.csv'), index=False)

    fig, ax = plt.subplots(figsize=(8.5, 5.2))
    ci_pm10 = 1.96 * (reg_pm10['std_meas'] / np.sqrt(reg_pm10['count_meas']))
    bars = ax.bar(reg_pm10['state'], reg_pm10['mean_meas'], yerr=ci_pm10, capsize=5,
                  color=COLORS['secondary'], edgecolor='none', width=0.5, alpha=0.9)
    
    ax.axhline(100, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h Standard (100 µg/m³)')
    ax.axhline(60, color='#D97706', linestyle=':', linewidth=1.2, label='NAAQS Annual Standard (60 µg/m³)')

    ax.set_ylabel('Mean PM10 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('State / Union Territory', fontweight='bold')
    ax.set_xticklabels([f"{row['state']}\n(N={int(row['count_meas']):,})" for _, row in reg_pm10.iterrows()])
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right')

    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 5, f"{yval:.1f} µg/m³", ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    ax.set_ylim(0, reg_pm10['mean_meas'].max() * 1.25)
    add_research_metadata(fig,
                          title="CHART 2 — State-wise PM10 Coarse Aerosol Comparison",
                          question="What are the regional differences in coarse particulate matter (PM10) loading across North India?",
                          note="Error bars denote 95% Confidence Intervals calculated across all hourly measurements.")

    p_fig2 = px.bar(reg_pm10, x='state', y='mean_meas', 
                    title="CHART 2 — State-wise PM10 Comparison",
                    labels={'state': 'State', 'mean_meas': 'Mean PM10 (µg/m³)'},
                    color='mean_meas', color_continuous_scale='Oranges')
    p_fig2.add_hline(y=100, line_dash="dash", line_color="#DC2626", annotation_text="NAAQS 24h Limit (100 µg/m³)")
    results['chart_2'] = save_multiformat(fig, 'regional', 'chart_02_state_pm10_comparison', p_fig2)

    # =========================================================================
    # CHART 3: City-wise Pollution Ranking
    # =========================================================================
    city_summary = df_filtered.dropna(subset=['pm25']).groupby(['city', 'state'])['pm25'].agg(
        mean='mean',
        median='median',
        count='count',
        stations=lambda x: df_filtered.loc[x.index, 'station_id'].nunique()
    ).reset_index().sort_values('mean', ascending=True)

    fig, ax = plt.subplots(figsize=(10, 6.5))
    norm_colors = [COLORS['states'].get(s, COLORS['primary']) for s in city_summary['state']]
    bars = ax.barh(city_summary['city'], city_summary['mean'], color=norm_colors, height=0.6, alpha=0.88)

    ax.axvline(60, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h Threshold (60 µg/m³)')
    ax.set_xlabel('Mean PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_ylabel('City', fontweight='bold')
    
    # Legend for state color coding
    from matplotlib.patches import Patch
    legend_elements = [Patch(facecolor=COLORS['states'][st], label=st) for st in target_states]
    legend_elements.append(plt.Line2D([0], [0], color='#DC2626', linestyle='--', label='NAAQS 24h (60 µg/m³)'))
    ax.legend(handles=legend_elements, loc='lower right', frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', fontsize=8.5)

    for bar, (_, row) in zip(bars, city_summary.iterrows()):
        xval = bar.get_width()
        ax.text(xval + 1.5, bar.get_y() + bar.get_height()/2.0, 
                f"{xval:.1f} (N={int(row['count']):,}, Stns={int(row['stations'])})", 
                va='center', fontsize=8, color=COLORS['dark_text'])

    ax.set_xlim(0, city_summary['mean'].max() * 1.35)
    add_research_metadata(fig,
                          title="CHART 3 — City-wise PM2.5 Concentration Ranking",
                          question="Which urban centers in North India register the highest persistent fine particulate burdens?",
                          note="Bars color-coded by State. Annotations include sample count (N) and active monitoring station count.")
    
    p_fig3 = px.bar(city_summary, y='city', x='mean', color='state', orientation='h',
                    title="CHART 3 — City-wise PM2.5 Concentration Ranking",
                    labels={'city': 'City', 'mean': 'Mean PM2.5 (µg/m³)', 'state': 'State'},
                    color_discrete_map=COLORS['states'])
    results['chart_3'] = save_multiformat(fig, 'regional', 'chart_03_city_pm25_ranking', p_fig3)

    # =========================================================================
    # CHART 4: Station-wise PM2.5 Distribution (Box Plot)
    # =========================================================================
    # Order stations by median PM2.5
    stn_order = df_filtered.dropna(subset=['pm25']).groupby('station_name')['pm25'].median().sort_values(ascending=False).index

    fig, ax = plt.subplots(figsize=(14, 8))
    # Sample 1000 points per station for clear boxplot rendering without extreme slowdown
    df_sample = df_filtered.dropna(subset=['pm25']).groupby('station_name').apply(
        lambda x: x.sample(n=min(len(x), 500), random_state=42)
    ).reset_index(drop=True)

    # Plot boxplot
    sns.boxplot(data=df_sample, x='station_name', y='pm25', order=stn_order, ax=ax,
                palette=['#055237' if 'site_1425' in s or 'site_145' in s else '#D1D5DB' for s in stn_order],
                showfliers=False, width=0.6)

    ax.axhline(60, color='#DC2626', linestyle='--', linewidth=1.2, label='NAAQS 24h (60 µg/m³)')
    ax.axhline(250, color='#7F1D1D', linestyle=':', linewidth=1.2, label='CPCB Severe Threshold (250 µg/m³)')
    ax.set_ylabel('Hourly PM2.5 Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('CAAQMS Monitoring Stations (Ranked by Median)', fontweight='bold')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=90, fontsize=7)
    ax.legend(loc='upper right', frameon=True, facecolor='#FFFFFF')
    ax.set_ylim(0, 500)

    add_research_metadata(fig,
                          title="CHART 4 — Station-wise PM2.5 Distribution & Variability",
                          question="How does fine aerosol variability and tail skewness differ across individual monitoring stations?",
                          note="Boxes show 25th, 50th (median), and 75th percentiles. Whiskers span 1.5x IQR. Outliers suppressed for visual clarity.")

    # Plotly version with top 15 stations
    top15_stns = stn_order[:15]
    df_top15 = df_filtered[df_filtered['station_name'].isin(top15_stns)]
    p_fig4 = px.box(df_top15, x='station_name', y='pm25', color='state',
                    title="CHART 4 — Station-wise PM2.5 Distribution (Top 15 Hotspots)",
                    labels={'station_name': 'Station', 'pm25': 'PM2.5 (µg/m³)'},
                    color_discrete_map=COLORS['states'])
    results['chart_4'] = save_multiformat(fig, 'regional', 'chart_04_station_pm25_distribution', p_fig4)

    # =========================================================================
    # CHART 5: State-wise PM2.5 and PM10 Comparison (Grouped Bar Chart)
    # =========================================================================
    # Combine PM2.5 and PM10 balanced summaries
    pm25_bal = reg_summary.set_index('state')['mean_balanced']
    pm10_bal = reg_pm10.set_index('state')['mean_balanced']
    comb_df = pd.DataFrame({'PM2.5': pm25_bal, 'PM10': pm10_bal}).loc[target_states]
    comb_df['PM2.5_to_PM10_Ratio'] = (comb_df['PM2.5'] / comb_df['PM10']).round(2)
    comb_df.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'state_particulate_ratio_comparison.csv'))

    fig, ax = plt.subplots(figsize=(9, 5.5))
    x = np.arange(len(comb_df))
    width = 0.35

    rects1 = ax.bar(x - width/2, comb_df['PM2.5'], width, label='Fine Aerosol (PM2.5)', color='#DC2626', alpha=0.9)
    rects2 = ax.bar(x + width/2, comb_df['PM10'], width, label='Inhalable Coarse (PM10)', color='#D97706', alpha=0.9)

    ax.set_ylabel('Station-Balanced Concentration (µg/m³)', fontweight='bold')
    ax.set_xlabel('State / Territory', fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([f"{st}\n(PM2.5/PM10 Ratio: {comb_df.loc[st, 'PM2.5_to_PM10_Ratio']:.2f})" for st in comb_df.index], fontsize=9)
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#E5E7EB', loc='upper right')

    for bar in rects1:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:.1f}", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#DC2626')
    for bar in rects2:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:.1f}", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#D97706')

    ax.set_ylim(0, comb_df['PM10'].max() * 1.25)
    add_research_metadata(fig,
                          title="CHART 5 — State-wise PM2.5 vs PM10 Concentration & Fine-to-Coarse Ratio",
                          question="What is the proportion of combustion-derived fine particles (PM2.5) relative to total crustal dust (PM10)?",
                          note="Values represent station-balanced means. Ratio > 0.60 indicates strong primary combustion/secondary aerosol dominance.")

    melted_comb = comb_df[['PM2.5', 'PM10']].reset_index().melt(id_vars='state', var_name='Fraction', value_name='Concentration')
    p_fig5 = px.bar(melted_comb, x='state', y='Concentration', color='Fraction', barmode='group',
                    title="CHART 5 — State-wise PM2.5 vs PM10 Comparison",
                    color_discrete_map={'PM2.5': '#DC2626', 'PM10': '#D97706'})
    results['chart_5'] = save_multiformat(fig, 'regional', 'chart_05_state_pm25_pm10_grouped', p_fig5)

    print(">>> Finished Chart Group 1.")
    return results

if __name__ == '__main__':
    generate_regional_charts()

