from typing import Dict, Any, List, Optional

# Station-specific definitions of nodes and connections aligned with docs/Content/dependency_graph.json
# and imporvement.md requirements

MAITRI_NODES = [
    {
        "id": "environment",
        "label": "Environment",
        "category": "ENVIRONMENT",
        "domain": "Environment",
        "impact_type": "Operational",
        "status": "Watch",
        "provenance": "REPLAY",
        "value_display": "-24.8°C | 12.6 km/h",
        "primary_metric": {"label": "Ambient Temp", "value": "-24.8", "unit": "°C"},
        "secondary_metric": {"label": "Wind Speed", "value": "12.6 km/h"},
        "details": {
            "metrics": ["Temperature: -24.8°C", "Wind Speed: 12.6 km/h", "Pressure: 973.2 hPa", "Catabatic Risk: High"],
            "description": "Schirmacher Oasis weather severity drives primary thermal load and restricts overland transit."
        },
        "why_it_matters": "Extreme sub-zero temperatures force boilers and generators into peak load, burning fuel faster and reducing mission autonomy."
    },
    {
        "id": "heating",
        "label": "Heating System",
        "category": "ENERGY",
        "domain": "Energy",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "2 × 150 kW Boilers",
        "primary_metric": {"label": "Thermal Output", "value": "108", "unit": "kWth"},
        "secondary_metric": {"label": "Loop Temp", "value": "68°C"},
        "details": {
            "metrics": ["Thermal Output: 108 kWth", "Network Temp: 68°C", "Efficiency: 92%", "Fuel Burn: 24 L/h"],
            "description": "Hydronic space heating and pipeline heat tracing protecting station water loops from freezing."
        },
        "why_it_matters": "Heating failure rapidly freezes habitat and water piping; higher heating demand directly consumes more electricity and fuel."
    },
    {
        "id": "power",
        "label": "Power System",
        "category": "ENERGY",
        "domain": "Energy",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "482 kW (66% Load)",
        "primary_metric": {"label": "Active Load", "value": "482", "unit": "kW"},
        "secondary_metric": {"label": "Fleet Rating", "value": "2 × 125 kVA"},
        "details": {
            "metrics": ["Online: DG-01, DG-02", "Total Capacity: 250 kVA", "Active Demand: 482 kW equivalent", "Power Margin: 61 kW"],
            "description": "DG Alternator sets providing primary bus electricity across Maitri main station and outstations."
        },
        "why_it_matters": "Loss of generation capacity reduces operating margins and forces immediate load shedding of non-vital research and life support."
    },
    {
        "id": "fuel",
        "label": "Fuel System",
        "category": "FUEL",
        "domain": "Infrastructure",
        "impact_type": "Resource",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "214,500 L (72%)",
        "primary_metric": {"label": "Storage Level", "value": "214.5", "unit": "kL"},
        "secondary_metric": {"label": "Burn Rate", "value": "116 L/h"},
        "details": {
            "metrics": ["Total Storage: 300,000 L", "Current Level: 214,500 L", "Daily Burn: 2,784 L/d", "Endurance: 11.2 d"],
            "description": "Bulk Polar Diesel fuel storage tanks, day-tanks, and distribution manifold feeding power and boilers."
        },
        "why_it_matters": "Fuel availability directly caps generator endurance and represents the hard limit of station survival in winter."
    },
    {
        "id": "water",
        "label": "Water Utility",
        "category": "WATER",
        "domain": "Life Support",
        "impact_type": "Resource",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "Priyadarshini Lake Active",
        "primary_metric": {"label": "Lake Pump", "value": "2,400", "unit": "L/d"},
        "secondary_metric": {"label": "Storage", "value": "18,500 L"},
        "details": {
            "metrics": ["Intake: Heated Lake Line", "Storage: 18,500 L", "Daily Consumption: 2,100 L/d", "Trace Heating: Active"],
            "description": "Potable water supply pumped from Priyadarshini Lake with electric trace heating to prevent pipe freeze."
        },
        "why_it_matters": "Lake intake pipelines require continuous trace heat; pipe freeze creates instant water starvation for expeditioners."
    },
    {
        "id": "habitat",
        "label": "Habitat & Buildings",
        "category": "LIFE SUPPORT",
        "domain": "Life Support",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "25 / 65 Occupancy",
        "primary_metric": {"label": "Crew", "value": "25", "unit": "pax"},
        "secondary_metric": {"label": "Indoor Temp", "value": "+19.2°C"},
        "details": {
            "metrics": ["Living Blocks: 25 Winter Crew", "Laboratories: Heated", "Indoor Temp: 19.2°C", "Ventilation: Nominal"],
            "description": "Enclosed living quarters, laboratories, and operational workshops requiring continuous thermal and power support."
        },
        "why_it_matters": "Habitat temperature and life-safety systems depend on non-interrupted power and boiler heat."
    },
    {
        "id": "assets",
        "label": "Assets & Fleet",
        "category": "ASSETS",
        "domain": "Infrastructure",
        "impact_type": "Maintenance",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "Fleet Readiness 84%",
        "primary_metric": {"label": "Critical Assets", "value": "84", "unit": "%"},
        "secondary_metric": {"label": "Snowcat Readiness", "value": "2 / 2"},
        "details": {
            "metrics": ["Generators: 78%", "Boilers: 92%", "PistenBully Fleet: 2 ready", "Critical Spares: 8.7 d buffer"],
            "description": "Station mechanical equipment, power alternators, mobile snow vehicles, and scheduled maintenance inventory."
        },
        "why_it_matters": "Degraded equipment readiness accelerates cascade failure probability and reduces maintenance response speed."
    },
    {
        "id": "logistics",
        "label": "Logistics & Resupply",
        "category": "LOGISTICS",
        "domain": "Logistics",
        "impact_type": "Logistics",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "Novo Route Clear",
        "primary_metric": {"label": "Corridor Status", "value": "Open", "unit": ""},
        "secondary_metric": {"label": "Next Resupply", "value": "12 d ETA"},
        "details": {
            "metrics": ["Corridor: Novo Air-link / Overland Convoy", "Next Cargo: 12 d ETA", "Fuel Staging: Nominal", "Weather Window: Fair"],
            "description": "Intercontinental air resupply corridor via Novo runway and overland traverse routes to Maitri."
        },
        "why_it_matters": "Weather blizzards shut down transport corridors, delaying spare parts and fuel delivery."
    },
    {
        "id": "personnel",
        "label": "Personnel",
        "category": "PERSONNEL",
        "domain": "Life Support",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "25 Winter Crew",
        "primary_metric": {"label": "On Station", "value": "25", "unit": "pax"},
        "secondary_metric": {"label": "Health Index", "value": "100%"},
        "details": {
            "metrics": ["Scientists: 11", "Support & Engineers: 14", "Medical Facility: Ready", "Life Support Load: 100%"],
            "description": "Winter-over team operating scientific experiments, facility infrastructure, and station communications."
        },
        "why_it_matters": "Personnel density directly establishes baseline heating, power, and potable water demand profiles."
    },
    {
        "id": "autonomy",
        "label": "Mission Autonomy",
        "category": "MISSION",
        "domain": "Mission",
        "impact_type": "Autonomy",
        "status": "Operational",
        "provenance": "DERIVED",
        "value_display": "8.4 Days",
        "primary_metric": {"label": "Autonomy", "value": "8.4", "unit": "days"},
        "secondary_metric": {"label": "Limiting Factor", "value": "Fuel"},
        "details": {
            "metrics": ["Fuel Endurance: 11.2 d", "Critical Spares: 8.7 d", "Water Endurance: 8.8 d", "Limiting Constraint: Fuel (Cold Penalty)"],
            "description": "Unified operational endurance calculated by multi-constraint minimization across station resources."
        },
        "why_it_matters": "Downstream terminal metric indicating how many days the station can operate safely without resupply."
    }
]

