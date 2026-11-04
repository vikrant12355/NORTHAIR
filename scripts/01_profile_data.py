#!/usr/bin/env python3
"""Script 01: Profile Data — NorthAir Intelligence

Executes Task 1 (Data Loading) and Task 2 (Data Quality Analysis).
Loads raw datasets from data/raw/, performs deep data auditing, and exports
comprehensive quality reports to reports/data_quality/ and reports/findings/.

Usage:
    python scripts/01_profile_data.py
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

# Add src to Python module path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from northair.data_loader import DataLoader
from northair.data_profiler import DataProfiler


def main() -> None:
    print("\n" + "=" * 78)
    print(" NORTHAIR INTELLIGENCE — PIPELINE STEP 01: DATA PROFILING & QUALITY AUDIT")
    print(" VIZ-A-THON 2026 — North India Air Quality Analytics Platform")
    print("=" * 78 + "\n")

    start_time = time.time()
    raw_dir = PROJECT_ROOT / "data" / "raw"
    loader = DataLoader(raw_dir=raw_dir)

    # 1. Verify required raw files exist
    print("[1/4] Checking dataset files existence in data/raw/...")
    existence = loader.check_files_exist()
    for name, exists in existence.items():
        status = "FOUND" if exists else "MISSING"
        print(f"  - {name:<25}: {status}")

    if not all(existence.values()):
        print("\n[ERROR] One or more required raw datasets are missing.")
        print("Please supply the real competition files into data/raw/ before proceeding.")
        print("Never generate fake or synthetic data to simulate real hackathon runs.")
        sys.exit(1)

    # 2. Load datasets with BOM/encoding handling
    print("\n[2/4] Loading datasets using Pandas (handling UTF-8 BOM and charsets)...")
    load_start = time.time()
    stations_df = loader.load_stations()
    aqi_hist_df = loader.load_aqi_history()
    aq_2025_df = loader.load_air_quality_hourly_2025()
    print(f"  - stations.csv loaded: {stations_df.shape[0]:,} rows x {stations_df.shape[1]} cols")
    print(f"  - aqi_history_2017_2023.csv loaded: {aqi_hist_df.shape[0]:,} rows x {aqi_hist_df.shape[1]} cols")
    print(f"  - air_quality_hourly_2025.csv loaded: {aq_2025_df.shape[0]:,} rows x {aq_2025_df.shape[1]} cols")
    print(f"  (Data loaded in {time.time() - load_start:.2f} seconds)")

    # 3. Display summaries for Task 1
    print("\n[3/4] Generating Dataset Summaries (Dimensions, dtypes, nulls, duplicates)...")
    for name, df in [
        ("stations.csv", stations_df),
        ("aqi_history_2017_2023.csv", aqi_hist_df),
        ("air_quality_hourly_2025.csv", aq_2025_df),
    ]:
        summary = loader.summarize_dataset(df, name=name, filepath=raw_dir / name)
        summary.display()

    # 4. Run deep profiling for Task 2
    print("[4/4] Executing comprehensive Data Profiling & Quality Analysis...")
    profiler = DataProfiler(
        stations_df=stations_df,
        aqi_history_df=aqi_hist_df,
        air_quality_hourly_2025_df=aq_2025_df,
    )

    reports_dir = PROJECT_ROOT / "reports" / "data_quality"
    full_report = profiler.generate_full_report(output_dir=reports_dir)

    print("\n" + "=" * 78)
    print(" DATA QUALITY AUDIT COMPLETED")
    print("=" * 78)
    print(f"Elapsed Time: {time.time() - start_time:.2f} seconds")
    print(f"Quality Reports exported to:")
    print(f"  - {reports_dir / 'missing_values_2025.csv'}")
    print(f"  - {reports_dir / 'missing_values_history.csv'}")
    print(f"  - {reports_dir / 'numerical_stats_2025.csv'}")
    print(f"  - {reports_dir / 'station_coverage_2025.csv'}")
    print(f"  - {reports_dir / 'data_quality_report.json'}")
    print(f"  - {reports_dir / 'data_quality_report.md'}")
    print(f"  - {PROJECT_ROOT / 'reports' / 'findings' / 'data_anomalies_and_limitations.md'}")
    print("=" * 78 + "\n")


if __name__ == "__main__":
    main()

