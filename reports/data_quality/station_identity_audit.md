# NorthAir Intelligence — Station Identity Reconciliation Audit

**VIZ-A-THON 2026 — Phase 2: Technical Investigation**

This document formalizes the empirical investigation into the 42,257 duplicate `['Station ID', 'Date']` entries in the historical AQI dataset (`aqi_history_2017_2023.csv`).

## 1. Executive Summary of Investigation

| Metric | Value | Finding & Interpretation |
|---|---|---|
| Total Unique Metadata Tuples in History | **78** | Disproportionate to 31 distinct Station IDs |
| `EXACT_MATCH` Stations | **31** | Verified 1:1 match with canonical `stations.csv` |
| `VERIFIED_MATCH` Disambiguated | **10** | Stations mislabeled under another ID in their city, resolved via Station Name |
| `UNRESOLVED` (Out-of-Region) | **37** | Stations from other Indian states dumped under `site_5046` |
| Total North Indian Stations in History | **41 / 48** | 10 additional stations recovered from multiplexed IDs |

## 2. Root Cause Analysis of Station ID Multiplexing

The 42,257 duplicate `['Station ID', 'Date']` records do **not** represent duplicate sensor reads. They represent **source-data compiler identifier reuse / grouping** across four specific Station IDs:

### A. `site_5582` (Chandigarh CPCC)
- In `stations.csv`, Chandigarh has three stations: `site_5491` (Sector 22), `site_5127` (Sector-25), and `site_5582` (Sector-53).
- In `aqi_history_2017_2023.csv`, all three Chandigarh stations were assigned `Station ID = site_5582`. However, their `Station Name` clearly distinguishes them.
- **Resolution**: Disambiguated via Station Name into canonical `site_5491`, `site_5127`, and `site_5582`.

### B. `site_5341` (Faridabad HSPCB)
- In `stations.csv`, Faridabad has four stations: `site_5340` (New Industrial Town), `site_5342` (Sector 11), `site_5341` (Sector 30), and `site_263` (Sector- 16A).
- In history, all four Faridabad stations were grouped under `Station ID = site_5341`.
- **Resolution**: Disambiguated via Station Name into canonical `site_5340`, `site_5342`, `site_5341`, and `site_263`.

### C. `site_5344` (Gurugram HSPCB / IMD)
- In `stations.csv`, Gurugram has four stations: `site_5025` (NISE Gwal Pahari), `site_5345` (Sector-51), `site_5344` (Teri Gram), and `site_146` (Vikas Sadan).
- In history, all four were labeled `Station ID = site_5344`.
- **Resolution**: Disambiguated via Station Name into canonical `site_5025`, `site_5345`, `site_5344`, and `site_146`.

### D. `site_5046` (Yamuna Nagar HSPCB — Severe Multiplexing)
- `site_5046` was assigned **40 different station names** in the raw historical file.
- Only **three** correspond to North Indian stations:
  1. `Gobind Pura Yamuna Nagar HSPCB` $\rightarrow$ Canonical `site_5046` (Yamuna Nagar)
  2. `Arya Nagar Bahadurgarh HSPCB` $\rightarrow$ Canonical `site_5045` (Bahadurgarh)
  3. `Shyam Nagar Palwal HSPCB` $\rightarrow$ Canonical `site_5050` (Palwal)
- The remaining **37 station names** originate from non-target states across India (e.g. Adarsh Nagar Jaipur in Rajasthan, Nehru Nagar Kanpur in UP, Dnyaneshwar Nagar Solapur in Maharashtra, Jawahar Nagar in Puducherry).
- **Crucial Action**: All 37 non-target stations are classified as `UNRESOLVED` and **excluded** from North India historical analysis, preventing severe geographical pollution distortion.

## 3. Disambiguated Crosswalk Table (North Indian Recoveries)

| Original ID | Original Name in History | Canonical ID | Canonical Station Name | City | State |
|---|---|---|---|---|---|
| `site_5046` | Arya Nagar Bahadurgarh HSPCB | **`site_5045`** | Arya Nagar, Bahadurgarh - HSPCB | Bahadurgarh | Haryana |
| `site_5046` | Shyam Nagar Palwal HSPCB | **`site_5050`** | Shyam Nagar, Palwal - HSPCB | Palwal  | Haryana |
| `site_5341` | New Industrial Town Faridabad HSPCB | **`site_5340`** | New Industrial Town, Faridabad - HSPCB | Faridabad | Haryana |
| `site_5341` | Sector 11 Faridabad HSPCB | **`site_5342`** | Sector 11, Faridabad - HSPCB | Faridabad | Haryana |
| `site_5341` | Sector- 16A Faridabad HSPCB | **`site_263`** | Sector- 16A, Faridabad - HSPCB | Faridabad | Haryana |
| `site_5344` | NISE Gwal Pahari Gurugram IMD | **`site_5025`** | NISE Gwal Pahari, Gurugram - IMD | Gurugram | Haryana |
| `site_5344` | Sector-51 Gurugram HSPCB | **`site_5345`** | Sector-51, Gurugram - HSPCB | Gurugram | Haryana |
| `site_5344` | Vikas Sadan Gurugram HSPCB | **`site_146`** | Vikas Sadan, Gurugram - HSPCB | Gurugram | Haryana |
| `site_5582` | Sector 22 Chandigarh CPCC | **`site_5491`** | Sector 22, Chandigarh - CPCC | Chandigarh | Chandigarh |
| `site_5582` | Sector-25 Chandigarh CPCC | **`site_5127`** | Sector-25, Chandigarh - CPCC | Chandigarh | Chandigarh |

## 4. Genuinely Missing Historical Stations (7 Stations)

The following 7 stations from `stations.csv` have no representation anywhere in `aqi_history_2017_2023.csv`:
1. `site_1420`: Ashok Vihar, Delhi - DPCC
2. `site_1422`: Dwarka-Sector 8, Delhi - DPCC
3. `site_1426`: Narela, Delhi - DPCC
4. `site_1429`: Nehru Nagar, Delhi - DPCC
5. `site_1431`: Patparganj, Delhi - DPCC
6. `site_1434`: Wazirpur, Delhi - DPCC
7. `site_6011`: Amity University, Panchgaon - IITM

*All 6 Delhi DPCC stations and 1 Panchgaon station were commissioned or added to the CAAQM network post-2023.*