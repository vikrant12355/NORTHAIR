"""Official Central Pollution Control Board (CPCB) AQI Engine for NorthAir Intelligence.

Implements exact CPCB 2014 breakpoint interpolation, rolling window aggregation
(24-hour with min_periods=16; 8-hour with min_periods=6), strict 3-pollutant data
sufficiency gatekeeping (requiring PM2.5 or PM10), and max-operator index calculation.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# Official CPCB Breakpoints: List of (B_low, B_high, I_low, I_high)
CPCB_BREAKPOINTS = {
    "PM2.5": [
        (0.0, 30.0, 0.0, 50.0),
        (30.0, 60.0, 51.0, 100.0),
        (60.0, 90.0, 101.0, 200.0),
        (90.0, 120.0, 201.0, 300.0),
        (120.0, 250.0, 301.0, 400.0),
        (250.0, 500.0, 401.0, 500.0),
    ],
    "PM10": [
        (0.0, 50.0, 0.0, 50.0),
        (50.0, 100.0, 51.0, 100.0),
        (100.0, 250.0, 101.0, 200.0),
        (250.0, 350.0, 201.0, 300.0),
        (350.0, 430.0, 301.0, 400.0),
        (430.0, 600.0, 401.0, 500.0),
    ],
    "NO2": [
        (0.0, 40.0, 0.0, 50.0),
        (40.0, 80.0, 51.0, 100.0),
        (80.0, 180.0, 101.0, 200.0),
        (180.0, 280.0, 201.0, 300.0),
        (280.0, 400.0, 301.0, 400.0),
        (400.0, 600.0, 401.0, 500.0),
    ],
    "NH3": [
        (0.0, 200.0, 0.0, 50.0),
        (200.0, 400.0, 51.0, 100.0),
        (400.0, 800.0, 101.0, 200.0),
        (800.0, 1200.0, 201.0, 300.0),
        (1200.0, 1800.0, 301.0, 400.0),
        (1800.0, 2400.0, 401.0, 500.0),
    ],
    "SO2": [
        (0.0, 40.0, 0.0, 50.0),
        (40.0, 80.0, 51.0, 100.0),
        (80.0, 380.0, 101.0, 200.0),
        (380.0, 800.0, 201.0, 300.0),
        (800.0, 1600.0, 301.0, 400.0),
        (1600.0, 2000.0, 401.0, 500.0),
    ],
    "CO": [
        (0.0, 1.0, 0.0, 50.0),
        (1.0, 2.0, 51.0, 100.0),
        (2.0, 10.0, 101.0, 200.0),
        (10.0, 17.0, 201.0, 300.0),
        (17.0, 34.0, 301.0, 400.0),
        (34.0, 50.0, 401.0, 500.0),
    ],
    "Ozone": [
        (0.0, 50.0, 0.0, 50.0),
        (50.0, 100.0, 51.0, 100.0),
        (100.0, 168.0, 101.0, 200.0),
        (168.0, 208.0, 201.0, 300.0),
        (208.0, 748.0, 301.0, 400.0),
        (748.0, 1000.0, 401.0, 500.0),
    ],
}


def calculate_sub_index(pollutant: str, concentration: float) -> float:
    """Calculate the individual pollutant sub-index via CPCB piecewise linear formula.

    Formula:
        I_p = I_low + [(I_high - I_low) / (B_high - B_low)] * (C_p - B_low)

    Args:
        pollutant: One of ['PM2.5', 'PM10', 'NO2', 'NH3', 'SO2', 'CO', 'Ozone'].
        concentration: Average concentration across appropriate window.

    Returns:
        Sub-index value rounded to nearest integer (or np.nan if invalid).
    """
    if pd.isna(concentration) or concentration < 0:
        return np.nan

    if pollutant not in CPCB_BREAKPOINTS:
        raise KeyError(f"Pollutant '{pollutant}' not recognized. Expected: {list(CPCB_BREAKPOINTS.keys())}")

    brackets = CPCB_BREAKPOINTS[pollutant]

    # Find matching bracket
    for b_low, b_high, i_low, i_high in brackets:
        if b_low <= concentration <= b_high:
            sub = i_low + ((i_high - i_low) / (b_high - b_low)) * (concentration - b_low)
            return float(round(sub))

    # Concentration exceeds highest breakpoint (Severe extrapolation)
    last_b_low, last_b_high, last_i_low, last_i_high = brackets[-1]
    if concentration > last_b_high:
        sub = last_i_low + ((last_i_high - last_i_low) / (last_b_high - last_b_low)) * (concentration - last_b_low)
        return float(min(500.0, round(sub)))

    return np.nan


def get_aqi_category(aqi: float) -> str:
    """Assign official CPCB categorical band based on numerical AQI value."""
    if pd.isna(aqi):
        return "Undetermined"
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Satisfactory"
    if aqi <= 200:
        return "Moderate"
    if aqi <= 300:
        return "Poor"
    if aqi <= 400:
        return "Very Poor"
    return "Severe"


def calculate_rolling_averages(
    df: pd.DataFrame,
    station_col: str = "Station ID",
    timestamp_col: str = "Timestamp",
) -> pd.DataFrame:
    """Compute 24-hour and 8-hour rolling averages partitioned by station.

    Enforces minimum valid data sufficiency per CPCB guidelines:
      - 24-hour rolling averages require min_periods=16 valid hourly readings.
      - 8-hour rolling averages require min_periods=6 valid hourly readings.
    """
    # Map raw dataset columns to canonical pollutant names
    col_map = {
        "PM2.5 (µg/m³)": "PM2.5",
        "PM10 (µg/m³)": "PM10",
        "NO2 (µg/m³)": "NO2",
        "NH3 (µg/m³)": "NH3",
        "SO2 (µg/m³)": "SO2",
        "CO (mg/m³)": "CO",
        "Ozone (µg/m³)": "Ozone",
    }
    
    # Check flexible naming (e.g. handling unicode chars)
    actual_map = {}
    for col in df.columns:
        for k, v in col_map.items():
            clean_k = "".join(c for c in k if c.isalnum())
            clean_col = "".join(c for c in col if c.isalnum())
            if clean_k in clean_col or v == col:
                actual_map[col] = v
                break

    rolling_24h = ["PM2.5", "PM10", "NO2", "NH3", "SO2"]
    rolling_8h = ["CO", "Ozone"]

    df_sorted = df.sort_values(by=[station_col, timestamp_col]).copy()
    
    # Process rolling averages per station
    station_dfs = []
    for sid, group in df_sorted.groupby(station_col):
        grp = group.copy()
        for raw_col, pol_name in actual_map.items():
            if pol_name in rolling_24h:
                grp[f"Rolling_{pol_name}"] = grp[raw_col].rolling(window=24, min_periods=16).mean()
            elif pol_name in rolling_8h:
                grp[f"Rolling_{pol_name}"] = grp[raw_col].rolling(window=8, min_periods=6).mean()
        station_dfs.append(grp)

    return pd.concat(station_dfs, ignore_index=True)


def calculate_cpcb_aqi(
    df: pd.DataFrame,
    station_col: str = "Station ID",
    timestamp_col: str = "Timestamp",
) -> pd.DataFrame:
    """Calculate official CPCB National Air Quality Index (NAQI).

    Enforces:
      1. Rolling averages (24h with min 16h; 8h with min 6h)
      2. Piecewise linear interpolation for each pollutant
      3. Minimum 3 valid sub-indices
      4. At least one particulate sub-index (PM2.5 or PM10)
      5. Max-operator index aggregation and prominent pollutant identification

    Returns:
        DataFrame enriched with Sub-Indices, Calculated_AQI, AQI_Category,
        and Prominent_Pollutant.
    """
    logger.info("Computing station-wise rolling averages with CPCB sufficiency windows...")
    df_rolled = calculate_rolling_averages(df, station_col=station_col, timestamp_col=timestamp_col)

    pollutants = ["PM2.5", "PM10", "NO2", "NH3", "SO2", "CO", "Ozone"]
    sub_index_cols = []

    logger.info("Evaluating CPCB sub-indices across %d records...", len(df_rolled))
    for p in pollutants:
        roll_col = f"Rolling_{p}"
        sub_col = f"SubIndex_{p}"
        sub_index_cols.append(sub_col)
        if roll_col in df_rolled.columns:
            # Vectorized piecewise lookup via numpy/pandas apply
            df_rolled[sub_col] = df_rolled[roll_col].apply(lambda c: calculate_sub_index(p, c))
        else:
            df_rolled[sub_col] = np.nan

    # Vectorized sufficiency check
    sub_df = df_rolled[sub_index_cols]
    valid_counts = sub_df.notna().sum(axis=1)
    has_pm25 = df_rolled["SubIndex_PM2.5"].notna() if "SubIndex_PM2.5" in df_rolled.columns else False
    has_pm10 = df_rolled["SubIndex_PM10"].notna() if "SubIndex_PM10" in df_rolled.columns else False
    has_particulate = has_pm25 | has_pm10

    # CPCB Sufficiency Gate: at least 3 pollutants, at least 1 particulate
    cpcb_valid_mask = (valid_counts >= 3) & has_particulate

    # Max-operator aggregation
    max_sub = sub_df.max(axis=1)
    df_rolled["Calculated_AQI"] = np.where(cpcb_valid_mask, max_sub, np.nan)
    
    # Identify prominent pollutant
    # argmax across sub-indices for rows where AQI is valid
    def get_prominent(row):
        if pd.isna(row["Calculated_AQI"]):
            return np.nan
        vals = {p: row[f"SubIndex_{p}"] for p in pollutants if pd.notna(row[f"SubIndex_{p}"])}
        if not vals:
            return np.nan
        # return pollutant with max value
        return max(vals, key=vals.get)

    df_rolled["Prominent_Pollutant"] = df_rolled.apply(get_prominent, axis=1)
    df_rolled["AQI_Category"] = df_rolled["Calculated_AQI"].apply(get_aqi_category)

    valid_aqi_count = int(df_rolled["Calculated_AQI"].notna().sum())
    logger.info(
        "Official CPCB AQI calculated: %d valid AQI records out of %d (%.2f%% coverage).",
        valid_aqi_count,
        len(df_rolled),
        valid_aqi_count / len(df_rolled) * 100.0,
    )

    return df_rolled
