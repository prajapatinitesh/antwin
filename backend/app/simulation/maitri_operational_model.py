"""
ANTWIN - Maitri Operational Twin Dynamic Model (Offline & Scenario Aware)
Causally links local meteorological observations and scenario fault injections into physical subsystem loads:
Temperature -> Heating Demand -> Power Load -> Generator Loading -> Fuel Consumption -> Autonomy.
Supports baseline vs scenario vs mitigated before/after comparisons and explainable mitigations.
"""

from typing import Dict, Any, List, Optional
from app.core.provenance import make_provenance, DataClass, TemporalStatus

# Baseline Maitri winter configuration parameters (REFERENCE & SIMULATED calibration)
MAITRI_INDOOR_TARGET_TEMP_C = 18.0
MAITRI_BASE_HEATING_KWTH = 35.0
MAITRI_HEATING_COEFF_KW_PER_C = 2.4   # Convective loss rate per degree below target
MAITRI_WINTER_OCCUPANCY = 25
MAITRI_OCCUPANCY_HEAT_KW = 0.15

MAITRI_BASE_ELECTRICAL_KWE = 38.0
MAITRI_SCIENTIFIC_LOAD_KWE = 12.0
MAITRI_HABITATION_LOAD_KWE = 8.5
MAITRI_INSTALLED_GENERATION_KVA = 250.0  # 2 x 125 kVA active sets (nominal 200 kWe capacity)

MAITRI_TANK_CAPACITY_L = 300000.0
MAITRI_CURRENT_FUEL_L = 214500.0

