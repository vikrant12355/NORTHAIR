"""Data preprocessing pipeline for NorthAir Intelligence.

Implements UTC to IST timestamp conversion, wide-to-long transformation of historical
hourly AQI measurements, station metadata enrichment, and multi-format persistence.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def convert_utc_to_ist(
    df: pd.DataFrame,
    timestamp_col: str = "Timestamp",
) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """Convert UTC timestamps to Indian Standard Time (IST = UTC + 05:30).

    Preserves the original timestamp column.
    Generates analytical columns:
      - Timestamp_IST (formatted string 'YYYY-MM-DD HH:MM:SS')
      - Date (string 'YYYY-MM-DD')
      - Year (int)
      - Month (int, 1-12)
      - Month_Name (string, e.g. 'January')
      - Day (int, 1-31)
      - Hour (int, 0-23)
      - Day_of_Week (string, e.g. 'Wednesday')

    Args:
        df: DataFrame containing the UTC timestamp column.
        timestamp_col: Name of the timestamp column in df.

    Returns:
        Tuple of (processed_df, anomaly_dict).
        
    Raises:
        KeyError: If timestamp_col is not present in df.
    """
    if timestamp_col not in df.columns:
        raise KeyError(
            f"Timestamp column '{timestamp_col}' not found in DataFrame. "
            f"Available columns: {list(df.columns)}"
        )

    processed = df.copy()
    raw_s = processed[timestamp_col]

    missing_count = int(raw_s.isna().sum())
    # Parse UTC datetimes
    parsed_utc = pd.to_datetime(raw_s, errors="coerce")
    invalid_count = int(parsed_utc.isna().sum() - missing_count)

    anomaly_report = {
        "total_rows": len(processed),
        "missing_timestamps": missing_count,
        "invalid_timestamps": invalid_count,
    }

    if invalid_count > 0:
        logger.warning(
            "Found %d invalid timestamp strings in column '%s' that could not be parsed.",
            invalid_count,
            timestamp_col,
        )

    # Shift by exact Indian Standard Time offset: UTC + 5 hours 30 minutes
    # Using Timedelta avoids rounding or shifting the underlying instant
    ist_series = parsed_utc + pd.Timedelta(hours=5, minutes=30)

    # Derive analytical columns
    processed["Timestamp_IST"] = ist_series.dt.strftime("%Y-%m-%d %H:%M:%S")
    processed["Date"] = ist_series.dt.strftime("%Y-%m-%d")
    processed["Year"] = ist_series.dt.year.astype("Int64")
    processed["Month"] = ist_series.dt.month.astype("Int64")
    processed["Month_Name"] = ist_series.dt.month_name()
    processed["Day"] = ist_series.dt.day.astype("Int64")
    processed["Hour"] = ist_series.dt.hour.astype("Int64")
    processed["Day_of_Week"] = ist_series.dt.day_name()

    return processed, anomaly_report


def transform_aqi_history_to_long(
    df: pd.DataFrame,
    date_col: Optional[str] = None,
    keep_metadata_cols: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Convert historical wide AQI dataset (24 hourly columns) into tidy long format.

    Validates that the total number of non-missing AQI observations is preserved
    identically between the wide and long representations.

    Args:
        df: Wide DataFrame containing hourly AQI columns ('00:00:00' to '23:00:00').
        date_col: Name of the date column. If None, auto-detected.
                  If ambiguous or missing, an error is raised.
        keep_metadata_cols: Station metadata columns to retain in the long format.

    Returns:
        Tuple of (long_df, validation_metrics).
        
    Raises:
        ValueError: If date column is missing or ambiguous, or if hourly columns are absent.
    """
    # 1. Identify date column
    if date_col is None:
        potential_dates = [c for c in df.columns if c.strip().lower() in ["date", "datetime", "reading_date"]]
        if len(potential_dates) == 0:
            raise ValueError(
                "Unable to identify date column in historical dataset. "
                f"Available columns: {list(df.columns)}"
            )
        if len(potential_dates) > 1:
            raise ValueError(
                f"Date column is ambiguous; multiple candidates detected: {potential_dates}. "
                "Please specify date_col explicitly."
            )
        date_col = potential_dates[0]
    elif date_col not in df.columns:
        raise ValueError(f"Specified date column '{date_col}' does not exist in DataFrame.")

    # 2. Identify hourly columns (00:00:00 to 23:00:00 or similar 24-hr formats)
    hour_cols = [c for c in df.columns if (
        (len(c) == 8 and c[2] == ":" and c[5] == ":") or
        (len(c) == 5 and c[2] == ":") or
        (c.isdigit() and 0 <= int(c) <= 23)
    )]

    if len(hour_cols) != 24:
        raise ValueError(
            f"Expected exactly 24 hourly columns, found {len(hour_cols)}: {hour_cols}"
        )

    # 3. Determine metadata columns to preserve
    if keep_metadata_cols is None:
        candidate_meta = ["Station ID", "State", "City", "Station Name"]
        metadata_cols = [c for c in candidate_meta if c in df.columns]
    else:
        metadata_cols = [c for c in keep_metadata_cols if c in df.columns]

    id_vars = metadata_cols + [date_col]

    # Pre-transformation verification: count non-null AQI values in wide format
    wide_non_null_aqi = int(df[hour_cols].notna().sum().sum())
    total_wide_cells = int(df[hour_cols].size)

    # 4. Perform melt
    logger.info("Melting historical AQI DataFrame with %d rows and 24 hourly columns...", len(df))
    long_df = pd.melt(
        df,
        id_vars=id_vars,
        value_vars=hour_cols,
        var_name="Hour_Raw",
        value_name="AQI",
    )

    # Standardize Hour column to 0-23 integer for analytical convenience while preserving Hour_Str
    # Extract integer hour from strings like '00:00:00' -> 0
    try:
        long_df["Hour"] = long_df["Hour_Raw"].str.slice(0, 2).astype(int)
    except Exception:
        long_df["Hour"] = long_df["Hour_Raw"]

    # Reorder columns to analytical standard:
    # Station ID, State, City, Station Name, Date, Hour, AQI
    front_cols = [c for c in ["Station ID", "State", "City", "Station Name", date_col, "Hour", "AQI"] if c in long_df.columns]
    remaining = [c for c in long_df.columns if c not in front_cols and c != "Hour_Raw"]
    long_df = long_df[front_cols + remaining]

    # Post-transformation verification
    long_non_null_aqi = int(long_df["AQI"].notna().sum())
    total_long_rows = len(long_df)

    if wide_non_null_aqi != long_non_null_aqi:
        raise AssertionError(
            f"Data loss detected during AQI melting! "
            f"Wide non-null observations: {wide_non_null_aqi:,}, "
            f"Long non-null observations: {long_non_null_aqi:,}."
        )

    validation_metrics = {
        "wide_rows": len(df),
        "long_rows": total_long_rows,
        "wide_non_null_aqi": wide_non_null_aqi,
        "long_non_null_aqi": long_non_null_aqi,
        "missing_aqi_observations": total_long_rows - long_non_null_aqi,
        "parity_verified": (wide_non_null_aqi == long_non_null_aqi),
    }

    logger.info(
        "Melt successful: %d rows produced. Verified non-null AQI parity: %d == %d.",
        total_long_rows,
        wide_non_null_aqi,
        long_non_null_aqi,
    )

    return long_df, validation_metrics


