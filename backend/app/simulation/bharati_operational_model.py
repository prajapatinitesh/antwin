"""
ANTWIN - Bharati Operational Twin Dynamic Model (100% Offline & Scenario-Aware)
Causally links local meteorological observations and scenario fault injections into physical subsystem loads:
Weather (Temp/Wind) -> HVAC Thermal Demand -> 3x100kVA CHP Dispatch & Heat Recovery
-> Electrical Loading & Power Margin -> Quilty Bay RO Water Plant -> Jet A-1 Fuel Consumption -> Derived Mission Autonomy.

Supports baseline vs scenario vs mitigated before/after comparisons and explainable mitigations.
Zero external API calls.
"""

from typing import Dict, Any, List, Optional
from app.core.provenance import make_provenance, DataClass, TemporalStatus

# Authoritative Bharati Reference & Calibrated Physical Parameters
BHARATI_INDOOR_TARGET_TEMP_C = 20.0
BHARATI_BASE_HEATING_KWTH = 42.0
BHARATI_BUILDING_UA_KW_PER_C = 1.85   # Modular 4-level insulated envelope
BHARATI_MAX_DESIGN_THERMAL_KWTH = 155.0
BHARATI_WIND_CHILL_FACTOR = 0.006
BHARATI_WINTER_OCCUPANCY = 47
BHARATI_OCCUPANCY_HEAT_KW = 0.14

# Electrical Loads (kWe)
BHARATI_BASE_STATION_KWE = 28.0
BHARATI_LABS_CLEANROOMS_KWE = 18.0
BHARATI_GALLEY_REFRIGERATION_KWE = 14.0
BHARATI_QUILTY_PUMP_KWE = 6.5
BHARATI_RO_PLANT_KWE = 12.0
BHARATI_WASTEWATER_MBR_KWE = 5.5
BHARATI_SATCOM_IT_KWE = 7.0
BHARATI_WORKSHOP_KWE = 8.0

# Generation Architecture: 3 x 100 kVA (80 kWe rated per unit, 240 kWe total installed)
BHARATI_CHP_UNIT_RATING_KWE = 80.0
BHARATI_CHP_UNIT_THERMAL_KWTH = 60.0

# Fuel System
BHARATI_TANK_CAPACITY_L = 300000.0
BHARATI_INITIAL_FUEL_L = 242000.0
BHARATI_NOMINAL_SFC_L_PER_KWH = 0.255

# Water System (Quilty Bay Seawater Intake -> RO Desalination -> Remineralization)
BHARATI_RO_CAPACITY_L_DAY = 12000.0
BHARATI_WATER_STORAGE_CAPACITY_L = 45000.0
BHARATI_INITIAL_WATER_L = 38500.0
BHARATI_PER_CAPITA_DAILY_WATER_L = 110.0


