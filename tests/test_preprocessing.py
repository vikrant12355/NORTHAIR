"""Unit tests for preprocessing transformations: UTC-IST conversion and AQI melting.

Uses isolated, synthetic DataFrames.
"""

from __future__ import annotations

import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

# Ensure src is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from northair.preprocessing import (
    convert_utc_to_ist,
    transform_aqi_history_to_long,
    build_station_metadata,
)


def test_timestamp_conversion_ist_offset():
    """Verify exact UTC + 05:30 conversion and derived analytical fields."""
    raw_df = pd.DataFrame({
        "Station ID": ["site_01", "site_02"],
        "Timestamp": ["2025-01-01 00:00:00", "2025-06-15 18:30:00"],
    })

    converted, anomaly_rep = convert_utc_to_ist(raw_df, timestamp_col="Timestamp")

    # Verification of anomaly report
    assert anomaly_rep["missing_timestamps"] == 0
    assert anomaly_rep["invalid_timestamps"] == 0

    # Verification of Row 1: 2025-01-01 00:00:00 UTC -> 2025-01-01 05:30:00 IST
    row1 = converted.iloc[0]
    assert row1["Timestamp"] == "2025-01-01 00:00:00"  # Original preserved
    assert row1["Timestamp_IST"] == "2025-01-01 05:30:00"
    assert row1["Date"] == "2025-01-01"
    assert row1["Year"] == 2025
    assert row1["Month"] == 1
    assert row1["Month_Name"] == "January"
    assert row1["Day"] == 1
    assert row1["Hour"] == 5
    assert row1["Day_of_Week"] == "Wednesday"

    # Verification of Row 2: 2025-06-15 18:30:00 UTC -> 2025-06-16 00:00:00 IST (date rolls over)
    row2 = converted.iloc[1]
    assert row2["Timestamp_IST"] == "2025-06-16 00:00:00"
    assert row2["Date"] == "2025-06-16"
    assert row2["Day"] == 16
    assert row2["Hour"] == 0
    assert row2["Day_of_Week"] == "Monday"


def test_timestamp_invalid_and_missing_handling():
    """Verify handling and reporting of missing or malformed timestamp strings."""
    df_with_bad = pd.DataFrame({
        "Station ID": ["s1", "s2", "s3"],
        "Timestamp": ["2025-01-01 10:00:00", None, "invalid-time-string"],
    })

    converted, rep = convert_utc_to_ist(df_with_bad, timestamp_col="Timestamp")
    assert rep["missing_timestamps"] == 1
    assert rep["invalid_timestamps"] == 1
    assert pd.isna(converted.loc[1, "Timestamp_IST"])
    assert pd.isna(converted.loc[2, "Timestamp_IST"])
    assert converted.loc[0, "Timestamp_IST"] == "2025-01-01 15:30:00"


def test_aqi_history_melting_and_parity():
    """Verify melting wide hourly AQI into long format preserves non-null observation counts."""
    hour_cols = [f"{i:02d}:00:00" for i in range(24)]
    data = {
        "Station ID": ["s1", "s2"],
        "State": ["Punjab", "Haryana"],
        "City": ["Ludhiana", "Faridabad"],
        "Station Name": ["Station Ludhiana", "Station Faridabad"],
        "Date": ["2022-01-01", "2022-01-02"],
    }
    # Populate row 1 with 12 valid AQI values, row 2 with 24 valid values
    for i, col in enumerate(hour_cols):
        data[col] = [float(100 + i) if i % 2 == 0 else np.nan, float(200 + i)]

    wide_df = pd.DataFrame(data)
    wide_non_null = int(wide_df[hour_cols].notna().sum().sum())
    assert wide_non_null == (12 + 24)  # 36 total valid values

    long_df, metrics = transform_aqi_history_to_long(wide_df, date_col="Date")

    assert len(long_df) == 2 * 24  # 48 total rows
    assert metrics["wide_non_null_aqi"] == 36
    assert metrics["long_non_null_aqi"] == 36
    assert metrics["parity_verified"] is True

    # Check analytical columns
    expected_cols = ["Station ID", "State", "City", "Station Name", "Date", "Hour", "AQI"]
    for col in expected_cols:
        assert col in long_df.columns

    # Verify Hour is standardized to integer
    assert set(long_df["Hour"].unique()) == set(range(24))


def test_ambiguous_date_column_error():
    """Verify that multiple ambiguous date columns trigger a ValueError."""
    bad_df = pd.DataFrame({
        "Station ID": ["s1"],
        "Date": ["2022-01-01"],
        "Datetime": ["2022-01-01 00:00:00"],
        **{f"{i:02d}:00:00": [100.0] for i in range(24)},
    })

    with pytest.raises(ValueError) as exc:
        transform_aqi_history_to_long(bad_df, date_col=None)
    assert "ambiguous" in str(exc.value)


def test_build_station_metadata():
    """Verify station metadata aggregation and enrichment flags."""
    stations = pd.DataFrame({
        "State": ["Punjab", "Haryana"],
        "Station ID": ["s1", "s2"],
        "City": ["Amritsar", "Gurugram"],
        "Station Name": ["Amritsar Stn", "Gurugram Stn"],
    })
    aq25 = pd.DataFrame({
        "Station ID": ["s1", "s1"],
        "Timestamp": ["2025-01-01 00:00:00", "2025-01-01 01:00:00"],
    })
    history = pd.DataFrame({
        "Station ID": ["s2"],
        "Date": ["2020-01-01"],
    })

    meta = build_station_metadata(stations, aq25, history)
    assert len(meta) == 2
    row_s1 = meta[meta["Station ID"] == "s1"].iloc[0]
    row_s2 = meta[meta["Station ID"] == "s2"].iloc[0]

    assert row_s1["In_2025_Data"] == True
    assert row_s1["In_Historical_Data"] == False
    assert row_s1["Hours_Recorded_2025"] == 2

    assert row_s2["In_2025_Data"] == False
    assert row_s2["In_Historical_Data"] == True
    assert row_s2["Days_Recorded_History"] == 1
