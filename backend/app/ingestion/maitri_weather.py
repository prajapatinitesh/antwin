"""
ANTWIN - Maitri Local Meteorological Ingestion Module (100% Offline)
Loads realistic local historical meteorological observation series without external network calls.
Guarantees 100% offline functionality as per product rules.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.config import ROOT_DIR
from app.core.provenance import make_provenance, DataClass, TemporalStatus

DATA_DIR = ROOT_DIR / "docs" / "Content" / "data" / "maitri"
REPLAY_JSON_PATH = DATA_DIR / "maitri_winter_replay.json"

_cached_observations = []

def _get_local_observations():
    global _cached_observations
    if not _cached_observations and REPLAY_JSON_PATH.exists():
        with open(REPLAY_JSON_PATH, "r", encoding="utf-8") as f:
            _cached_observations = json.load(f)
    return _cached_observations

def fetch_local_maitri_observation(index: int = 0) -> Dict[str, Any]:
    """
    Returns the local offline Maitri weather observation at the given index.
    Zero external network calls, 100% offline.
    """
    obs_list = _get_local_observations()
    if obs_list:
        idx = index % len(obs_list)
        obs = dict(obs_list[idx])
        obs["data_class"] = "REPLAY"
        obs["provenance"] = make_provenance(
            data_class=DataClass.REPLAY,
            source="NPDC/NCPOR AWS Maitri Archive (Station 89514)",
            source_year=2014,
            station="Maitri",
            temporal_status=TemporalStatus.HISTORICAL,
            notes="Local offline historical observation dataset."
        )
        return obs

    # Safe deterministic fallback if files are loading
    return {
        "station": "MAITRI",
        "timestamp": "2014-07-15T12:00:00",
        "temperature_c": -17.6,
        "relative_humidity_pct": 58.4,
        "pressure_hpa": 978.5,
        "wind_speed_ms": 7.5,
        "wind_speed_kmh": 27.0,
        "wind_direction_deg": 149,
        "wind_direction_cardinal": "SSE",
        "data_class": "REPLAY"
    }
