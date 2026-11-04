#!/usr/bin/env python3
"""Script 03: Run Phase 2 Analytics Pipeline — NorthAir Intelligence

Executes Phase 2 analytics:
  - Station identity reconciliation
  - Coverage and quality decision audits
  - Spatio-temporal and state/city aggregations
  - Diurnal profile curves
  - Meteorological correlation matrices
  - Multi-year historical AQI trends
  - Station hotspot rankings
  - Official CPCB AQI engine calculation

Exports all 10 analytical datasets to data/processed/analytics/ and markdown reports.

Usage:
    python scripts/03_run_phase2_analytics.py
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

import pandas as pd
from northair.data_loader import DataLoader
from northair.analytics.station_reconciliation import generate_station_identity_reports
from northair.analytics.coverage_and_quality import generate_coverage_and_quality_reports
from northair.analytics.pipeline_phase2 import generate_all_analytics_outputs


def main() -> None:
    print("\n" + "=" * 78)
    print(" NORTHAIR INTELLIGENCE — PIPELINE STEP 03: PHASE 2 ANALYTICS ENGINE")
    print(" VIZ-A-THON 2026 — North India Air Quality Analytics Platform")
    print("=" * 78 + "\n")

    start_time = time.time()
    loader = DataLoader(raw_dir=PROJECT_ROOT / "data" / "raw")

    # 1. Load data
    print("[1/4] Loading datasets...")
    t0 = time.time()
    stations_df = loader.load_stations()
    aqi_hist_df = loader.load_aqi_history()
    # Load processed 2025 IST parquet for speed
    p25_path = PROJECT_ROOT / "data" / "processed" / "air_quality_2025_ist.parquet"
    if p25_path.is_file():
        print(f"  - Loading 2025 IST dataset from Parquet ({p25_path.name})...")
        aq_2025_df = pd.read_parquet(p25_path)
    else:
        print("  - Loading 2025 hourly dataset from raw CSV...")
        aq_2025_df = loader.load_air_quality_hourly_2025()
    print(f"  (Loaded in {time.time() - t0:.2f} seconds)")

    # 2. Stage 2: Station Identity Reconciliation
    print("\n[2/4] Stage 2: Executing Station Identity Reconciliation...")
    t0 = time.time()
    conflicts_df, crosswalk_df = generate_station_identity_reports(
        stations_df=stations_df,
        aqi_hist_df=aqi_hist_df,
        output_dir=PROJECT_ROOT / "reports" / "data_quality",
    )
    print(f"  - Reconciled {len(crosswalk_df)} historical metadata combinations.")
    print(f"  - EXACT_MATCH: {(crosswalk_df['Mapping Status'] == 'EXACT_MATCH').sum()}")
    print(f"  - VERIFIED_MATCH: {(crosswalk_df['Mapping Status'] == 'VERIFIED_MATCH').sum()}")
    print(f"  - UNRESOLVED (Out-of-region excluded): {(crosswalk_df['Mapping Status'] == 'UNRESOLVED').sum()}")
    print(f"  (Processed in {time.time() - t0:.2f} seconds)")

    # 3. Stage 3 & 4: Data Coverage & Quality Decisions
    print("\n[3/4] Stage 3 & 4: Generating Coverage Audits & Quality Control Decisions...")
    t0 = time.time()
    generate_coverage_and_quality_reports(
        aq_2025_df=aq_2025_df,
        aqi_hist_df=aqi_hist_df,
        crosswalk_df=crosswalk_df,
        output_dir=PROJECT_ROOT / "reports" / "data_quality",
    )
    print(f"  - Exported data_coverage_report.md, station_coverage.csv, monthly_coverage.csv, data_quality_decisions.md")
    print(f"  (Processed in {time.time() - t0:.2f} seconds)")

    # 4. Stage 5-10: Complete Analytics & 10 Analytical Datasets
    print("\n[4/4] Stage 5-10: Generating 10 Analytical Parquet/CSV Artifacts...")
    t0 = time.time()
    analytics_dir = PROJECT_ROOT / "data" / "processed" / "analytics"
    outputs = generate_all_analytics_outputs(
        aq_2025_df=aq_2025_df,
        aqi_hist_df=aqi_hist_df,
        crosswalk_df=crosswalk_df,
        output_dir=analytics_dir,
    )
    print(f"  (Generated in {time.time() - t0:.2f} seconds)")

    print("\n" + "=" * 78)
    print(" VERIFYING GENERATED ANALYTICS ARTIFACTS")
    print("=" * 78)
    for name, path in outputs.items():
        size_mb = path.stat().st_size / (1024 * 1024)
        print(f"  • {path.name:<32}: {size_mb:>6.2f} MB")

    print("\n" + "=" * 78)
    print(" PHASE 2 ANALYTICS PIPELINE COMPLETED SUCCESSFULLY")
    print(f" Total Pipeline Execution Time: {time.time() - start_time:.2f} seconds")
    print("=" * 78 + "\n")


if __name__ == "__main__":
    main()
