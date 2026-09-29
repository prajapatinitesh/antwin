from fastapi import APIRouter
from app.schemas.schemas import SimulationRequest, RecalculateMitigationRequest
from app.simulation.scenarios import run_scenario_simulation

router = APIRouter(prefix="/simulation", tags=["Simulation"])

# In-memory storage for active demo simulation runs
_sim_cache = {}

@router.post("/run")
def run_simulation(req: SimulationRequest):
    """
    Executes an isolated simulation of injected environmental and asset failures.
    Returns cascading steps, key metrics deltas, system health impact, and mitigations.
    """
    params = req.parameters
    result = run_scenario_simulation(
        station_id=req.station_id,
        scenario_type=req.scenario_type,
        scenario_name=req.scenario_name,
        temperature_c=params.temperature_c,
        wind_speed_kmh=params.wind_speed_kmh,
        resupply_delay_days=params.resupply_delay_days,
        generator_degradation_pct=params.generator_degradation_pct,
        ro_degradation_pct=params.ro_degradation_pct,
        seawater_pump_failure=params.seawater_pump_failure,
        occupancy_change=params.occupancy_change,
        load_shedding_active=params.non_critical_load_shedding,
        optimize_heating_active=params.optimize_heating_setpoints,
        redistribute_active=params.redistribute_generator_load,
        verify_spares_active=params.verify_critical_spares
    )
    _sim_cache[result["simulation_id"]] = result
    return result

@router.post("/recalculate-mitigation")
def recalculate_mitigation(req: RecalculateMitigationRequest):
    """
    Recalculates autonomy recovery after operator activates explainable mitigations.
    """
    active_mitigations = req.selected_mitigations
    cached = _sim_cache.get(req.simulation_id, {})
    
    station_id = cached.get("station_id", "MAITRI")
    scenario_type = cached.get("scenario_type", "COMBINED")
    scenario_name = f"{cached.get('scenario_name', 'Scenario')} (Mitigated)"
    temp_c = cached.get("parameters", {}).get("temperature_c", -35.0)
    wind_kmh = cached.get("parameters", {}).get("wind_speed_kmh", 60.0)
    resupply_delay = cached.get("parameters", {}).get("resupply_delay_days", 7)
    gen_deg = cached.get("parameters", {}).get("generator_degradation_pct", 50.0)
    ro_deg = cached.get("parameters", {}).get("ro_degradation_pct", 0.0)
    seawater_pump = cached.get("parameters", {}).get("seawater_pump_failure", False)
    occ = cached.get("parameters", {}).get("occupancy_change", 0)

    result = run_scenario_simulation(
        station_id=station_id,
        scenario_type=scenario_type,
        scenario_name=scenario_name,
        temperature_c=temp_c,
        wind_speed_kmh=wind_kmh,
        resupply_delay_days=resupply_delay,
        generator_degradation_pct=gen_deg,
        ro_degradation_pct=ro_deg,
        seawater_pump_failure=seawater_pump,
        occupancy_change=occ,
        load_shedding_active="mitigation_load_shedding" in active_mitigations,
        optimize_heating_active="mitigation_optimize_heating" in active_mitigations,
        redistribute_active="mitigation_redistribute_load" in active_mitigations,
        verify_spares_active="mitigation_verify_spares" in active_mitigations
    )
    _sim_cache[result["simulation_id"]] = result
    return result


@router.get("/{simulation_id}")
def get_simulation(simulation_id: str):
    return _sim_cache.get(simulation_id, run_scenario_simulation())
