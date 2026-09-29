from typing import Dict, Any, List
from app.core.provenance import make_provenance, DataClass, TemporalStatus

def calculate_mission_autonomy(
    energy_days: float,
    fuel_days: float,
    water_days: float,
    provisions_days: float,
    spare_days: float,
    asset_margin_days: float,
    logistics_days: float,
    station_id: str = "MAITRI"
) -> Dict[str, Any]:
    """
    Transparent explainable multi-constraint Mission Autonomy engine.
    MA = min(
      energy_endurance,
      fuel_endurance,
      water_endurance,
      provisions_endurance,
      critical_spare_coverage,
      critical_asset_margin,
      logistics_accessibility
    )
    """
    endurances = {
        "Critical Asset Margin": round(asset_margin_days, 1),
        "Spare Parts Coverage": round(spare_days, 1),
        "Energy Endurance": round(energy_days, 1),
        "Logistics Accessibility": round(logistics_days, 1),
        "Fuel Endurance": round(fuel_days, 1),
        "Water Supply": round(water_days, 1),
        "Food Provisions": round(provisions_days, 1),
    }

    # Limiting constraint is the minimum value
    limiting_constraint = min(endurances, key=endurances.get)
    min_days = endurances[limiting_constraint]

    # Status classification
    if min_days < 7.0:
        status = "Critical Risk"
    elif min_days < 14.0:
        status = "Within Safe Range"
    else:
        status = "Optimal Buffer"

    # Explanation chain
    explanation = [
        f"Overall station mission autonomy is constrained to {min_days} days by {limiting_constraint}.",
        f"Secondary bottleneck: {sorted(endurances.items(), key=lambda x: x[1])[1][0]} ({sorted(endurances.items(), key=lambda x: x[1])[1][1]} days).",
        f"Critical spare coverage ({spare_days}d) and asset margin ({asset_margin_days}d) restrict long-term unassisted operation under current winter degradation."
    ]

    mitigations = [
        "Perform preventive inspection and load redistribution on critical generating units.",
        "Shed non-critical scientific loads during off-peak windows to extend fuel and power endurance.",
        "Verify backup RO membrane inventory and critical gasket spares in logistics manifest."
    ]

    provenance = make_provenance(
        data_class=DataClass.DERIVED,
        source="ANTWIN Mission Autonomy Multi-Constraint Engine",
        source_year=2025,
        station=station_id,
        unit="days",
        temporal_status=TemporalStatus.CURRENT,
        confidence="HIGH",
        formula="min(energy, fuel, water, provisions, spares, asset_margin, logistics)",
        inputs=[
            "generator_reserve_margin", "fuel_tank_inventory",
            "potable_water_storage", "cold_chain_ration_ledger",
            "critical_spare_manifest", "cargo_pipeline_eta"
        ]
    )

    return {
        "station_id": station_id,
        "overall_autonomy_days": min_days,
        "status": status,
        "limiting_constraint": limiting_constraint,
        "breakdown": {
            "energy_days": round(energy_days, 1),
            "fuel_days": round(fuel_days, 1),
            "water_days": round(water_days, 1),
            "provisions_days": round(provisions_days, 1),
            "spare_days": round(spare_days, 1),
            "asset_margin_days": round(asset_margin_days, 1),
            "logistics_days": round(logistics_days, 1),
        },
        "explanation_chain": explanation,
        "mitigations": mitigations,
        "data_class": "DERIVED",
        "provenance": provenance
    }