def calculate_bharati_operational_state(
    weather_obs: Dict[str, Any],
    previous_state: Dict[str, Any] = None,
    scenario: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates dynamic operational state of Bharati Station driven by current weather observation
    and optional active scenario fault injection.
    """
    temp_c = weather_obs.get("temperature_c", -17.5)
    wind_kmh = weather_obs.get("wind_speed_kmh", 22.0)
    wind_kt = weather_obs.get("wind_speed_knots", wind_kmh / 1.852)
    wind_card = weather_obs.get("wind_direction_cardinal", "ESE")

    # Extract active scenario details
    scenario_info = scenario or {}
    scenario_name = scenario_info.get("name")
    severity = float(scenario_info.get("severity", 35.0))
    active_mitigations = scenario_info.get("mitigations", [])

    # --- Scenario Modifiers (Applied to Operational Model, NOT Weather Data) ---
    chp01_status = "RUNNING"
    chp02_status = "RUNNING"
    chp03_status = "STANDBY"
    chp01_health = 97.0
    chp02_health = 96.0
    chp03_health = 95.0
    chp01_cap_kwe = BHARATI_CHP_UNIT_RATING_KWE
    chp02_cap_kwe = BHARATI_CHP_UNIT_RATING_KWE
    chp03_cap_kwe = BHARATI_CHP_UNIT_RATING_KWE

    extra_thermal_kwth = 0.0
    extra_wind_kmh = 0.0
    fuel_capacity_factor = 1.0
    sfc_multiplier = 1.0
    ro_capacity_factor = 1.0
    quilty_pump_down = False
    water_storage_factor = 1.0
    comms_loss = False
    vehicle_down = False
    resupply_delay_days = 0.0

    if scenario_name:
        s_lower = scenario_name.lower()
        if "chp-02" in s_lower and "failure" in s_lower:
            chp02_status = "FAILED"
            chp02_health = 0.0
            chp02_cap_kwe = 0.0
            sfc_multiplier = 1.14
        elif "chp-01" in s_lower and "degradation" in s_lower:
            deg_frac = severity / 100.0
            chp01_status = "DEGRADED"
            chp01_health = max(40.0, 97.0 - (50.0 * deg_frac))
            chp01_cap_kwe = max(45.0, BHARATI_CHP_UNIT_RATING_KWE * (1.0 - 0.45 * deg_frac))
            sfc_multiplier = 1.0 + (0.15 * deg_frac)
        elif "chp-02" in s_lower and "degradation" in s_lower:
            deg_frac = severity / 100.0
            chp02_status = "DEGRADED"
            chp02_health = max(40.0, 96.0 - (50.0 * deg_frac))
            chp02_cap_kwe = max(45.0, BHARATI_CHP_UNIT_RATING_KWE * (1.0 - 0.45 * deg_frac))
            sfc_multiplier = 1.0 + (0.15 * deg_frac)
        elif "chp-03" in s_lower and "failure" in s_lower:
            chp03_status = "OFFLINE"
            chp03_health = 0.0
            chp03_cap_kwe = 0.0
        elif "ro plant" in s_lower:
            deg_frac = severity / 100.0
            ro_capacity_factor = max(0.1, 1.0 - (0.75 * deg_frac))
        elif "seawater pump" in s_lower:
            quilty_pump_down = True
            ro_capacity_factor = 0.0
        elif "extreme cold" in s_lower:
            extra_thermal_kwth = 32.0 * (severity / 100.0)
        elif "high wind" in s_lower:
            extra_wind_kmh = 36.0 * (severity / 100.0)
        elif "fuel constraint" in s_lower:
            fuel_capacity_factor = max(0.5, 1.0 - (0.45 * (severity / 100.0)))
        elif "water storage" in s_lower:
            water_storage_factor = max(0.4, 1.0 - (0.55 * (severity / 100.0)))
        elif "communication loss" in s_lower:
            comms_loss = True
        elif "resupply delay" in s_lower:
            resupply_delay_days = 3.0 * (severity / 100.0)
        elif "vehicle" in s_lower:
            vehicle_down = True

    # --- Apply Mitigations ---
    mitigation_power_relief = 0.0
    mitigation_thermal_relief = 0.0
    mitigation_water_relief = 0.0
    chp03_dispatched_by_mitigation = False

    if "CHP Load Redistribution & Standby Dispatch (CHP-03)" in active_mitigations:
        if chp03_status in ["STANDBY", "NORMAL"]:
            chp03_status = "RUNNING"
            chp03_dispatched_by_mitigation = True

    if "Non-Critical HVAC Thermal Setback (-2°C)" in active_mitigations:
        mitigation_thermal_relief += 14.0
        mitigation_power_relief += 3.5

    if "Laboratory Auxiliary Equipment Shedding" in active_mitigations:
        mitigation_power_relief += 9.0

    if "RO Plant High-Pressure Membrane Duty Cycling" in active_mitigations:
        if ro_capacity_factor < 0.8:
            ro_capacity_factor = min(0.85, ro_capacity_factor + 0.35)

    if "Water Rationing Protocol (Tier-1)" in active_mitigations:
        mitigation_water_relief += 1200.0  # Conserve 1,200 L/day

    # --- 1. Thermal & HVAC Model ---
    effective_temp = temp_c
    effective_wind = wind_kmh + extra_wind_kmh
    thermal_deficit = max(0.0, BHARATI_INDOOR_TARGET_TEMP_C - effective_temp)
    wind_mult = 1.0 + (BHARATI_WIND_CHILL_FACTOR * effective_wind)
    occupancy_heat = BHARATI_WINTER_OCCUPANCY * BHARATI_OCCUPANCY_HEAT_KW

    total_thermal_demand_kwth = (
        BHARATI_BASE_HEATING_KWTH +
        (thermal_deficit * BHARATI_BUILDING_UA_KW_PER_C * wind_mult) +
        extra_thermal_kwth -
        mitigation_thermal_relief -
        occupancy_heat
    )
    total_thermal_demand_kwth = max(38.0, min(BHARATI_MAX_DESIGN_THERMAL_KWTH, total_thermal_demand_kwth))

    # HVAC electrical auxiliary load (circulation pumps, ventilation fans)
    hvac_aux_kwe = 10.0 + (0.09 * total_thermal_demand_kwth) - mitigation_power_relief * 0.2

    # --- 2. Electrical Demand Model ---
    ro_electrical_kwe = BHARATI_RO_PLANT_KWE * (ro_capacity_factor if not quilty_pump_down else 0.0)
    total_electrical_demand_kwe = (
        BHARATI_BASE_STATION_KWE +
        BHARATI_LABS_CLEANROOMS_KWE +
        BHARATI_GALLEY_REFRIGERATION_KWE +
        (BHARATI_QUILTY_PUMP_KWE if not quilty_pump_down else 0.0) +
        ro_electrical_kwe +
        BHARATI_WASTEWATER_MBR_KWE +
        BHARATI_SATCOM_IT_KWE +
        BHARATI_WORKSHOP_KWE +
        hvac_aux_kwe -
        mitigation_power_relief
    )
    total_electrical_demand_kwe = max(65.0, total_electrical_demand_kwe)

    # --- 3. 3 x 100 kVA CHP Fleet Dispatch & Loading ---
    # Determine active running units
    running_units = []
    if chp01_status in ["RUNNING", "DEGRADED"]:
        running_units.append(("CHP-01", chp01_cap_kwe))
    if chp02_status in ["RUNNING", "DEGRADED"]:
        running_units.append(("CHP-02", chp02_cap_kwe))
    if chp03_status == "RUNNING" or chp03_dispatched_by_mitigation:
        running_units.append(("CHP-03", chp03_cap_kwe))

    # In normal operations, if demand > 155 kWe and CHP-03 is standby, it auto-dispatches.
    # In fault scenarios (e.g. CHP-02 failure), standby dispatch is an explainable mitigation action.
    available_gen_kwe = sum(cap for _, cap in running_units)
    if not scenario_name and available_gen_kwe < total_electrical_demand_kwe and chp03_status == "STANDBY":
        chp03_status = "RUNNING"
        running_units.append(("CHP-03", chp03_cap_kwe))
        available_gen_kwe = sum(cap for _, cap in running_units)

    # Distribute electrical load evenly across running units
    num_active = len(running_units)
    chp_load_pct = (total_electrical_demand_kwe / available_gen_kwe * 100.0) if available_gen_kwe > 0 else 100.0

    chp01_load_kwe = 0.0
    chp02_load_kwe = 0.0
    chp03_load_kwe = 0.0
    chp01_th_kwth = 0.0
    chp02_th_kwth = 0.0
    chp03_th_kwth = 0.0

    if num_active > 0:
        per_unit_kwe = total_electrical_demand_kwe / num_active
        if any(name == "CHP-01" for name, _ in running_units):
            chp01_load_kwe = min(chp01_cap_kwe, per_unit_kwe)
            chp01_th_kwth = min(BHARATI_CHP_UNIT_THERMAL_KWTH, chp01_load_kwe * 0.75)
        if any(name == "CHP-02" for name, _ in running_units):
            chp02_load_kwe = min(chp02_cap_kwe, per_unit_kwe)
            chp02_th_kwth = min(BHARATI_CHP_UNIT_THERMAL_KWTH, chp02_load_kwe * 0.75)
        if any(name == "CHP-03" for name, _ in running_units):
            chp03_load_kwe = min(chp03_cap_kwe, per_unit_kwe)
            chp03_th_kwth = min(BHARATI_CHP_UNIT_THERMAL_KWTH, chp03_load_kwe * 0.75)

    total_thermal_recovered_kwth = chp01_th_kwth + chp02_th_kwth + chp03_th_kwth
    thermal_margin_kwth = total_thermal_recovered_kwth - total_thermal_demand_kwth
    power_margin_kwe = available_gen_kwe - total_electrical_demand_kwe

    # --- 4. Fuel System Model (Jet A-1) ---
    effective_sfc = BHARATI_NOMINAL_SFC_L_PER_KWH * sfc_multiplier
    # If thermal deficit exists, hydronic auxiliary burners supply difference
    aux_burner_burn_l_per_h = (abs(thermal_margin_kwth) * 0.075) if thermal_margin_kwth < 0 else 0.0

    hourly_fuel_burn_l = (total_electrical_demand_kwe * effective_sfc) + aux_burner_burn_l_per_h
    daily_fuel_burn_l = hourly_fuel_burn_l * 24.0

    # Fuel Level in 300,000 L farm
    current_fuel_l = (BHARATI_INITIAL_FUEL_L * fuel_capacity_factor) - (weather_obs.get("hour_index", 0) * hourly_fuel_burn_l)
    current_fuel_l = max(40000.0, current_fuel_l)
    fuel_endurance_days = round(current_fuel_l / max(200.0, daily_fuel_burn_l), 1)

    # --- 5. Water Utility Model (Quilty Bay Seawater Intake -> RO Desalination) ---
    daily_water_consumption_l = max(2500.0, (BHARATI_WINTER_OCCUPANCY * BHARATI_PER_CAPITA_DAILY_WATER_L) - mitigation_water_relief)
    hourly_consumption_l = daily_water_consumption_l / 24.0

    daily_water_production_l = BHARATI_RO_CAPACITY_L_DAY * ro_capacity_factor
    hourly_water_production_l = daily_water_production_l / 24.0

    # Storage buffer tracking
    current_storage_l = (BHARATI_INITIAL_WATER_L * water_storage_factor) + (
        weather_obs.get("hour_index", 0) * (hourly_water_production_l - hourly_consumption_l)
    )
    current_storage_l = max(3500.0, min(BHARATI_WATER_STORAGE_CAPACITY_L, current_storage_l))

    # Water endurance
    if daily_water_production_l >= daily_water_consumption_l:
        water_endurance_days = round(min(180.0, 90.0 + (current_storage_l / 800.0)), 1)
    else:
        net_deficit_day = daily_water_consumption_l - daily_water_production_l
        water_endurance_days = round(current_storage_l / net_deficit_day, 1)

    # --- 6. Wastewater (MBR Plant) ---
    daily_wastewater_gen_l = daily_water_consumption_l * 0.85
    mbr_status = "NORMAL" if not quilty_pump_down else "WARNING"

    # --- 7. Mobility & Field Logistics ---
    if wind_kt < 25.0 and not vehicle_down:
        field_access = "NORMAL"
        vehicle_readiness = 94.0
    elif wind_kt < 35.0 and not vehicle_down:
        field_access = "CONSTRAINED"
        vehicle_readiness = 78.0
    else:
        field_access = "RESTRICTED"
        vehicle_readiness = 45.0

    air_network_window = "OPEN" if wind_kt < 35.0 else "CLOSED_WEATHER"

    # --- 8. Mission Autonomy Calculation ---
    # min of energy, fuel, water, provisions, spares, assets, logistics
    energy_endurance_days = round(max(0.5, power_margin_kwe / 12.0 * 2.5), 1) if power_margin_kwe > 0 else 0.5
    provisions_endurance_days = 145.0
    critical_spare_days = 95.0 if chp03_status != "OFFLINE" else 8.5
    critical_asset_margin_days = round(max(1.0, (available_gen_kwe / total_electrical_demand_kwe) * 7.5), 1)
    logistics_days = max(4.0, 28.0 - resupply_delay_days)

    endurance_map = {
        "Energy Margin": energy_endurance_days,
        "Fuel Endurance": fuel_endurance_days,
        "Water Endurance": water_endurance_days,
        "Critical Spares": critical_spare_days,
        "Asset Reliability Margin": critical_asset_margin_days,
        "Logistics Accessibility": logistics_days
    }

    # Minimum determines mission autonomy
    sorted_endurances = sorted(endurance_map.items(), key=lambda x: x[1])
    limiting_constraint = sorted_endurances[0][0]
    limiting_value = sorted_endurances[0][1]
    secondary_contributor = sorted_endurances[1][0]

    # Baseline autonomy (for before/after comparison)
    baseline_autonomy_days = 9.1
    scenario_autonomy_days = limiting_value
    # Mitigated estimate
    mitigated_autonomy_days = min(baseline_autonomy_days, scenario_autonomy_days + (1.2 if active_mitigations else 0.0))

    # --- 9. Explainable Causal Delta Chain (5 sequential cards) ---
    causal_chain = [
        {
            "step": 1,
            "title": "WEATHER TRIGGER",
            "icon": "CloudSnow",
            "metric": f"{temp_c:.1f}°C / {wind_kt:.0f} kt {wind_card}",
            "delta_str": f"Deficit: {thermal_deficit:.1f}°C",
            "impact": f"Larsemann Hills coastal conditions driving building envelope convective heat loss."
        },
        {
            "step": 2,
            "title": "HVAC THERMAL DEMAND",
            "icon": "Flame",
            "metric": f"{total_thermal_demand_kwth:.1f} kWth",
            "delta_str": f"{'+' if total_thermal_demand_kwth > 75 else ''}{total_thermal_demand_kwth - 75.0:.1f} kWth",
            "impact": f"Automated HVAC circulation requiring {total_thermal_recovered_kwth:.1f} kWth recovered CHP heat."
        },
        {
            "step": 3,
            "title": "3x CHP GENERATION",
            "icon": "Zap",
            "metric": f"{total_electrical_demand_kwe:.1f} / {available_gen_kwe:.0f} kWe",
            "delta_str": f"Margin: {power_margin_kwe:.1f} kWe",
            "impact": f"{num_active} units active ({chp_load_pct:.0f}% load). {chp02_status} state."
        },
        {
            "step": 4,
            "title": "JET A-1 & WATER BALANCE",
            "icon": "Droplets",
            "metric": f"{hourly_fuel_burn_l:.1f} L/h | RO {daily_water_production_l:.0f} L/d",
            "delta_str": f"Fuel: {fuel_endurance_days:.0f}d | H₂O: {water_endurance_days:.0f}d",
            "impact": f"Quilty Bay intake {'nominal' if not quilty_pump_down else 'OFFLINE'}; fuel burn at {effective_sfc:.3f} L/kWh."
        },
        {
            "step": 5,
            "title": "MISSION AUTONOMY",
            "icon": "ShieldCheck",
            "metric": f"{limiting_value:.1f} Days",
            "delta_str": f"{'-' if limiting_value < baseline_autonomy_days else ''}{abs(limiting_value - baseline_autonomy_days):.1f}d vs Base",
            "impact": f"Limiting constraint: {limiting_constraint.upper()} (Secondary: {secondary_contributor})."
        }
    ]

    return {
        "station": "BHARATI",
        "data_class": "DERIVED",
        "timestamp": weather_obs.get("timestamp"),
        "thermal_state": {
            "total_demand_kwth": round(total_thermal_demand_kwth, 1),
            "recovered_chp_kwth": round(total_thermal_recovered_kwth, 1),
            "thermal_margin_kwth": round(thermal_margin_kwth, 1),
            "indoor_target_c": BHARATI_INDOOR_TARGET_TEMP_C,
            "thermal_deficit_c": round(thermal_deficit, 1),
            "design_max_kwth": BHARATI_MAX_DESIGN_THERMAL_KWTH
        },
        "power_state": {
            "total_demand_kwe": round(total_electrical_demand_kwe, 1),
            "available_generation_kwe": round(available_gen_kwe, 1),
            "power_margin_kwe": round(power_margin_kwe, 1),
            "installed_capacity_kwe": 240.0,
            "average_chp_load_pct": round(chp_load_pct, 1),
            "active_chp_count": num_active,
            "chp_units": [
                {
                    "id": "CHP-01",
                    "status": chp01_status,
                    "electrical_load_kwe": round(chp01_load_kwe, 1),
                    "thermal_output_kwth": round(chp01_th_kwth, 1),
                    "health_pct": round(chp01_health, 1),
                    "efficiency_pct": 92.5 if chp01_status == "RUNNING" else 76.0,
                    "operating_hours": 14280
                },
                {
                    "id": "CHP-02",
                    "status": chp02_status,
                    "electrical_load_kwe": round(chp02_load_kwe, 1),
                    "thermal_output_kwth": round(chp02_th_kwth, 1),
                    "health_pct": round(chp02_health, 1),
                    "efficiency_pct": 91.8 if chp02_status == "RUNNING" else 0.0,
                    "operating_hours": 13910
                },
                {
                    "id": "CHP-03",
                    "status": chp03_status,
                    "electrical_load_kwe": round(chp03_load_kwe, 1),
                    "thermal_output_kwth": round(chp03_th_kwth, 1),
                    "health_pct": round(chp03_health, 1),
                    "efficiency_pct": 94.0 if chp03_status == "RUNNING" else 95.0,
                    "operating_hours": 4210
                }
            ]
        },
        "fuel_state": {
            "fuel_type": "JET A-1",
            "capacity_l": BHARATI_TANK_CAPACITY_L,
            "current_level_l": round(current_fuel_l, 1),
            "fuel_level_pct": round((current_fuel_l / BHARATI_TANK_CAPACITY_L) * 100.0, 1),
            "hourly_burn_rate_l": round(hourly_fuel_burn_l, 1),
            "daily_burn_rate_l": round(daily_fuel_burn_l, 1),
            "fuel_endurance_days": fuel_endurance_days,
            "specific_fuel_consumption_l_per_kwh": round(effective_sfc, 3)
        },
        "water_state": {
            "intake_source": "Quilty Bay Seawater Intake (~12m depth)",
            "quilty_intake_status": "NORMAL" if not quilty_pump_down else "CRITICAL",
            "ro_plant_status": "NORMAL" if ro_capacity_factor >= 0.8 else ("WARNING" if ro_capacity_factor > 0 else "CRITICAL"),
            "remineralization_status": "NORMAL",
            "production_rate_l_per_day": round(daily_water_production_l, 1),
            "consumption_rate_l_per_day": round(daily_water_consumption_l, 1),
            "storage_level_l": round(current_storage_l, 1),
            "storage_capacity_l": BHARATI_WATER_STORAGE_CAPACITY_L,
            "storage_pct": round((current_storage_l / BHARATI_WATER_STORAGE_CAPACITY_L) * 100.0, 1),
            "water_endurance_days": water_endurance_days
        },
        "wastewater_state": {
            "technology": "Membrane Bioreactor (MBR) Plant",
            "status": mbr_status,
            "daily_generation_l": round(daily_wastewater_gen_l, 1),
            "recycling_efficiency_pct": 65.0
        },
        "mobility_state": {
            "field_access": field_access,
            "vehicle_readiness_pct": vehicle_readiness,
            "air_network_window": air_network_window,
            "comms_status": "OFFLINE" if comms_loss else "NORMAL"
        },
        "mission_autonomy": {
            "overall_days": limiting_value,
            "limiting_constraint": limiting_constraint,
            "secondary_contributor": secondary_contributor,
            "endurance_breakdown": endurance_map,
            "baseline_days": baseline_autonomy_days,
            "scenario_days": scenario_autonomy_days,
            "mitigated_days": mitigated_autonomy_days
        },
        "scenario_impact": {
            "active_scenario_name": scenario_name,
            "severity_pct": severity,
            "active_mitigations": active_mitigations,
            "baseline_autonomy_days": baseline_autonomy_days,
            "scenario_autonomy_days": scenario_autonomy_days,
            "mitigated_autonomy_days": mitigated_autonomy_days,
            "available_mitigations": [
                {
                    "id": "mit_chp03",
                    "name": "CHP Load Redistribution & Standby Dispatch (CHP-03)",
                    "category": "Power Generation",
                    "explanation": "Immediately synchronizes standby CHP-03 to the station bus to relieve overloaded running units and restore n-1 redundancy."
                },
                {
                    "id": "mit_ro_cycle",
                    "name": "RO Plant High-Pressure Membrane Duty Cycling",
                    "category": "Water & Desalination",
                    "explanation": "Engages high-pressure membrane pulsing to mitigate scaling and restore 35% freshwater output."
                },
                {
                    "id": "mit_thermal",
                    "name": "Non-Critical HVAC Thermal Setback (-2°C)",
                    "category": "HVAC / Thermal",
                    "explanation": "Reduces non-essential workshop and laboratory setpoints from 20°C to 18°C, shedding 14 kWth thermal load."
                },
                {
                    "id": "mit_labs",
                    "name": "Laboratory Auxiliary Equipment Shedding",
                    "category": "Electrical Load",
                    "explanation": "Shuts down non-critical sample incubation freezers and laser spectrometers, regaining 9 kWe power margin."
                },
                {
                    "id": "mit_water_ration",
                    "name": "Water Rationing Protocol (Tier-1)",
                    "category": "Life Support",
                    "explanation": "Implements timed shower intervals and graywater laundry cycles to extend storage endurance by 1,200 L/day."
                }
            ]
        },
        "causal_chain": causal_chain
    }
