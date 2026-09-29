from fastapi import APIRouter

router = APIRouter(prefix="/stations/{station_id}", tags=["Logistics & Resupply"])

@router.get("/logistics")
def get_logistics(station_id: str):
    st_id = station_id.upper()
    return {
        "station_id": st_id,
        "pipeline": [
            {"name": "Goa", "completed": True, "current": False},
            {"name": "Cape Town", "completed": True, "current": False},
            {"name": "Expedition Vessel", "completed": False, "current": True},
            {"name": "Antarctica", "completed": False, "current": False},
            {"name": "Stations", "completed": False, "current": False},
        ],
        "next_shipment_title": "Next Cargo Shipment (ETA)",
        "next_shipment_route": f"Cape Town -> {st_id.capitalize()}",
        "next_shipment_eta_days": 12,
        "vessel_eta_title": "Vessel ETA (India Bay)",
        "vessel_eta_days": 18,
        "active_delay_days": 0,
        "cargo_status": "Vessel navigating Roaring Forties corridor",
        "data_class": "SIMULATED"
    }

@router.get("/resupply")
def get_resupply_schedule(station_id: str):
    return {
        "expedition": "44th Indian Scientific Expedition to Antarctica",
        "window": "Dec 2025 – Apr 2026",
        "planned_delivery_days": 12,
        "contingency_buffer_days": 14,
        "cargo_manifest": [
            {"category": "Fuel", "item": "Polar Jet A-1 / Diesel Blend", "qty": "85,000 L"},
            {"category": "Spares", "item": "Generator AVR cards & injectors", "qty": "14 units"},
            {"category": "Provisions", "item": "Deep-freeze rations & dry pulses", "qty": "4.2 tonnes"}
        ]
    }
