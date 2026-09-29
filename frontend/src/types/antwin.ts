export type DataClass = 'LIVE' | 'REFERENCE' | 'SIMULATED' | 'DERIVED' | 'REPLAY';

export interface Provenance {
  data_class: DataClass;
  source: string;
  source_year?: number;
  station?: string;
  unit?: string;
  temporal_status?: string;
  confidence?: string;
  formula?: string;
  inputs?: string[];
  notes?: string;
}

export interface StationSummary {
  id: string;
  code: string;
  name: string;
  tagline?: string;
  latitude: number;
  longitude: number;
  elevation: number;
  location_desc: string;
  winter_capacity: number;
  summer_capacity: number;
  status: string;
  data_class: DataClass;
  image_url?: string;
  temperature_c: number;
  wind_speed_kmh: number;
  pressure_hpa: number;
  humidity_pct: number;
  mission_autonomy_days: number;
  autonomy_status: string;
  active_alerts_count: number;
  fuel_level_l: number;
  fuel_capacity_l: number;
  fuel_percentage: number;
  power_load_kw: number;
  power_capacity_kw: number;
  power_percentage: number;
  provenance?: Provenance;
}

export interface KeySystemStatus {
  name: string;
  status: string;
  type: string;
  detail: string;
}

export interface PowerTrendPoint {
  time: string;
  generation_kw: number;
  load_kw: number;
}

export interface FuelTrendPoint {
  date: string;
  level_k_l: number;
  consumption_l: number;
}

export interface AutonomyBreakdown {
  energy_days: number;
  fuel_days: number;
  water_days: number;
  provisions_days: number;
  spare_days: number;
  asset_margin_days: number;
  logistics_days: number;
}

export interface AutonomyData {
  station_id: string;
  overall_autonomy_days: number;
  status: string;
  limiting_constraint: string;
  breakdown: AutonomyBreakdown;
  explanation_chain: string[];
  mitigations: string[];
  data_class: DataClass;
  provenance?: Provenance;
}

export interface AlertItem {
  id: number;
  station_id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  message: string;
  threshold_info?: string;
  source: string;
  created_at: string;
  time_ago: string;
  acknowledged: boolean;
  data_class: DataClass;
}

export interface AssetHealth {
  name: string;
  health_pct: number;
  status: string;
  criticality: string;
}

export interface ActivityTimelineItem {
  time: string;
  event: string;
  source: string;
  type: string;
}

export interface LayoutNode {
  id: string;
  label: string;
  layer: string;
  x: number;
  y: number;
  status: string;
}

export interface StationTwinState {
  summary: StationSummary;
  key_systems: KeySystemStatus[];
  power_state: {
    total_load_kw: number;
    load_pct: number;
    generator_load_pct: number;
    battery_soc_pct: number;
    available_generation_kw: number;
    reserve_margin_kw: number;
    reserve_margin_pct: number;
    data_class: DataClass;
    generation_vs_load_trend: PowerTrendPoint[];
  };
  fuel_state: {
    total_capacity_l: number;
    current_level_l: number;
    fuel_pct: number;
    daily_consumption_l: number;
    fuel_endurance_days: number;
    fuel_type: string;
    data_class: DataClass;
    recent_trend: FuelTrendPoint[];
  };
  autonomy: AutonomyData;
  assets_health: AssetHealth[];
  activity_timeline: ActivityTimelineItem[];
  alerts: AlertItem[];
  layout_nodes: LayoutNode[];
}

export interface CascadeStep {
  step_number: number;
  node_id: string;
  title: string;
  metric_label: string;
  delta_display: string;
  status: 'critical' | 'warning' | 'info' | 'success';
  description: string;
}

export interface RiskCard {
  id: string;
  severity: string;
  title: string;
  description: string;
  affected_system: string;
  cascade_chain: string;
  recommended_action: string;
}

export interface MitigationSuggestion {
  id: string;
  label: string;
  impact_pct: number;
  autonomy_gain_days: number;
  description: string;
  applied: boolean;
}

