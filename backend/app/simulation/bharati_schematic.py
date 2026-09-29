"""
ANTWIN - Bharati 2D Operational Schematic & Zone Register
Derived from official NCPOR Bharati Architecture Reference (Bölling & Lennox Modular Design):
Main Building modular structure (~30m x 50m, 2,100 m² across 4 levels) + Quilty Bay pump house + Jet A-1 fuel farm.
Reference Geometry / Not to Scale.
"""

from typing import Dict, Any, List

def get_bharati_schematic_zones(operational_state: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Returns documented Bharati zones with dynamic operational health status
    driven by current weather, 3xCHP loading, Quilty Bay water production, and Jet A-1 storage.
    """
    op = operational_state or {}
    power = op.get("power_state", {})
    thermal = op.get("thermal_state", {})
    fuel = op.get("fuel_state", {})
    water = op.get("water_state", {})
    chp_units = power.get("chp_units", [])

    chp01 = next((u for u in chp_units if u["id"] == "CHP-01"), {})
    chp02 = next((u for u in chp_units if u["id"] == "CHP-02"), {})
    chp03 = next((u for u in chp_units if u["id"] == "CHP-03"), {})

    # Zone 1: Level 1 — Vehicle Garage & Heavy Workshop
    z1_status = "NORMAL"
    garage_zone = {
        "id": "bha_level1_garage",
        "name": "Level 1: Vehicle Garage & Heavy Workshop",
        "short_code": "L1-GAR",
        "reference_label": "Ground Level Heavy Maintenance & Vehicle Bay",
        "coordinates": {"x": 240, "y": 300, "w": 320, "h": 75},
        "status": z1_status,
        "status_reason": "4 tracked polar carriers serviced; maintenance bays operational",
        "category": "MOBILITY_LOGISTICS",
        "subsystems": [
            {"name": "Hägglunds BV-206 Bay", "status": "Ready", "detail": "2 units heated & fueled"},
            {"name": "PistenBully 300 Polar Bay", "status": "Ready", "detail": "Hydraulics nominal"},
            {"name": "Heavy Machine Tool Bay", "status": "Active", "detail": "Lathe & welding operational"},
            {"name": "Overhead Gantry Crane (5T)", "status": "Inspected", "detail": "Annual inspection valid"}
        ],
        "active_metrics": {
            "Vehicle Readiness": "94%",
            "Floor Temperature": "14.5°C",
            "Exhaust Ventilation": "Nominal"
        },
        "notes": "Direct ground level ramp access for all-terrain snow transport and cargo skids."
    }

    # Zone 2: Level 2 — Utility Plant & CHP / Water RO Treatment
    # Depends on CHP status & RO status
    z2_status = "NORMAL"
    if chp02.get("status") in ["DEGRADED", "FAILED"] or chp01.get("status") in ["DEGRADED", "FAILED"]:
        z2_status = "WARNING" if chp02.get("status") == "DEGRADED" else "CRITICAL"
    if water.get("ro_plant_status") == "CRITICAL":
        z2_status = "CRITICAL"

    plant_zone = {
        "id": "bha_level2_plant",
        "name": "Level 2: Utility Plant (CHP & RO Treatment)",
        "short_code": "L2-PLANT",
        "reference_label": "Station Technical Plant & Desalination Facility",
        "coordinates": {"x": 240, "y": 215, "w": 320, "h": 75},
        "status": z2_status,
        "status_reason": f"CHP Load {power.get('average_chp_load_pct', 65):.0f}% | RO: {water.get('ro_plant_status', 'NORMAL')}",
        "category": "POWER_THERMAL_WATER",
        "subsystems": [
            {"name": "CHP-01 Unit (100 kVA)", "status": chp01.get("status", "RUNNING"), "detail": f"{chp01.get('electrical_load_kwe', 58)} kWe | {chp01.get('thermal_output_kwth', 44)} kWth"},
            {"name": "CHP-02 Unit (100 kVA)", "status": chp02.get("status", "RUNNING"), "detail": f"{chp02.get('electrical_load_kwe', 54)} kWe | {chp02.get('thermal_output_kwth', 41)} kWth"},
            {"name": "CHP-03 Unit (100 kVA)", "status": chp03.get("status", "STANDBY"), "detail": f"Standby Reserve ({chp03.get('health_pct', 95)}% health)"},
            {"name": "Reverse Osmosis Desalination Rack", "status": water.get("ro_plant_status", "NORMAL"), "detail": f"Production: {water.get('production_rate_l_per_day', 12000):,.0f} L/day"},
            {"name": "Remineralization & UV Plant", "status": "NORMAL", "detail": "Mineral balance compliant (WHO polar std)"},
            {"name": "MBR Wastewater Recycling", "status": "NORMAL", "detail": "Effluent treatment 65% recycling"}
        ],
        "active_metrics": {
            "Installed Generation": "300 kVA (240 kWe)",
            "Thermal Recovered": f"{thermal.get('recovered_chp_kwth', 85)} kWth",
            "Power Margin": f"{power.get('power_margin_kwe', 45)} kWe"
        },
        "notes": "Co-locates 3x100kVA CHP cogeneration units and seawater RO desalination on dedicated vibration-damped foundation."
    }

    # Zone 3: Level 3 — Living, Dining, Galley & Medical Ward
    z3_status = "NORMAL"
    living_zone = {
        "id": "bha_level3_living",
        "name": "Level 3: Habitation, Dining & Medical Ward",
        "short_code": "L3-HAB",
        "reference_label": "Crew Quarters & Life Support Core",
        "coordinates": {"x": 240, "y": 130, "w": 320, "h": 75},
        "status": z3_status,
        "status_reason": "47 single berths conditioned; galley & surgery operational",
        "category": "HABITATION_LIFE_SUPPORT",
        "capacity": {"winter": 47, "additional_summer": 25, "current_occupancy": 47},
        "subsystems": [
            {"name": "Crew Cabins (47 Single Rooms)", "status": "Occupied", "detail": "Target temp 20.0°C maintained"},
            {"name": "Central Galley & Cold Storage", "status": "Active", "detail": "Freezer rooms at -22°C nominal"},
            {"name": "Dining & Recreation Lounge", "status": "Conditioned", "detail": "Air exchange 100% compliant"},
            {"name": "Polar Medical & Surgical Clinic", "status": "Ready", "detail": "Telemedicine uplink active"}
        ],
        "active_metrics": {
            "Indoor Temperature": "20.1°C",
            "Indoor RH": "42%",
            "Active Personnel": "47 Winter Staff"
        },
        "notes": "Acoustically isolated modular accommodation blocks with triple-glazed panoramic observation portals."
    }

    # Zone 4: Level 4 — BMS, Operations, Radio & SATCOM Dome
    z4_status = "NORMAL"
    if op.get("mobility_state", {}).get("comms_status") == "OFFLINE":
        z4_status = "CRITICAL"

    ops_zone = {
        "id": "bha_level4_ops",
        "name": "Level 4: BMS, Operations & SATCOM Dome",
        "short_code": "L4-OPS",
        "reference_label": "Station Command & Telemetry Bridge",
        "coordinates": {"x": 240, "y": 45, "w": 320, "h": 75},
        "status": z4_status,
        "status_reason": "BMS digital monitoring online; satellite link nominal" if z4_status == "NORMAL" else "SATCOM Link Severed",
        "category": "MISSION_OPERATIONS",
        "subsystems": [
            {"name": "Integrated Building Management (BMS)", "status": "Online", "detail": "SCADA edge concentrator active"},
            {"name": "SATCOM C-Band & Ku-Band Radomes", "status": "Online" if z4_status == "NORMAL" else "OFFLINE", "detail": "Goa NCPOR high-speed link"},
            {"name": "VHF / HF Polar Aeronautical Radio", "status": "Guarded", "detail": "121.5 MHz & DROMLAN HF tuned"},
            {"name": "Atmospheric Science Console", "status": "Recording", "detail": "IIG/IMD meteorological rack"}
        ],
        "active_metrics": {
            "SATCOM Latency": "620 ms",
            "Telemetry Points": "412 Active Sensors",
            "DROMLAN Comms": "Guarded"
        },
        "notes": "Command bridge with 360-degree visibility over Prydz Bay and the Larsemann Hills ice margins."
    }

    # Zone 5: External — Quilty Bay Seawater Intake & Pump House
    z5_status = water.get("quilty_intake_status", "NORMAL")
    quilty_zone = {
        "id": "bha_quilty_pump",
        "name": "External: Quilty Bay Seawater Intake & Pump House",
        "short_code": "EXT-SEA",
        "reference_label": "Coastal Seawater Intake & Transport Pipeline",
        "coordinates": {"x": 620, "y": 215, "w": 180, "h": 90},
        "status": z5_status,
        "status_reason": "Intake depth ~12m clear; heat tracing nominal" if z5_status == "NORMAL" else "Intake pump fault / ice blockage",
        "category": "WATER_UTILITY",
        "subsystems": [
            {"name": "Submersible Intake Pumps (P1/P2)", "status": "Operational" if z5_status == "NORMAL" else "OFFLINE", "detail": "Depth 12m, Quilty Bay"},
            {"name": "Heated Transport Pipeline (300m)", "status": "Heated", "detail": "Electric heat tracing active"},
            {"name": "Coarse Strainer & Screen Skid", "status": "Clean", "detail": "Differential pressure nominal"},
            {"name": "Shoreline Pump House Enclosure", "status": "Conditioned", "detail": "Anti-freeze heater online"}
        ],
        "active_metrics": {
            "Pipeline Length": "300 meters",
            "Seawater Feed": f"{water.get('production_rate_l_per_day', 12000):,.0f} L/day",
            "Intake Depth": "12 meters"
        },
        "notes": "Dedicated coastal pump house delivering raw Antarctic seawater to the station RO desalination facility."
    }

    # Zone 6: External — Jet A-1 Automated Fuel Farm
    z6_status = "NORMAL"
    if fuel.get("fuel_endurance_days", 180) < 30.0:
        z6_status = "WARNING"
    fuel_zone = {
        "id": "bha_fuel_farm",
        "name": "External: Jet A-1 Automated Fuel Farm",
        "short_code": "EXT-FUEL",
        "reference_label": "Bulk Polar Aviation Fuel Depot (~300,000 L)",
        "coordinates": {"x": 30, "y": 215, "w": 180, "h": 90},
        "status": z6_status,
        "status_reason": f"Inventory: {fuel.get('current_level_l', 242000):,.0f} L | Endurance: {fuel.get('fuel_endurance_days', 150):.0f} days",
        "category": "FUEL_INFRASTRUCTURE",
        "subsystems": [
            {"name": "Bunded Double-Walled Storage Tanks", "status": "Nominal", "detail": "300,000 L capacity Jet A-1"},
            {"name": "Automated Fuel Transfer Station", "status": "Active", "detail": "Day-tank feed to CHP skid"},
            {"name": "Vapor Recovery & Leak Detection", "status": "Armed", "detail": "Interstitial sensors nominal"},
            {"name": "Helicopter Refueling Skid", "status": "Standby", "detail": "Gravity feed nozzle certified"}
        ],
        "active_metrics": {
            "Current Inventory": f"{fuel.get('current_level_l', 242000):,.0f} L",
            "Burn Rate": f"{fuel.get('hourly_burn_rate_l', 38.5):.1f} L/h",
            "Tank Farm Fill": f"{fuel.get('fuel_level_pct', 80.6):.1f}%"
        },
        "notes": "Documented 300,000 L automated fuel installation designed specifically for Jet A-1 polar fuel handling."
    }

    # Zone 7: External — Summer Camp & Emergency Container Modules
    z7_status = "NORMAL"
    summer_zone = {
        "id": "bha_summer_camp",
        "name": "External: Summer Camp & Container Modules",
        "short_code": "EXT-SUM",
        "reference_label": "Seasonal Expedition Camp & Emergency Pods",
        "coordinates": {"x": 240, "y": 395, "w": 320, "h": 65},
        "status": z7_status,
        "status_reason": "Summer pods winterized; emergency survival shelters ready",
        "category": "EXPEDITION_SUPPORT",
        "capacity": {"winter": 0, "summer": 25, "emergency_berths": 25},
        "subsystems": [
            {"name": "Modular Summer Cabins (25 Berths)", "status": "Winterized", "detail": "Drained & sealed for winter"},
            {"name": "Emergency Survival Container Pods", "status": "Ready", "detail": "Independent food & heating cache"},
            {"name": "Cold Storage Shipping Containers", "status": "Secure", "detail": "Field equipment & spares"},
            {"name": "Novo / Progress Link Transit Stage", "status": "Secured", "detail": "Cargo staging area"}
        ],
        "active_metrics": {
            "Summer Capacity": "25 Personnel",
            "Winter Status": "Winterized / Standby",
            "Emergency Cache": "100% Provisioned"
        },
        "notes": "Secondary living infrastructure deployed during high summer expedition surge periods (total combined capacity 72)."
    }

    return [
        living_zone,
        plant_zone,
        garage_zone,
        ops_zone,
        quilty_zone,
        fuel_zone,
        summer_zone
    ]
