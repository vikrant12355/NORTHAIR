# NorthAir Intelligence — Data Coverage & Completeness Report

**VIZ-A-THON 2026 — Phase 2: Technical Audit**

## 1. 2025 Dataset Spatial & Temporal Coverage

- **Total 2025 Hourly Records**: 414,255
- **Unique Hourly Timestamps**: 8,760 (out of 8,760 calendar hours)
- **Station-Timestamp Duplicates**: 0 (Zero duplicates verified)

### State-Level Completeness (2025)
| State / UT | Station Count | Recorded Hours | Expected Hours | Completeness % |
|---|---|---|---|---|
| Chandigarh | 3 | 26,280 | 26,280 | **100.0%** |
| Delhi | 6 | 52,560 | 52,560 | **100.0%** |
| Punjab | 8 | 69,658 | 70,080 | **99.4%** |
| Haryana | 31 | 265,757 | 271,560 | **97.86%** |

### Monthly Completeness (2025)
| Month | Active Stations | Recorded Hours | Expected Hours | Completeness % |
|---|---|---|---|---|
| January | 48 | 35,613 | 35,712 | 99.72% |
| February | 48 | 31,621 | 32,256 | 98.03% |
| March | 48 | 35,267 | 35,712 | 98.75% |
| April | 48 | 33,715 | 34,560 | 97.55% |
| May | 48 | 34,922 | 35,712 | 97.79% |
| June | 48 | 33,837 | 34,560 | 97.91% |
| July | 47 | 34,949 | 35,712 | 97.86% |
| August | 47 | 34,918 | 35,712 | 97.78% |
| September | 47 | 33,813 | 34,560 | 97.84% |
| October | 48 | 35,449 | 35,712 | 99.26% |
| November | 48 | 34,507 | 34,560 | 99.85% |
| December | 48 | 35,644 | 35,712 | 99.81% |

### Parameter-Level Observation Availability (2025)
| Variable | Category | Valid Records | Missing Records | Availability % |
|---|---|---|---|---|
| `PM2.5 (µg/m³)` | Pollutant | 218,917 | 195,338 | 52.85% |
| `PM10 (µg/m³)` | Pollutant | 214,875 | 199,380 | 51.87% |
| `NO (µg/m³)` | Pollutant | 214,248 | 200,007 | 51.72% |
| `NO2 (µg/m³)` | Pollutant | 215,266 | 198,989 | 51.96% |
| `NOx (ppb)` | Pollutant | 219,777 | 194,478 | 53.05% |
| `NH3 (µg/m³)` | Pollutant | 185,866 | 228,389 | 44.87% |
| `SO2 (µg/m³)` | Pollutant | 196,791 | 217,464 | 47.5% |
| `CO (mg/m³)` | Pollutant | 207,093 | 207,162 | 49.99% |
| `Ozone (µg/m³)` | Pollutant | 208,311 | 205,944 | 50.29% |
| `Benzene (µg/m³)` | Pollutant | 192,179 | 222,076 | 46.39% |
| `Toluene (µg/m³)` | Pollutant | 196,063 | 218,192 | 47.33% |
| `Xylene (µg/m³)` | Pollutant | 59,123 | 355,132 | 14.27% |
| `Eth-Benzene (µg/m³)` | Pollutant | 120,282 | 293,973 | 29.04% |
| `MP-Xylene (µg/m³)` | Pollutant | 120,956 | 293,299 | 29.2% |
| `AT (°C)` | Weather | 119,250 | 295,005 | 28.79% |
| `RH (%)` | Weather | 180,044 | 234,211 | 43.46% |
| `WS (m/s)` | Weather | 200,454 | 213,801 | 48.39% |
| `WD (deg)` | Weather | 200,637 | 213,618 | 48.43% |
| `RF (mm)` | Weather | 180,878 | 233,377 | 43.66% |
| `TOT-RF (mm)` | Weather | 394,200 | 20,055 | 95.16% |
| `SR (W/mt2)` | Weather | 170,752 | 243,503 | 41.22% |
| `BP (mmHg)` | Weather | 77,287 | 336,968 | 18.66% |
| `VWS (m/s)` | Weather | 7,035 | 407,220 | 1.7% |

## 2. Historical AQI Coverage (2017–2023)

- **Total Historical Days**: 102,744
- **Total Hourly AQI Cells**: 2,465,856
- **Valid Hourly AQI Observations**: **2,291,589** (92.93% complete)
- **Missing AQI Cells**: 174,267 (7.07%)
- **Verified North Indian Stations**: 41 stations (70,834 station-days, 1,572,998 valid AQI reads)
- **Out-of-Region Excluded Stations**: 37 stations (29,685 station-days, 667,946 valid AQI reads)

### Historical AQI Completeness by Year
| Year | Station Days | Unique Station IDs | Valid Hourly AQI | Completeness % |
|---|---|---|---|---|
| 2017.0 | 1,496.0 | 8.0 | 31,222.0 | 86.96% |
| 2018.0 | 5,470.0 | 15.0 | 121,514.0 | 92.56% |
| 2019.0 | 13,944.0 | 30.0 | 313,681.0 | 93.73% |
| 2020.0 | 16,470.0 | 31.0 | 367,239.0 | 92.91% |
| 2021.0 | 18,377.0 | 31.0 | 410,602.0 | 93.1% |
| 2022.0 | 20,991.0 | 31.0 | 466,958.0 | 92.69% |
| 2023.0 | 25,996.0 | 31.0 | 580,373.0 | 93.02% |
