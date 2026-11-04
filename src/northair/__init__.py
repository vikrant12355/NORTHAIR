"""NorthAir Intelligence package.

Technical foundation for data-driven air quality analytics in North India.
Built for VIZ-A-THON 2026.
"""

__version__ = "0.1.0"
__author__ = "NorthAir Intelligence Team"

from northair.data_loader import DataLoader
from northair.data_profiler import DataProfiler
from northair.preprocessing import (
    convert_utc_to_ist,
    transform_aqi_history_to_long,
    build_station_metadata,
    save_processed_datasets,
)
from northair.validation import (
    validate_station_integrity,
    validate_timestamp_conversion,
    validate_aqi_melting,
    validate_processed_outputs,
)

__all__ = [
    "DataLoader",
    "DataProfiler",
    "convert_utc_to_ist",
    "transform_aqi_history_to_long",
    "build_station_metadata",
    "save_processed_datasets",
    "validate_station_integrity",
    "validate_timestamp_conversion",
    "validate_aqi_melting",
    "validate_processed_outputs",
]

