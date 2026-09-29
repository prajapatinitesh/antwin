from typing import Dict, Any

def calculate_thermal_demand(
    outdoor_temp_c: float,
    occupancy: int,
    base_thermal_kw: float = 40.0,
    comfort_temp_c: float = 18.0,
    thermal_sensitivity_kw_per_c: float = 2.2,
    occupancy_factor_kw: float = 0.15,
    heating_optimization_active: bool = False
) -> Dict[str, Any]:
    """
    Computes Antarctic station thermal demand.
    ANTWIN Derived model:
    thermal_demand = base_thermal + thermal_sensitivity * max(0, comfort_temp - outdoor_temp) + occupancy * occupancy_factor
    If heating optimization is active, safe setpoint adjustment saves ~15% of temperature delta demand.
    """
    temp_delta = max(0.0, comfort_temp_c - outdoor_temp_c)
    
    if heating_optimization_active:
        # Smart setpoint adjustment (e.g., unoccupied zones 15°C instead of 18°C)
        temp_delta *= 0.85

    weather_thermal_load = thermal_sensitivity_kw_per_c * temp_delta
    human_thermal_load = occupancy * occupancy_factor_kw
    total_thermal_kw = base_thermal_kw + weather_thermal_load + human_thermal_load

    return {
        "total_thermal_demand_kw": round(total_thermal_kw, 1),
        "base_thermal_kw": base_thermal_kw,
        "weather_thermal_load_kw": round(weather_thermal_load, 1),
        "human_thermal_load_kw": round(human_thermal_load, 1),
        "outdoor_temp_c": outdoor_temp_c,
        "temp_delta_c": round(temp_delta, 1),
        "heating_optimization_active": heating_optimization_active,
        "formula": "base_thermal + 2.2 * max(0, 18 - outdoor_temp) + 0.15 * occupancy"
    }
