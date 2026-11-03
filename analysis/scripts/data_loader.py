import os
import pandas as pd
import numpy as np
from config import DATA_DIR

class DataLoader:
    _instance = None

    def __init__(self):
        self.df_2025 = None
        self.df_history = None
        self.df_stations = None
        self._load_datasets()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_datasets(self):
        # 1. Load 2025 IST Air Quality
        path_2025 = os.path.join(DATA_DIR, 'air_quality_2025_ist.parquet')
        if os.path.exists(path_2025):
            df = pd.read_parquet(path_2025)
            # Standardize column mapping
            rename_map = {}
            for col in df.columns:
                if col.startswith('PM2.5'): rename_map[col] = 'pm25'
                elif col.startswith('PM10'): rename_map[col] = 'pm10'
                elif col.startswith('NO2'): rename_map[col] = 'no2'
                elif col.startswith('SO2'): rename_map[col] = 'so2'
                elif col.startswith('CO '): rename_map[col] = 'co'
                elif col.startswith('Ozone'): rename_map[col] = 'ozone'
                elif col.startswith('AT '): rename_map[col] = 'temp'
                elif col.startswith('RH '): rename_map[col] = 'rh'
                elif col.startswith('WS '): rename_map[col] = 'ws'
                elif col.startswith('WD '): rename_map[col] = 'wd'
                elif col.startswith('RF '): rename_map[col] = 'rf'
                elif col.startswith('SR '): rename_map[col] = 'sr'
                elif col.startswith('BP '): rename_map[col] = 'bp'
                elif col.startswith('VWS '): rename_map[col] = 'vws'
                elif col == 'Station ID': rename_map[col] = 'station_id'
                elif col == 'Station Name': rename_map[col] = 'station_name'
                elif col == 'State': rename_map[col] = 'state'
                elif col == 'City': rename_map[col] = 'city'
                elif col == 'Date': rename_map[col] = 'date'
                elif col == 'Month': rename_map[col] = 'month'
                elif col == 'Hour': rename_map[col] = 'hour'
                elif col == 'Timestamp_IST': rename_map[col] = 'timestamp_ist'
            
            df = df.rename(columns=rename_map)

            # Assign Seasons
            # Winter: Dec, Jan, Feb
            # Summer/Pre-Monsoon: Mar, Apr, May
            # Monsoon: Jun, Jul, Aug, Sep
            # Post-Monsoon: Oct, Nov
            season_map = {
                1: 'Winter', 2: 'Winter', 12: 'Winter',
                3: 'Pre-Monsoon', 4: 'Pre-Monsoon', 5: 'Pre-Monsoon',
                6: 'Monsoon', 7: 'Monsoon', 8: 'Monsoon', 9: 'Monsoon',
                10: 'Post-Monsoon', 11: 'Post-Monsoon'
            }
            if 'month' in df.columns:
                df['season'] = df['month'].map(season_map)

            # Flag sensor saturation
            df['pm25_saturated'] = df['pm25'] >= 999.9
            df['pm10_saturated'] = df['pm10'] >= 1000.0
            df['co_saturated'] = df['co'] >= 10.0

            self.df_2025 = df

        # 2. Load Historical AQI
        path_history = os.path.join(DATA_DIR, 'aqi_history_long.parquet')
        if os.path.exists(path_history):
            df_hist = pd.read_parquet(path_history)
            df_hist = df_hist.rename(columns={
                'Station ID': 'station_id',
                'Station Name': 'station_name',
                'State': 'state',
                'City': 'city',
                'Date': 'date',
                'Hour': 'hour',
                'AQI': 'aqi'
            })
            # Extract Year and Month if date is available
            if 'date' in df_hist.columns:
                df_hist['date_parsed'] = pd.to_datetime(df_hist['date'], errors='coerce')
                df_hist['year'] = df_hist['date_parsed'].dt.year
                df_hist['month'] = df_hist['date_parsed'].dt.month
            self.df_history = df_hist

        # 3. Load Station Metadata
        path_stations = os.path.join(DATA_DIR, 'station_metadata.parquet')
        if os.path.exists(path_stations):
            df_meta = pd.read_parquet(path_stations)
            df_meta = df_meta.rename(columns={
                'Station ID': 'station_id',
                'Station Name': 'station_name',
                'State': 'state',
                'City': 'city',
                'Hours_Recorded_2025': 'hours_recorded_2025',
                'Days_Recorded_History': 'days_recorded_history'
            })
            self.df_stations = df_meta

    def get_2025_data(self):
        return self.df_2025

    def get_historical_data(self):
        return self.df_history

    def get_station_metadata(self):
        return self.df_stations

    def get_daily_station_summary(self):
        """Aggregate hourly records to station-day summaries to account for temporal autocorrelation."""
        df = self.df_2025
        agg_rules = {
            'pm25': 'mean',
            'pm10': 'mean',
            'no2': 'mean',
            'so2': 'mean',
            'co': 'mean',
            'ozone': 'mean',
            'temp': 'mean',
            'rh': 'mean',
            'ws': 'mean',
            'rf': 'sum'
        }
        existing_aggs = {k: v for k, v in agg_rules.items() if k in df.columns}
        daily = df.groupby(['state', 'city', 'station_id', 'station_name', 'date', 'month', 'season'])[list(existing_aggs.keys())].agg(existing_aggs).reset_index()
        return daily

    def get_regional_comparison(self, pollutant='pm25'):
        """
        Calculates both:
        A. Measurement-Weighted: Sample mean across all valid measurements in the state.
        B. Station-Balanced: Unweighted mean of station means in each state (prevents high-sample stations from dominating).
        """
        df = self.df_2025.dropna(subset=[pollutant])

        # A. Measurement-Weighted
        meas_weighted = df.groupby('state')[pollutant].agg(
            mean_meas='mean',
            std_meas='std',
            median_meas='median',
            count_meas='count',
            q75_meas=lambda x: np.percentile(x, 75),
            q90_meas=lambda x: np.percentile(x, 90)
        ).reset_index()

        # B. Station-Balanced
        stn_means = df.groupby(['state', 'station_id'])[pollutant].mean().reset_index()
        stn_balanced = stn_means.groupby('state')[pollutant].agg(
            mean_balanced='mean',
            std_balanced='std',
            median_balanced='median',
            station_count='count'
        ).reset_index()

        merged = pd.merge(meas_weighted, stn_balanced, on='state')
        return merged

data_loader = DataLoader.get_instance()

