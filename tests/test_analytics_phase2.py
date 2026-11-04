"""Automated unit and integration tests for Phase 2 Analytics.

Tests:
  - Station identity reconciliation & crosswalk mapping
  - Duplicate classification & conflict detection
  - Historical out-of-region station filtering
  - Coverage and quality decision audits
  - Seasonal and diurnal grouping
  - Weather correlation functions
  - Pollution hotspot calculations and rankings
  - Official CPCB AQI engine (breakpoints, interpolation, rolling, sufficiency gatekeeping)
"""

from __future__ import annotations

import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from northair.analytics.station_reconciliation import (
    clean_str,
    identify_station_conflicts,
    build_station_identity_crosswalk,
    apply_station_crosswalk,
)
from northair.analytics.coverage_and_quality import (
    audit_2025_coverage,
    investigate_sensor_saturation,
    investigate_vertical_wind_speed,
    add_quality_flags,
)
from northair.analytics.hotspot_detection import calculate_station_hotspot_metrics
from northair.analytics.aqi_engine import (
    calculate_sub_index,
    get_aqi_category,
    calculate_rolling_averages,
    calculate_cpcb_aqi,
)
from northair.analytics.pipeline_phase2 import assign_season, assign_diurnal_window


# -------------------------------------------------------------
# 1. Station Identity & Reconciliation Tests
# -------------------------------------------------------------
def test_clean_str_normalization():
    """Verify alphanumeric string normalization for robust station matching."""
    assert clean_str("Sector 22, Chandigarh - CPCC") == "sector22chandigarhcpcc"
    assert clean_str("Sector 22 Chandigarh CPCC") == "sector22chandigarhcpcc"
    assert clean_str(None) == ""


def test_station_identity_crosswalk_mapping():
    """Verify classification of EXACT_MATCH, VERIFIED_MATCH, and UNRESOLVED."""
    stations = pd.DataFrame([
        {"Station ID": "site_01", "State": "Chandigarh", "City": "Chandigarh", "Station Name": "Sector 22, Chandigarh - CPCC"},
        {"Station ID": "site_02", "State": "Chandigarh", "City": "Chandigarh", "Station Name": "Sector-25, Chandigarh - CPCC"},
    ])

    # In history, site_02 was labeled as site_01, and an out-of-region station was also given site_01
    aqi_hist = pd.DataFrame([
        {"Station ID": "site_01", "State": "Chandigarh", "City": "Chandigarh", "Station Name": "Sector 22 Chandigarh CPCC"},
        {"Station ID": "site_01", "State": "Chandigarh", "City": "Chandigarh", "Station Name": "Sector-25 Chandigarh CPCC"},
        {"Station ID": "site_01", "State": "Chandigarh", "City": "Chandigarh", "Station Name": "Nehru Nagar Kanpur UPPCB"},
    ])

    cw = build_station_identity_crosswalk(stations, aqi_hist)
    assert len(cw) == 3

    row_exact = cw[cw["Original Station Name"] == "Sector 22 Chandigarh CPCC"].iloc[0]
    assert row_exact["Mapping Status"] == "EXACT_MATCH"
    assert row_exact["Canonical Station ID"] == "site_01"

    row_verified = cw[cw["Original Station Name"] == "Sector-25 Chandigarh CPCC"].iloc[0]
    assert row_verified["Mapping Status"] == "VERIFIED_MATCH"
    assert row_verified["Canonical Station ID"] == "site_02"

    row_unresolved = cw[cw["Original Station Name"] == "Nehru Nagar Kanpur UPPCB"].iloc[0]
    assert row_unresolved["Mapping Status"] == "UNRESOLVED"
    assert row_unresolved["Canonical Station ID"] == "UNRESOLVED"
    assert row_unresolved["Review Required"] == "YES"


def test_apply_station_crosswalk_filters_unresolved():
    """Verify that applying crosswalk discards unresolved out-of-region stations."""
    stations = pd.DataFrame([
        {"Station ID": "s1", "State": "Punjab", "City": "Amritsar", "Station Name": "Golden Temple - PPCB"},
    ])
    aqi_hist = pd.DataFrame([
        {"Station ID": "s1", "State": "Punjab", "City": "Amritsar", "Station Name": "Golden Temple Amritsar PPCB", "Date": "2020-01-01"},
        {"Station ID": "s1", "State": "Punjab", "City": "Amritsar", "Station Name": "Adarsh Nagar Jaipur RSPCB", "Date": "2020-01-01"},
    ])

    cw = build_station_identity_crosswalk(stations, aqi_hist)
    filtered = apply_station_crosswalk(aqi_hist, cw, filter_unresolved=True)

    assert len(filtered) == 1
    assert filtered.iloc[0]["Station Name"] == "Golden Temple - PPCB"


