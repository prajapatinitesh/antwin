import json
from fastapi import APIRouter
from app.core.config import DOCS_CONTENT_DIR
from app.core.provenance import make_provenance, DataClass, TemporalStatus

router = APIRouter(prefix="/provenance", tags=["Provenance"])

@router.get("/sources")
def get_sources():
    sources_path = DOCS_CONTENT_DIR / "sources.json"
    if sources_path.exists():
        with open(sources_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/{entity_type}/{entity_id}")
def get_entity_provenance(entity_type: str, entity_id: str):
    """
    Returns full provenance record explaining data source, temporal status,
    confidence rating, and calculation inputs.
    """
    etype = entity_type.lower()
    if etype == "environment":
        if "BHARATI" in entity_id.upper():
            return make_provenance(
                data_class=DataClass.REPLAY,
                source="Bharati 7-Day Winter Operational Replay (168h NCPOR/IIG/IMD AWS Calibration)",
                source_year=2015,
                station="Bharati",
                temporal_status=TemporalStatus.HISTORICAL_REFERENCE,
                confidence="HIGH",
                notes="Deterministic 168-hour winter replay calibrated on coastal Larsemann Hills meteorological structure."
            )
        return make_provenance(
            data_class=DataClass.REPLAY,
            source="Maitri 7-Day Winter Operational Replay (168h IMD/AWS Ground Calibration)",
            source_year=2024,
            station=entity_id,
            temporal_status=TemporalStatus.HISTORICAL,
            confidence="HIGH",
            notes="Deterministic 168-hour winter replay calibrated on Schirmacher Oasis surface meteorology."
        )
    elif etype == "station":
        return make_provenance(
            data_class=DataClass.REFERENCE,
            source="NCPOR Expedition Planning Advisory / Official Technical Tender",
            source_year=2022 if "MAITRI" in entity_id.upper() else 2017,
            station=entity_id,
            temporal_status=TemporalStatus.CURRENT,
            confidence="HIGH",
            notes="Verified documented civil and mechanical baseline parameters."
        )
    elif etype == "generator":
        return make_provenance(
            data_class=DataClass.SIMULATED,
            source="Polar Station Telemetry Simulator (Engine 26060)",
            source_year=2025,
            station=entity_id,
            temporal_status=TemporalStatus.SIMULATED,
            confidence="SIMULATED",
            notes="Private SCADA BMS telemetry is unavailable publicly; deterministically simulated based on historical kVA curves."
        )
    elif etype == "autonomy":
        return make_provenance(
            data_class=DataClass.DERIVED,
            source="ANTWIN Mission Autonomy Multi-Constraint Engine",
            source_year=2025,
            station=entity_id,
            temporal_status=TemporalStatus.CURRENT,
            confidence="HIGH",
            formula="min(energy_endurance, fuel_endurance, water_endurance, provisions_endurance, critical_spares, asset_margin, logistics_buffer)",
            inputs=["generator_margin", "fuel_level_l", "ration_store_kg", "spare_manifest", "vessel_eta_days"],
            notes="ANTWIN Derived metric. Transparent and explainable bottleneck analysis."
        )
    else:
        return make_provenance(
            data_class=DataClass.SIMULATED,
            source="ANTWIN Operational Model",
            source_year=2025,
            station=entity_id,
            temporal_status=TemporalStatus.CURRENT
        )
