from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Station(Base):
    __tablename__ = "stations"

    id = Column(String(50), primary_key=True, index=True)  # "MAITRI", "BHARATI"
    code = Column(String(20), unique=True, index=True)
    name = Column(String(100), nullable=False)
    tagline = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, nullable=False)
    location_desc = Column(String(200), nullable=False)
    winter_capacity = Column(Integer, default=25)
    summer_capacity = Column(Integer, default=65)
    status = Column(String(50), default="OPERATIONAL")  # OPERATIONAL, CAUTION, CRITICAL
    data_class = Column(String(20), default="REFERENCE")
    provenance_json = Column(Text, nullable=True)
    image_url = Column(String(300), nullable=True)

    # Relationships
    assets = relationship("Asset", back_populates="station", cascade="all, delete-orphan")
    environment_observations = relationship("EnvironmentObservation", back_populates="station", cascade="all, delete-orphan")
    fuel_tanks = relationship("FuelTank", back_populates="station", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="station", cascade="all, delete-orphan")
    personnel_records = relationship("PersonnelState", back_populates="station", cascade="all, delete-orphan")
    cargos = relationship("Cargo", back_populates="station", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="station", cascade="all, delete-orphan")
    autonomy_snapshots = relationship("AutonomySnapshot", back_populates="station", cascade="all, delete-orphan")
    communication_states = relationship("CommunicationState", back_populates="station", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(100), primary_key=True, index=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    asset_type = Column(String(50), nullable=False)  # GENERATOR, CHP, BOILER, PUMP, VEHICLE, RO_PLANT, HVAC
    name = Column(String(150), nullable=False)
    criticality = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    rated_capacity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)  # kVA, kW, L/h, etc.
    state = Column(String(50), default="NORMAL")  # NORMAL, DEGRADED, FAILED, STANDBY, MAINTENANCE
    health_pct = Column(Float, default=100.0)
    operating_hours = Column(Float, default=1240.0)
    installation_year = Column(Integer, default=2012)
    data_class = Column(String(20), default="SIMULATED")
    provenance_json = Column(Text, nullable=True)

    station = relationship("Station", back_populates="assets")
    telemetry_records = relationship("AssetTelemetry", back_populates="asset", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset", cascade="all, delete-orphan")


class AssetTelemetry(Base):
    __tablename__ = "asset_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String(100), ForeignKey("assets.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True)
    metric = Column(String(50), nullable=False)  # power_output, vibration, oil_temp, coolant_temp, fuel_flow
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    quality = Column(String(20), default="GOOD")
    data_class = Column(String(20), default="SIMULATED")

    asset = relationship("Asset", back_populates="telemetry_records")


class EnvironmentObservation(Base):
    __tablename__ = "environment_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True)
    temperature_c = Column(Float, nullable=False)
    pressure_hpa = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    wind_speed_kmh = Column(Float, nullable=False)
    wind_direction = Column(String(20), default="NE (45°)")
    weather_condition = Column(String(50), default="Sub-zero Blizzard Watch")
    visibility = Column(String(20), default="Good")
    source = Column(String(100), default="NCPOR AWS / NPDC Data Portal")
    data_class = Column(String(20), default="LIVE")
    provenance_json = Column(Text, nullable=True)

    station = relationship("Station", back_populates="environment_observations")


