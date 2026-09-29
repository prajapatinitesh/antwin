from typing import Dict, Any, List
from app.core.provenance import make_provenance, DataClass, TemporalStatus
from app.services.autonomy import calculate_mission_autonomy

def get_station_summary(station_id: str) -> Dict[str, Any]:
    st_id = station_id.upper()
    if st_id == "MAITRI":
        prov = make_provenance(
            data_class=DataClass.REFERENCE,
            source="NCPOR Planning Advisory & Historical Engineering Documentation",
            source_year=2022,
            station="Maitri",
            temporal_status=TemporalStatus.CURRENT,
            notes="Location: Schirmacher Oasis; Elevation 117m; Nominal Winter 25 / Summer 65."
        )
        return {
            "id": "MAITRI",
            "code": "MAI",
            "name": "Maitri Station",
            "tagline": "Science for a sustainable future",
            "latitude": -70.7668,
            "longitude": 11.7308,
            "elevation": 117.0,
            "location_desc": "Schirmacher Oasis, Dronning Maud Land",
            "winter_capacity": 25,
            "summer_capacity": 65,
            "status": "OPERATIONAL",
            "data_class": "REFERENCE",
            "image_url": "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80",
            "temperature_c": -24.8,
            "wind_speed_kmh": 12.6,
            "pressure_hpa": 973.2,
            "humidity_pct": 78.0,
            "mission_autonomy_days": 8.4,
            "autonomy_status": "Within Safe Range",
            "active_alerts_count": 2,
            "fuel_level_l": 214500.0,
            "fuel_capacity_l": 300000.0,
            "fuel_percentage": 72.0,
            "power_load_kw": 482.0,
            "power_capacity_kw": 730.0,
            "power_percentage": 66.0,
            "provenance": prov
        }
    else:  # BHARATI
        prov = make_provenance(
            data_class=DataClass.REFERENCE,
            source="NCPOR Bharati Engineering Specification Tender TD-22062017",
            source_year=2017,
            station="Bharati",
            temporal_status=TemporalStatus.CURRENT,
            notes="Location: Larsemann Hills; 3x100 kVA CHP; Jet-A1 fuel farm approx 296 kL; Seawater RO intake."
        )
        return {
            "id": "BHARATI",
            "code": "BHA",
            "name": "Bharati Station",
            "tagline": "Next-generation green polar architecture",
            "latitude": -69.4068,
            "longitude": 76.19525,
            "elevation": 35.0,  # Reconciled reference doc
            "location_desc": "Larsemann Hills, Ingrid Christensen Coast",
            "winter_capacity": 47,
            "summer_capacity": 72,
            "status": "OPERATIONAL",
            "data_class": "REFERENCE",
            "image_url": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1000&q=80",
            "temperature_c": -21.3,
            "wind_speed_kmh": 8.7,
            "pressure_hpa": 982.4,
            "humidity_pct": 68.0,
            "mission_autonomy_days": 9.2,
            "autonomy_status": "Within Safe Range",
            "active_alerts_count": 1,
            "fuel_level_l": 242000.0,
            "fuel_capacity_l": 296000.0,
            "fuel_percentage": 81.8,
            "power_load_kw": 185.0,
            "power_capacity_kw": 300.0,
            "power_percentage": 61.7,
            "provenance": prov
        }