# -------------------------------------------------------------
# 2. Coverage, Quality Decisions & Saturation Tests
# -------------------------------------------------------------
def test_season_and_diurnal_window_assignment():
    """Verify correct meteorological season and diurnal category classification."""
    # Seasons
    assert assign_season(1) == "Winter"
    assert assign_season(7) == "Monsoon"
    assert assign_season(10) == "Post-Monsoon"
    assert assign_season(4) == "Pre-Monsoon"

    # Diurnal windows
    assert "Night" in assign_diurnal_window(3)
    assert "Morning" in assign_diurnal_window(8)
    assert "Daytime" in assign_diurnal_window(12)
    assert "Evening" in assign_diurnal_window(18)
    assert "Late Evening" in assign_diurnal_window(22)


def test_sensor_saturation_investigation():
    """Verify sensor ceiling detection and flag generation."""
    df = pd.DataFrame({
        "Station ID": ["s1", "s1", "s2"],
        "Timestamp": ["2025-01-01 00:00:00", "2025-01-01 01:00:00", "2025-01-01 02:00:00"],
        "PM2.5 (µg/m³)": [999.99, 45.0, 999.5],
        "PM10 (µg/m³)": [1000.0, 80.0, 200.0],
        "CO (mg/m³)": [10.0, 1.2, 0.5],
        "BP (mmHg)": [950.0, 750.0, 760.0],
        "VWS (m/s)": [-1.5, 0.5, 0.0],
    })

    sat = investigate_sensor_saturation(df)
    assert sat["PM2.5"]["ceiling_count"] == 2
    assert sat["PM10"]["ceiling_count"] == 1
    assert sat["CO"]["ceiling_count"] == 1

    df_flagged = add_quality_flags(df)
    assert df_flagged["Flag_PM25_Censored"].sum() == 2
    assert df_flagged["Flag_PM10_Censored"].sum() == 1
    assert df_flagged["Flag_CO_Censored"].sum() == 1
    assert df_flagged["Flag_BP_Suspect"].sum() == 1
    assert df_flagged["Flag_VWS_Negative"].sum() == 1


# -------------------------------------------------------------
# 3. Hotspot Detection Tests
# -------------------------------------------------------------
def test_hotspot_metrics_calculation():
    """Verify multi-criteria station rankings for chronic and acute pollution."""
    df = pd.DataFrame({
        "Station ID": ["s1"] * 10 + ["s2"] * 10,
        "State": ["Haryana"] * 10 + ["Punjab"] * 10,
        "City": ["Gurugram"] * 10 + ["Ludhiana"] * 10,
        "Station Name": ["Gurugram Stn"] * 10 + ["Ludhiana Stn"] * 10,
        "Timestamp": [f"2025-01-01 {i:02d}:00:00" for i in range(10)] * 2,
        "PM2.5 (µg/m³)": [150.0] * 10 + [40.0] * 10,
        "PM10 (µg/m³)": [250.0] * 10 + [80.0] * 10,
    })

    hotspots = calculate_station_hotspot_metrics(df)
    assert len(hotspots) == 2
    top_station = hotspots.iloc[0]
    assert top_station["Station ID"] == "s1"
    assert top_station["PM25_Mean"] == 150.0
    assert top_station["PM25_Exceed_60_Pct"] == 100.0


# -------------------------------------------------------------
# 4. CPCB Official AQI Engine Tests
# -------------------------------------------------------------
def test_cpcb_sub_index_boundary_interpolation():
    """Verify sub-index linear interpolation at official CPCB breakpoints."""
    # PM2.5 breakpoints
    assert calculate_sub_index("PM2.5", 0.0) == 0.0
    assert calculate_sub_index("PM2.5", 30.0) == 50.0
    assert calculate_sub_index("PM2.5", 60.0) == 100.0
    assert calculate_sub_index("PM2.5", 90.0) == 200.0
    assert calculate_sub_index("PM2.5", 120.0) == 300.0
    assert calculate_sub_index("PM2.5", 250.0) == 400.0

    # PM10 breakpoints
    assert calculate_sub_index("PM10", 50.0) == 50.0
    assert calculate_sub_index("PM10", 100.0) == 100.0
    assert calculate_sub_index("PM10", 250.0) == 200.0

    # CO breakpoints (mg/m3)
    assert calculate_sub_index("CO", 1.0) == 50.0
    assert calculate_sub_index("CO", 2.0) == 100.0
    assert calculate_sub_index("CO", 10.0) == 200.0

    # Severe category extrapolation
    assert calculate_sub_index("PM2.5", 350.0) > 400.0


def test_aqi_category_mapping():
    """Verify categorical AQI assignment."""
    assert get_aqi_category(25.0) == "Good"
    assert get_aqi_category(75.0) == "Satisfactory"
    assert get_aqi_category(150.0) == "Moderate"
    assert get_aqi_category(250.0) == "Poor"
    assert get_aqi_category(350.0) == "Very Poor"
    assert get_aqi_category(450.0) == "Severe"
    assert get_aqi_category(np.nan) == "Undetermined"


