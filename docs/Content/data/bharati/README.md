# Bharati Station Meteorological Replay Dataset & Operational Calibration

## 1. Overview
This directory contains the authoritative offline meteorological replay dataset and calibration records for **Bharati Station** in the **ANTWIN Digital Twin**.

Bharati is India's third Antarctic research station, located on a rocky promontory in the **Larsemann Hills**, East Antarctica ($69^\circ 24.41'\text{ S}, 76^\circ 11.72'\text{ E}$), at an elevation of approximately **35 meters** above sea level.

---

## 2. Dataset Specification
- **File Name**: `bharati_winter_replay.csv` (and normalized `bharati_winter_replay.json`)
- **Total Duration**: Exactly 7 Days (168 Hours, looping continuously)
- **Time Step**: 1-hour resolution
- **Core Meteorological Fields**:
  - `timestamp`: ISO-8601 UTC timestamp
  - `temperature_c`: Outdoor ambient surface temperature ($^\circ\text{C}$)
  - `relative_humidity_pct`: Atmospheric relative humidity ($\%$)
  - `pressure_hpa`: Barometric station pressure ($\text{hPa}$)
  - `wind_speed_ms`: Wind speed in meters per second ($\text{m/s}$)
  - `wind_speed_knots`: Wind speed in knots ($\text{kt}$)
  - `wind_speed_kmh`: Wind speed in kilometers per hour ($\text{km/h}$)
  - `wind_direction_deg`: Compass bearing of incoming wind ($0^\circ - 359^\circ$)
  - `wind_direction_cardinal`: 16-point cardinal compass direction (e.g. ESE, SE)
  - `weather_event`: Synoptic weather classification

---

## 3. Data Provenance & Ground Truth Policy
In strict accordance with ANTWIN's four-layer Data Truth Policy:

| Data Element | Classification | Source & Provenance Description |
| :--- | :--- | :--- |
| **Station Coordinates & Elevation** | `REFERENCE` | Official NCPOR Bharati Station Reference ($69^\circ 24.41'\text{ S}, 76^\circ 11.72'\text{ E}$, 35 m). |
| **Occupancy Capacity** | `REFERENCE` | Main Building: 47 personnel; Additional Summer/Emergency: 25 personnel (Max combined: 72). |
| **Generation Architecture** | `REFERENCE` | 3 $\times$ 100 kVA Combined Heat and Power (CHP) units ($\sim 300\text{ kVA}$ total installed). |
| **Maximum Thermal Demand** | `REFERENCE` | Documented maximum design thermal load of $\approx 155\text{ kWth}$. |
| **Fuel Storage Infrastructure** | `REFERENCE` | Documented $\sim 300,000\text{ L}$ class automated Jet A-1 fuel farm. |
| **Water Utility Infrastructure** | `REFERENCE` | Seawater drawn from Quilty Bay $\to$ dedicated pump house $\to$ RO desalination $\to$ remineralization. |
| **Meteorological Replay Series** | `REPLAY` | Deterministic historical-style winter dataset calibrated to NCPOR / IMD / IIG AWS observation patterns (2012–2016 baseline). |
| **Subsystem Telemetry** | `SIMULATED` | Physics-driven simulation (CHP loadings, RO output, fuel burn rates). |
| **Mission Autonomy & Risk** | `DERIVED` | ANTWIN multi-domain endurance calculation ($\min(\text{energy}, \text{fuel}, \text{water}, \dots)$). |

> **Important Data Truth Caveat**:
> NCPOR's live telemetry endpoints are private to station operations and not publicly accessible. ANTWIN operates 100% offline, never scrapes private BMS/SCADA networks, and never falsely represents prototype-simulated telemetry as verified NCPOR real-time data.

---

## 4. Bharati-Specific Weather Regimes (7-Day Winter Profile)
Unlike the continental oasis climate of Maitri, Bharati experiences coastal maritime weather conditions driven by Prydz Bay cyclonic systems:

1. **Period A (Hours 0–27) — Stable Polar Cold**: $-16.5^\circ\text{C}$ to $-18.5^\circ\text{C}$, 982–985 hPa, 12–18 kt ESE winds.
2. **Period B (Hours 28–55) — Temperature Decline**: Gradual radiative heat loss down to $-24.8^\circ\text{C}$, 986 hPa, 10–15 kt winds.
3. **Period C (Hours 56–83) — Increasing Maritime Wind**: Approaching low-pressure system in Prydz Bay; winds ramp from 15 to 38 kt.
4. **Period D (Hours 84–111) — Strong Wind Event / Coastal Blizzard**: Severe gale with gusts exceeding 50 kt, barometric low of 962 hPa; external field mobility restricted.
5. **Period E (Hours 112–139) — Severe Cold-Wind Chill Peak**: Sustained winds of 32–38 kt coupled with temperatures of $-27^\circ\text{C}$, producing maximum thermal demand on the station.
6. **Period F (Hours 140–167) — Synoptic Weather Recovery**: Pressure recovers to 985 hPa, winds ease below 16 kt, and logistics accessibility reopens.

---

## 5. Offline Simulation Architecture
The local replay engine runs deterministically on port 8000:
- Single centralized replay clock with synchronized playback.
- Instantaneous local speed switching ($0.5\times, 1.0\times, 2.0\times, 5.0\times, 10.0\times$).
- Zero external internet or API dependencies.
