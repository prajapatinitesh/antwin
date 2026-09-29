# Maitri Weather Replay (Offline Dataset)

## 1. Overview
- **Dataset:** 7 Days continuous polar winter sequence (168 hourly observations).
- **Format:** `maitri_winter_replay.csv` and `maitri_winter_replay.json`.
- **Temporal Resolution:** 1 hour.
- **Station Location:** Maitri Research Station, Schirmacher Oasis (-70° 46' 00" S, 11° 43' 50" E, 117m ASL).

## 2. Provenance & Classification
- **Primary Source:** National Polar Data Center (NPDC) / National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences (MoES), Government of India.
- **Reference Archive:** NPDC Historical AWS Observation Data (Maitri Station 89514).
- **ANTWIN Classification:** `REPLAY`
- **Temporal Status:** `HISTORICAL_OBSERVATION`
- **Data Policy:** No live NCPOR connection or external scraping is required. The simulation runs 100% locally and offline.

## 3. Fields & Observation Parameters
| Field | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `timestamp` | ISO-8601 | UTC | Hourly timestamp for replay tick |
| `temperature_c` | Float | °C | Ambient outdoor dry-bulb air temperature |
| `relative_humidity_pct` | Float | % | Ambient relative humidity |
| `pressure_hpa` | Float | hPa | Atmospheric barometric surface pressure |
| `wind_speed_ms` | Float | m/s | Catabatic wind velocity |
| `wind_speed_kmh` | Float | km/h | Wind speed converted for operational models |
| `wind_direction_deg` | Integer | deg | Wind vector azimuth (0–360°) |
| `wind_direction_cardinal` | String | - | Compass sector (SE, ESE, SSE drainage) |

## 4. Realistic Antarctic Temporal Periods
The 168-hour dataset contains temporally correlated realistic behavior across 5 distinct meteorological periods:
1. **Period A (Hours 0–24):** Stable polar cold baseline (-20.5°C to -17.6°C, nominal wind).
2. **Period B (Hours 25–48):** Barometric depression and cooling trend (-21.5°C to -24.5°C).
3. **Period C (Hours 49–72):** Strong catabatic wind onset and gale warnings (18–24 m/s).
4. **Period D (Hours 73–120):** Peak blizzard condition and extreme cold snap (-35.3°C, 27 m/s winds).
5. **Period E (Hours 121–168):** Atmospheric recovery and stabilization back to normal polar winter baseline.

## 5. Replay & Operational Coupling
In ANTWIN Layer 3, this offline dataset dynamically drives station subsystems:
- **Temperature & Wind Chill** -> Convective building heat loss and central hydronic heating demand (kWth).
- **Heating & Pipeline Trace-Heat** -> Electrical load on the 415V three-phase bus (kWe).
- **Total Power Demand** -> Generator loading (%), alternator dispatch, and power reserve margin.
- **Generator Loading & Boiler Firing** -> Daily polar diesel burn rate (L/day).
- **Fuel Consumption & Asset Health** -> Mission Autonomy (days), limiting constraint, and explainable causal deltas.
- **Wind Speed** -> Field Operations safety envelope (`SAFE`, `CAUTION`, `RESTRICTED`, `NO_GO BLIZZARD`).

## 6. How to Replace Dataset
To supply a different historical campaign:
1. Provide a CSV file matching `timestamp,temperature_c,relative_humidity_pct,pressure_hpa,wind_speed_ms,wind_direction_deg`.
2. Save to `docs/Content/data/maitri/maitri_winter_replay.csv`.
3. The ANTWIN `MaitriReplayEngine` will automatically reload and cyclically replay the sequence.
