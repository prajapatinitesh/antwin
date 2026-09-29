from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Base Provenance Schema
class ProvenanceSchema(BaseModel):
    data_class: str
    source: str
    source_year: Optional[int] = 2025
    station: Optional[str] = None
    unit: Optional[str] = None
    temporal_status: str = "CURRENT"
    confidence: Optional[str] = "HIGH"
    formula: Optional[str] = None
    inputs: Optional[List[str]] = None
    notes: Optional[str] = None

# Station Schemas
class StationSummary(BaseModel):
    id: str
    code: str
    name: str
    tagline: Optional[str] = None
    latitude: float
    longitude: float
    elevation: float
    location_desc: str
    winter_capacity: int
    summer_capacity: int
    status: str
    data_class: str
    image_url: Optional[str] = None
    temperature_c: float
    wind_speed_kmh: float
    pressure_hpa: float
    humidity_pct: float
    mission_autonomy_days: float
    autonomy_status: str
    active_alerts_count: int
    fuel_level_l: float
    fuel_capacity_l: float
    fuel_percentage: float
    power_load_kw: float
    power_capacity_kw: float
    power_percentage: float
    provenance: Optional[ProvenanceSchema] = None

# Environment Schemas
class EnvironmentCurrent(BaseModel):
    station_id: str
    timestamp: str
    temperature_c: float
    pressure_hpa: float
    humidity_pct: float
    wind_speed_kmh: float
    wind_direction: str
    weather_condition: str
    visibility: str
    source: str
    data_class: str
    provenance: Optional[ProvenanceSchema] = None

class EnvironmentHistoryPoint(BaseModel):
    timestamp: str
    temperature_c: float
    wind_speed_kmh: float
    pressure_hpa: float
    humidity_pct: float

# Asset Schemas
class AssetSummary(BaseModel):
    id: str
    station_id: str
    asset_type: str
    name: str
    criticality: str
    rated_capacity: float
    unit: str
    state: str
    health_pct: float
    operating_hours: float
    data_class: str
    provenance: Optional[ProvenanceSchema] = None

# Power & Fuel Schemas
class PowerHourlyTrend(BaseModel):
    time: str
    generation_kw: float
    load_kw: float

class PowerStateResponse(BaseModel):
    station_id: str
    total_load_kw: float
    load_pct: float
    generator_load_pct: float
    battery_soc_pct: float
    available_generation_kw: float
    reserve_margin_kw: float
    reserve_margin_pct: float
    data_class: str
    generation_vs_load_trend: List[PowerHourlyTrend]
    provenance: Optional[ProvenanceSchema] = None

class FuelDailyTrend(BaseModel):
    date: str
    level_k_l: float
    consumption_l: float

class FuelStateResponse(BaseModel):
    station_id: str
    total_capacity_l: float
    current_level_l: float
    fuel_pct: float
    daily_consumption_l: float
    fuel_endurance_days: float
    fuel_type: str
    data_class: str
    recent_trend: List[FuelDailyTrend]
    provenance: Optional[ProvenanceSchema] = None

# Autonomy Schemas
class AutonomyBreakdown(BaseModel):
    energy_days: float
    fuel_days: float
    water_days: float
    provisions_days: float
    spare_days: float
    asset_margin_days: float
    logistics_days: float

class AutonomyResponse(BaseModel):
    station_id: str
    overall_autonomy_days: float
    status: str  # "Within Safe Range", "Warning", "Critical"
    limiting_constraint: str
    breakdown: AutonomyBreakdown
    explanation_chain: List[str]
    mitigations: List[str]
    data_class: str
    provenance: Optional[ProvenanceSchema] = None

# Alerts & Risks
class AlertResponse(BaseModel):
    id: int
    station_id: str
    severity: str  # CRITICAL, WARNING, INFO
    category: str
    message: str
    threshold_info: Optional[str] = None
    source: str
    created_at: str
    time_ago: str
    acknowledged: bool
    data_class: str

class RiskCardResponse(BaseModel):
    id: str
    severity: str  # High, Medium, Low
    title: str
    description: str
    affected_system: str
    cascade_chain: str
    recommended_action: str

# Logistics Schemas
class LogisticsStage(BaseModel):
    name: str
    completed: bool
    current: bool

class LogisticsResponse(BaseModel):
    station_id: str
    pipeline: List[LogisticsStage]
    next_shipment_title: str
    next_shipment_route: str
    next_shipment_eta_days: int
    vessel_eta_title: str
    vessel_eta_days: int
    active_delay_days: int
    cargo_status: str
    data_class: str

# Dependency Graph
class GraphNode(BaseModel):
    id: str
    label: str
    category: str  # Environment, Power, Heating, Fuel, Habitat, Assets, Water, Logistics, Autonomy
    status: str
    value_display: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    propagation_type: str  # Direct Dependency, Indirect Dependency, Critical Path, Normal Flow
    weight: float

class DependencyGraphResponse(BaseModel):
    station_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# Scenario Simulation Schemas
class SimulationParameters(BaseModel):
    temperature_c: float = -35.0
    wind_speed_kmh: float = 60.0
    resupply_delay_days: int = 7
    generator_degradation_pct: float = 50.0  # 50% capacity on Gen-02 / CHP-02
    ro_degradation_pct: float = 0.0          # RO plant membrane degradation
    seawater_pump_failure: bool = False      # Bharati Quilty Bay seawater pump trip
    occupancy_change: int = 0
    non_critical_load_shedding: bool = False
    optimize_heating_setpoints: bool = False
    redistribute_generator_load: bool = False
    verify_critical_spares: bool = False

class SimulationRequest(BaseModel):
    station_id: str = "MAITRI"
    scenario_type: str = "COMBINED"  # ENVIRONMENTAL, EQUIPMENT, LOGISTICS, COMBINED
    scenario_name: str = "Severe Cold + Generator Degradation"
    parameters: SimulationParameters

class CascadeStep(BaseModel):
    step_number: int
    node_id: str
    title: str
    metric_label: str
    delta_display: str
    status: str  # critical, warning, info, success
    description: str

class SimulationResult(BaseModel):
    simulation_id: str
    station_id: str
    scenario_name: str
    baseline_autonomy_days: float
    scenario_autonomy_days: float
    mitigated_autonomy_days: Optional[float] = None
    autonomy_delta_pct: float
    limiting_constraint: str
    cascade_steps: List[CascadeStep]
    affected_systems: List[str]
    system_health_impact: Dict[str, Dict[str, Any]]
    key_metrics_impact: Dict[str, Dict[str, Any]]
    critical_risks: List[RiskCardResponse]
    mitigation_suggestions: List[Dict[str, Any]]
    provenance: Optional[ProvenanceSchema] = None

# Recalculate Mitigation Request
class RecalculateMitigationRequest(BaseModel):
    simulation_id: str
    selected_mitigations: List[str]

# Communication Schemas
class CommunicationStateResponse(BaseModel):
    station_id: str
    link_status: str  # CONNECTED, LINK_LOSS, BUFFERING
    queued_records: int
    latency_ms: int
    sync_status: str  # SYNCHRONIZED, PENDING, SYNCING
    last_sync: str
    data_class: str
