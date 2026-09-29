"""
ANTWIN - Bharati Meteorological Replay Engine (100% Offline)
Loads verified local Bharati historical observations from docs/Content/data/bharati/bharati_winter_replay.csv and provides:
- Centralized replay clock (0-167 hours, looping)
- Temporal simulation with speed controls (0.5x, 1x, 2x, 5x, 10x; default 2x)
- Dynamic scenario fault injection state (CHP-02 failure, RO degradation, extreme cold, delays, etc.)
- Explainable weather event detection
- Zero network dependencies
"""

import csv
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import ROOT_DIR
from app.simulation.bharati_operational_model import calculate_bharati_operational_state
from app.simulation.bharati_schematic import get_bharati_schematic_zones

logger = logging.getLogger(__name__)

BHARATI_DATA_DIR = ROOT_DIR / "docs" / "Content" / "data" / "bharati"
BHARATI_CSV_PATH = BHARATI_DATA_DIR / "bharati_winter_replay.csv"
BHARATI_META_PATH = BHARATI_DATA_DIR / "metadata.json"

class BharatiReplayEngine:
    def __init__(self):
        self.observations: List[Dict[str, Any]] = []
        self.current_index: int = 18  # Daytime hour
        self.mode: str = "REPLAY"     # Strictly offline local REPLAY
        self.speed: float = 2.0       # Default 2.0x
        self.is_playing: bool = True
        self.metadata: Dict[str, Any] = {}
        self.active_scenario: Optional[Dict[str, Any]] = None
        self._load_dataset()

    @property
    def total_records(self) -> int:
        return len(self.observations)

    def _load_dataset(self):
        """Loads and parses the local 168-hour Bharati CSV dataset."""
        if not BHARATI_CSV_PATH.exists():
            logger.error(f"Bharati Replay CSV not found at {BHARATI_CSV_PATH}")
            return

        with open(BHARATI_CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.observations.append({
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
                })

        if BHARATI_META_PATH.exists():
            with open(BHARATI_META_PATH, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

        logger.info(f"Loaded {len(self.observations)} Bharati local observations for replay.")

    def set_speed(self, speed: float):
        if speed in [0.5, 1.0, 2.0, 5.0, 10.0]:
            self.speed = speed

    def toggle_play(self) -> bool:
        self.is_playing = not self.is_playing
        return self.is_playing

    def seek(self, index: int):
        if self.observations:
            self.current_index = max(0, min(len(self.observations) - 1, index))

    def reset(self):
        self.current_index = 0
        self.is_playing = True

    def set_scenario(self, scenario_name: Optional[str], severity: float = 35.0, mitigations: List[str] = None):
        """Sets active scenario fault injection on Bharati operational twin."""
        if not scenario_name or scenario_name.lower() in ["none", "clear", "normal"]:
            self.active_scenario = None
        else:
            self.active_scenario = {
                "name": scenario_name,
                "severity": float(severity),
                "mitigations": mitigations or []
            }

    def toggle_mitigation(self, mitigation_name: str) -> List[str]:
        """Toggles an active explainable mitigation on Bharati active scenario."""
        if not self.active_scenario:
            return []
        active_mits = list(self.active_scenario.get("mitigations", []))
        if mitigation_name in active_mits:
            active_mits.remove(mitigation_name)
        else:
            active_mits.append(mitigation_name)
        self.active_scenario["mitigations"] = active_mits
        return active_mits

    def tick(self, hours_forward: int = 1) -> Dict[str, Any]:
        """Advances centralized replay clock."""
        if not self.observations:
            return {}

        if self.is_playing:
            self.current_index = (self.current_index + hours_forward) % len(self.observations)

        return self.get_current_state()

    def get_current_observation(self) -> Dict[str, Any]:
        if not self.observations:
            return {}
        return self.observations[self.current_index]

    def get_current_state(self) -> Dict[str, Any]:
        """Returns unified state: current weather + deterministic Bharati operational model."""
        obs = self.get_current_observation()
        if not obs:
            return {}

        ops = calculate_bharati_operational_state(
            weather_obs=obs,
            scenario=self.active_scenario
        )

        zones = get_bharati_schematic_zones(ops)

        events = []
        if obs.get("temperature_c", 0) < -25.0:
            events.append("Deep Polar Freeze (<-25°C)")
        if obs.get("wind_speed_knots", 0) > 35.0:
            events.append("Prydz Bay Coastal Gale (>35 kt)")
        if obs.get("wind_speed_knots", 0) > 45.0:
            events.append("Severe Blizzard & Whiteout")
        if self.active_scenario:
            events.append(f"SCENARIO: {self.active_scenario['name'].upper()} ({self.active_scenario['severity']:.0f}%)")

        return {
            "mode": "REPLAY",
            "station": "BHARATI",
            "current_index": self.current_index,
            "total_records": len(self.observations),
            "current_timestamp": obs.get("timestamp"),
            "is_playing": self.is_playing,
            "speed": self.speed,
            "active_events": events,
            "active_scenario": self.active_scenario,
            "current_weather": obs,
            "current_operations": ops,
            "schematic_zones": zones
        }

# Singleton instance
_bharati_replay_engine: Optional[BharatiReplayEngine] = None

def get_bharati_replay_engine() -> BharatiReplayEngine:
    global _bharati_replay_engine
    if _bharati_replay_engine is None:
        _bharati_replay_engine = BharatiReplayEngine()
    return _bharati_replay_engine
