"""
ANTWIN - Dedicated Maitri Replay & Station Digital Twin API Endpoints (100% Offline)
Zero external network calls, immediate local response (<10ms).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.replay.maitri_replay import maitri_replay_engine
from app.simulation.maitri_operational_model import calculate_maitri_operational_state
from app.simulation.maitri_schematic import get_maitri_schematic_zones
from app.core.provenance import make_provenance, DataClass, TemporalStatus

router = APIRouter(prefix="/maitri", tags=["Maitri Digital Twin Replay"])

class ReplayControlRequest(BaseModel):
    action: Optional[str] = None       # play, pause, seek, reset
    speed: Optional[float] = None      # 0.5, 1.0, 2.0, 5.0, 10.0
    is_playing: Optional[bool] = None
    seek_index: Optional[int] = None
    index: Optional[int] = None

class ScenarioInjectRequest(BaseModel):
    scenario_name: Optional[str] = None  # e.g. "Generator-02 Degradation", "Extreme Cold", "None"
    severity_pct: Optional[float] = 35.0
    mitigations: Optional[List[str]] = []

class MitigationToggleRequest(BaseModel):
    mitigation_name: str

_previous_op_state = None

@router.get("/replay/current")
def get_current_replay_state():
    """
    Returns current active local observation, correlated operational twin loads,
    subsystem status, weather events, and active scenario impact.
    """
    global _previous_op_state
    obs = maitri_replay_engine.get_current_observation()
    op_state = calculate_maitri_operational_state(
        weather_obs=obs,
        previous_state=_previous_op_state,
        scenario=maitri_replay_engine.active_scenario
    )
    _previous_op_state = op_state

    return {
        "weather": obs,
        "current_weather": obs,
        "operational_twin": op_state,
        "current_operations": op_state,
        "mode": "REPLAY",
        "speed": maitri_replay_engine.speed,
        "is_playing": maitri_replay_engine.is_playing,
        "current_index": maitri_replay_engine.current_index,
        "index": maitri_replay_engine.current_index,
        "total_records": len(maitri_replay_engine.observations),
        "current_timestamp": obs.get("timestamp"),
        "timestamp": obs.get("timestamp"),
        "active_events": [e.get("label", "") for e in obs.get("events", [])],
        "active_scenario": maitri_replay_engine.active_scenario
    }

@router.post("/replay/tick")
def trigger_replay_tick():
    """
    Advances replay clock by 1 simulated hour and recalculates all operational twin parameters immediately.
    """
    global _previous_op_state
    obs = maitri_replay_engine.tick()
    op_state = calculate_maitri_operational_state(
        weather_obs=obs,
        previous_state=_previous_op_state,
        scenario=maitri_replay_engine.active_scenario
    )
    _previous_op_state = op_state

    return {
        "weather": obs,
        "current_weather": obs,
        "operational_twin": op_state,
        "current_operations": op_state,
        "mode": "REPLAY",
        "speed": maitri_replay_engine.speed,
        "is_playing": maitri_replay_engine.is_playing,
        "current_index": maitri_replay_engine.current_index,
        "index": maitri_replay_engine.current_index,
        "total_records": len(maitri_replay_engine.observations),
        "current_timestamp": obs.get("timestamp"),
        "timestamp": obs.get("timestamp"),
        "active_events": [e.get("label", "") for e in obs.get("events", [])],
        "active_scenario": maitri_replay_engine.active_scenario
    }

@router.post("/replay/control")
def control_replay(req: ReplayControlRequest):
    """
    Adjusts replay parameters: speed, playback state, or scrubber position.
    Immediate local execution (< 1ms).
    """
    if req.action == "play":
        maitri_replay_engine.is_playing = True
    elif req.action == "pause":
        maitri_replay_engine.is_playing = False
    elif req.action == "reset":
        maitri_replay_engine.reset()
    elif req.action == "seek" and (req.index is not None or req.seek_index is not None):
        seek_to = req.index if req.index is not None else req.seek_index
        maitri_replay_engine.seek(seek_to)

    if req.speed is not None:
        maitri_replay_engine.set_speed(req.speed)
    if req.is_playing is not None:
        maitri_replay_engine.is_playing = req.is_playing
    if req.seek_index is not None:
        maitri_replay_engine.seek(req.seek_index)
    elif req.index is not None:
        maitri_replay_engine.seek(req.index)

    return get_current_replay_state()

@router.post("/scenario/inject")
def inject_scenario(req: ScenarioInjectRequest):
    """
    Injects or clears a scenario fault on the operational model without altering weather data.
    Immediate local calculation (< 2ms).
    """
    maitri_replay_engine.set_scenario(
        scenario_name=req.scenario_name,
        severity=req.severity_pct or 35.0,
        mitigations=req.mitigations or []
    )
    return get_current_replay_state()

@router.post("/scenario/mitigate")
def toggle_mitigation(req: MitigationToggleRequest):
    """
    Toggles an explainable mitigation recommendation on the active scenario.
    """
    updated_mits = maitri_replay_engine.toggle_mitigation(req.mitigation_name)
    return get_current_replay_state()

@router.get("/replay/timeline")
def get_replay_timeline():
    """Returns detected weather events and milestones across the 7-day replay series."""
    return maitri_replay_engine.get_timeline()

@router.get("/replay/history")
def get_replay_history(count: int = 24, hours: Optional[int] = None):
    """Returns past 24 hours of replayed observations for dynamic moving charts."""
    num_hours = hours if hours is not None else count
    return {
        "station_id": "MAITRI",
        "hours": num_hours,
        "history": maitri_replay_engine.get_history_window(num_hours)
    }

@router.get("/schematic/zones")
def get_schematic_zones():
    """
    Returns documented Maitri 2D station schematic zones with dynamic status
    driven by current operational twin state and active scenario.
    """
    obs = maitri_replay_engine.get_current_observation()
    op_state = calculate_maitri_operational_state(
        weather_obs=obs,
        scenario=maitri_replay_engine.active_scenario
    )
    zones = get_maitri_schematic_zones(op_state)
    return {
        "station_id": "MAITRI",
        "station_name": "Maitri Research Station",
        "layout_provenance": "Antarctic Treaty Inspection Report 2001 (Survey of India Map Series) & NCPOR 2025 Advisory",
        "zones": zones,
        "operational_summary": {
            "heating_demand_kw": op_state["heating_demand_kw"],
            "power_load_kw": op_state["power_load_kw"],
            "generator_load_pct": op_state["generator_load_pct"],
            "fuel_endurance_days": op_state["fuel_endurance_days"],
            "mission_autonomy_days": op_state["mission_autonomy_days"],
            "limiting_constraint": op_state["limiting_constraint"],
            "active_scenario": maitri_replay_engine.active_scenario
        }
    }

@router.get("/schematic/zone/{zone_id}")
def get_schematic_zone_detail(zone_id: str):
    """Returns rich operational and subsystem detail for a selected schematic zone."""
    obs = maitri_replay_engine.get_current_observation()
    op_state = calculate_maitri_operational_state(
        weather_obs=obs,
        scenario=maitri_replay_engine.active_scenario
    )
    zones = get_maitri_schematic_zones(op_state)
    for z in zones:
        if z["id"] == zone_id:
            return z
    raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found in Maitri schematic")

@router.get("/assets/fleet")
def get_maitri_fleet_registry():
    """Returns Maitri Polar Mobility fleet registry based on NCPOR 2025 documented assets."""
    return {
        "station_id": "MAITRI",
        "fleet": [
            {
                "id": "PB-300-01",
                "unit": "PistenBully 300 Polar",
                "type": "Heavy Snow Groomer & Traverse Tractor",
                "role": "Crevasse survey & cargo sledge haulage",
                "status": "Operational",
                "engine_hours": 1420,
                "location": "Garage Workshop / West Yard",
                "winterized": True
            },
            {
                "id": "PB-100-02",
                "unit": "Kassbohrer PB100",
                "type": "Light Tracked Vehicle",
                "role": "Personnel transport to Lake Priyadarshini intake",
                "status": "Operational",
                "engine_hours": 890,
                "location": "Main Building Front Port",
                "winterized": True
            },
            {
                "id": "TEREX-CRANE",
                "unit": "Terex 25T All-Terrain",
                "type": "Rough-Terrain Hydraulic Crane",
                "role": "ISO container offloading & plant rigging",
                "status": "Ready",
                "engine_hours": 640,
                "location": "Container Line East",
                "winterized": True
            },
            {
                "id": "HILUX-6X6",
                "unit": "Toyota Arctic Hilux 6x6",
                "type": "Expedition Support Truck",
                "role": "Schirmacher Oasis route reconnaissance",
                "status": "Operational",
                "engine_hours": 1120,
                "location": "Garage Bay 2",
                "winterized": True
            },
            {
                "id": "YAM-VK540-1",
                "unit": "Yamaha VK Professional 540",
                "type": "Utility Snowmobile",
                "role": "Glaciology & meteorological sensor maintenance",
                "status": "Operational",
                "engine_hours": 310,
                "location": "Outer Hangar",
                "winterized": True
            }
        ]
    }
