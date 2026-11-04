#!/usr/bin/env python3
"""Script 02: Preprocess Data — NorthAir Intelligence

Executes Task 3 (Timestamp Processing), Task 4 (Historical AQI Transformation),
Task 5 (Station Mapping), and Task 6 (Save Processed Data).

Converts UTC to IST, melts historical AQI, enriches station metadata, and exports
analysis-ready CSV and Parquet files into data/processed/.

Usage:
    python scripts/02_preprocess_data.py
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

# Add src to Python module path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from northair.data_loader import DataLoader
from northair.preprocessing import (
    convert_utc_to_ist,
    transform_aqi_history_to_long,
    build_station_metadata,
    save_processed_datasets,
)
from northair.validation import (
    validate_timestamp_conversion,
    validate_aqi_melting,
    validate_processed_outputs,
)


def main() -> None:
    print("\n" + "=" * 78)
    print(" NORTHAIR INTELLIGENCE — PIPELINE STEP 02: DATA PREPROCESSING")
    print(" VIZ-A-THON 2026 — North India Air Quality Analytics Platform")
    print("=" * 78 + "\n")

    start_time = time.time()
    raw_dir = PROJECT_ROOT / "data" / "raw"
    processed_dir = PROJECT_ROOT / "data" / "processed"

    loader = DataLoader(raw_dir=raw_dir)

    # 1. Load raw datasets
    print("[1/5] Loading raw datasets from data/raw/...")
    t0 = time.time()
    stations_df = loader.load_stations()
    aqi_hist_df = loader.load_aqi_history()
    aq_2025_df = loader.load_air_quality_hourly_2025()
    print(f"  - stations.csv: {stations_df.shape[0]:,} rows")
    print(f"  - aqi_history_2017_2023.csv: {aqi_hist_df.shape[0]:,} rows")
    print(f"  - air_quality_hourly_2025.csv: {aq_2025_df.shape[0]:,} rows")
    print(f"  (Loaded in {time.time() - t0:.2f} seconds)")

    # 2. Task 3: Timestamp Processing (UTC -> IST +05:30)
    print("\n[2/5] Task 3: Converting 2025 UTC Timestamps to Indian Standard Time (IST)...")
    t0 = time.time()
    aq_2025_ist, ts_anomalies = convert_utc_to_ist(aq_2025_df, timestamp_col="Timestamp")
    print(f"  - Converted rows: {len(aq_2025_ist):,}")
    print(f"  - Missing timestamps: {ts_anomalies['missing_timestamps']}")
    print(f"  - Invalid timestamps: {ts_anomalies['invalid_timestamps']}")
    print(f"  - Analytical columns added: Timestamp_IST, Date, Year, Month, Month_Name, Day, Hour, Day_of_Week")
    print(f"  - Sample UTC: {aq_2025_df['Timestamp'].iloc[0]} -> Sample IST: {aq_2025_ist['Timestamp_IST'].iloc[0]}")

    # Validate conversion
    val_ts = validate_timestamp_conversion(aq_2025_df, aq_2025_ist)
    print(f"  - Validation check: PASSED ({val_ts['offset_verified']} verified across sample)")
    print(f"  (Processed in {time.time() - t0:.2f} seconds)")

    # 3. Task 4: Historical AQI Transformation (Wide -> Long)
    print("\n[3/5] Task 4: Melting Historical AQI Dataset from Wide to Long Format...")
    t0 = time.time()
    aqi_long, melt_metrics = transform_aqi_history_to_long(aqi_hist_df)
    print(f"  - Wide rows: {melt_metrics['wide_rows']:,} (24 hourly columns)")
    print(f"  - Long rows: {melt_metrics['long_rows']:,}")
    print(f"  - Wide non-null AQI values: {melt_metrics['wide_non_null_aqi']:,}")
    print(f"  - Long non-null AQI values: {melt_metrics['long_non_null_aqi']:,}")
    print(f"  - Missing AQI cells preserved as NaN: {melt_metrics['missing_aqi_observations']:,}")

    # Validate melting parity
    val_melt = validate_aqi_melting(aqi_hist_df, aqi_long)
    print(f"  - Validation check: PASSED (Non-null observation parity exactly verified: {val_melt['parity']})")
    print(f"  (Processed in {time.time() - t0:.2f} seconds)")

    # 4. Task 5: Station Mapping & Metadata Enrichment
    print("\n[4/5] Task 5: Station Mapping & Metadata Enrichment...")
    t0 = time.time()
    station_meta = build_station_metadata(
        stations_df=stations_df,
        air_quality_2025_df=aq_2025_df,
        aqi_history_df=aqi_hist_df,
    )
    print(f"  - Enriched stations count: {len(station_meta)}")
    print(f"  - Stations active in 2025 data: {station_meta['In_2025_Data'].sum()} / {len(station_meta)}")
    print(f"  - Stations present in historical data: {station_meta['In_Historical_Data'].sum()} / {len(station_meta)}")
    print(f"  (Processed in {time.time() - t0:.2f} seconds)")

    # 5. Task 6: Save Processed Data (CSV + Parquet)
    print("\n[5/5] Task 6: Saving Processed Datasets to data/processed/ (CSV + Parquet)...")
    t0 = time.time()
    datasets_to_save = {
        "air_quality_2025_ist": aq_2025_ist,
        "aqi_history_long": aqi_long,
        "station_metadata": station_meta,
    }
    save_summary = save_processed_datasets(
        datasets=datasets_to_save,
        output_dir=processed_dir,
        save_parquet=True,
    )
    print(f"  (Saved in {time.time() - t0:.2f} seconds)")

    # 6. Verify output files
    print("\nVerifying output files in data/processed/...")
    output_val = validate_processed_outputs(output_dir=processed_dir)
    print(f"Output verification status: {'PASSED' if output_val['passed'] else 'FAILED'}")
    for fname, info in output_val["files"].items():
        print(f"  - {fname:<30}: {info['size_mb']:>6.2f} MB ({info['size_bytes']:,} bytes)")

    print("\n" + "=" * 78)
    print(" PREPROCESSING PIPELINE COMPLETED SUCCESSFULLY")
    print(f" Total Pipeline Time: {time.time() - start_time:.2f} seconds")
    print(f" Processed datasets ready for analytical querying and modeling.")
    print("=" * 78 + "\n")


if __name__ == "__main__":
    main()

