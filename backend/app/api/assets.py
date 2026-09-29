from fastapi import APIRouter, HTTPException
from app.services.station_state import get_station_twin_state

router = APIRouter(prefix="", tags=["Assets"])

@router.get("/stations/{station_id}/assets")
def get_station_assets(station_id: str):
    st_id = station_id.upper()
    state = get_station_twin_state(st_id)
    return state["assets_health"]

@router.get("/assets/{asset_id}")
def get_asset_detail(asset_id: str):
    return {
        "id": asset_id,
        "name": "Maitri Prime Generator 02",
        "station_id": "MAITRI",
        "asset_type": "GENERATOR",
        "rated_capacity": 125.0,
        "unit": "kVA",
        "state": "DEGRADED",
        "health_pct": 78.0,
        "operating_hours": 1240.0,
        "vibration_mm_s": 2.4,
        "vibration_threshold": 2.0,
        "data_class": "SIMULATED",
        "upstream_dependencies": ["Polar Fuel System", "Auxiliary Starter"],
        "downstream_impacts": ["Power Distribution", "Heating Furnace Auxiliary", "Mission Autonomy"]
    }
