"""
ANTWIN - Dedicated Bharati Replay & Station Digital Twin API Endpoints (100% Offline)
Zero external network calls, immediate local response (<10ms).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.replay.bharati_replay import get_bharati_replay_engine
from app.simulation.bharati_operational_model import calculate_bharati_operational_state
from app.simulation.bharati_schematic import get_bharati_schematic_zones
from app.core.provenance import make_provenance, DataClass, TemporalStatus

router = APIRouter(prefix="/bharati", tags=["Bharati Digital Twin Replay"])

class ReplayControlRequest(BaseModel):
    action: Optional[str] = None       # play, pause, seek, reset
    speed: Optional[float] = None      # 0.5, 1.0, 2.0, 5.0, 10.0
    is_playing: Optional[bool] = None
    seek_index: Optional[int] = None
    index: Optional[int] = None

class ScenarioInjectRequest(BaseModel):
    scenario_name: Optional[str] = None  # e.g. "CHP-02 Failure", "RO Plant Degradation", "Extreme Cold"
    severity_pct: Optional[float] = 35.0
    mitigations: Optional[List[str]] = []

class MitigationToggleRequest(BaseModel):
    mitigation_name: str

_previous_op_state = None

@router.get("/replay/current")
def get_current_replay_state():
    """
    Returns current active local observation, correlated operational twin loads,
    subsystem status, weather events, and active scenario impact for Bharati.
    """
    global _previous_op_state
    engine = get_bharati_replay_engine()
    state = engine.get_current_state()
    return state

@router.post("/replay/tick")
def trigger_replay_tick():
    """
    Advances replay clock by 1 simulated hour and recalculates all operational twin parameters immediately.
    """
    engine = get_bharati_replay_engine()
    state = engine.tick(hours_forward=1)
    return state

@router.post("/replay/control")
def control_replay(req: ReplayControlRequest):
    """
    Adjusts replay parameters: speed, playback state, or scrubber position.
    Immediate local execution (< 1ms).
    """
    engine = get_bharati_replay_engine()

    if req.action == "play":
        engine.is_playing = True
    elif req.action == "pause":
        engine.is_playing = False
    elif req.action == "reset":
        engine.reset()
    elif req.is_playing is not None:
        engine.is_playing = req.is_playing

    if req.speed is not None:
        engine.set_speed(req.speed)

    seek_target = req.seek_index if req.seek_index is not None else req.index
    if seek_target is not None:
        engine.seek(seek_target)

    return engine.get_current_state()

@router.post("/scenario/inject")
def inject_scenario(req: ScenarioInjectRequest):
    """
    Injects a fault scenario (e.g. CHP-02 Failure, RO Plant Degradation)
    or clears it back to nominal.
    """
    engine = get_bharati_replay_engine()
    engine.set_scenario(
        scenario_name=req.scenario_name,
        severity=req.severity_pct or 35.0,
        mitigations=req.mitigations or []
    )
    return engine.get_current_state()

@router.post("/scenario/mitigate")
def toggle_mitigation(req: MitigationToggleRequest):
    """
    Toggles an explainable mitigation action on the active scenario.
    """
    engine = get_bharati_replay_engine()
    active_mits = engine.toggle_mitigation(req.mitigation_name)
    state = engine.get_current_state()
    state["active_mitigations"] = active_mits
    return state

@router.get("/schematic/zones")
def get_schematic_zones():
    """
    Returns Bharati 2D reference geometry operational schematic zones and active subsystem statuses.
    """
    engine = get_bharati_replay_engine()
    state = engine.get_current_state()
    return state.get("schematic_zones", [])

@router.get("/timeline")
def get_replay_timeline():
    """
    Returns 168-hour timeline summaries for scrubbing and trend charts.
    """
    engine = get_bharati_replay_engine()
    timeline = []
    for obs in engine.observations:
        timeline.append({
            "index": obs["hour_index"],
            "timestamp": obs["timestamp"],
            "temperature_c": obs["temperature_c"],
            "wind_speed_knots": obs["wind_speed_knots"],
            "pressure_hpa": obs["pressure_hpa"],
            "weather_event": obs.get("weather_event")
        })
    return timeline