MAITRI_EDGES = [
    # Path 1: Weather -> Heating -> Power -> Fuel -> Autonomy
    {"source": "environment", "target": "heating", "relationship": "thermal_demand", "propagation_type": "Direct Dependency", "weight": 1.4, "label": "Ambient Cold Surge"},
    {"source": "heating", "target": "power", "relationship": "electrical_load", "propagation_type": "Direct Dependency", "weight": 1.3, "label": "Circulation Pumps Load"},
    {"source": "power", "target": "fuel", "relationship": "fuel_consumption", "propagation_type": "Critical Path", "weight": 1.5, "label": "Generator Fuel Burn"},
    {"source": "fuel", "target": "autonomy", "relationship": "fuel_endurance", "propagation_type": "Critical Path", "weight": 1.7, "label": "Fuel Depletion Limit"},
    # Path 2: Weather -> Logistics -> Resupply -> Autonomy
    {"source": "environment", "target": "logistics", "relationship": "blizzard_blockage", "propagation_type": "Indirect Dependency", "weight": 1.0, "label": "Runway / Track Access"},
    {"source": "logistics", "target": "assets", "relationship": "replenishes_spares", "propagation_type": "Direct Dependency", "weight": 1.2, "label": "Spare Delivery"},
    {"source": "logistics", "target": "fuel", "relationship": "fuel_resupply", "propagation_type": "Direct Dependency", "weight": 1.2, "label": "Tanker Replenishment"},
    {"source": "logistics", "target": "autonomy", "relationship": "resupply_buffer", "propagation_type": "Critical Path", "weight": 1.4, "label": "Logistics Buffer"},
    # Path 3: Asset Failure -> Capacity -> Power Margin -> Autonomy
    {"source": "assets", "target": "power", "relationship": "generator_reliability", "propagation_type": "Critical Path", "weight": 1.6, "label": "Fleet Availability"},
    {"source": "assets", "target": "autonomy", "relationship": "critical_spares_margin", "propagation_type": "Critical Path", "weight": 1.8, "label": "Spares Constraint"},
    # Path 4: Personnel -> Habitation -> Heating/Power/Water -> Autonomy
    {"source": "personnel", "target": "habitat", "relationship": "occupancy_load", "propagation_type": "Normal Flow", "weight": 1.0, "label": "Habitation Load"},
    {"source": "habitat", "target": "heating", "relationship": "comfort_setpoint", "propagation_type": "Normal Flow", "weight": 1.1, "label": "Interior Thermostat"},
    {"source": "habitat", "target": "power", "relationship": "appliances_lighting", "propagation_type": "Normal Flow", "weight": 1.1, "label": "Living Quarters Demand"},
    {"source": "power", "target": "water", "relationship": "trace_heating_power", "propagation_type": "Direct Dependency", "weight": 1.2, "label": "Pipeline Trace Heat"},
    {"source": "water", "target": "autonomy", "relationship": "potable_reserve", "propagation_type": "Normal Flow", "weight": 1.1, "label": "Potable Water Buffer"}
]

