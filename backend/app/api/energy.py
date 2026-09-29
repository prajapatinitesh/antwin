from fastapi import APIRouter, HTTPException
from app.services.station_state import get_station_twin_state
from app.services.autonomy import calculate_mission_autonomy

router = APIRouter(prefix="/stations/{station_id}", tags=["Energy & Autonomy"])

@router.get("/power")
def get_station_power(station_id: str):
    st_id = station_id.upper()
    state = get_station_twin_state(st_id)
    return state["power_state"]

@router.get("/fuel")
def get_station_fuel(station_id: str):
    st_id = station_id.upper()
    state = get_station_twin_state(st_id)
    return state["fuel_state"]

@router.get("/autonomy")
def get_station_autonomy(station_id: str):
    st_id = station_id.upper()
    state = get_station_twin_state(st_id)
    return state["autonomy"]
