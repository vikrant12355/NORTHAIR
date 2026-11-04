"""Data loading module for NorthAir Intelligence.

Handles robust loading of raw air quality datasets with encoding detection,
validation of file existence, schema introspection, and summary reporting.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class DatasetSummary:
    """Summary statistics for an inspected dataset."""
    name: str
    filepath: Path
    rows: int
    columns: int
    column_names: List[str]
    dtypes: Dict[str, str]
    head: pd.DataFrame
    tail: pd.DataFrame
    missing_counts: Dict[str, int]
    missing_percentages: Dict[str, float]
    total_missing_cells: int
    missing_cells_percentage: float
    duplicate_rows: int
    memory_usage_mb: float

    def display(self) -> None:
        """Print a structured summary of the dataset to console."""
        print(f"\n{'='*70}")
        print(f" DATASET SUMMARY: {self.name}")
        print(f" Source: {self.filepath}")
        print(f"{'='*70}")
        print(f"Dimensions: {self.rows:,} rows x {self.columns} columns")
        print(f"Memory Usage: {self.memory_usage_mb:.2f} MB")
        print(f"Duplicate Rows: {self.duplicate_rows:,}")
        print(f"Total Missing Cells: {self.total_missing_cells:,} ({self.missing_cells_percentage:.2f}%)")
        print("\nColumns & Data Types:")
        for col in self.column_names:
            dtype_str = self.dtypes[col]
            n_miss = self.missing_counts[col]
            pct_miss = self.missing_percentages[col]
            print(f"  - {col:<25} | Type: {dtype_str:<10} | Missing: {n_miss:,} ({pct_miss:.2f}%)")
        
        print("\nFirst 5 Rows:")
        print(self.head)
        print("\nLast 5 Rows:")
        print(self.tail)
        print(f"{'='*70}\n")


class DataLoader:
    """Loader and inspector for NorthAir Intelligence datasets."""

    DEFAULT_RAW_DIR = Path("data/raw")
    EXPECTED_FILES = {
        "stations": "stations.csv",
        "aqi_history": "aqi_history_2017_2023.csv",
        "air_quality_hourly_2025": "air_quality_hourly_2025.csv",
    }

    def __init__(self, raw_dir: Union[str, Path] = DEFAULT_RAW_DIR) -> None:
        """Initialize the loader with a raw data directory path.
        
        Args:
            raw_dir: Directory where raw CSV files are stored.
        """
        self.raw_dir = Path(raw_dir)

    def check_files_exist(self) -> Dict[str, bool]:
        """Check whether expected raw files exist in the data directory.
        
        Returns:
            Dictionary mapping dataset keys to boolean existence flags.
        """
        existence = {}
        for key, filename in self.EXPECTED_FILES.items():
            path = self.raw_dir / filename
            exists = path.is_file()
            existence[key] = exists
            if not exists:
                logger.warning(
                    "Required raw file '%s' was not found at '%s'. "
                    "Original dataset must be supplied before processing.",
                    filename,
                    path.resolve(),
                )
        return existence

    def get_file_path(self, dataset_key: str) -> Path:
        """Resolve and validate the path for a given dataset key.
        
        Args:
            dataset_key: Key in EXPECTED_FILES ('stations', 'aqi_history', etc.)
            
        Returns:
            Path object pointing to the file.
            
        Raises:
            KeyError: If dataset_key is unknown.
            FileNotFoundError: If the file does not exist on disk.
        """
        if dataset_key not in self.EXPECTED_FILES:
            raise KeyError(
                f"Unknown dataset key '{dataset_key}'. "
                f"Expected one of: {list(self.EXPECTED_FILES.keys())}"
            )
        filepath = self.raw_dir / self.EXPECTED_FILES[dataset_key]
        if not filepath.is_file():
            raise FileNotFoundError(
                f"Dataset file '{filepath.name}' is missing at '{filepath.resolve()}'. "
                f"Please place the raw file in '{self.raw_dir.resolve()}' before proceeding. "
                "Synthetic datasets are strictly prohibited."
            )
        return filepath

    @staticmethod
    def read_csv_with_encoding(
        filepath: Union[str, Path],
        encodings: Optional[List[str]] = None,
        **kwargs,
    ) -> pd.DataFrame:
        """Read a CSV file trying multiple encodings to handle BOM and charsets.
        
        Args:
            filepath: Path to the CSV file.
            encodings: Ordered list of encodings to try. Defaults to
                       ['utf-8-sig', 'utf-8', 'latin1', 'cp1252', 'iso-8859-1'].
            **kwargs: Extra arguments passed directly to pd.read_csv.
            
        Returns:
            Loaded pandas DataFrame.
            
        Raises:
            UnicodeDecodeError: If all candidate encodings fail.
            FileNotFoundError: If the file does not exist.
        """
        path = Path(filepath)
        if not path.is_file():
            raise FileNotFoundError(f"Cannot load CSV: File not found at '{path.resolve()}'.")

        if encodings is None:
            encodings = ["utf-8-sig", "utf-8", "latin1", "cp1252", "iso-8859-1"]

        last_error = None
        for enc in encodings:
            try:
                df = pd.read_csv(path, encoding=enc, **kwargs)
                logger.debug("Successfully loaded '%s' using encoding '%s'", path.name, enc)
                return df
            except UnicodeDecodeError as err:
                last_error = err
                logger.debug("Encoding '%s' failed for '%s': %s", enc, path.name, err)
                continue
            except Exception as err:
                # Other errors (e.g. ParserError) should propagate
                raise err

        raise UnicodeDecodeError(
            f"Failed to read '{path.name}' with any candidate encodings ({encodings}). "
            f"Last error: {last_error}"
        )

    def load_stations(self, **kwargs) -> pd.DataFrame:
        """Load the stations metadata dataset."""
        path = self.get_file_path("stations")
        return self.read_csv_with_encoding(path, **kwargs)

    def load_aqi_history(self, **kwargs) -> pd.DataFrame:
        """Load the 2017-2023 historical hourly AQI dataset."""
        path = self.get_file_path("aqi_history")
        return self.read_csv_with_encoding(path, **kwargs)

    def load_air_quality_hourly_2025(self, **kwargs) -> pd.DataFrame:
        """Load the 2025 hourly air quality and weather dataset."""
        path = self.get_file_path("air_quality_hourly_2025")
        return self.read_csv_with_encoding(path, **kwargs)

    def load_all(self) -> Dict[str, pd.DataFrame]:
        """Load all three datasets into a dictionary."""
        return {
            "stations": self.load_stations(),
            "aqi_history": self.load_aqi_history(),
            "air_quality_hourly_2025": self.load_air_quality_hourly_2025(),
        }

    def summarize_dataset(self, df: pd.DataFrame, name: str, filepath: Optional[Path] = None) -> DatasetSummary:
        """Generate a complete DatasetSummary for an in-memory DataFrame.
        
        Args:
            df: The loaded DataFrame.
            name: Identifier for the dataset.
            filepath: Optional original path.
            
        Returns:
            DatasetSummary dataclass instance.
        """
        rows, cols = df.shape
        col_names = df.columns.tolist()
        dtypes = {c: str(df[c].dtype) for c in col_names}
        head = df.head(5)
        tail = df.tail(5)

        missing_s = df.isna().sum()
        missing_counts = missing_s.to_dict()
        missing_percentages = (missing_s / rows * 100.0 if rows > 0 else missing_s * 0.0).to_dict()

        total_missing_cells = int(missing_s.sum())
        total_cells = rows * cols
        missing_cells_pct = (total_missing_cells / total_cells * 100.0) if total_cells > 0 else 0.0

        duplicate_rows = int(df.duplicated().sum())
        memory_usage_mb = float(df.memory_usage(deep=True).sum()) / (1024 * 1024)

        return DatasetSummary(
            name=name,
            filepath=filepath if filepath is not None else Path(name),
            rows=rows,
            columns=cols,
            column_names=col_names,
            dtypes=dtypes,
            head=head,
            tail=tail,
            missing_counts=missing_counts,
            missing_percentages=missing_percentages,
            total_missing_cells=total_missing_cells,
            missing_cells_percentage=missing_cells_pct,
            duplicate_rows=duplicate_rows,
            memory_usage_mb=memory_usage_mb,
        )