# Bharati Station-specific nodes and edges
BHARATI_NODES = [
    {
        "id": "environment",
        "label": "Environment",
        "category": "ENVIRONMENT",
        "domain": "Environment",
        "impact_type": "Operational",
        "status": "Watch",
        "provenance": "REPLAY",
        "value_display": "-28.4°C | 22.4 km/h",
        "primary_metric": {"label": "Ambient Temp", "value": "-28.4", "unit": "°C"},
        "secondary_metric": {"label": "Wind Speed", "value": "22.4 km/h"},
        "details": {
            "metrics": ["Temperature: -28.4°C", "Wind Speed: 22.4 km/h", "Barometer: 978.4 hPa", "Quilty Bay Ice: Pack Ice"],
            "description": "Larsemann Hills coastal Antarctic climate with catabatic gale winds and sub-ice freezing in Quilty Bay."
        },
        "why_it_matters": "Quilty Bay freezing threatens seawater intake lines, while extreme sub-zero winds spike station heating demands."
    },
    {
        "id": "seawater_intake",
        "label": "Seawater Intake",
        "category": "WATER",
        "domain": "Life Support",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "Quilty Bay Active",
        "primary_metric": {"label": "Intake Flow", "value": "140", "unit": "L/min"},
        "secondary_metric": {"label": "Water Temp", "value": "-1.8°C"},
        "details": {
            "metrics": ["Location: Quilty Bay Sub-ice", "Flow Rate: 140 L/min", "Water Temp: -1.8°C", "Heated Trace: Active"],
            "description": "Sub-ice seawater suction manifold supplying raw saline feed water to Bharati's water treatment plant."
        },
        "why_it_matters": "Ice blockage or intake freezing cuts raw feed water, stopping desalination and draining station water storage."
    },
    {
        "id": "water_pump",
        "label": "Water Pump Station",
        "category": "WATER",
        "domain": "Life Support",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "Dual Pump System",
        "primary_metric": {"label": "Delivery Pressure", "value": "4.2", "unit": "bar"},
        "secondary_metric": {"label": "Pump Speed", "value": "1,450 RPM"},
        "details": {
            "metrics": ["Primary Pump: Operational", "Secondary Pump: Standby", "Feed Pressure: 4.2 bar", "Power Draw: 12 kW"],
            "description": "High-pressure seawater transfer pumps conveying saline water through heated double-wall pipeline to the RO plant."
        },
        "why_it_matters": "Pump degradation directly reduces reverse osmosis membrane feed pressure, cutting freshwater output."
    },
    {
        "id": "ro_plant",
        "label": "RO Desalination Plant",
        "category": "WATER",
        "domain": "Life Support",
        "impact_type": "Resource",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "3,000 L/d Nominal",
        "primary_metric": {"label": "Freshwater Out", "value": "2,850", "unit": "L/d"},
        "secondary_metric": {"label": "Recovery Rate", "value": "35%"},
        "details": {
            "metrics": ["Capacity: 3,000 L/d", "Active Output: 2,850 L/d", "Conductivity: <30 µS/cm", "Thermal Preheat: Active"],
            "description": "Reverse Osmosis desalination trains with pre-heating and remineralization providing all potable water for Bharati."
        },
        "why_it_matters": "Bharati has no meltwater lake nearby; RO is the single lifeline for drinking, cooking, hygiene, and medical safety."
    },
    {
        "id": "freshwater_storage",
        "label": "Freshwater Storage",
        "category": "WATER",
        "domain": "Life Support",
        "impact_type": "Resource",
        "status": "Operational",
        "provenance": "SIMULATED",
        "value_display": "22,000 L (88%)",
        "primary_metric": {"label": "Potable Reserve", "value": "22.0", "unit": "kL"},
        "secondary_metric": {"label": "Daily Draw", "value": "2,400 L/d"},
        "details": {
            "metrics": ["Installed Tanks: 25,000 L", "Current Level: 22,000 L", "Consumption: 2,400 L/d", "Reserve Autonomy: 9.1 d"],
            "description": "Insulated potable water holding buffer feeding station pressurized sanitary and laboratory rings."
        },
        "why_it_matters": "When RO output drops below station consumption, storage depletes rapidly, triggering emergency rationing."
    },
    {
        "id": "chp_fleet",
        "label": "CHP Power Plant",
        "category": "ENERGY",
        "domain": "Energy",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "3 × 100 kVA Fleet",
        "primary_metric": {"label": "Electrical Out", "value": "194", "unit": "kW"},
        "secondary_metric": {"label": "Running Units", "value": "2 / 3 Online"},
        "details": {
            "metrics": ["CHP Units: 3 × 100 kVA (300 kVA Installed)", "Online: CHP-01, CHP-02", "Standby: CHP-03", "Bus Load: 65%"],
            "description": "Combined Heat & Power units co-generating electrical power and recovering exhaust/jacket heat for station heating."
        },
        "why_it_matters": "CHP trip cuts both electricity and thermal recovery, spiking load on remaining units and auxiliary heating."
    },
    {
        "id": "heating",
        "label": "Thermal & HVAC Loop",
        "category": "ENERGY",
        "domain": "Energy",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "155 kWth Max Demand",
        "primary_metric": {"label": "Thermal Supply", "value": "118", "unit": "kWth"},
        "secondary_metric": {"label": "Heat Recovery", "value": "86 kWth"},
        "details": {
            "metrics": ["Max Thermal Demand: 155 kWth", "Current Load: 118 kWth", "CHP Recovered Heat: 86 kWth", "Aux Boiler: 32 kWth"],
            "description": "Hydronic heating network warmed primarily by CHP waste heat recovery, backed by secondary electric/fuel boilers."
        },
        "why_it_matters": "Thermal loop protects RO raw feed lines from icing and maintains the aerodynamic building envelope at comfortable +20°C."
    },
    {
        "id": "fuel",
        "label": "Jet A-1 Fuel Farm",
        "category": "FUEL",
        "domain": "Infrastructure",
        "impact_type": "Resource",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "296 kL Class Storage",
        "primary_metric": {"label": "Fuel On Hand", "value": "242.0", "unit": "kL"},
        "secondary_metric": {"label": "Burn Rate", "value": "92 L/h"},
        "details": {
            "metrics": ["Storage Class: 296–300 kL", "Current Reserves: 242 kL", "Daily Consumption: 2,208 L/d", "Endurance: 11.8 d"],
            "description": "Insulated bulk Jet A-1 fuel tank farm with pre-heated day tanks feeding the CHP plant."
        },
        "why_it_matters": "Jet A-1 powers the entire CHP electrical and thermal ecosystem; fuel depletion halts station life support."
    },
    {
        "id": "habitat",
        "label": "Station Habitation",
        "category": "LIFE SUPPORT",
        "domain": "Life Support",
        "impact_type": "Operational",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "23 Winter Crew",
        "primary_metric": {"label": "Occupancy", "value": "23", "unit": "pax"},
        "secondary_metric": {"label": "Building Temp", "value": "+20.5°C"},
        "details": {
            "metrics": ["Structure: Triple-deck Aerodynamic", "Crew: 23 Wintering", "Capacity: 47 Max", "Pressurized Ring: Nominal"],
            "description": "Bharati's main raised aerodynamic building housing all living quarters, laboratories, and operational control rooms."
        },
        "why_it_matters": "Compact integrated structure concentrates thermal and electrical loads, making life support highly efficient but dependent on CHP uptime."
    },
    {
        "id": "logistics",
        "label": "Progress Resupply Corridor",
        "category": "LOGISTICS",
        "domain": "Logistics",
        "impact_type": "Logistics",
        "status": "Operational",
        "provenance": "REFERENCE",
        "value_display": "Sea-Ice Link Open",
        "primary_metric": {"label": "Access Route", "value": "Clear", "unit": ""},
        "secondary_metric": {"label": "Next Vessel", "value": "14 d ETA"},
        "details": {
            "metrics": ["Sea-Ice Corridor: Quilty Bay - Progress", "Vessel ETA: 14 d", "Helicopter Deck: Operational", "Fuel Replenish: Scheduled"],
            "description": "Seasonal maritime resupply via cargo vessel, helicopter ship-to-shore airlift, and Larsemann Hills access tracks."
        },
        "why_it_matters": "Sea-ice breakup or heavy blizzards prevent helicopter sorties and tanker transfers, extending autonomy burn."
    },
    {
        "id": "autonomy",
        "label": "Mission Autonomy",
        "category": "MISSION",
        "domain": "Mission",
        "impact_type": "Autonomy",
        "status": "Operational",
        "provenance": "DERIVED",
        "value_display": "9.2 Days",
        "primary_metric": {"label": "Autonomy", "value": "9.2", "unit": "days"},
        "secondary_metric": {"label": "Limiting Factor", "value": "Water (RO Buffer)"},
        "details": {
            "metrics": ["Water Endurance: 9.1 d", "Fuel Endurance: 11.8 d", "Critical Spares: 10.4 d", "Limiting Constraint: Water Storage & RO Output"],
            "description": "Unified Bharati mission endurance derived from real-time minimization of water, fuel, power margin, and logistics access."
        },
        "why_it_matters": "Downstream terminal metric determining how long Bharati can safely sustain autonomous crew survival without resupply."
    }
]

