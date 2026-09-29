from typing import Dict, Any, List

def calculate_power_state(
    station_id: str,
    base_electrical_load_kw: float,
    thermal_load_kw: float,
    occupancy: int,
    generators: List[Dict[str, Any]],
    load_shedding_active: bool = False,
    redistribute_active: bool = False
) -> Dict[str, Any]:
    """
    Computes electrical generation, auxiliary heating load, total electrical demand,
    and power reserve margins across active/standby generator sets.
    """
    # Auxiliary electric heater & HVAC circulation load derived from thermal demand
    aux_heating_electric_kw = thermal_load_kw * 0.22
    occupancy_electric_kw = occupancy * 0.25

    gross_load_kw = base_electrical_load_kw + aux_heating_electric_kw + occupancy_electric_kw

    # Non-critical load shedding can reduce load by ~18 kW (scientific chillers, non-essential lighting)
    shed_load_kw = 0.0
    if load_shedding_active:
        shed_load_kw = gross_load_kw * 0.12
        gross_load_kw -= shed_load_kw

    # Available generation capacity
    total_installed_capacity_kw = 0.0
    available_generation_kw = 0.0
    generator_status_list = []

    for gen in generators:
        rated_cap = gen.get("rated_capacity", 125.0)
        total_installed_capacity_kw += rated_cap
        health = gen.get("health_pct", 100.0) / 100.0
        state = gen.get("state", "NORMAL")

        if state == "FAILED":
            effective_cap = 0.0
        elif state == "DEGRADED" or health < 0.6:
            # Degraded capacity factor e.g., 50-65%
            effective_cap = rated_cap * max(0.4, health)
        else:
            effective_cap = rated_cap

        available_generation_kw += effective_cap
        generator_status_list.append({
            "id": gen.get("id"),
            "name": gen.get("name"),
            "rated_capacity": rated_cap,
            "effective_capacity": round(effective_cap, 1),
            "state": state,
            "health_pct": round(health * 100, 1)
        })

    net_margin_kw = available_generation_kw - gross_load_kw
    margin_pct = (net_margin_kw / available_generation_kw * 100.0) if available_generation_kw > 0 else 0.0
    load_pct = (gross_load_kw / available_generation_kw * 100.0) if available_generation_kw > 0 else 100.0

    return {
        "station_id": station_id,
        "total_electrical_load_kw": round(gross_load_kw, 1),
        "base_load_kw": round(base_electrical_load_kw, 1),
        "aux_heating_electric_kw": round(aux_heating_electric_kw, 1),
        "occupancy_electric_kw": round(occupancy_electric_kw, 1),
        "shed_load_kw": round(shed_load_kw, 1),
        "available_generation_kw": round(available_generation_kw, 1),
        "total_installed_capacity_kw": round(total_installed_capacity_kw, 1),
        "reserve_margin_kw": round(net_margin_kw, 1),
        "reserve_margin_pct": round(max(0.0, margin_pct), 1),
        "load_pct": round(min(100.0, load_pct), 1),
        "generators": generator_status_list,
        "load_shedding_active": load_shedding_active,
        "redistribute_active": redistribute_active
    }