def calculate_maitri_operational_state(
    weather_obs: Dict[str, Any],
    previous_state: Dict[str, Any] = None,
    generator_degraded: bool = False,
    scenario: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates dynamic operational state of Maitri Station driven by current weather observation
    and optional active scenario fault injection.
    """
    temp_c = weather_obs.get("temperature_c", -18.5)
    wind_kmh = weather_obs.get("wind_speed_kmh", 25.0)
    wind_card = weather_obs.get("wind_direction_cardinal", "SE")

    # Extract scenario details
    scenario_info = scenario or {}
    scenario_name = scenario_info.get("name")
    if not scenario_name and generator_degraded:
        scenario_name = "Generator-02 Degradation"
        scenario_info = {"name": scenario_name, "severity": 50.0, "mitigations": []}

    severity = float(scenario_info.get("severity", 35.0))
    active_mitigations = scenario_info.get("mitigations", [])

    # --- Scenario Modifiers (Applied to Operational Model, NOT Weather Data) ---
    effective_gen_capacity_kwe = 200.0
    base_elec_demand = MAITRI_BASE_ELECTRICAL_KWE
    extra_heating_kwth = 0.0
    extra_wind_kmh = 0.0
    fuel_capacity_factor = 1.0
    asset_margin_penalty = 0.0
    resupply_delay_days = 0.0
    comms_loss = False
    vehicle_down = False
    sfc_multiplier = 1.0

    if scenario_name:
        s_lower = scenario_name.lower()
        if "generator" in s_lower and "degradation" in s_lower:
            # Capacity drops proportional to severity
            reduction = 70.0 * (severity / 100.0)
            effective_gen_capacity_kwe = max(110.0, 200.0 - reduction)
            sfc_multiplier = 1.0 + (0.12 * (severity / 100.0))
            asset_margin_penalty = 2.4 * (severity / 100.0)

        elif "generator" in s_lower and "failure" in s_lower:
            # Complete failure of Generator-02 (drop to 105 kWe single generator)
            effective_gen_capacity_kwe = 105.0
            sfc_multiplier = 1.15
            asset_margin_penalty = 3.5

        elif "extreme cold" in s_lower:
            # Cold snap shock (+12 kWth heating)
            extra_heating_kwth = 28.0 * (severity / 100.0)

        elif "high wind" in s_lower:
            extra_wind_kmh = 35.0 * (severity / 100.0)

        elif "fuel constraint" in s_lower:
            fuel_capacity_factor = max(0.5, 1.0 - (0.45 * (severity / 100.0)))

        elif "communication loss" in s_lower:
            comms_loss = True

        elif "resupply delay" in s_lower:
            resupply_delay_days = 3.0 * (severity / 100.0)

        elif "vehicle" in s_lower:
            vehicle_down = True

        elif "critical asset" in s_lower:
            asset_margin_penalty = 3.8

    # Apply Mitigations
    mitigation_power_relief = 0.0
    mitigation_heating_relief = 0.0
    mitigation_autonomy_boost = 0.0

    if "Shed non-critical loads" in active_mitigations:
        mitigation_power_relief += 7.5  # Shed science/non-essential heating
        mitigation_autonomy_boost += 0.8

    if "Load redistribution" in active_mitigations:
        effective_gen_capacity_kwe += 15.0
        mitigation_autonomy_boost += 0.9

    if "Optimize heating" in active_mitigations:
        mitigation_heating_relief += 12.0
        mitigation_autonomy_boost += 0.7

    if "Verify critical spare" in active_mitigations:
        asset_margin_penalty = max(0.0, asset_margin_penalty - 1.8)
        mitigation_autonomy_boost += 0.6

    if "Reassess resupply" in active_mitigations:
        resupply_delay_days = max(0.0, resupply_delay_days - 1.5)
        mitigation_autonomy_boost += 0.5

    # 1. Heating Demand (kWth)
    effective_wind_kmh = wind_kmh + extra_wind_kmh
    temp_deficit = max(0.0, MAITRI_INDOOR_TARGET_TEMP_C - temp_c)
    wind_convection_factor = 1.0 + max(0.0, (effective_wind_kmh - 20.0) * 0.005)
    
    thermal_weather_load = temp_deficit * MAITRI_HEATING_COEFF_KW_PER_C * wind_convection_factor
    occupancy_heat_credit = MAITRI_WINTER_OCCUPANCY * MAITRI_OCCUPANCY_HEAT_KW
    total_heating_demand_kw = round(
        max(30.0, MAITRI_BASE_HEATING_KWTH + thermal_weather_load + extra_heating_kwth - occupancy_heat_credit - mitigation_heating_relief),
        1
    )

    # 2. Power Demand (kWe)
    heat_tracing_electric_kw = round(max(4.0, (temp_deficit - 20.0) * 0.45), 1)
    water_pumping_electric_kw = 5.2
    wastewater_aeration_kw = 4.8

    total_power_load_kw = round(
        max(35.0, base_elec_demand +
        MAITRI_SCIENTIFIC_LOAD_KWE +
        MAITRI_HABITATION_LOAD_KWE +
        heat_tracing_electric_kw +
        water_pumping_electric_kw +
        wastewater_aeration_kw -
        mitigation_power_relief),
        1
    )

    # 3. Generator Loading
    generator_load_pct = round(min(100.0, (total_power_load_kw / effective_gen_capacity_kwe) * 100.0), 1)
    reserve_margin_kwe = round(max(0.0, effective_gen_capacity_kwe - total_power_load_kw), 1)
    reserve_margin_pct = round((reserve_margin_kwe / effective_gen_capacity_kwe) * 100.0, 1)

    # 4. Fuel Consumption (L/day)
    base_sfc = 0.29 if generator_load_pct > 75.0 else 0.265
    sfc = base_sfc * sfc_multiplier
    daily_gen_fuel_l = total_power_load_kw * 24.0 * sfc
    daily_heating_fuel_l = total_heating_demand_kw * 24.0 * 0.072
    daily_vehicle_fuel_l = 85.0 if effective_wind_kmh < 40 and not vehicle_down else 30.0

    total_daily_fuel_l = round(daily_gen_fuel_l + daily_heating_fuel_l + daily_vehicle_fuel_l, 1)

    # 5. Fuel Endurance (Days)
    usable_fuel_l = (MAITRI_CURRENT_FUEL_L * 0.95) * fuel_capacity_factor
    fuel_endurance_days = round(usable_fuel_l / total_daily_fuel_l, 1) if total_daily_fuel_l > 0 else 0.0

    # 6. Mission Autonomy (Days)
    energy_endurance_days = round(min(14.0, (reserve_margin_pct / 100.0) * 20.0 + 4.0), 1)
    water_endurance_days = 15.6
    provisions_endurance_days = 17.8
    spare_parts_coverage_days = 8.7
    critical_asset_margin_days = round(max(2.5, 8.5 - asset_margin_penalty), 1)
    logistics_buffer_days = round(max(2.0, 12.0 - (effective_wind_kmh / 25.0) - resupply_delay_days), 1)

    all_endurances = {
        "Critical Asset Margin": critical_asset_margin_days,
        "Spare Parts Coverage": spare_parts_coverage_days,
        "Energy Endurance": energy_endurance_days,
        "Logistics Accessibility": logistics_buffer_days,
        "Fuel Endurance": fuel_endurance_days,
        "Water Supply": water_endurance_days,
        "Food Provisions": provisions_endurance_days
    }
    limiting_constraint = min(all_endurances, key=all_endurances.get)
    mission_autonomy_days = round(all_endurances[limiting_constraint] + mitigation_autonomy_boost, 1)

    # Calculate Baseline vs Scenario vs Mitigated before/after values
    # Baseline nominal autonomy for current weather without faults
    baseline_autonomy_days = round(min(
        8.5,
        energy_endurance_days,
        round((MAITRI_CURRENT_FUEL_L * 0.95) / (total_power_load_kw * 24.0 * 0.265 + total_heating_demand_kw * 24.0 * 0.072 + 85.0), 1),
        round(max(3.0, 12.0 - (wind_kmh / 25.0)), 1)
    ), 1)

    scenario_raw_autonomy_days = round(all_endurances[limiting_constraint], 1)
    mitigated_autonomy_days = round(scenario_raw_autonomy_days + mitigation_autonomy_boost, 1) if active_mitigations else scenario_raw_autonomy_days

    # 7. Field Operations Envelope & Mobility
    if effective_wind_kmh >= 75.0 or temp_c <= -35.0:
        field_status = "CRITICAL_SUSPENSION"
        field_envelope_desc = f"Extreme blizzard ({effective_wind_kmh} km/h, {wind_card}). Complete outdoor travel lockdown. Lake pump pipeline emergency heat on."
    elif effective_wind_kmh >= 45.0 or temp_c <= -26.0 or vehicle_down:
        field_status = "CONSTRAINED_ESSENTIAL"
        field_envelope_desc = f"High catabatic wind ({effective_wind_kmh} km/h). PistenBully essential utility runs only. Priyadarshini access road watch."
    else:
        field_status = "OPERATIONAL_NOMINAL"
        field_envelope_desc = f"Nominal Antarctic winter weather ({temp_c}°C, {effective_wind_kmh} km/h). All polar vehicles and science routes operational."

    # 8. Explainable Causal Delta vs. Previous
    prev_temp = previous_state.get("outdoor_temp_c", -18.5) if previous_state else -18.5
    prev_heating = previous_state.get("heating_demand_kw", 82.0) if previous_state else 82.0
    prev_power = previous_state.get("power_load_kw", 65.0) if previous_state else 65.0
    prev_fuel = previous_state.get("daily_fuel_l", 1250.0) if previous_state else 1250.0
    prev_autonomy = previous_state.get("mission_autonomy_days", 9.2) if previous_state else 9.2

    delta_temp = round(temp_c - prev_temp, 1)
    delta_heating_pct = round(((total_heating_demand_kw - prev_heating) / prev_heating) * 100.0, 1)
    delta_power_pct = round(((total_power_load_kw - prev_power) / prev_power) * 100.0, 1)
    delta_fuel_pct = round(((total_daily_fuel_l - prev_fuel) / prev_fuel) * 100.0, 1)
    delta_autonomy = round(mission_autonomy_days - prev_autonomy, 1)

    why_explanation = [
        f"Temperature shifted from {prev_temp}°C to {temp_c}°C (delta {delta_temp:+}°C).",
        f"Hydronic heating demand {'increased' if delta_heating_pct >= 0 else 'decreased'} by {abs(delta_heating_pct)}% to {total_heating_demand_kw} kWth.",
        f"Auxiliary heat tracing and electrical demand changed by {delta_power_pct:+}% to {total_power_load_kw} kWe.",
        f"Daily polar fuel burn rate adjusted to {total_daily_fuel_l:,.0f} L/day ({delta_fuel_pct:+}%).",
        f"Station Mission Autonomy is {mission_autonomy_days} days (constrained by {limiting_constraint})."
    ]

    why_autonomy_changed = [
        {"step": "Weather Trigger", "factor": "Ambient Temperature", "delta_str": f"{delta_temp:+}°C", "impact": f"Ambient {temp_c}°C ({effective_wind_kmh} km/h)"},
        {"step": "Thermal Demand", "factor": "Hydronic Heating", "delta_str": f"{delta_heating_pct:+}%", "impact": f"Envelope heating: {total_heating_demand_kw} kWth"},
        {"step": "Power Demand", "factor": "Electric Base & Heat Tracing", "delta_str": f"{delta_power_pct:+}%", "impact": f"Station 415V bus: {total_power_load_kw} kWe"},
        {"step": "Fuel Burn Rate", "factor": "Polar Diesel Consumption", "delta_str": f"{delta_fuel_pct:+}%", "impact": f"Daily burn: {total_daily_fuel_l:,.0f} L/day"},
        {"step": "Mission Autonomy", "factor": "Limiting Constraint", "delta_str": f"{delta_autonomy:+} days", "impact": f"{mission_autonomy_days} days ({limiting_constraint})"}
    ]

    field_transit_status = "NO_GO" if field_status == "CRITICAL_SUSPENSION" else ("CAUTION" if field_status == "CONSTRAINED_ESSENTIAL" else "SAFE")
    lake_water_intake_status = "Sub-ice Trace-Heated (+4.2°C)" if temp_c <= -25.0 else "Intake flowing freely"

    # Mitigation recommendations
    mitigation_options = [
        {
            "id": "load_redistribution",
            "name": "Load redistribution",
            "reason": "Generator-02 available capacity decreased; balance load across active alternators.",
            "expected_effect": "Reduce Genset-01 thermal stress and restore 0.9 days power reserve.",
            "recovery_days": 0.9,
            "applied": "Load redistribution" in active_mitigations
        },
        {
            "id": "load_shedding",
            "name": "Shed non-critical loads",
            "reason": "Non-essential science freezers & secondary corridor heaters can be safely shed.",
            "expected_effect": "Lowers station load by 7.5 kWe, improving fuel endurance by +0.8 days.",
            "recovery_days": 0.8,
            "applied": "Shed non-critical loads" in active_mitigations
        },
        {
            "id": "optimize_heating",
            "name": "Optimize heating",
            "reason": "Lower night setpoints by 1.5°C in unpopulated summer camp modules.",
            "expected_effect": "Reduces hydronic heating load by 12 kWth, saving ~21 L/day furnace diesel.",
            "recovery_days": 0.7,
            "applied": "Optimize heating" in active_mitigations
        },
        {
            "id": "verify_spare",
            "name": "Verify critical spare",
            "reason": "Audit inventory of AVRs, injector nozzles, and water pump mechanical seals.",
            "expected_effect": "Rebounds Critical Asset Margin coverage by +0.6 days.",
            "recovery_days": 0.6,
            "applied": "Verify critical spare" in active_mitigations
        },
        {
            "id": "reassess_resupply",
            "name": "Reassess resupply",
            "reason": "Coordinate with Bharati station logistics hub for expedited air-drop window.",
            "expected_effect": "Buffers logistics accessibility margin by +0.5 days.",
            "recovery_days": 0.5,
            "applied": "Reassess resupply" in active_mitigations
        }
    ]

    return {
        "station_id": "MAITRI",
        "outdoor_temp_c": temp_c,
        "temperature_c": temp_c,
        "wind_speed_kmh": effective_wind_kmh,
        "wind_speed_knots": round(effective_wind_kmh / 1.852, 1),
        "wind_direction": wind_card,
        "wind_direction_cardinal": wind_card,
        "heating_demand_kw": total_heating_demand_kw,
        "heating_demand_kwth": total_heating_demand_kw,
        "power_load_kw": total_power_load_kw,
        "power_demand_kwe": total_power_load_kw,
        "active_generators": 2 if effective_gen_capacity_kwe > 120.0 else 1,
        "running_genset_ids": ["DG-01", "DG-02"] if effective_gen_capacity_kwe > 120.0 else ["DG-01"],
        "generator_load_pct": generator_load_pct,
        "genset_load_pct": generator_load_pct,
        "reserve_margin_kw": reserve_margin_kwe,
        "reserve_margin_pct": reserve_margin_pct,
        "daily_fuel_l": total_daily_fuel_l,
        "fuel_burn_rate_l_day": total_daily_fuel_l,
        "fuel_burn_rate_l_hr": round(total_daily_fuel_l / 24.0, 1),
        "fuel_storage_remaining_l": usable_fuel_l,
        "fuel_endurance_days": fuel_endurance_days,
        "mission_autonomy_days": mission_autonomy_days,
        "limiting_constraint": limiting_constraint,
        "water_endurance_days": water_endurance_days,
        "provisions_endurance_days": provisions_endurance_days,
        "lake_water_intake_status": lake_water_intake_status,
        "pipe_trace_heating_kw": heat_tracing_electric_kw,
        "field_transit_status": field_transit_status,
        "endurance_breakdown": all_endurances,
        "scenario_impact": {
            "active_scenario": scenario_name or "NONE",
            "severity_pct": severity if scenario_name else 0.0,
            "baseline_autonomy_days": baseline_autonomy_days,
            "scenario_autonomy_days": scenario_raw_autonomy_days,
            "mitigated_autonomy_days": mitigated_autonomy_days,
            "active_mitigations": active_mitigations,
            "mitigation_options": mitigation_options
        },
        "field_envelope": {
            "status": field_status,
            "description": field_envelope_desc
        },
        "why_explanation": why_explanation,
        "why_autonomy_changed": why_autonomy_changed,
        "deltas": {
            "delta_temp": delta_temp,
            "delta_heating_pct": delta_heating_pct,
            "delta_power_pct": delta_power_pct,
            "delta_fuel_pct": delta_fuel_pct,
            "delta_autonomy": delta_autonomy
        },
        "data_classes": {
            "weather": "REPLAY",
            "heating": "DERIVED",
            "power": "SIMULATED",
            "fuel": "SIMULATED",
            "autonomy": "DERIVED"
        }
    }
