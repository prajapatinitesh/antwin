import pytest
from app.simulation.thermal import calculate_thermal_demand
from app.simulation.power import calculate_power_state
from app.simulation.fuel import calculate_fuel_state
from app.services.autonomy import calculate_mission_autonomy
from app.simulation.scenarios import run_scenario_simulation

def test_thermal_demand_increases_with_cold():
    baseline = calculate_thermal_demand(outdoor_temp_c=-18.5, occupancy=25)
    cold_snap = calculate_thermal_demand(outdoor_temp_c=-35.0, occupancy=25)
    
    assert cold_snap["total_thermal_demand_kw"] > baseline["total_thermal_demand_kw"]
    assert cold_snap["temp_delta_c"] == 53.0

def test_power_state_calculation_and_margin():
    generators = [
        {"id": "G1", "rated_capacity": 125.0, "health_pct": 100.0, "state": "NORMAL"},
        {"id": "G2", "rated_capacity": 125.0, "health_pct": 100.0, "state": "NORMAL"}
    ]
    power = calculate_power_state("MAITRI", base_electrical_load_kw=41.0, thermal_load_kw=82.0, occupancy=25, generators=generators)
    
    assert power["available_generation_kw"] == 250.0
    assert power["reserve_margin_kw"] > 0
    assert power["reserve_margin_pct"] > 50.0

def test_fuel_endurance_formula():
    fuel = calculate_fuel_state(
        current_fuel_l=214500.0,
        total_capacity_l=300000.0,
        electrical_load_kw=65.0,
        thermal_load_kw=82.0
    )
    assert fuel["fuel_endurance_days"] > 0
    assert fuel["usable_fuel_l"] == 214500.0 * 0.95
    assert fuel["fuel_pct"] == round(214500.0 / 300000.0 * 100, 1)

def test_mission_autonomy_identifies_limiting_constraint():
    autonomy = calculate_mission_autonomy(
        energy_days=9.1,
        fuel_days=11.4,
        water_days=15.6,
        provisions_days=17.8,
        spare_days=8.7,
        asset_margin_days=6.6,
        logistics_days=9.0,
        station_id="MAITRI"
    )
    assert autonomy["overall_autonomy_days"] == 6.6
    assert autonomy["limiting_constraint"] == "Critical Asset Margin"
    assert autonomy["data_class"] == "DERIVED"

def test_scenario_cascade_and_mitigation():
    # Run primary demo scenario
    sim = run_scenario_simulation(
        station_id="MAITRI",
        temperature_c=-35.0,
        wind_speed_kmh=60.0,
        resupply_delay_days=7,
        generator_degradation_pct=50.0,
        load_shedding_active=False,
        optimize_heating_active=False,
        redistribute_active=False,
        verify_spares_active=False
    )
    
    assert sim["scenario_autonomy_days"] == 6.8
    assert sim["baseline_autonomy_days"] == 11.2
    assert len(sim["cascade_steps"]) == 8
    
    # Run with mitigations applied
    mitigated = run_scenario_simulation(
        station_id="MAITRI",
        temperature_c=-35.0,
        wind_speed_kmh=60.0,
        resupply_delay_days=7,
        generator_degradation_pct=50.0,
        load_shedding_active=True,
        optimize_heating_active=True,
        redistribute_active=True,
        verify_spares_active=True
    )
    assert mitigated["mitigated_autonomy_days"] > sim["scenario_autonomy_days"]
    assert mitigated["mitigated_autonomy_days"] == 9.4
