"""
ANTWIN - Maitri 2D Operational Schematic & Zone Register
Derived from documented Antarctic Treaty Inspection Report 2001 (Survey of India Special Map Series)
and NCPOR Maitri Station Advisory 2025.
Provides the operational structural geometry and real-time subsystem state for every major station installation.
"""

from typing import Dict, Any, List

def get_maitri_schematic_zones(operational_state: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Returns documented Maitri zones with dynamic operational health status
    driven by current weather, generator loading, and fuel levels.
    """
    op = operational_state or {}
    temp = op.get("outdoor_temp_c", -18.5)
    wind_kmh = op.get("wind_speed_kmh", 25.0)
    gen_load_pct = op.get("generator_load_pct", 52.0)
    fuel_endurance = op.get("fuel_endurance_days", 14.2)

    # 1. Main Building (U-Shaped Complex)
    main_status = "NORMAL"
    if temp < -32.0:
        main_status = "WARNING"
    main_building = {
        "id": "main_building",
        "name": "Maitri Main Building",
        "reference_label": "U-Shaped Complex (Survey of India Ref)",
        "coordinates_grid": {"x": 380, "y": 210, "w": 240, "h": 140},
        "status": main_status,
        "status_reason": "Heating demand elevated" if main_status == "WARNING" else "Comfort envelope maintained (18°C setpoint)",
        "category": "HABITATION_LIFE_SUPPORT",
        "capacity": {"winter": 25, "summer": 65, "current_occupancy": 25},
        "subsystems": [
            {"name": "Central Hydronic Heating", "status": "Active", "load": f"{op.get('heating_demand_kw', 117)} kWth"},
            {"name": "Communications Center", "status": "Online", "mode": "Inmarsat / SATCOM"},
            {"name": "Medical Unit & Surgery", "status": "Ready", "envelope": "Nominal"},
            {"name": "Scientific Laboratories", "status": "Operational", "power_draw": "12.0 kWe"},
            {"name": "Living & Dining Modules", "status": "Conditioned", "temp": "18.2°C"}
        ],
        "historical_reference": "Constructed 1989; steel structure on pillars with insulated panels, central corridor joining living wings."
    }

    # 2. Generator Complex (West of Main Building)
    gen_status = "NORMAL"
    if gen_load_pct > 75.0:
        gen_status = "WARNING"
    if op.get("reserve_margin_pct", 30.0) < 15.0:
        gen_status = "CRITICAL"
    generator_complex = {
        "id": "generator_complex",
        "name": "Generator Complex",
        "reference_label": "Power & Thermal Plant (West Wing)",
        "coordinates_grid": {"x": 160, "y": 230, "w": 140, "h": 110},
        "status": gen_status,
        "status_reason": f"Active Load {gen_load_pct}% | Reserve {op.get('reserve_margin_pct', 35)}%",
        "category": "POWER_GENERATION",
        "installed_capacity": "2 × 125 kVA Prime Sets (Historical ref: 62.5 kVA sets)",
        "subsystems": [
            {"name": "Generator Set 01", "status": "Running", "output": f"{round(op.get('power_load_kw', 75) * 0.55, 1)} kWe", "vibration": "1.4 mm/s"},
            {"name": "Generator Set 02", "status": "Running" if gen_status != "CRITICAL" else "Degraded", "output": f"{round(op.get('power_load_kw', 75) * 0.45, 1)} kWe", "vibration": "2.4 mm/s"},
            {"name": "Thermal Heat Exchanger", "status": "Active", "recovery": "48 kWth"},
            {"name": "Main Distribution Switchboard", "status": "Synchronized", "bus_freq": "50.0 Hz"}
        ],
        "historical_reference": "Documented in 2001 ATS Inspection as detached generator housing with acoustic dampening and heat extraction."
    }

    # 3. Fuel Farm & Fuel Station (Next to Generator Complex)
    fuel_status = "NORMAL"
    if fuel_endurance < 10.0:
        fuel_status = "WARNING"
    fuel_farm = {
        "id": "fuel_farm",
        "name": "Fuel Farm & Pump Station",
        "reference_label": "Bulk Storage Depot (Southwest)",
        "coordinates_grid": {"x": 160, "y": 380, "w": 160, "h": 100},
        "status": fuel_status,
        "status_reason": f"Inventory: 214,500 L | Daily Burn: {op.get('daily_fuel_l', 780):,.0f} L/day",
        "category": "FUEL_INFRASTRUCTURE",
        "capacity_total_l": 300000.0,
        "current_level_l": 214500.0,
        "subsystems": [
            {"name": "Bulk Polar Diesel Tanks (T1-T4)", "status": "Nominal", "fill_level": "71.5%"},
            {"name": "Day Tanks (DG Supply)", "status": "Auto-Refilling", "buffer_hrs": "18 h"},
            {"name": "Fuel Transfer Pipeline & Manifold", "status": "Pressurized", "flow": "Intermittent"},
            {"name": "Secondary Containment Bund", "status": "Dry / Compliant", "integrity": "100%"}
        ],
        "historical_reference": "Documented as steel tank farm on cribbing foundations with transfer manifold to day tanks."
    }

    # 4. Lake Water Pump House (Lake Priyadarshini)
    water_status = "NORMAL"
    if temp < -25.0:
        water_status = "WARNING"
    water_pump_house = {
        "id": "water_pump_house",
        "name": "Lake Water Pump House",
        "reference_label": "Lake Priyadarshini Intake (South)",
        "coordinates_grid": {"x": 410, "y": 420, "w": 160, "h": 90},
        "status": water_status,
        "status_reason": "Freeze-protection heat tracing running" if water_status == "WARNING" else "Intake flowing freely",
        "category": "WATER_UTILITY",
        "subsystems": [
            {"name": "Submerged Intake Head", "status": "Sub-ice Unfrozen", "depth": "2.8 m"},
            {"name": "Submersible Heavy Pumps", "status": "Duty Cycle", "flow_rate": "120 L/min"},
            {"name": "Insulated Heat-Traced Pipeline", "status": "Active Heating", "pipe_temp": "+4.2°C"},
            {"name": "Sediment Filtration & RO", "status": "Clean", "differential_p": "0.4 bar"}
        ],
        "historical_reference": "Source: Lake Priyadarshini water body; heated intake pipeline connecting pump house to main station."
    }

    # 5. Summer Camp Complex (Northeast Sector)
    summer_status = "NORMAL"
    summer_camp = {
        "id": "summer_camp",
        "name": "Summer Camp Complex",
        "reference_label": "Living & Support Modules (Northeast)",
        "coordinates_grid": {"x": 480, "y": 60, "w": 200, "h": 95},
        "status": summer_status,
        "status_reason": "Winter standby; modules pre-heated on low-cycle envelope",
        "category": "EXPEDITION_SUPPORT",
        "subsystems": [
            {"name": "Containerized Living Quarters", "status": "Low-Power Standby", "capacity": "40 berths"},
            {"name": "Visiting Scientist Laboratories", "status": "Secure", "instruments": "GPS / Seismo"},
            {"name": "Emergency Food & Fuel Depot", "status": "Sealed & Inspected", "reserve": "30 days"},
            {"name": "Secondary Generator Shelter", "status": "Cold Standby", "rating": "30 kVA"}
        ],
        "historical_reference": "Dedicated summer expansion camp located in northeast sector to accommodate seasonal expedition personnel."
    }

    # 6. Garage / Workshop (Western Sector)
    garage_status = "NORMAL"
    if wind_kmh > 45.0:
        garage_status = "WARNING"
    garage_workshop = {
        "id": "garage_workshop",
        "name": "Garage & Technical Workshop",
        "reference_label": "Polar Fleet Maintenance (West)",
        "coordinates_grid": {"x": 40, "y": 120, "w": 170, "h": 100},
        "status": garage_status,
        "status_reason": "Outdoor vehicle runs suspended due to wind" if garage_status == "WARNING" else "Vehicles pre-heated & available",
        "category": "POLAR_MOBILITY",
        "fleet_inventory": {
            "Pisten Bully Snow Tractors": 12,
            "Snow Scooters": 6,
            "Toyota Arctic 4x4 Truck": 1,
            "Tata Xenon XT 4x4": 2,
            "Heavy Bulldozer": 1,
            "Mantis Polar Cranes": 6,
            "Excavator": 1,
            "Heavy Cargo Sledges & Trailers": 37
        },
        "subsystems": [
            {"name": "Heated Maintenance Bay", "status": "Active", "temp": "+12°C"},
            {"name": "Engine Block Warming Outlets", "status": "Powered", "draw": "6.4 kWe"},
            {"name": "Hydraulic Spare Inventory", "status": "Stocked", "coverage": "100%"},
            {"name": "Tire/Track Repair Bay", "status": "Ready", "tools": "Pneumatic"}
        ],
        "historical_reference": "NCPOR 2025 Advisory documents active polar fleet of 12 Pisten Bullies, 6 Snow Scooters, Cranes and Tractors."
    }

    # 7. Logistics & Container Storage Line (Between Complex and Hills)
    storage_line = {
        "id": "container_storage",
        "name": "Storage Containers & Cargo Staging",
        "reference_label": "Inter-Complex Staging Corridor",
        "coordinates_grid": {"x": 240, "y": 140, "w": 110, "h": 70},
        "status": "NORMAL",
        "status_reason": "Stores secure; inventory audited",
        "category": "LOGISTICS_STORAGE",
        "subsystems": [
            {"name": "Deep-Freeze Ration Store", "status": "Nominal", "temp": "-18°C"},
            {"name": "Dry Provision Containers", "status": "Sealed", "humidity": "25%"},
            {"name": "Critical Spare Parts Depot", "status": "Audited", "spares": "Generators & Pumps"},
            {"name": "Solid Waste Packaging Shelter", "status": "Holding", "treaty_compliant": "Yes"}
        ],
        "historical_reference": "Container modules positioned along perimeter road for sheltered staging and resupply receipt."
    }

    return [
        summer_camp,
        main_building,
        generator_complex,
        fuel_farm,
        water_pump_house,
        garage_workshop,
        storage_line
    ]
