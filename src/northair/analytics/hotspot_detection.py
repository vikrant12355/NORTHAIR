"""Hotspot detection module for NorthAir Intelligence.

Identifies stations with elevated, persistent, and highly variable air pollution
concentrations across Chandigarh, Punjab, Haryana, and Delhi.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def calculate_station_hotspot_metrics(aq_2025_df: pd.DataFrame) -> pd.DataFrame:
    """Calculate multi-dimensional pollution metrics per monitoring station.

    Computes:
      - PM2.5: Mean, Median, Std, 90th percentile, Max
      - PM10: Mean, Median, Std, 90th percentile, Max
      - Observation counts and completeness %
      - Frequency of elevated PM2.5 (>60 µg/m³ CPCB NAAQS, >120 µg/m³ Poor, >250 µg/m³ Severe)
      - Frequency of elevated PM10 (>100 µg/m³ CPCB NAAQS, >350 µg/m³ Poor, >430 µg/m³ Severe)
      - Multi-criteria Hotspot Score (combining chronic exposure, extreme events, and frequency)

    Returns:
        DataFrame containing station hotspot rankings.
    """
    total_hours_year = 8760
    stations = aq_2025_df["Station ID"].unique()
    rows = []

    for sid in stations:
        sub = aq_2025_df[aq_2025_df["Station ID"] == sid]
        st_info = sub.iloc[0]
        state = st_info["State"]
        city = st_info["City"]
        sname = st_info["Station Name"]

        # PM2.5 metrics
        pm25 = sub["PM2.5 (µg/m³)"].dropna()
        pm25_n = len(pm25)
        pm25_mean = float(pm25.mean()) if pm25_n > 0 else np.nan
        pm25_median = float(pm25.median()) if pm25_n > 0 else np.nan
        pm25_std = float(pm25.std()) if pm25_n > 0 else np.nan
        pm25_p75 = float(np.percentile(pm25, 75)) if pm25_n > 0 else np.nan
        pm25_p90 = float(np.percentile(pm25, 90)) if pm25_n > 0 else np.nan
        pm25_max = float(pm25.max()) if pm25_n > 0 else np.nan
        pm25_exceed_60_pct = round((pm25 > 60.0).sum() / pm25_n * 100.0, 2) if pm25_n > 0 else np.nan
        pm25_exceed_120_pct = round((pm25 > 120.0).sum() / pm25_n * 100.0, 2) if pm25_n > 0 else np.nan
        pm25_exceed_250_pct = round((pm25 > 250.0).sum() / pm25_n * 100.0, 2) if pm25_n > 0 else np.nan

        # PM10 metrics
        pm10 = sub["PM10 (µg/m³)"].dropna()
        pm10_n = len(pm10)
        pm10_mean = float(pm10.mean()) if pm10_n > 0 else np.nan
        pm10_median = float(pm10.median()) if pm10_n > 0 else np.nan
        pm10_std = float(pm10.std()) if pm10_n > 0 else np.nan
        pm10_p75 = float(np.percentile(pm10, 75)) if pm10_n > 0 else np.nan
        pm10_p90 = float(np.percentile(pm10, 90)) if pm10_n > 0 else np.nan
        pm10_max = float(pm10.max()) if pm10_n > 0 else np.nan
        pm10_exceed_100_pct = round((pm10 > 100.0).sum() / pm10_n * 100.0, 2) if pm10_n > 0 else np.nan
        pm10_exceed_250_pct = round((pm10 > 250.0).sum() / pm10_n * 100.0, 2) if pm10_n > 0 else np.nan
        pm10_exceed_430_pct = round((pm10 > 430.0).sum() / pm10_n * 100.0, 2) if pm10_n > 0 else np.nan

        recorded_hours = len(sub)
        temporal_completeness_pct = round(recorded_hours / total_hours_year * 100.0, 2)

        rows.append({
            "Station ID": sid,
            "State": state,
            "City": city,
            "Station Name": sname,
            "Recorded_Hours": recorded_hours,
            "Temporal_Completeness_Pct": temporal_completeness_pct,
            # PM2.5 stats
            "PM25_Valid_Count": pm25_n,
            "PM25_Mean": round(pm25_mean, 2),
            "PM25_Median": round(pm25_median, 2),
            "PM25_Std": round(pm25_std, 2),
            "PM25_P75": round(pm25_p75, 2),
            "PM25_P90": round(pm25_p90, 2),
            "PM25_Max": round(pm25_max, 2),
            "PM25_Exceed_60_Pct": pm25_exceed_60_pct,
            "PM25_Exceed_120_Pct": pm25_exceed_120_pct,
            "PM25_Exceed_250_Pct": pm25_exceed_250_pct,
            # PM10 stats
            "PM10_Valid_Count": pm10_n,
            "PM10_Mean": round(pm10_mean, 2),
            "PM10_Median": round(pm10_median, 2),
            "PM10_Std": round(pm10_std, 2),
            "PM10_P75": round(pm10_p75, 2),
            "PM10_P90": round(pm10_p90, 2),
            "PM10_Max": round(pm10_max, 2),
            "PM10_Exceed_100_Pct": pm10_exceed_100_pct,
            "PM10_Exceed_250_Pct": pm10_exceed_250_pct,
            "PM10_Exceed_430_Pct": pm10_exceed_430_pct,
        })

    res = pd.DataFrame(rows)

    # Rank dimensions separately
    res["Rank_Mean_PM25"] = res["PM25_Mean"].rank(ascending=False, method="min").astype("Int64")
    res["Rank_P90_PM25"] = res["PM25_P90"].rank(ascending=False, method="min").astype("Int64")
    res["Rank_Exceed_60_PM25"] = res["PM25_Exceed_60_Pct"].rank(ascending=False, method="min").astype("Int64")

    res["Rank_Mean_PM10"] = res["PM10_Mean"].rank(ascending=False, method="min").astype("Int64")
    res["Rank_P90_PM10"] = res["PM10_P90"].rank(ascending=False, method="min").astype("Int64")

    # Composite Hotspot Score: normalized average of mean rank, p90 rank, and exceedance rank
    res["Composite_Hotspot_Rank"] = (
        res["Rank_Mean_PM25"] * 0.4 +
        res["Rank_P90_PM25"] * 0.3 +
        res["Rank_Exceed_60_PM25"] * 0.3
    ).rank(ascending=True, method="min").astype("Int64")

    return res.sort_values(by="Composite_Hotspot_Rank").reset_index(drop=True)


def generate_hotspot_report(
    hotspot_df: pd.DataFrame,
    output_path: Path,
) -> None:
    """Export the hotspot analysis markdown report."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    md = []
    md.append("# NorthAir Intelligence — Air Pollution Hotspot Detection Report\n")
    md.append("**VIZ-A-THON 2026 — Phase 2: Spatial Hotspots & Vulnerability Ranking**\n")
    md.append("This analysis systematically identifies stations and urban centers experiencing elevated, chronic, and extreme particulate matter exposure across North India in 2025.\n")

    md.append("## 1. Top 10 Chronic Exposure Hotspots (Ranked by Annual Mean PM2.5)\n")
    top_mean = hotspot_df.sort_values(by="PM25_Mean", ascending=False).head(10)
    md.append("| Rank | Station ID | Station Name | City | State | Mean PM2.5 (µg/m³) | Median PM2.5 | Exceedance >60 µg/m³ (%) |")
    md.append("|---|---|---|---|---|---|---|---|")
    for idx, r in top_mean.reset_index(drop=True).iterrows():
        md.append(f"| {idx+1} | `{r['Station ID']}` | {r['Station Name']} | {r['City']} | {r['State']} | **{r['PM25_Mean']}** | {r['PM25_Median']} | {r['PM25_Exceed_60_Pct']}% |")
    md.append("")

    md.append("## 2. Top 10 Acute / Extreme Pollution Hotspots (Ranked by 90th Percentile PM2.5)\n")
    top_p90 = hotspot_df.sort_values(by="PM25_P90", ascending=False).head(10)
    md.append("| Rank | Station ID | Station Name | City | State | 90th %ile PM2.5 (µg/m³) | Max PM2.5 | Severe Hours (>250 µg/m³, %) |")
    md.append("|---|---|---|---|---|---|---|---|")
    for idx, r in top_p90.reset_index(drop=True).iterrows():
        md.append(f"| {idx+1} | `{r['Station ID']}` | {r['Station Name']} | {r['City']} | {r['State']} | **{r['PM25_P90']}** | {r['PM25_Max']} | {r['PM25_Exceed_250_Pct']}% |")
    md.append("")

    md.append("## 3. Top 10 PM10 Hotspots (Ranked by Annual Mean PM10)\n")
    top_pm10 = hotspot_df.sort_values(by="PM10_Mean", ascending=False).head(10)
    md.append("| Rank | Station ID | Station Name | City | State | Mean PM10 (µg/m³) | Median PM10 | Exceedance >100 µg/m³ (%) |")
    md.append("|---|---|---|---|---|---|---|---|")
    for idx, r in top_pm10.reset_index(drop=True).iterrows():
        md.append(f"| {idx+1} | `{r['Station ID']}` | {r['Station Name']} | {r['City']} | {r['State']} | **{r['PM10_Mean']}** | {r['PM10_Median']} | {r['PM10_Exceed_100_Pct']}% |")
    md.append("")

    md.append("## 4. Multi-Criteria Composite Hotspot Summary\n")
    md.append("To avoid misleading classifications based on single outlier peaks or sample size differences, the Composite Hotspot Rank weights:\n")
    md.append("- Chronic baseline exposure (Annual Mean PM2.5, 40% weight)")
    md.append("- Acute severe episode intensity (90th Percentile PM2.5, 30% weight)")
    md.append("- Exposure frequency (% of hours exceeding the 60 µg/m³ National Standard, 30% weight)\n")

    top_composite = hotspot_df.head(10)
    md.append("| Composite Rank | Station ID | Station Name | City | State | Mean PM2.5 | 90th %ile PM2.5 | Exceedance % |")
    md.append("|---|---|---|---|---|---|---|---|")
    for _, r in top_composite.iterrows():
        md.append(f"| {r['Composite_Hotspot_Rank']} | `{r['Station ID']}` | {r['Station Name']} | {r['City']} | {r['State']} | {r['PM25_Mean']} | {r['PM25_P90']} | {r['PM25_Exceed_60_Pct']}% |")
    md.append("\n*Note: High-ranking stations represent persistent regional airshed pollution hubs requiring prioritized air-shed management.*")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    logger.info("Hotspot report written to %s", output_path)
