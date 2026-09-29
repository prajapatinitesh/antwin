import pytest
from app.replay.bharati_replay import get_bharati_replay_engine
from app.simulation.bharati_operational_model import calculate_bharati_operational_state
from app.simulation.bharati_schematic import get_bharati_schematic_zones

def test_bharati_replay_engine_initialization():
    engine = get_bharati_replay_engine()
    assert engine.total_records == 168
    assert engine.mode == "REPLAY"
    assert engine.speed == 2.0
    obs = engine.get_current_observation()
    assert "temperature_c" in obs
    assert "wind_speed_knots" in obs
    assert obs["station"] == "BHARATI"

def test_bharati_replay_engine_seek_and_tick():
    engine = get_bharati_replay_engine()
    engine.seek(10)
    assert engine.current_index == 10
    
    state = engine.tick(hours_forward=2)
    assert engine.current_index == 12
    assert "current_operations" in state
    assert state["current_operations"]["station"] == "BHARATI"

def test_bharati_chp_operational_correlations():
    engine = get_bharati_replay_engine()
    obs = engine.get_current_observation()
    op_state = calculate_bharati_operational_state(obs)
    
    # Verify 3 x 100 kVA CHP units are present
    power = op_state["power_state"]
    chp_units = power["chp_units"]
    assert len(chp_units) == 3
    assert chp_units[0]["id"] == "CHP-01"
    assert chp_units[1]["id"] == "CHP-02"
    assert chp_units[2]["id"] == "CHP-03"
    
    # Normal operation: CHP-01 and CHP-02 RUNNING, CHP-03 STANDBY
    assert chp_units[0]["status"] == "RUNNING"
    assert chp_units[1]["status"] == "RUNNING"
    assert chp_units[2]["status"] == "STANDBY"
    
    # Power and thermal margins
    assert power["power_margin_kwe"] > 0
    assert op_state["thermal_state"]["total_demand_kwth"] >= 42.0

def test_bharati_water_system_correlations():
    engine = get_bharati_replay_engine()
    obs = engine.get_current_observation()
    op_state = calculate_bharati_operational_state(obs)
    
    water = op_state["water_state"]
    assert "Quilty Bay" in water["intake_source"]
    assert water["production_rate_l_per_day"] == 12000.0
    assert water["consumption_rate_l_per_day"] > 4000.0
    assert water["storage_level_l"] > 10000.0
    assert water["water_endurance_days"] > 30.0

def test_bharati_hero_scenario_chp02_failure():
    engine = get_bharati_replay_engine()
    obs = engine.get_current_observation()
    
    nominal_state = calculate_bharati_operational_state(obs)
    failed_state = calculate_bharati_operational_state(
        obs,
        scenario={"name": "CHP-02 Failure", "severity": 100.0, "mitigations": []}
    )
    
    # Available generation drops and CHP-02 is marked FAILED
    nom_avail = nominal_state["power_state"]["available_generation_kwe"]
    fail_avail = failed_state["power_state"]["available_generation_kwe"]
    
    chp02_unit = next(u for u in failed_state["power_state"]["chp_units"] if u["id"] == "CHP-02")
    assert chp02_unit["status"] == "FAILED"
    
    # Autonomy or power margin decreases
    assert failed_state["power_state"]["power_margin_kwe"] < nominal_state["power_state"]["power_margin_kwe"]

def test_bharati_ro_plant_degradation_scenario():
    engine = get_bharati_replay_engine()
    obs = engine.get_current_observation()
    
    nominal_state = calculate_bharati_operational_state(obs)
    ro_degraded = calculate_bharati_operational_state(
        obs,
        scenario={"name": "RO Plant Degradation", "severity": 60.0, "mitigations": []}
    )
    
    # Water production drops significantly
    assert ro_degraded["water_state"]["production_rate_l_per_day"] < nominal_state["water_state"]["production_rate_l_per_day"]
    assert ro_degraded["water_state"]["ro_plant_status"] in ["WARNING", "CRITICAL"]

def test_bharati_schematic_zones():
    engine = get_bharati_replay_engine()
    obs = engine.get_current_observation()
    op_state = calculate_bharati_operational_state(obs)
    zones = get_bharati_schematic_zones(op_state)
    
    assert len(zones) == 7
    zone_ids = [z["id"] for z in zones]
    assert "bha_level1_garage" in zone_ids
    assert "bha_level2_plant" in zone_ids
    assert "bha_level3_living" in zone_ids
    assert "bha_level4_ops" in zone_ids
    assert "bha_quilty_pump" in zone_ids
    assert "bha_fuel_farm" in zone_ids
    assert "bha_summer_camp" in zone_ids