def get_station_twin_state(station_id: str) -> Dict[str, Any]:
    st_id = station_id.upper()
    summary = get_station_summary(st_id)
    autonomy = calculate_mission_autonomy(
        energy_days=9.1,
        fuel_days=11.4 if st_id == "MAITRI" else 13.8,
        water_days=15.6,
        provisions_days=17.8,
        spare_days=8.7,
        asset_margin_days=6.6,
        logistics_days=9.0,
        station_id=st_id
    )

    # 5 Key Systems
    key_systems = [
        {"name": "Power System", "status": "Normal", "type": "power", "detail": "482 kW (66%)" if st_id == "MAITRI" else "185 kW (62%)"},
        {"name": "Heating System", "status": "Normal", "type": "heating", "detail": "Boilers 68°C" if st_id == "MAITRI" else "CHP Hydronic 72°C"},
        {"name": "Water System", "status": "Normal", "type": "water", "detail": "RO & Storage Normal"},
        {"name": "Wastewater System", "status": "Normal", "type": "wastewater", "detail": "Aerobic Bio-filter 100%"},
        {"name": "Fuel System", "status": "Normal", "type": "fuel", "detail": "Pumps & Tank Pressures Nominal"}
    ]

    # Power Generation vs Load Trend (24h hourly)
    power_trend = [
        {"time": "00:00", "generation_kw": 580, "load_kw": 380},
        {"time": "04:00", "generation_kw": 600, "load_kw": 400},
        {"time": "08:00", "generation_kw": 640, "load_kw": 510},
        {"time": "12:00", "generation_kw": 610, "load_kw": 470},
        {"time": "16:00", "generation_kw": 650, "load_kw": 530},
        {"time": "20:00", "generation_kw": 590, "load_kw": 482},
    ]

    # Fuel Trend (7 days)
    fuel_trend = [
        {"date": "18 Apr", "level_k_l": 228, "consumption_l": 2750},
        {"date": "19 Apr", "level_k_l": 225, "consumption_l": 2820},
        {"date": "20 Apr", "level_k_l": 222, "consumption_l": 2790},
        {"date": "21 Apr", "level_k_l": 219, "consumption_l": 2850},
        {"date": "22 Apr", "level_k_l": 217, "consumption_l": 2810},
        {"date": "23 Apr", "level_k_l": 215, "consumption_l": 2840},
        {"date": "24 Apr", "level_k_l": 214.5, "consumption_l": 2800},
    ]

    # Asset Health Table
    assets_health = [
        {"name": "Generators", "health_pct": 78, "status": "Operational", "criticality": "Critical"},
        {"name": "HVAC", "health_pct": 84, "status": "Operational", "criticality": "High"},
        {"name": "Pumps", "health_pct": 91, "status": "Operational", "criticality": "Medium"},
        {"name": "Vehicles", "health_pct": 76, "status": "Standby", "criticality": "Medium"},
        {"name": "Infrastructure", "health_pct": 88, "status": "Operational", "criticality": "Low"},
    ]

    # Recent Activity Timeline
    activity_timeline = [
        {"time": "14:28", "event": "Environmental data updated", "source": "NCPOR public API", "type": "info"},
        {"time": "13:47", "event": "Generator 2 load adjusted", "source": "Auto-optimization", "type": "action"},
        {"time": "12:32", "event": "Inventory level synced", "source": "Simulated", "type": "sync"},
        {"time": "10:15", "event": "Maintenance check completed", "source": "Generator 1 (Normal)", "type": "maintenance"},
    ]

    # Recent Alerts
    alerts = [
        {
            "id": 1,
            "station_id": st_id,
            "severity": "CRITICAL",
            "category": "POWER",
            "message": "Generator 2 – Vibration High",
            "threshold_info": "2.4 mm/s (threshold 2.0)",
            "source": "SIMULATED Telemetry",
            "created_at": "2025-04-24T12:32:00Z",
            "time_ago": "2h ago",
            "acknowledged": False,
            "data_class": "SIMULATED"
        },
        {
            "id": 2,
            "station_id": st_id,
            "severity": "WARNING",
            "category": "FUEL",
            "message": "Fuel Level Low",
            "threshold_info": "Tank 2 – 18%",
            "source": "SIMULATED Level Gauge",
            "created_at": "2025-04-24T10:32:00Z",
            "time_ago": "4h ago",
            "acknowledged": False,
            "data_class": "SIMULATED"
        },
        {
            "id": 3,
            "station_id": st_id,
            "severity": "INFO",
            "category": "WEATHER",
            "message": "Weather Severity Increased",
            "threshold_info": "High wind (32 km/h)",
            "source": "LIVE NCPOR AWS",
            "created_at": "2025-04-24T08:32:00Z",
            "time_ago": "6h ago",
            "acknowledged": True,
            "data_class": "LIVE"
        }
    ]

    # 2D Station Layout Nodes (matching maitri-digital-twin.png layout map)
    layout_nodes = [
        {"id": "node_power", "label": "Power House", "layer": "Power", "x": 30, "y": 28, "status": "Normal"},
        {"id": "node_living", "label": "Living Modules", "layer": "Buildings", "x": 58, "y": 35, "status": "Normal"},
        {"id": "node_labs", "label": "Laboratories", "layer": "Buildings", "x": 75, "y": 60, "status": "Normal"},
        {"id": "node_workshop", "label": "Vehicles & Workshop", "layer": "Vehicles", "x": 52, "y": 80, "status": "Normal"},
        {"id": "node_fuel", "label": "Fuel Farm", "layer": "Fuel", "x": 22, "y": 74, "status": "Normal"},
        {"id": "node_water", "label": "Priyadarshini Lake Intake" if st_id == "MAITRI" else "Quilty Bay Seawater Intake", "layer": "Water", "x": 42, "y": 55, "status": "Normal"}
    ]

    return {
        "summary": summary,
        "key_systems": key_systems,
        "power_state": {
            "total_load_kw": 482.0 if st_id == "MAITRI" else 185.0,
            "load_pct": 66.0 if st_id == "MAITRI" else 61.7,
            "generator_load_pct": 66.0,
            "battery_soc_pct": 72.0,
            "available_generation_kw": 730.0 if st_id == "MAITRI" else 300.0,
            "reserve_margin_kw": 248.0 if st_id == "MAITRI" else 115.0,
            "reserve_margin_pct": 34.0,
            "data_class": "SIMULATED",
            "generation_vs_load_trend": power_trend
        },
        "fuel_state": {
            "total_capacity_l": 300000.0 if st_id == "MAITRI" else 296000.0,
            "current_level_l": 214500.0 if st_id == "MAITRI" else 242000.0,
            "fuel_pct": 72.0 if st_id == "MAITRI" else 81.8,
            "daily_consumption_l": 2800.0 if st_id == "MAITRI" else 2100.0,
            "fuel_endurance_days": 11.4 if st_id == "MAITRI" else 13.8,
            "fuel_type": "Polar Diesel" if st_id == "MAITRI" else "JET A-1",
            "data_class": "SIMULATED",
            "recent_trend": fuel_trend
        },
        "autonomy": autonomy,
        "assets_health": assets_health,
        "activity_timeline": activity_timeline,
        "alerts": alerts,
        "layout_nodes": layout_nodes
    }