BHARATI_EDGES = [
    # Bharati Signature Path: Seawater Intake -> Water Pump -> RO Plant -> Freshwater Production -> Water Storage -> Mission Autonomy
    {"source": "environment", "target": "seawater_intake", "relationship": "ice_freezing_hazard", "propagation_type": "Direct Dependency", "weight": 1.4, "label": "Sub-ice Cold Risk"},
    {"source": "seawater_intake", "target": "water_pump", "relationship": "raw_seawater_suction", "propagation_type": "Critical Path", "weight": 1.5, "label": "Feedwater Suction"},
    {"source": "water_pump", "target": "ro_plant", "relationship": "high_pressure_feed", "propagation_type": "Critical Path", "weight": 1.6, "label": "Pressurized Feed"},
    {"source": "ro_plant", "target": "freshwater_storage", "relationship": "potable_production", "propagation_type": "Critical Path", "weight": 1.7, "label": "Desalinated Output"},
    {"source": "freshwater_storage", "target": "autonomy", "relationship": "water_endurance", "propagation_type": "Critical Path", "weight": 1.9, "label": "Water Endurance Bottleneck"},
    # Path 1: Weather -> Heating -> CHP Load -> Fuel -> Autonomy
    {"source": "environment", "target": "heating", "relationship": "thermal_demand", "propagation_type": "Direct Dependency", "weight": 1.3, "label": "Space Heat Demand"},
    {"source": "heating", "target": "chp_fleet", "relationship": "chp_heat_coupling", "propagation_type": "Direct Dependency", "weight": 1.3, "label": "Thermal Load Coupling"},
    {"source": "chp_fleet", "target": "fuel", "relationship": "jet_a1_consumption", "propagation_type": "Critical Path", "weight": 1.5, "label": "Fuel Burn Rate"},
    {"source": "fuel", "target": "autonomy", "relationship": "fuel_endurance", "propagation_type": "Critical Path", "weight": 1.6, "label": "Jet A-1 Endurance"},
    # Auxiliary couplings: CHP powers Pumps & RO
    {"source": "chp_fleet", "target": "water_pump", "relationship": "electrical_power", "propagation_type": "Direct Dependency", "weight": 1.2, "label": "Pump Electrical Power"},
    {"source": "chp_fleet", "target": "ro_plant", "relationship": "plant_power", "propagation_type": "Direct Dependency", "weight": 1.3, "label": "RO High Pressure Power"},
    {"source": "heating", "target": "ro_plant", "relationship": "feed_preheat", "propagation_type": "Direct Dependency", "weight": 1.1, "label": "Feedwater Preheat"},
    # Habitation & Logistics
    {"source": "habitat", "target": "freshwater_storage", "relationship": "potable_consumption", "propagation_type": "Normal Flow", "weight": 1.1, "label": "Crew Water Draw"},
    {"source": "logistics", "target": "fuel", "relationship": "fuel_resupply", "propagation_type": "Direct Dependency", "weight": 1.2, "label": "Vessel Fuel Discharge"},
    {"source": "logistics", "target": "autonomy", "relationship": "resupply_buffer", "propagation_type": "Critical Path", "weight": 1.3, "label": "Corridor Resupply Window"}
]

