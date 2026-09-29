"""
ANTWIN - Bharati Weather Observation Ingestion (100% Offline)
Pure local file reading from verified offline dataset docs/Content/data/bharati/bharati_winter_replay.csv.
Zero external scraping, zero network dependencies, instantaneous response.
"""

import csv
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.config import ROOT_DIR

logger = logging.getLogger(__name__)

BHARATI_DATA_DIR = ROOT_DIR / "docs" / "Content" / "data" / "bharati"
BHARATI_REPLAY_CSV = BHARATI_DATA_DIR / "bharati_winter_replay.csv"

def fetch_local_bharati_observation(index: int = 0) -> Optional[Dict[str, Any]]:
    """
    Reads a single observation from the local 168-hour Bharati winter dataset at the given index.
    Instantaneous and completely offline.
    """
    if not BHARATI_REPLAY_CSV.exists():
        logger.error(f"Local Bharati dataset not found at {BHARATI_REPLAY_CSV}")
        return None

    try:
        with open(BHARATI_REPLAY_CSV, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            if not rows:
                return None
            idx = max(0, min(len(rows) - 1, index))
            row = rows[idx]
            return {
                "timestamp": row["timestamp"],
                "day_index": int(row.get("day_index", 1)),
                "hour_index": int(row.get("hour_index", 0)),
                "hour_of_day": row.get("hour_of_day", "12:00"),
                "temperature_c": float(row["temperature_c"]),
                "relative_humidity_pct": float(row["relative_humidity_pct"]),
                "pressure_hpa": float(row["pressure_hpa"]),
                "wind_speed_ms": float(row["wind_speed_ms"]),
                "wind_speed_knots": float(row["wind_speed_knots"]),
                "wind_speed_kmh": float(row["wind_speed_kmh"]),
                "wind_direction_deg": int(row["wind_direction_deg"]),
                "wind_direction_cardinal": row["wind_direction_cardinal"],
                "weather_event": row.get("weather_event", "Stable Polar Cold"),
                "station": "BHARATI",
                "source": "docs/Content/data/bharati/bharati_winter_replay.csv (168h series)",
                "data_class": "REPLAY",
                "original_observation": True
            }
    except Exception as e:
        logger.error(f"Error reading local Bharati dataset: {e}")
        return None
