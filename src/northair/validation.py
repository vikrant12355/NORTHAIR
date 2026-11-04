"""Validation module for NorthAir Intelligence.

Enforces schema contracts, referential integrity constraints, transformation
verifications, and processed output artifact checks.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple, Union

import pandas as pd

logger = logging.getLogger(__name__)


def validate_station_integrity(
    stations_df: pd.DataFrame,
    air_quality_2025_df: Optional[pd.DataFrame] = None,
    aqi_history_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """Validate cross-dataset referential integrity for Station ID.

    Checks:
      - Unique stations in stations.csv
      - Duplicate station IDs in stations.csv
      - Missing station metadata (State, City, Station Name)
      - Unmatched stations between datasets
      - Orphan stations (present in data but missing from stations.csv)

    Returns:
        Dictionary of validation results and boolean passed flag.
    """
    if "Station ID" not in stations_df.columns:
        raise KeyError("Column 'Station ID' not found in stations_df.")

    st_ids = stations_df["Station ID"]
    unique_stations_count = int(st_ids.nunique())
    duplicate_st_ids = int(st_ids.duplicated().sum())

    missing_metadata = {
        col: int(stations_df[col].isna().sum())
        for col in ["State", "City", "Station Name"]
        if col in stations_df.columns
    }

    base_set: Set[str] = set(st_ids.dropna().unique())

    unmatched: Dict[str, Any] = {}
    passed = (duplicate_st_ids == 0) and all(v == 0 for v in missing_metadata.values())

    if air_quality_2025_df is not None and "Station ID" in air_quality_2025_df.columns:
        aq25_set = set(air_quality_2025_df["Station ID"].dropna().unique())
        orphan_aq25 = list(aq25_set - base_set)
        unmatched["orphan_stations_in_2025"] = orphan_aq25
        unmatched["missing_stations_in_2025"] = list(base_set - aq25_set)
        if len(orphan_aq25) > 0:
            passed = False

    if aqi_history_df is not None and "Station ID" in aqi_history_df.columns:
        hist_set = set(aqi_history_df["Station ID"].dropna().unique())
        orphan_hist = list(hist_set - base_set)
        unmatched["orphan_stations_in_history"] = orphan_hist
        unmatched["uncovered_stations_in_history"] = list(base_set - hist_set)
        if len(orphan_hist) > 0:
            passed = False

    return {
        "passed": passed,
        "unique_stations_count": unique_stations_count,
        "duplicate_station_ids": duplicate_st_ids,
        "missing_metadata": missing_metadata,
        "unmatched": unmatched,
    }


def validate_timestamp_conversion(
    original_df: pd.DataFrame,
    converted_df: pd.DataFrame,
    utc_col: str = "Timestamp",
    ist_col: str = "Timestamp_IST",
) -> Dict[str, Any]:
    """Verify that timestamp conversion preserves the exact instant and applies UTC + 05:30.

    Args:
        original_df: DataFrame with original UTC timestamp column.
        converted_df: DataFrame with converted IST column and analytical columns.
        utc_col: UTC timestamp column name.
        ist_col: IST timestamp column name.

    Returns:
        Validation metrics dictionary.
        
    Raises:
        AssertionError: If offset or analytical fields are incorrect.
    """
    if utc_col not in original_df.columns:
        raise KeyError(f"Column '{utc_col}' not found in original_df.")
    if ist_col not in converted_df.columns:
        raise KeyError(f"Column '{ist_col}' not found in converted_df.")

    expected_cols = ["Timestamp_IST", "Date", "Year", "Month", "Month_Name", "Day", "Hour", "Day_of_Week"]
    missing_cols = [c for c in expected_cols if c not in converted_df.columns]
    if missing_cols:
        raise AssertionError(f"Missing required analytical timestamp columns: {missing_cols}")

    # Check non-null rows
    valid_mask = original_df[utc_col].notna() & converted_df[ist_col].notna()
    sample_size = min(100, int(valid_mask.sum()))

    if sample_size > 0:
        sample_utc = pd.to_datetime(original_df.loc[valid_mask, utc_col].head(sample_size))
        sample_ist = pd.to_datetime(converted_df.loc[valid_mask, ist_col].head(sample_size))
        diff = sample_ist - sample_utc
        expected_diff = pd.Timedelta(hours=5, minutes=30)

        all_match = (diff == expected_diff).all()
        if not all_match:
            raise AssertionError(
                f"Timestamp shift did not match UTC + 05:30! "
                f"Observed differences: {diff.value_counts().to_dict()}"
            )

    return {
        "passed": True,
        "sample_checked": sample_size,
        "analytical_columns_present": expected_cols,
        "offset_verified": "UTC + 05:30",
    }


def validate_aqi_melting(
    wide_df: pd.DataFrame,
    long_df: pd.DataFrame,
    date_col: str = "Date",
    aqi_col: str = "AQI",
) -> Dict[str, Any]:
    """Validate that wide-to-long AQI melting preserved all non-missing AQI observations.

    Args:
        wide_df: Original wide format DataFrame.
        long_df: Transformed long format DataFrame.
        date_col: Name of the date column.
        aqi_col: Name of the melted value column.

    Returns:
        Validation metrics dictionary.
    """
    hour_cols = [c for c in wide_df.columns if (
        (len(c) == 8 and c[2] == ":" and c[5] == ":") or
        (len(c) == 5 and c[2] == ":") or
        (c.isdigit() and 0 <= int(c) <= 23)
    )]

    wide_non_null = int(wide_df[hour_cols].notna().sum().sum())
    long_non_null = int(long_df[aqi_col].notna().sum())

    parity = (wide_non_null == long_non_null)
    if not parity:
        raise AssertionError(
            f"AQI observation parity failed! Wide: {wide_non_null}, Long: {long_non_null}"
        )

    return {
        "passed": True,
        "wide_rows": len(wide_df),
        "long_rows": len(long_df),
        "wide_non_null_aqi": wide_non_null,
        "long_non_null_aqi": long_non_null,
        "parity": parity,
    }


def validate_processed_outputs(
    output_dir: Union[str, Path] = "data/processed",
    expected_files: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Check that all required processed files exist and have non-zero file sizes."""
    out_path = Path(output_dir)
    if expected_files is None:
        expected_files = [
            "air_quality_2025_ist.csv",
            "aqi_history_long.csv",
            "station_metadata.csv",
        ]

    results: Dict[str, Any] = {}
    all_exist = True

    for filename in expected_files:
        p = out_path / filename
        exists = p.is_file()
        size_bytes = p.stat().st_size if exists else 0
        results[filename] = {
            "exists": exists,
            "size_bytes": size_bytes,
            "size_mb": round(size_bytes / (1024 * 1024), 2),
        }
        if not exists or size_bytes == 0:
            all_exist = False

    return {
        "passed": all_exist,
        "output_directory": str(out_path.resolve()),
        "files": results,
    }