def get_dependency_graph(station_id: str = "MAITRI") -> Dict[str, Any]:
    station_key = station_id.upper()
    if station_key == "BHARATI":
        return {
            "station_id": "BHARATI",
            "nodes": BHARATI_NODES,
            "edges": BHARATI_EDGES
        }
    return {
        "station_id": "MAITRI",
        "nodes": MAITRI_NODES,
        "edges": MAITRI_EDGES
    }

def get_node_details(node_id: str, station_id: str = "MAITRI") -> Optional[Dict[str, Any]]:
    graph = get_dependency_graph(station_id)
    target_node = next((n for n in graph["nodes"] if n["id"].lower() == node_id.lower()), None)
    if not target_node:
        return None

    # Find upstream causes
    upstream = [
        {"node": edge["source"], "relationship": edge["relationship"], "type": edge["propagation_type"], "label": edge.get("label", "")}
        for edge in graph["edges"] if edge["target"].lower() == target_node["id"].lower()
    ]

    # Find downstream impacts
    downstream = [
        {"node": edge["target"], "relationship": edge["relationship"], "type": edge["propagation_type"], "label": edge.get("label", "")}
        for edge in graph["edges"] if edge["source"].lower() == target_node["id"].lower()
    ]

    return {
        "node": target_node,
        "upstream_dependencies": upstream,
        "downstream_impacts": downstream
    }
