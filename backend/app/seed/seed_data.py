import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.entities import (
    Station, Asset, FuelTank, InventoryItem, PersonnelState,
    Expedition, Cargo, DependencyEdge, DataSource, Alert, CommunicationState
)
from app.core.config import DOCS_CONTENT_DIR
from app.core.provenance import make_provenance, DataClass, TemporalStatus

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_database():
    init_db()
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Station).first():
            print("Database already seeded.")
            return

        print("Seeding ANTWIN database from reference files...")

        # 1. Sources
        sources_path = DOCS_CONTENT_DIR / "sources.json"
        if sources_path.exists():
            with open(sources_path, "r", encoding="utf-8") as f:
                sources_data = json.load(f)
                for s in sources_data:
                    ds = DataSource(
                        id=s.get("id"),
                        title=s.get("title"),
                        publisher=s.get("publisher"),
                        data_class=s.get("data_class", "REFERENCE"),
                        temporal_status=s.get("temporal_status", "CURRENT"),
                        url=s.get("url"),
                        use_tags_json=json.dumps(s.get("use", []))
                    )
                    db.add(ds)

        # 2. Stations
        maitri = Station(
            id="MAITRI",
            code="MAI",
            name="Maitri Station",
            tagline="Science for a sustainable future",
            latitude=-70.7668,
            longitude=11.7308,
            elevation=117.0,
            location_desc="Schirmacher Oasis, Dronning Maud Land",
            winter_capacity=25,
            summer_capacity=65,
            status="OPERATIONAL",
            data_class="REFERENCE",
            image_url="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80",
            provenance_json=json.dumps(make_provenance(
                data_class=DataClass.REFERENCE,
                source="NCPOR Planning Advisory 2022",
                source_year=2022,
                station="Maitri"
            ))
        )
        db.add(maitri)

        bharati = Station(
            id="BHARATI",
            code="BHA",
            name="Bharati Station",
            tagline="Next-generation green polar architecture",
            latitude=-69.4068,
            longitude=76.19525,
            elevation=35.0,
            location_desc="Larsemann Hills, Ingrid Christensen Coast",
            winter_capacity=47,
            summer_capacity=72,
            status="OPERATIONAL",
            data_class="REFERENCE",
            image_url="https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1000&q=80",
            provenance_json=json.dumps(make_provenance(
                data_class=DataClass.REFERENCE,
                source="NCPOR Bharati Tender TD-22062017",
                source_year=2017,
                station="Bharati"
            ))
        )
        db.add(bharati)

        # 3. Assets
        assets_seed = [
            ("MAITRI-DG-01", "MAITRI", "GENERATOR", "Maitri Prime Generator 01", "CRITICAL", 125.0, "kVA", "NORMAL", 94.0),
            ("MAITRI-DG-02", "MAITRI", "GENERATOR", "Maitri Prime Generator 02", "CRITICAL", 125.0, "kVA", "NORMAL", 91.0),
            ("MAITRI-BLR-01", "MAITRI", "BOILER", "Hydronic Heating Furnace 01", "HIGH", 150.0, "kWth", "NORMAL", 88.0),
            ("MAITRI-BLR-02", "MAITRI", "BOILER", "Hydronic Heating Furnace 02", "HIGH", 150.0, "kWth", "NORMAL", 86.0),
            ("MAITRI-RO-01", "MAITRI", "RO_PLANT", "Priyadarshini Lake RO System", "HIGH", 2500.0, "L/day", "NORMAL", 92.0),
            ("BHARATI-CHP-01", "BHARATI", "CHP", "Bharati CHP Unit 01", "CRITICAL", 100.0, "kVA", "NORMAL", 97.0),
            ("BHARATI-CHP-02", "BHARATI", "CHP", "Bharati CHP Unit 02", "CRITICAL", 100.0, "kVA", "NORMAL", 96.0),
            ("BHARATI-CHP-03", "BHARATI", "CHP", "Bharati CHP Unit 03", "CRITICAL", 100.0, "kVA", "STANDBY", 95.0),
            ("BHARATI-RO-01", "BHARATI", "RO_PLANT", "Quilty Bay Seawater RO Plant", "HIGH", 3500.0, "L/day", "NORMAL", 94.0)
        ]
        for aid, st_id, atype, name, crit, cap, unit, state, health in assets_seed:
            asset = Asset(
                id=aid,
                station_id=st_id,
                asset_type=atype,
                name=name,
                criticality=crit,
                rated_capacity=cap,
                unit=unit,
                state=state,
                health_pct=health,
                data_class="SIMULATED",
                provenance_json=json.dumps(make_provenance(
                    data_class=DataClass.SIMULATED,
                    source="Polar Station Telemetry Simulator",
                    station=st_id,
                    unit=unit
                ))
            )
            db.add(asset)

        # 4. Fuel Tanks
        maitri_tank = FuelTank(
            id="MAITRI-TANK-01",
            station_id="MAITRI",
            name="Maitri Polar Diesel Main Storage",
            capacity_l=300000.0,
            current_level_l=214500.0,
            fuel_type="Polar Diesel",
            daily_consumption_l=2800.0,
            data_class="SIMULATED"
        )
        db.add(maitri_tank)

        bharati_tank = FuelTank(
            id="BHARATI-TANK-01",
            station_id="BHARATI",
            name="Bharati Jet A-1 Main Farm",
            capacity_l=296000.0,
            current_level_l=242000.0,
            fuel_type="JET A-1",
            daily_consumption_l=2100.0,
            data_class="REFERENCE"
        )
        db.add(bharati_tank)

        # 5. Expeditions and Cargo
        expedition = Expedition(
            id="EXP-44-ISEA",
            name="44th Indian Scientific Expedition to Antarctica",
            season="2024-2025",
            status="ACTIVE",
            route="Goa -> Cape Town -> India Bay / Prydz Bay"
        )
        db.add(expedition)

        cargo_maitri = Cargo(
            id="CARGO-44-01",
            expedition_id="EXP-44-ISEA",
            station_id="MAITRI",
            category="FUEL_AND_SPARES",
            item_name="Polar Generator Spares & Aviation Jet Fuel",
            quantity=85.0,
            origin="Cape Town",
            current_stage="Expedition Vessel",
            eta_days=12,
            delay_days=0,
            status="EN_ROUTE"
        )
        db.add(cargo_maitri)

        # 6. Communication States
        comm_m = CommunicationState(station_id="MAITRI", link_status="CONNECTED", queued_records=0, latency_ms=640)
        comm_b = CommunicationState(station_id="BHARATI", link_status="CONNECTED", queued_records=0, latency_ms=580)
        db.add(comm_m)
        db.add(comm_b)

        # 7. Dependency Edges
        dep_path = DOCS_CONTENT_DIR / "dependency_graph.json"
        if dep_path.exists():
            with open(dep_path, "r", encoding="utf-8") as f:
                dep_data = json.load(f)
                for edge in dep_data.get("edges", []):
                    de = DependencyEdge(
                        station_id="ALL",
                        source_node=edge.get("source"),
                        target_node=edge.get("target"),
                        relationship=edge.get("relationship"),
                        propagation_type="DIRECT" if "constrains" in edge.get("relationship", "") else "NORMAL"
                    )
                    db.add(de)

        db.commit()
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
