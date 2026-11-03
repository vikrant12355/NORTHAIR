# NorthAir Intelligence — Air Pollution Hotspot Detection Report

**VIZ-A-THON 2026 — Phase 2: Spatial Hotspots & Vulnerability Ranking**

This analysis systematically identifies stations and urban centers experiencing elevated, chronic, and extreme particulate matter exposure across North India in 2025.

## 1. Top 10 Chronic Exposure Hotspots (Ranked by Annual Mean PM2.5)

| Rank | Station ID | Station Name | City | State | Mean PM2.5 (µg/m³) | Median PM2.5 | Exceedance >60 µg/m³ (%) |
|---|---|---|---|---|---|---|---|
| 1 | `site_5045` | Arya Nagar, Bahadurgarh - HSPCB | Bahadurgarh | Haryana | **161.77** | 133.35 | 87.37% |
| 2 | `site_5041` | Murthal, Sonipat - HSPCB | Sonipat | Haryana | **156.85** | 146.15 | 95.72% |
| 3 | `site_5044` | Municipal Corporation Office, Dharuhera -  HSPCB | Dharuhera | Haryana | **144.44** | 130.3 | 87.74% |
| 4 | `site_5039` | Sector-2 IMT, Manesar - HSPCB | Manesar | Haryana | **131.75** | 113.9 | 86.44% |
| 5 | `site_1434` | Wazirpur, Delhi - DPCC | Delhi | Delhi | **125.24** | 80.0 | 62.68% |
| 6 | `site_5344` | Teri Gram, Gurugram - HSPCB | Gurugram | Haryana | **123.42** | 107.3 | 88.07% |
| 7 | `site_5345` | Sector-51, Gurugram - HSPCB | Gurugram | Haryana | **120.26** | 96.9 | 76.66% |
| 8 | `site_147` | MD University, Rohtak - HSPCB | Rohtak | Haryana | **118.01** | 94.68 | 78.8% |
| 9 | `site_5056` | Police Lines, Jind - HSPCB | Jind | Haryana | **117.79** | 104.35 | 82.51% |
| 10 | `site_1420` | Ashok Vihar, Delhi - DPCC | Delhi | Delhi | **113.15** | 74.0 | 57.81% |

## 2. Top 10 Acute / Extreme Pollution Hotspots (Ranked by 90th Percentile PM2.5)

| Rank | Station ID | Station Name | City | State | 90th %ile PM2.5 (µg/m³) | Max PM2.5 | Severe Hours (>250 µg/m³, %) |
|---|---|---|---|---|---|---|---|
| 1 | `site_5045` | Arya Nagar, Bahadurgarh - HSPCB | Bahadurgarh | Haryana | **304.34** | 982.1 | 13.95% |
| 2 | `site_1434` | Wazirpur, Delhi - DPCC | Delhi | Delhi | **283.8** | 967.0 | 12.79% |
| 3 | `site_1429` | Nehru Nagar, Delhi - DPCC | Delhi | Delhi | **265.0** | 870.0 | 11.67% |
| 4 | `site_5041` | Murthal, Sonipat - HSPCB | Sonipat | Haryana | **258.94** | 407.82 | 11.93% |
| 5 | `site_1420` | Ashok Vihar, Delhi - DPCC | Delhi | Delhi | **257.0** | 892.0 | 10.73% |
| 6 | `site_1426` | Narela, Delhi - DPCC | Delhi | Delhi | **249.0** | 696.0 | 9.81% |
| 7 | `site_5044` | Municipal Corporation Office, Dharuhera -  HSPCB | Dharuhera | Haryana | **246.2** | 813.0 | 9.22% |
| 8 | `site_1431` | Patparganj, Delhi - DPCC | Delhi | Delhi | **246.0** | 686.0 | 9.54% |
| 9 | `site_5039` | Sector-2 IMT, Manesar - HSPCB | Manesar | Haryana | **238.47** | 959.3 | 7.99% |
| 10 | `site_1422` | Dwarka-Sector 8, Delhi - DPCC  | Delhi | Delhi | **233.0** | 774.0 | 8.05% |