def build_station_metadata(
    stations_df: pd.DataFrame,
    air_quality_2025_df: Optional[pd.DataFrame] = None,
    aqi_history_df: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Consolidate authoritative station metadata enriched with presence and coverage flags.

    Args:
        stations_df: Base stations dataset.
        air_quality_2025_df: Optional 2025 measurements dataset.
        aqi_history_df: Optional historical AQI dataset.

    Returns:
        Enriched DataFrame of station metadata.
    """
    meta = stations_df.copy()

    # Base unique check
    meta = meta.drop_duplicates(subset=["Station ID"]).reset_index(drop=True)

    if air_quality_2025_df is not None and "Station ID" in air_quality_2025_df.columns:
        aq25_counts = air_quality_2025_df.groupby("Station ID").agg(
            Hours_Recorded_2025=("Timestamp", "count"),
            Min_UTC_2025=("Timestamp", "min"),
            Max_UTC_2025=("Timestamp", "max"),
        ).reset_index()
        meta = meta.merge(aq25_counts, on="Station ID", how="left")
        meta["Hours_Recorded_2025"] = meta["Hours_Recorded_2025"].fillna(0).astype(int)
        meta["In_2025_Data"] = (meta["Hours_Recorded_2025"] > 0).astype(bool)
    else:
        meta["In_2025_Data"] = False

    if aqi_history_df is not None and "Station ID" in aqi_history_df.columns:
        date_col = "Date" if "Date" in aqi_history_df.columns else None
        if date_col:
            hist_counts = aqi_history_df.groupby("Station ID").agg(
                Days_Recorded_History=(date_col, "count"),
                Min_Date_History=(date_col, "min"),
                Max_Date_History=(date_col, "max"),
            ).reset_index()
            meta = meta.merge(hist_counts, on="Station ID", how="left")
            meta["Days_Recorded_History"] = meta["Days_Recorded_History"].fillna(0).astype(int)
            meta["In_Historical_Data"] = (meta["Days_Recorded_History"] > 0).astype(bool)
        else:
            meta["In_Historical_Data"] = False
    else:
        meta["In_Historical_Data"] = False

    return meta.sort_values(by=["State", "City", "Station ID"]).reset_index(drop=True)


def save_processed_datasets(
    datasets: Dict[str, pd.DataFrame],
    output_dir: Union[str, Path] = "data/processed",
    save_parquet: bool = True,
) -> Dict[str, Dict[str, Union[Path, int]]]:
    """Save processed datasets to CSV and Parquet formats reproducibly.

    Args:
        datasets: Dict mapping dataset filenames (without extension) to DataFrames.
                  e.g. {'air_quality_2025_ist': df1, 'aqi_history_long': df2, 'station_metadata': df3}
        output_dir: Output folder path.
        save_parquet: Whether to write high-performance Parquet companions.

    Returns:
        Summary dict containing output paths and row counts.
    """
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    summary: Dict[str, Dict[str, Union[Path, int]]] = {}

    for name, df in datasets.items():
        csv_path = out_dir / f"{name}.csv"
        logger.info("Saving '%s' to CSV: %s (rows: %d)...", name, csv_path, len(df))
        df.to_csv(csv_path, index=False, encoding="utf-8")

        item_info: Dict[str, Union[Path, int]] = {
            "csv_path": csv_path,
            "rows": len(df),
            "columns": len(df.columns),
        }

        if save_parquet:
            pq_path = out_dir / f"{name}.parquet"
            logger.info("Saving '%s' to Parquet: %s...", name, pq_path)
            # Ensure all column names are strings for pyarrow compatibility
            df_pq = df.copy()
            df_pq.columns = [str(c) for c in df_pq.columns]
            df_pq.to_parquet(pq_path, index=False, engine="pyarrow")
            item_info["parquet_path"] = pq_path

        summary[name] = item_info

    logger.info("All processed datasets saved successfully to '%s'.", out_dir)
    return summary