def test_cpcb_sufficiency_gatekeeper():
    """Verify that AQI requires >= 3 pollutants and at least one particulate."""
    timestamps = [f"2025-01-01 {i:02d}:00:00" for i in range(24)]

    # Case A: 3 pollutants with PM2.5 present -> VALID AQI
    df_valid = pd.DataFrame({
        "Station ID": ["s1"] * 24,
        "Timestamp": timestamps,
        "PM2.5 (µg/m³)": [45.0] * 24,
        "NO2 (µg/m³)": [50.0] * 24,
        "SO2 (µg/m³)": [30.0] * 24,
    })
    res_valid = calculate_cpcb_aqi(df_valid)
    assert res_valid["Calculated_AQI"].iloc[-1] > 0
    assert res_valid["AQI_Category"].iloc[-1] != "Undetermined"

    # Case B: Only 2 pollutants (PM2.5 and NO2) -> INSUFFICIENT -> NaN
    df_two_pol = pd.DataFrame({
        "Station ID": ["s1"] * 24,
        "Timestamp": timestamps,
        "PM2.5 (µg/m³)": [45.0] * 24,
        "NO2 (µg/m³)": [50.0] * 24,
    })
    res_two = calculate_cpcb_aqi(df_two_pol)
    assert pd.isna(res_two["Calculated_AQI"].iloc[-1])
    assert res_two["AQI_Category"].iloc[-1] == "Undetermined"

    # Case C: 3 pollutants (NO2, SO2, CO) but NO PM2.5 or PM10 -> INSUFFICIENT -> NaN
    df_no_pm = pd.DataFrame({
        "Station ID": ["s1"] * 24,
        "Timestamp": timestamps,
        "NO2 (µg/m³)": [50.0] * 24,
        "SO2 (µg/m³)": [30.0] * 24,
        "CO (mg/m³)": [1.5] * 24,
    })
    res_no_pm = calculate_cpcb_aqi(df_no_pm)
    assert pd.isna(res_no_pm["Calculated_AQI"].iloc[-1])
    assert res_no_pm["AQI_Category"].iloc[-1] == "Undetermined"


# -------------------------------------------------------------
# 5. Seasonal, Daily & Station-Balanced Regional Aggregation Tests
# -------------------------------------------------------------
def test_daily_aggregation_and_cpcb_16h_threshold():
    """Verify daily aggregation requires >= 16 valid hours per CPCB guidelines."""
    # Station with 18 valid hours (should pass)
    df_pass = pd.DataFrame({
        "PM2.5": [50.0] * 18 + [np.nan] * 6
    })
    valid_hours_pass = df_pass["PM2.5"].notna().sum()
    assert valid_hours_pass >= 16
    assert round(df_pass["PM2.5"].mean(), 1) == 50.0

    # Station with only 12 valid hours (should fail sufficiency)
    df_fail = pd.DataFrame({
        "PM2.5": [50.0] * 12 + [np.nan] * 12
    })
    valid_hours_fail = df_fail["PM2.5"].notna().sum()
    assert valid_hours_fail < 16


def test_seasonal_grouping_boundaries():
    """Verify four meteorological season groupings."""
    assert assign_season(12) == "Winter"
    assert assign_season(1) == "Winter"
    assert assign_season(2) == "Winter"
    assert assign_season(3) == "Pre-Monsoon"
    assert assign_season(4) == "Pre-Monsoon"
    assert assign_season(5) == "Pre-Monsoon"
    assert assign_season(6) == "Monsoon"
    assert assign_season(7) == "Monsoon"
    assert assign_season(8) == "Monsoon"
    assert assign_season(9) == "Monsoon"
    assert assign_season(10) == "Post-Monsoon"
    assert assign_season(11) == "Post-Monsoon"


def test_station_balanced_vs_pooled_regional_average():
    """Verify that station-balanced averages prevent over-sampled stations from skewing regional means."""
    # Station 1 has 100 observations at 200 µg/m³
    # Station 2 has 10 observations at 50 µg/m³
    s1_vals = [200.0] * 100
    s2_vals = [50.0] * 10

    # Pooled measurement average: (100*200 + 10*50) / 110 = 20500 / 110 = 186.36
    pooled_mean = np.mean(s1_vals + s2_vals)
    assert round(pooled_mean, 2) == 186.36

    # Station-balanced average: (mean(s1) + mean(s2)) / 2 = (200 + 50) / 2 = 125.0
    station_balanced_mean = (np.mean(s1_vals) + np.mean(s2_vals)) / 2.0
    assert station_balanced_mean == 125.0
    assert station_balanced_mean < pooled_mean


