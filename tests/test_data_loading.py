"""Unit tests for data loading and dataset summary introspection.

Uses isolated, synthetic temporary CSVs to ensure fast, reproducible testing.
"""

from __future__ import annotations

import sys
from pathlib import Path
import pytest
import pandas as pd

# Ensure src is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from northair.data_loader import DataLoader, DatasetSummary


@pytest.fixture
def temp_data_env(tmp_path: Path):
    """Fixture creating a temporary directory with synthetic test datasets."""
    raw_dir = tmp_path / "raw"
    raw_dir.mkdir(parents=True)

    # 1. Synthetic stations.csv with UTF-8 BOM
    stations_csv = raw_dir / "stations.csv"
    stations_data = (
        "\ufeffStation ID,State,City,Station Name\n"
        "site_001,Punjab,Amritsar,Golden Temple - PPCB\n"
        "site_002,Haryana,Gurugram,Vikas Sadan - HSPCB\n"
    )
    stations_csv.write_text(stations_data, encoding="utf-8")

    # 2. Synthetic aqi_history_2017_2023.csv
    aqi_csv = raw_dir / "aqi_history_2017_2023.csv"
    hour_headers = ",".join([f"{i:02d}:00:00" for i in range(24)])
    aqi_row1 = ",".join(["150.0" if i % 2 == 0 else "" for i in range(24)])
    aqi_data = (
        f"\ufeffStation ID,State,City,Station Name,Date,{hour_headers}\n"
        f"site_001,Punjab,Amritsar,Golden Temple - PPCB,2020-01-01,{aqi_row1}\n"
    )
    aqi_csv.write_text(aqi_data, encoding="utf-8")

    # 3. Synthetic air_quality_hourly_2025.csv
    aq25_csv = raw_dir / "air_quality_hourly_2025.csv"
    aq25_data = (
        "\ufeffStation ID,State,City,Station Name,Timestamp,PM2.5 (µg/m³),PM10 (µg/m³)\n"
        "site_001,Punjab,Amritsar,Golden Temple - PPCB,2025-01-01 00:00:00,45.2,85.1\n"
        "site_002,Haryana,Gurugram,Vikas Sadan - HSPCB,2025-01-01 01:00:00,120.5,\n"
    )
    aq25_csv.write_text(aq25_data, encoding="utf-8")

    return raw_dir


def test_loader_check_files_exist_all_present(temp_data_env: Path):
    """Verify check_files_exist returns True for all present files."""
    loader = DataLoader(raw_dir=temp_data_env)
    exists = loader.check_files_exist()
    assert exists["stations"] is True
    assert exists["aqi_history"] is True
    assert exists["air_quality_hourly_2025"] is True


def test_loader_missing_dataset_detection(tmp_path: Path):
    """Verify proper detection and exception raising when raw files are missing."""
    empty_dir = tmp_path / "empty_raw"
    empty_dir.mkdir()
    loader = DataLoader(raw_dir=empty_dir)

    exists = loader.check_files_exist()
    assert exists["stations"] is False
    assert exists["aqi_history"] is False
    assert exists["air_quality_hourly_2025"] is False

    with pytest.raises(FileNotFoundError) as exc_info:
        loader.load_stations()
    assert "stations.csv" in str(exc_info.value)


def test_encoding_bom_handling(temp_data_env: Path):
    """Verify that UTF-8 BOM is cleanly stripped from column names."""
    loader = DataLoader(raw_dir=temp_data_env)
    df_stations = loader.load_stations()
    assert "Station ID" in df_stations.columns
    assert "\ufeffStation ID" not in df_stations.columns
    assert len(df_stations) == 2


def test_dataset_summary_introspection(temp_data_env: Path):
    """Verify summary metrics calculation including missing counts and dtypes."""
    loader = DataLoader(raw_dir=temp_data_env)
    df_aq25 = loader.load_air_quality_hourly_2025()
    summary = loader.summarize_dataset(df_aq25, name="air_quality_hourly_2025")

    assert summary.rows == 2
    assert summary.columns == 7
    assert summary.missing_counts["PM10 (µg/m³)"] == 1
    assert summary.missing_counts["PM2.5 (µg/m³)"] == 0
    assert summary.duplicate_rows == 0
    assert len(summary.head) == 2
    assert len(summary.tail) == 2