## 3. Top 10 PM10 Hotspots (Ranked by Annual Mean PM10)

| Rank | Station ID | Station Name | City | State | Mean PM10 (µg/m³) | Median PM10 | Exceedance >100 µg/m³ (%) |
|---|---|---|---|---|---|---|---|
| 1 | `site_1434` | Wazirpur, Delhi - DPCC | Delhi | Delhi | **281.13** | 237.0 | 90.9% |
| 2 | `site_5044` | Municipal Corporation Office, Dharuhera -  HSPCB | Dharuhera | Haryana | **278.87** | 258.9 | 95.76% |
| 3 | `site_5345` | Sector-51, Gurugram - HSPCB | Gurugram | Haryana | **255.27** | 213.75 | 91.86% |
| 4 | `site_5045` | Arya Nagar, Bahadurgarh - HSPCB | Bahadurgarh | Haryana | **249.92** | 216.1 | 83.76% |
| 5 | `site_5041` | Murthal, Sonipat - HSPCB | Sonipat | Haryana | **235.36** | 230.35 | 98.5% |
| 6 | `site_1420` | Ashok Vihar, Delhi - DPCC | Delhi | Delhi | **224.58** | 189.5 | 77.84% |
| 7 | `site_5060` | Nathu Colony, Ballabgarh - HSPCB | Ballabgarh | Haryana | **222.96** | 205.42 | 92.0% |
| 8 | `site_5048` | Sector-18, Panipat - HSPCB | Panipat | Haryana | **222.51** | 190.69 | 85.6% |
| 9 | `site_1431` | Patparganj, Delhi - DPCC | Delhi | Delhi | **219.8** | 191.0 | 79.88% |
| 10 | `site_1422` | Dwarka-Sector 8, Delhi - DPCC  | Delhi | Delhi | **217.6** | 186.0 | 81.35% |

## 4. Multi-Criteria Composite Hotspot Summary

To avoid misleading classifications based on single outlier peaks or sample size differences, the Composite Hotspot Rank weights:

- Chronic baseline exposure (Annual Mean PM2.5, 40% weight)
- Acute severe episode intensity (90th Percentile PM2.5, 30% weight)
- Exposure frequency (% of hours exceeding the 60 µg/m³ National Standard, 30% weight)

| Composite Rank | Station ID | Station Name | City | State | Mean PM2.5 | 90th %ile PM2.5 | Exceedance % |
|---|---|---|---|---|---|---|---|
| 1 | `site_263` | Sector- 16A, Faridabad - HSPCB | Faridabad | Haryana | nan | nan | nan% |
| 2 | `site_5041` | Murthal, Sonipat - HSPCB | Sonipat | Haryana | 156.85 | 258.94 | 95.72% |
| 3 | `site_5045` | Arya Nagar, Bahadurgarh - HSPCB | Bahadurgarh | Haryana | 161.77 | 304.34 | 87.37% |
| 4 | `site_5044` | Municipal Corporation Office, Dharuhera -  HSPCB | Dharuhera | Haryana | 144.44 | 246.2 | 87.74% |
| 5 | `site_5039` | Sector-2 IMT, Manesar - HSPCB | Manesar | Haryana | 131.75 | 238.47 | 86.44% |
| 6 | `site_5344` | Teri Gram, Gurugram - HSPCB | Gurugram | Haryana | 123.42 | 208.51 | 88.07% |
| 7 | `site_1434` | Wazirpur, Delhi - DPCC | Delhi | Delhi | 125.24 | 283.8 | 62.68% |
| 8 | `site_5056` | Police Lines, Jind - HSPCB | Jind | Haryana | 117.79 | 194.1 | 82.51% |
| 9 | `site_147` | MD University, Rohtak - HSPCB | Rohtak | Haryana | 118.01 | 223.78 | 78.8% |
| 9 | `site_5060` | Nathu Colony, Ballabgarh - HSPCB | Ballabgarh | Haryana | 112.11 | 165.92 | 89.2% |

*Note: High-ranking stations represent persistent regional airshed pollution hubs requiring prioritized air-shed management.*