import pytest
from app.replay.maitri_replay import get_maitri_replay_engine
from app.simulation.maitri_operational_model import calculate_maitri_operational_state
from app.simulation.maitri_schematic import get_maitri_schematic_zones
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_maitri_replay_engine_initialization():
    engine = get_maitri_replay_engine()
    assert engine.total_records >= 168
    status = engine.get_status()
    assert status["total_records"] >= 168
    assert "current_weather" in status
    assert "current_operations" in status
    assert status["mode"] in ["REPLAY", "LIVE", "DEMO"]

def test_maitri_replay_engine_seek_and_tick():
    engine = get_maitri_replay_engine()
    engine.is_playing = True
    engine.seek(10)
    assert engine.current_index == 10
    
    obs = engine.tick()
    assert engine.current_index == 11
    assert "temperature_c" in obs


def test_maitri_operational_physical_correlations():
    # Mild polar baseline
    mild_obs = {"temperature_c": -10.0, "wind_speed_kmh": 15.0, "wind_direction_cardinal": "SE"}
    mild_ops = calculate_maitri_operational_state(mild_obs)
    
    # Severe blizzard condition
    blizzard_obs = {"temperature_c": -35.0, "wind_speed_kmh": 75.0, "wind_direction_cardinal": "SE"}
    blizzard_ops = calculate_maitri_operational_state(blizzard_obs, previous_state=mild_ops)

    # 1. Thermal demand must increase significantly in severe conditions
    assert blizzard_ops["heating_demand_kw"] > mild_ops["heating_demand_kw"]
    
    # 2. Electrical demand must increase due to trace heating & circulation
    assert blizzard_ops["power_load_kw"] > mild_ops["power_load_kw"]
    
    # 3. Fuel burn rate must increase with higher generator load
    assert blizzard_ops["daily_fuel_l"] > mild_ops["daily_fuel_l"]
    
    # 4. Mission autonomy days must drop as fuel burns faster or logistics drops
    assert blizzard_ops["mission_autonomy_days"] <= mild_ops["mission_autonomy_days"]

    # 5. Field envelope reflects blizzard lockdown
    assert blizzard_ops["field_envelope"]["status"] == "CRITICAL_SUSPENSION"
    assert "blizzard" in blizzard_ops["field_envelope"]["description"].lower()

    # 6. Why explanation chain has 5 causal steps
    assert len(blizzard_ops["why_explanation"]) == 5

def test_maitri_schematic_zones():
    mild_obs = {"temperature_c": -15.0, "wind_speed_kmh": 20.0}
    mild_ops = calculate_maitri_operational_state(mild_obs)
    zones = get_maitri_schematic_zones(mild_ops)
    
    zone_ids = [z["id"] for z in zones]
    assert "main_building" in zone_ids
    assert "generator_complex" in zone_ids
    assert "fuel_farm" in zone_ids
    assert "water_pump_house" in zone_ids
    assert "summer_camp" in zone_ids
    assert "garage_workshop" in zone_ids
    assert "container_storage" in zone_ids

def test_maitri_replay_api_endpoints():
    # 1. /api/maitri/replay/current
    res = client.get("/api/maitri/replay/current")
    assert res.status_code == 200
    data = res.json()
    assert "current_weather" in data
    assert "current_operations" in data

    # 2. /api/maitri/replay/tick
    res = client.post("/api/maitri/replay/tick")
    assert res.status_code == 200
    ticked = res.json()
    assert "index" in ticked

    # 3. /api/maitri/schematic/zones
    res = client.get("/api/maitri/schematic/zones")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones["zones"]) == 7

    # 4. /api/maitri/assets/fleet
    res = client.get("/api/maitri/assets/fleet")
    assert res.status_code == 200
    fleet = res.json()
    assert "fleet" in fleet
    assert len(fleet["fleet"]) >= 5
