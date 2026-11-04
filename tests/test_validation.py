"""Unit tests for validation constraints and data quality profiling logic.

Uses synthetic DataFrames for fast, hermetic test runs.
"""

from __future__ import annotations

import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

# Ensure src is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from northair.validation import (
    validate_station_integrity,
    validate_timestamp_conversion,
    validate_aqi_melting,
    validate_processed_outputs,
)
from northair.data_profiler import DataProfiler


def test_station_integrity_validation_clean():
    """Verify clean validation when all stations match without orphans."""
    stations = pd.DataFrame({
        "Station ID": ["s1", "s2"],
        "State": ["Delhi", "Punjab"],
        "City": ["Delhi", "Jalandhar"],
        "Station Name": ["Delhi 1", "Jalandhar 1"],
    })
    aq25 = pd.DataFrame({"Station ID": ["s1", "s2"]})
    history = pd.DataFrame({"Station ID": ["s1"]})

    res = validate_station_integrity(stations, aq25, history)
    assert res["passed"] is True
    assert res["unique_stations_count"] == 2
    assert res["duplicate_station_ids"] == 0
    assert len(res["unmatched"]["orphan_stations_in_2025"]) == 0
    assert len(res["unmatched"]["uncovered_stations_in_history"]) == 1


def test_station_integrity_detects_orphans_and_duplicates():
    """Verify detection of duplicate station IDs and orphan stations in data."""
    stations_with_dupes = pd.DataFrame({
        "Station ID": ["s1", "s1"],  # Duplicate ID
        "State": ["Delhi", "Delhi"],
        "City": ["Delhi", "Delhi"],
        "Station Name": ["Name 1", "Name 2"],
    })
    aq25_with_orphan = pd.DataFrame({"Station ID": ["s1", "s999_orphan"]})

    res = validate_station_integrity(stations_with_dupes, aq25_with_orphan)
    assert res["passed"] is False
    assert res["duplicate_station_ids"] == 1
    assert "s999_orphan" in res["unmatched"]["orphan_stations_in_2025"]


def test_profiler_percentile_calculations():
    """Verify that 25%, 50%, 75%, and 90% percentiles match numpy percentiles."""
    values = np.linspace(10.0, 100.0, 100)
    df = pd.DataFrame({"metric": values})

    # Synthetic profiler instance
    dummy_meta = pd.DataFrame({"Station ID": ["s1"]})
    profiler = DataProfiler(dummy_meta, dummy_meta, df)

    stats_df, stats_list = profiler.profile_numerical_statistics(df)
    stat = stats_list[0]

    assert stat.column == "metric"
    assert stat.count == 100
    assert stat.missing == 0
    assert stat.min == 10.0
    assert stat.max == 100.0
    assert stat.median == pytest.approx(float(np.percentile(values, 50)), 0.01)
    assert stat.p25 == pytest.approx(float(np.percentile(values, 25)), 0.01)
    assert stat.p75 == pytest.approx(float(np.percentile(values, 75)), 0.01)
    assert stat.p90 == pytest.approx(float(np.percentile(values, 90)), 0.01)


def test_validate_processed_outputs_check(tmp_path: Path):
    """Verify checking processed output file existence and sizes."""
    out_dir = tmp_path / "processed"
    out_dir.mkdir()

    # Before creating files
    res_before = validate_processed_outputs(output_dir=out_dir)
    assert res_before["passed"] is False

    # Create dummy files
    (out_dir / "air_quality_2025_ist.csv").write_text("dummy", encoding="utf-8")
    (out_dir / "aqi_history_long.csv").write_text("dummy", encoding="utf-8")
    (out_dir / "station_metadata.csv").write_text("dummy", encoding="utf-8")

    res_after = validate_processed_outputs(output_dir=out_dir)
    assert res_after["passed"] is True
    assert res_after["files"]["air_quality_2025_ist.csv"]["size_bytes"] > 0