export interface SimulationResult {
  simulation_id: string;
  station_id: string;
  scenario_name: string;
  baseline_autonomy_days: number;
  scenario_autonomy_days: number;
  mitigated_autonomy_days?: number;
  autonomy_delta_pct: number;
  limiting_constraint: string;
  cascade_steps: CascadeStep[];
  affected_systems: string[];
  system_health_impact: Record<string, { health_pct: number; delta_pct: number; status: string }>;
  key_metrics_impact: Record<string, { value: string; delta_pct: number; direction: string }>;
  critical_risks: RiskCard[];
  mitigation_suggestions: MitigationSuggestion[];
  provenance?: Provenance;
}

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  status: string;
  value_display?: string;
  details?: {
    metrics: string[];
    description: string;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  propagation_type: string;
  weight: number;
}

export interface DependencyGraphData {
  station_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface LogisticsPipelineStage {
  name: string;
  completed: boolean;
  current: boolean;
}

export interface LogisticsData {
  station_id: string;
  pipeline: LogisticsPipelineStage[];
  next_shipment_title: string;
  next_shipment_route: string;
  next_shipment_eta_days: number;
  vessel_eta_title: string;
  vessel_eta_days: number;
  active_delay_days: number;
  cargo_status: string;
  data_class: DataClass;
}

export interface CommunicationState {
  station_id: string;
  link_status: 'CONNECTED' | 'LINK_LOSS' | 'BUFFERING';
  queued_records: number;
  latency_ms: number;
  sync_status: string;
  last_sync: string;
  data_class: DataClass;
}

export interface MaitriWeatherObservation {
  timestamp: string;
  source: string;
  station: string;
  temperature_c: number;
  relative_humidity_pct: number;
  pressure_hpa: number;
  wind_speed_knots: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  wind_speed_kmh: number;
  event_flag?: string;
  event_description?: string;
}

export interface MaitriOperationalState {
  timestamp: string;
  temperature_c: number;
  wind_speed_kmh: number;
  wind_speed_knots: number;
  pressure_hpa: number;
  relative_humidity_pct: number;
  wind_direction_cardinal: string;
  heating_demand_kwth: number;
  power_demand_kwe: number;
  active_generators: number;
  running_genset_ids: string[];
  genset_load_pct: number;
  fuel_burn_rate_l_hr: number;
  fuel_burn_rate_l_day: number;
  fuel_storage_remaining_l: number;
  fuel_endurance_days: number;
  mission_autonomy_days: number;
  limiting_constraint: string;
  water_endurance_days: number;
  provisions_endurance_days: number;
  lake_water_intake_status: string;
  pipe_trace_heating_kw: number;
  field_transit_status: 'SAFE' | 'CAUTION' | 'RESTRICTED' | 'NO_GO';
  active_events: string[];
  why_autonomy_changed: Array<{
    step: string;
    factor: string;
    delta_str: string;
    impact: string;
  }>;
}

export interface MaitriReplayStatus {
  mode: 'REPLAY' | 'LIVE' | 'DEMO';
  current_index: number;
  total_records: number;
  current_timestamp: string;
  is_playing: boolean;
  speed: number;
  active_events: string[];
  active_scenario?: {
    scenario_id: string;
    name: string;
    severity: number;
    active_mitigations?: string[];
    parameters?: Record<string, any>;
  } | null;
  current_weather: MaitriWeatherObservation;
  current_operations: MaitriOperationalState;
}

export interface MaitriTimelineItem {
  index: number;
  timestamp: string;
  temperature_c: number;
  wind_speed_knots: number;
  event_flag?: string;
}

export interface MaitriSchematicSubsystem {
  name: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  detail: string;
}

export interface MaitriSchematicZone {
  id: string;
  name: string;
  short_code: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  coordinates: { x: number; y: number; w: number; h: number };
  subsystems: MaitriSchematicSubsystem[];
  active_metrics: Record<string, string>;
  notes: string;
}

export interface PolarFleetItem {
  id: string;
  type: string;
  unit: string;
  role: string;
  status: string;
  engine_hours?: number;
  battery_health?: string;
  location: string;
}

