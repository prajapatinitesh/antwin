from typing import Dict, Any

def calculate_fuel_state(
    current_fuel_l: float,
    total_capacity_l: float,
    electrical_load_kw: float,
    thermal_load_kw: float,
    generator_efficiency_penalty: float = 0.0,
    vehicle_daily_fuel_l: float = 120.0,
    usable_fraction: float = 0.95
) -> Dict[str, Any]:
    """
    Computes daily fuel consumption and remaining fuel endurance in days.
    ANTWIN Derived model:
    fuel_endurance_days = usable_fuel_l / projected_daily_fuel_consumption_l
    """
    # Generator specific fuel consumption ~ 0.27 L/kWh at nominal load
    specific_fuel_rate = 0.27 * (1.0 + generator_efficiency_penalty)
    generator_daily_fuel_l = electrical_load_kw * 24.0 * specific_fuel_rate

    # Heating burner fuel consumption
    heating_daily_fuel_l = thermal_load_kw * 24.0 * 0.065

    # Total daily consumption
    total_daily_consumption_l = generator_daily_fuel_l + heating_daily_fuel_l + vehicle_daily_fuel_l

    usable_fuel_l = current_fuel_l * usable_fraction
    endurance_days = usable_fuel_l / total_daily_consumption_l if total_daily_consumption_l > 0 else 0.0
    fuel_pct = (current_fuel_l / total_capacity_l * 100.0) if total_capacity_l > 0 else 0.0

    return {
        "total_capacity_l": round(total_capacity_l, 1),
        "current_fuel_l": round(current_fuel_l, 1),
        "usable_fuel_l": round(usable_fuel_l, 1),
        "fuel_pct": round(fuel_pct, 1),
        "daily_consumption_l": round(total_daily_consumption_l, 1),
        "generator_daily_fuel_l": round(generator_daily_fuel_l, 1),
        "heating_daily_fuel_l": round(heating_daily_fuel_l, 1),
        "vehicle_daily_fuel_l": round(vehicle_daily_fuel_l, 1),
        "fuel_endurance_days": round(endurance_days, 1),
        "efficiency_penalty": generator_efficiency_penalty,
        "formula": "(current_fuel_l * 0.95) / projected_daily_consumption_l"
    }
