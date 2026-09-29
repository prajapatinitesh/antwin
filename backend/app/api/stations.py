from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.station_state import get_station_summary, get_station_twin_state
from app.services.autonomy import calculate_mission_autonomy

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("")
def list_stations():
    """Returns summaries for both Maitri and Bharati stations."""
    maitri = get_station_summary("MAITRI")
    bharati = get_station_summary("BHARATI")
    return [maitri, bharati]

@router.get("/{station_id}")
def get_station(station_id: str):
    """Returns single station summary."""
    st_id = station_id.upper()
    if st_id not in ["MAITRI", "BHARATI"]:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found.")
    return get_station_summary(st_id)

@router.get("/{station_id}/state")
def get_station_state(station_id: str):
    """Returns full Digital Twin state for a station."""
    st_id = station_id.upper()
    if st_id not in ["MAITRI", "BHARATI"]:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found.")
    return get_station_twin_state(st_id)
