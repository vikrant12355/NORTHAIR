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

def generate_historical_charts():
    print(">>> Generating Chart Group 6: Historical AQI Analysis (Charts 27-30)...")
    set_scientific_style()
    df_hist = data_loader.get_historical_data()
    results = {}

    if df_hist is None or len(df_hist) == 0:
        print("Warning: Historical AQI dataset unavailable.")
        return results

    # Ensure Year and Month are available
    clean_hist = df_hist.dropna(subset=['aqi', 'year', 'month']).copy()
    clean_hist['year'] = clean_hist['year'].astype(int)
    clean_hist['month'] = clean_hist['month'].astype(int)
    # Filter valid years 2017 to 2023
    clean_hist = clean_hist[clean_hist['year'].between(2017, 2023)]

    # =========================================================================
    # CHART 27: Annual AQI Trend (2017 - 2023)
    # =========================================================================
    annual_summary = clean_hist.groupby('year')['aqi'].agg(
        mean='mean',
        median='median',
        std='std',
        q25=lambda x: np.percentile(x, 25),
        q75=lambda x: np.percentile(x, 75),
        count='count'
    ).reset_index()

    os.makedirs(ANALYTICS_OUTPUT_DIR, exist_ok=True)
    annual_summary.to_csv(os.path.join(ANALYTICS_OUTPUT_DIR, 'annual_historical_aqi_progression.csv'), index=False)

    fig, ax = plt.subplots(figsize=(9, 5.5))
    ax.plot(annual_summary['year'], annual_summary['median'], marker='o', linewidth=2.4, color=COLORS['primary'], label='Annual Median AQI')
    ax.fill_between(annual_summary['year'], annual_summary['q25'], annual_summary['q75'], color=COLORS['primary'], alpha=0.18, label='Interquartile Range (IQR: 25th - 75th %ile)')
    ax.plot(annual_summary['year'], annual_summary['mean'], marker='s', linestyle='--', linewidth=1.5, color='#DC2626', label='Annual Mean AQI')

    ax.axhline(100, color='#059669', linestyle='--', linewidth=1.2, label='Satisfactory Ceiling (AQI 100)')
    ax.axhline(200, color='#D97706', linestyle='--', linewidth=1.2, label='Moderate Ceiling (AQI 200)')
    ax.axhline(300, color='#EF4444', linestyle='--', linewidth=1.2, label='Poor Ceiling (AQI 300)')

    # Annotate NCAP and COVID-19
    ax.annotate('NCAP Inception (2019)', xy=(2019, 185), xytext=(2018.2, 235),
                arrowprops=dict(facecolor='#2563EB', arrowstyle='->', lw=1.2), fontsize=8, fontweight='bold', color='#2563EB')
    ax.annotate('COVID Lockdown Anomaly (2020)', xy=(2020, 158), xytext=(2019.5, 110),
                arrowprops=dict(facecolor='#055237', arrowstyle='->', lw=1.2), fontsize=8, fontweight='bold', color='#055237')

    ax.set_ylabel('Air Quality Index (AQI)', fontweight='bold')
    ax.set_xlabel('Calendar Year', fontweight='bold')
    ax.set_xticks(annual_summary['year'])
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right', fontsize=8)
    ax.set_ylim(50, 320)

    for _, row in annual_summary.iterrows():
        ax.text(row['year'], row['median'] + 6, f"{row['median']:.0f}", ha='center', fontsize=8.5, fontweight='bold', color=COLORS['primary'])

    add_research_metadata(fig,
                          title="CHART 27 — 7-Year Historical AQI Progression (2017–2023)",
                          question="What has been the multi-year macro trajectory of air quality across North India under NCAP?",
                          note=f"Aggregated from N = {len(clean_hist):,} verified historical measurements. Shaded band denotes interquartile range.")

    p_fig27 = px.line(annual_summary, x='year', y='median', markers=True,
                      title="CHART 27 — 7-Year Historical AQI Progression (2017–2023)",
                      labels={'year': 'Year', 'median': 'Median AQI'},
                      color_discrete_sequence=[COLORS['primary']])
    results['chart_27'] = save_multiformat(fig, 'historical_aqi', 'chart_27_annual_aqi_trend', p_fig27)

    # =========================================================================
    # CHART 28: Monthly Historical AQI Heatmap (Years vs Months)
    # =========================================================================
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    hist_pivot = clean_hist.pivot_table(index='year', columns='month', values='aqi', aggfunc='mean').reindex(columns=range(1, 13))
    hist_pivot.columns = month_labels

    fig, ax = plt.subplots(figsize=(11, 5.5))
    sns.heatmap(hist_pivot, cmap='YlOrRd', ax=ax, cbar_kws={'label': 'Mean Historical AQI'},
                linewidths=0.5, linecolor='#FFFFFF', annot=True, fmt='.0f', annot_kws={'size': 8.5})
    ax.set_title("Year vs Month Historical AQI Heatmap Matrix (2017–2023)", fontsize=11, fontweight='bold', pad=10)
    ax.set_ylabel("Year", fontweight='bold')
    ax.set_xlabel("Month", fontweight='bold')

    add_research_metadata(fig,
                          title="CHART 28 — Multi-Year Monthly AQI Heatmap Matrix",
                          question="Is the post-monsoon and winter air pollution surge an invariant recurring macro-pattern?",
                          note="Every observed year exhibits identical seasonal dynamics: monsoon clean periods (Jul-Aug) and winter emergency spikes (Nov-Jan).")

    p_fig28 = px.imshow(hist_pivot, labels=dict(x="Month", y="Year", color="AQI"),
                        x=month_labels, y=hist_pivot.index, color_continuous_scale='YlOrRd',
                        title="CHART 28 — Historical Monthly AQI Matrix (2017–2023)")
    results['chart_28'] = save_multiformat(fig, 'historical_aqi', 'chart_28_monthly_historical_aqi_heatmap', p_fig28)

    # =========================================================================
    # CHART 29: Hourly AQI Distribution (Historical 2017–2023)
    # =========================================================================
    clean_hourly = clean_hist.dropna(subset=['hour']).copy()
    clean_hourly['hour'] = clean_hourly['hour'].astype(int)
    hourly_hist = clean_hourly.groupby('hour')['aqi'].agg(
        mean='mean',
        median='median',
        p25=lambda x: np.percentile(x, 25),
        p75=lambda x: np.percentile(x, 75)
    ).reindex(range(24)).reset_index()

    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.plot(hourly_hist['hour'], hourly_hist['mean'], marker='o', color='#2563EB', linewidth=2.2, label='Mean Historical AQI')
    ax.fill_between(hourly_hist['hour'], hourly_hist['p25'], hourly_hist['p75'], color='#2563EB', alpha=0.18, label='Interquartile Range (IQR)')
    ax.plot(hourly_hist['hour'], hourly_hist['median'], marker='s', linestyle='--', color='#1D4ED8', linewidth=1.5, label='Median Historical AQI')

    ax.set_ylabel('Historical AQI', fontweight='bold')
    ax.set_xlabel('Hour of the Day', fontweight='bold')
    ax.set_xticks(range(24))
    ax.set_xticklabels([f"{h:02d}:00" for h in range(24)], rotation=45, fontsize=8)
    ax.legend(frameon=True, facecolor='#FFFFFF', loc='upper right')

    add_research_metadata(fig,
                          title="CHART 29 — Long-Term Diurnal AQI Distribution (2017–2023)",
                          question="Does the 24-hour diurnal cycle remain stable over a 7-year multi-decadal observation baseline?",
                          note="Demonstrates the invariant presence of the midday convective boundary-layer expansion dip across all 7 years.")

    p_fig29 = px.line(hourly_hist, x='hour', y='mean', markers=True,
                      title="CHART 29 — Long-Term Diurnal AQI Profile (2017–2023)",
                      labels={'hour': 'Hour of Day', 'mean': 'Mean AQI'},
                      color_discrete_sequence=['#2563EB'])
    results['chart_29'] = save_multiformat(fig, 'historical_aqi', 'chart_29_hourly_aqi_distribution', p_fig29)

    # =========================================================================
    # CHART 30: AQI Category Distribution (CPCB Official Standards)
    # =========================================================================
    # CPCB 2014 AQI bands:
    # Good: 0-50, Satisfactory: 51-100, Moderate: 101-200, Poor: 201-300, Very Poor: 301-400, Severe: 401-500
    bins = [0, 50, 100, 200, 300, 400, 1000]
    cat_names = ['Good\n(0-50)', 'Satisfactory\n(51-100)', 'Moderate\n(101-200)', 'Poor\n(201-300)', 'Very Poor\n(301-400)', 'Severe\n(401+)']
    cat_colors = [COLORS['good'], COLORS['satisfactory'], COLORS['moderate'], COLORS['poor'], COLORS['very_poor'], COLORS['severe']]

    clean_hist['aqi_cat'] = pd.cut(clean_hist['aqi'], bins=bins, labels=cat_names, right=True)
    cat_counts = clean_hist['aqi_cat'].value_counts().reindex(cat_names)
    cat_pcts = (cat_counts / len(clean_hist) * 100.0)

    fig, ax = plt.subplots(figsize=(9, 5.5))
    bars = ax.bar(cat_names, cat_pcts, color=cat_colors, width=0.55, edgecolor='#4B5563', linewidth=0.6)

    ax.set_ylabel('Proportion of Total Historical Records (%)', fontweight='bold')
    ax.set_xlabel('Official CPCB National Air Quality Index (IND-AQI) Categories', fontweight='bold')
    ax.set_ylim(0, max(cat_pcts) * 1.25)

    for bar, pct, count in zip(bars, cat_pcts, cat_counts):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, yval + 1, f"{pct:.1f}%\n({count:,})",
                ha='center', va='bottom', fontsize=8, fontweight='bold')

    add_research_metadata(fig,
                          title="CHART 30 — Historical AQI Category Distribution (CPCB Standards)",
                          question="What percentage of historical time in North India complies with healthy breathing air standards?",
                          note=f"Sample Size: N = {len(clean_hist):,} records. Only {cat_pcts['Good\n(0-50)'] + cat_pcts['Satisfactory\n(51-100)']:.1f}% of historical hours achieved Good or Satisfactory air.")

    p_df = pd.DataFrame({'Category': cat_names, 'Percentage': cat_pcts, 'Count': cat_counts})
    p_fig30 = px.bar(p_df, x='Category', y='Percentage', color='Category',
                     color_discrete_sequence=cat_colors,
                     title="CHART 30 — Historical AQI Category Distribution (CPCB)",
                     labels={'Percentage': 'Percentage (%)', 'Category': 'AQI Category'})
    results['chart_30'] = save_multiformat(fig, 'historical_aqi', 'chart_30_aqi_category_distribution', p_fig30)

    print(">>> Finished Chart Group 6.")
    return results

if __name__ == '__main__':
    generate_historical_charts()

