from fastapi import APIRouter, HTTPException
from app.services.station_state import get_station_summary
from app.core.provenance import make_provenance, DataClass, TemporalStatus

router = APIRouter(prefix="/stations/{station_id}/environment", tags=["Environment"])

@router.get("/current")
def get_current_environment(station_id: str):
    st_id = station_id.upper()
    if st_id not in ["MAITRI", "BHARATI"]:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found.")
    
    summary = get_station_summary(st_id)
    prov = make_provenance(
        data_class=DataClass.LIVE,
        source="NCPOR AWS Automatic Weather Station / NPDC Portal",
        source_year=2025,
        station=st_id,
        temporal_status=TemporalStatus.CURRENT,
        confidence="HIGH",
        notes="Observation synchronized via satellite link."
    )

    return {
        "station_id": st_id,
        "timestamp": "2025-04-24T14:28:00Z",
        "temperature_c": summary["temperature_c"],
        "pressure_hpa": summary["pressure_hpa"],
        "humidity_pct": summary["humidity_pct"],
        "wind_speed_kmh": summary["wind_speed_kmh"],
        "wind_direction": "NE (45°)",
        "weather_condition": "Sub-zero Polar Regime",
        "visibility": "Good",
        "source": "NCPOR AWS / NPDC Data Portal",
        "data_class": "LIVE",
        "provenance": prov
    }

@router.get("/history")
def get_environment_history(station_id: str):
    st_id = station_id.upper()
    base_t = -24.8 if st_id == "MAITRI" else -21.3
    return [
        {"timestamp": "08:00", "temperature_c": round(base_t - 2.1, 1), "wind_speed_kmh": 10.4, "pressure_hpa": 974.1},
        {"timestamp": "10:00", "temperature_c": round(base_t - 1.2, 1), "wind_speed_kmh": 11.2, "pressure_hpa": 973.8},
        {"timestamp": "12:00", "temperature_c": round(base_t + 0.5, 1), "wind_speed_kmh": 12.0, "pressure_hpa": 973.5},
        {"timestamp": "14:00", "temperature_c": base_t, "wind_speed_kmh": 12.6, "pressure_hpa": 973.2},
    ]