class FuelTank(Base):
    __tablename__ = "fuel_tanks"

    id = Column(String(100), primary_key=True, index=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    capacity_l = Column(Float, nullable=False)
    current_level_l = Column(Float, nullable=False)
    fuel_type = Column(String(50), default="JET A-1 / Polar Diesel")
    daily_consumption_l = Column(Float, default=2800.0)
    data_class = Column(String(20), default="SIMULATED")
    provenance_json = Column(Text, nullable=True)

    station = relationship("Station", back_populates="fuel_tanks")
    transactions = relationship("FuelTransaction", back_populates="tank", cascade="all, delete-orphan")


class FuelTransaction(Base):
    __tablename__ = "fuel_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tank_id = Column(String(100), ForeignKey("fuel_tanks.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    quantity_l = Column(Float, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # DISCHARGE, REFILL, TRANSFER
    notes = Column(String(200), nullable=True)

    tank = relationship("FuelTank", back_populates="transactions")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String(100), primary_key=True, index=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    category = Column(String(50), nullable=False)  # PROVISIONS, SPARES, MEDICAL, WATER, CHEMICALS
    item_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    daily_consumption = Column(Float, nullable=False)
    minimum_reserve = Column(Float, nullable=False)
    coverage_days = Column(Float, nullable=False)
    criticality = Column(String(20), default="HIGH")
    data_class = Column(String(20), default="SIMULATED")
    provenance_json = Column(Text, nullable=True)

    station = relationship("Station", back_populates="inventory_items")


class PersonnelState(Base):
    __tablename__ = "personnel_state"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    population = Column(Integer, nullable=False)
    season = Column(String(20), default="WINTER")  # SUMMER, WINTER
    status_note = Column(String(100), default="Within Safe Range")
    data_class = Column(String(20), default="REFERENCE")
    provenance_json = Column(Text, nullable=True)

    station = relationship("Station", back_populates="personnel_records")


class Expedition(Base):
    __tablename__ = "expeditions"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    season = Column(String(50), default="44th ISEA (2024-2025)")
    status = Column(String(50), default="ACTIVE")
    route = Column(String(200), default="Goa -> Cape Town -> India Bay / Prydz Bay")
    start_date = Column(String(50), default="Dec 2024")
    end_date = Column(String(50), default="Apr 2025")

    cargos = relationship("Cargo", back_populates="expedition", cascade="all, delete-orphan")


class Cargo(Base):
    __tablename__ = "cargos"

    id = Column(String(100), primary_key=True, index=True)
    expedition_id = Column(String(50), ForeignKey("expeditions.id"), index=True, nullable=False)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    category = Column(String(50), nullable=False)  # FUEL, SPARES, PROVISIONS, SCIENTIFIC
    item_name = Column(String(150), nullable=False)
    quantity = Column(Float, nullable=False)
    origin = Column(String(100), default="Cape Town")
    current_stage = Column(String(100), default="Expedition Vessel")  # Goa, Cape Town, Expedition Vessel, Antarctica, Stations
    eta_days = Column(Integer, default=12)
    delay_days = Column(Integer, default=0)
    status = Column(String(50), default="EN_ROUTE")
    data_class = Column(String(20), default="SIMULATED")

    expedition = relationship("Expedition", back_populates="cargos")
    station = relationship("Station", back_populates="cargos")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    asset_id = Column(String(100), ForeignKey("assets.id"), index=True, nullable=False)
    maintenance_type = Column(String(50), default="PREVENTIVE")
    due_date = Column(String(50), default="2025-05-15")
    completed_date = Column(String(50), nullable=True)
    status = Column(String(50), default="PENDING")  # COMPLETED, PENDING, OVERDUE
    notes = Column(String(250), nullable=True)
    spare_required = Column(String(100), nullable=True)

    asset = relationship("Asset", back_populates="maintenance_records")


class CommunicationState(Base):
    __tablename__ = "communication_state"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    link_status = Column(String(50), default="CONNECTED")  # CONNECTED, LINK_LOSS, BUFFERING
    queued_records = Column(Integer, default=0)
    latency_ms = Column(Integer, default=640)
    sync_status = Column(String(50), default="SYNCHRONIZED")  # SYNCHRONIZED, PENDING, SYNCING
    data_class = Column(String(20), default="SIMULATED")

    station = relationship("Station", back_populates="communication_states")


class DependencyEdge(Base):
    __tablename__ = "dependency_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(50), default="ALL")
    source_node = Column(String(100), nullable=False, index=True)
    target_node = Column(String(100), nullable=False, index=True)
    relationship = Column(String(100), nullable=False)
    propagation_type = Column(String(50), default="DIRECT")  # DIRECT, INDIRECT, CRITICAL
    weight = Column(Float, default=1.0)
    enabled = Column(Boolean, default=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    severity = Column(String(20), default="WARNING")  # CRITICAL, WARNING, INFO
    category = Column(String(50), nullable=False)  # POWER, FUEL, WEATHER, LOGISTICS, WATER
    message = Column(String(200), nullable=False)
    threshold_info = Column(String(150), nullable=True)
    source = Column(String(100), default="ANTWIN Intelligence")
    created_at = Column(DateTime, default=utc_now)
    acknowledged = Column(Boolean, default=False)
    data_class = Column(String(20), default="DERIVED")

    station = relationship("Station", back_populates="alerts")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(String(100), primary_key=True, index=True)
    scenario_name = Column(String(150), nullable=False)
    scenario_type = Column(String(50), default="COMBINED")
    station_id = Column(String(50), nullable=False)
    inputs_json = Column(Text, nullable=False)
    outputs_json = Column(Text, nullable=False)
    baseline_autonomy_days = Column(Float, nullable=False)
    scenario_autonomy_days = Column(Float, nullable=False)
    mitigated_autonomy_days = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class AutonomySnapshot(Base):
    __tablename__ = "autonomy_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(50), ForeignKey("stations.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    energy_days = Column(Float, nullable=False)
    fuel_days = Column(Float, nullable=False)
    water_days = Column(Float, nullable=False)
    provisions_days = Column(Float, nullable=False)
    spare_days = Column(Float, nullable=False)
    asset_margin_days = Column(Float, nullable=False)
    logistics_days = Column(Float, nullable=False)
    mission_autonomy_days = Column(Float, nullable=False)
    limiting_constraint = Column(String(100), nullable=False)
    explanation = Column(Text, nullable=True)
    data_class = Column(String(20), default="DERIVED")
    provenance_json = Column(Text, nullable=True)

    station = relationship("Station", back_populates="autonomy_snapshots")


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    publisher = Column(String(100), nullable=False)
    data_class = Column(String(20), default="REFERENCE")
    temporal_status = Column(String(50), default="CURRENT")
    url = Column(String(300), nullable=True)
    use_tags_json = Column(Text, nullable=True)
