import React, { useState, useMemo } from 'react';
import {
  Thermometer,
  Zap,
  Flame,
  Droplets,
  Building,
  Wrench,
  Truck,
  Users,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight,
  Info,
  Layers,
  Activity,
  ShieldAlert,
  Clock,
  Compass
} from 'lucide-react';
import { DependencyGraphData, Provenance } from '../types/antwin';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

interface Props {
  graphData: DependencyGraphData;
  onNavigate: (pageId: string) => void;
  onViewProvenance: (prov: Provenance) => void;
}

export type ViewMode = 'System' | 'Domain' | 'Impact';

interface GraphNodeDef {
  id: string;
  label: string;
  category: 'ENVIRONMENT' | 'ENERGY' | 'FUEL' | 'WATER' | 'LIFE SUPPORT' | 'ASSETS' | 'LOGISTICS' | 'PERSONNEL' | 'MISSION';
  domain: 'Environment' | 'Energy' | 'Life Support' | 'Infrastructure' | 'Logistics' | 'Mission';
  impactType: 'Operational' | 'Resource' | 'Maintenance' | 'Logistics' | 'Autonomy';
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'Operational' | 'Watch' | 'Critical' | 'Degraded';
  provenance: 'REFERENCE' | 'REPLAY' | 'SIMULATED' | 'DERIVED';
  primaryMetric: { label: string; value: string; unit?: string };
  secondaryMetric?: { label: string; value: string };
  description: string;
  whyItMatters: string;
}

interface GraphEdgeDef {
  source: string;
  target: string;
  type: 'direct' | 'indirect' | 'critical' | 'normal';
  criticality: 'normal' | 'high' | 'critical';
  relationship: string;
  label: string;
}

interface ScenarioDef {
  id: string;
  name: string;
  affectedNode: string;
  tagline: string;
  description: string;
  causalPath: string[];
  nodeDeltas: Record<string, { delta: string; direction: 'up' | 'down'; status: 'Degraded' | 'Critical' | 'Watch' }>;
  autonomyImpact: { days: number; delta: string; limiting: string; secondary: string };
  mitigations: string[];
  cascadeSteps: Array<{
    system: string;
    metric: string;
    delta: string;
    severity: 'High' | 'Critical' | 'Watch';
    color: string;
  }>;
}

// ---------------------------------------------------------------------------
// STATION TOPOLOGIES
// ---------------------------------------------------------------------------

const MAITRI_NODES: GraphNodeDef[] = [
  {
    id: 'environment',
    label: 'Environment',
    category: 'ENVIRONMENT',
    domain: 'Environment',
    impactType: 'Operational',
    x: 30,
    y: 35,
    width: 145,
    height: 95,
    status: 'Watch',
    provenance: 'REPLAY',
    primaryMetric: { label: 'Ambient Temp', value: '-24.8', unit: '°C' },
    secondaryMetric: { label: 'Wind Speed', value: '12.6 km/h' },
    description: 'Schirmacher Oasis weather severity drives primary thermal load and restricts overland transit.',
    whyItMatters: 'Extreme sub-zero temperatures force boilers and generators into peak load, accelerating fuel depletion.'
  },
  {
    id: 'personnel',
    label: 'Personnel',
    category: 'PERSONNEL',
    domain: 'Life Support',
    impactType: 'Operational',
    x: 480,
    y: 35,
    width: 145,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Crew Occupancy', value: '25', unit: 'pax' },
    secondaryMetric: { label: 'Health Status', value: 'Nominal' },
    description: 'Winter-over team operating scientific experiments, facility infrastructure, and station communications.',
    whyItMatters: 'Personnel density directly establishes baseline heating, power, and potable water demand profiles.'
  },
  {
    id: 'assets',
    label: 'Assets & Fleet',
    category: 'ASSETS',
    domain: 'Infrastructure',
    impactType: 'Maintenance',
    x: 690,
    y: 35,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Equipment Health', value: '84', unit: '%' },
    secondaryMetric: { label: 'Snowcat Fleet', value: '2 / 2 Ready' },
    description: 'Station mechanical equipment, power alternators, mobile snow vehicles, and scheduled maintenance inventory.',
    whyItMatters: 'Degraded equipment readiness accelerates cascade failure probability and reduces maintenance response speed.'
  },
  {
    id: 'heating',
    label: 'Heating Boilers',
    category: 'ENERGY',
    domain: 'Energy',
    impactType: 'Operational',
    x: 30,
    y: 195,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Thermal Output', value: '108', unit: 'kWth' },
    secondaryMetric: { label: 'Loop Temp', value: '68°C' },
    description: 'Hydronic space heating and pipeline heat tracing protecting station water loops from freezing.',
    whyItMatters: 'Heating failure rapidly freezes habitat and water piping; higher heating demand consumes more fuel.'
  },
  {
    id: 'habitat',
    label: 'Habitat & Bldgs',
    category: 'LIFE SUPPORT',
    domain: 'Life Support',
    impactType: 'Operational',
    x: 480,
    y: 185,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Living Modules', value: '25/65', unit: 'pax' },
    secondaryMetric: { label: 'Indoor Temp', value: '+19.2°C' },
    description: 'Enclosed living quarters, laboratories, and operational workshops requiring continuous thermal and power support.',
    whyItMatters: 'Habitat temperature and life-safety systems depend on non-interrupted power and boiler heat.'
  },
  {
    id: 'logistics',
    label: 'Logistics & Resupply',
    category: 'LOGISTICS',
    domain: 'Logistics',
    impactType: 'Logistics',
    x: 690,
    y: 185,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Corridor Status', value: 'Open', unit: '' },
    secondaryMetric: { label: 'Next Resupply', value: '12 d ETA' },
    description: 'Intercontinental air resupply corridor via Novo runway and overland traverse routes to Maitri.',
    whyItMatters: 'Weather blizzards shut down transport corridors, delaying critical spare parts and fuel delivery.'
  },
  {
    id: 'power',
    label: 'Power System (DG)',
    category: 'ENERGY',
    domain: 'Energy',
    impactType: 'Operational',
    x: 240,
    y: 220,
    width: 170,
    height: 100,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Active Load', value: '482', unit: 'kW' },
    secondaryMetric: { label: 'Operating Margin', value: '61 kW' },
    description: 'DG Alternator sets (2 × 125 kVA) providing primary bus electricity across Maitri main station.',
    whyItMatters: 'Loss of generation capacity reduces operating margins and forces immediate load shedding of non-vital equipment.'
  },
  {
    id: 'water',
    label: 'Water Utility',
    category: 'WATER',
    domain: 'Life Support',
    impactType: 'Resource',
    x: 480,
    y: 330,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Lake Pumping', value: '2,400', unit: 'L/d' },
    secondaryMetric: { label: 'Storage Level', value: '18,500 L' },
    description: 'Potable water pumped from Priyadarshini Lake with electric trace heating to prevent pipe freeze.',
    whyItMatters: 'Lake intake lines require continuous trace heat; pipe freeze creates instant water starvation.'
  },
  {
    id: 'fuel',
    label: 'Polar Diesel Farm',
    category: 'FUEL',
    domain: 'Infrastructure',
    impactType: 'Resource',
    x: 240,
    y: 390,
    width: 170,
    height: 100,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Storage Level', value: '214.5', unit: 'kL' },
    secondaryMetric: { label: 'Burn Rate', value: '116 L/h' },
    description: 'Bulk Polar Diesel fuel storage tanks (300,000 L class), day-tanks, and transfer pumps feeding power and boilers.',
    whyItMatters: 'Fuel availability directly caps generator endurance and represents the hard limit of station survival.'
  },
  {
    id: 'autonomy',
    label: 'MISSION AUTONOMY',
    category: 'MISSION',
    domain: 'Mission',
    impactType: 'Autonomy',
    x: 620,
    y: 375,
    width: 225,
    height: 120,
    status: 'Operational',
    provenance: 'DERIVED',
    primaryMetric: { label: 'Endurance', value: '8.4', unit: 'Days' },
    secondaryMetric: { label: 'Limiting Factor', value: 'Fuel Depletion' },
    description: 'Unified operational endurance calculated by multi-constraint minimization across station resources.',
    whyItMatters: 'Downstream terminal metric indicating how many days the station can operate safely without resupply.'
  }
];

const MAITRI_EDGES: GraphEdgeDef[] = [
  // Path 1: Weather -> Heating -> Power -> Fuel -> Autonomy
  { source: 'environment', target: 'heating', type: 'direct', criticality: 'high', relationship: 'thermal_demand', label: 'Cold Ambient Surge' },
  { source: 'heating', target: 'power', type: 'direct', criticality: 'high', relationship: 'electrical_load', label: 'Circulation Pumps Load' },
  { source: 'power', target: 'fuel', type: 'critical', criticality: 'critical', relationship: 'fuel_consumption', label: 'Generator Fuel Burn' },
  { source: 'fuel', target: 'autonomy', type: 'critical', criticality: 'critical', relationship: 'fuel_endurance', label: 'Fuel Depletion Margin' },
  // Path 2: Weather -> Logistics -> Resupply -> Autonomy
  { source: 'environment', target: 'logistics', type: 'indirect', criticality: 'normal', relationship: 'blizzard_hold', label: 'Traverse Track Conditions' },
  { source: 'logistics', target: 'assets', type: 'direct', criticality: 'normal', relationship: 'spares_replenishment', label: 'Spares Delivery' },
  { source: 'logistics', target: 'fuel', type: 'direct', criticality: 'high', relationship: 'fuel_resupply', label: 'Tanker Replenishment' },
  { source: 'logistics', target: 'autonomy', type: 'critical', criticality: 'high', relationship: 'resupply_window', label: 'Corridor Buffer' },
  // Path 3: Asset Failure -> Capacity -> Power Margin -> Autonomy
  { source: 'assets', target: 'power', type: 'critical', criticality: 'critical', relationship: 'generator_reliability', label: 'Alternator Availability' },
  { source: 'assets', target: 'autonomy', type: 'critical', criticality: 'high', relationship: 'critical_spares', label: 'Spare Buffer Margin' },
  // Path 4: Personnel -> Habitation -> Heating/Power/Water -> Autonomy
  { source: 'personnel', target: 'habitat', type: 'normal', criticality: 'normal', relationship: 'occupancy', label: 'Crew Habitation Demand' },
  { source: 'habitat', target: 'heating', type: 'normal', criticality: 'normal', relationship: 'comfort_temp', label: 'Thermostat Setpoint' },
  { source: 'habitat', target: 'power', type: 'normal', criticality: 'normal', relationship: 'appliances_light', label: 'Module Electrical Draw' },
  { source: 'power', target: 'water', type: 'direct', criticality: 'high', relationship: 'trace_heat', label: 'Lake Pipeline Trace Heat' },
  { source: 'water', target: 'autonomy', type: 'direct', criticality: 'normal', relationship: 'potable_reserve', label: 'Water Reserve Buffer' }
];

const BHARATI_NODES: GraphNodeDef[] = [
  {
    id: 'environment',
    label: 'Environment',
    category: 'ENVIRONMENT',
    domain: 'Environment',
    impactType: 'Operational',
    x: 30,
    y: 35,
    width: 145,
    height: 95,
    status: 'Watch',
    provenance: 'REPLAY',
    primaryMetric: { label: 'Ambient Temp', value: '-28.4', unit: '°C' },
    secondaryMetric: { label: 'Wind Speed', value: '22.4 km/h' },
    description: 'Larsemann Hills coastal Antarctic climate with catabatic gale winds and sub-ice freezing in Quilty Bay.',
    whyItMatters: 'Quilty Bay freezing threatens seawater intake lines, while extreme sub-zero winds spike heating demands.'
  },
  {
    id: 'chp_fleet',
    label: 'CHP Power Plant',
    category: 'ENERGY',
    domain: 'Energy',
    impactType: 'Operational',
    x: 270,
    y: 35,
    width: 165,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Electrical Out', value: '194', unit: 'kW' },
    secondaryMetric: { label: 'Fleet Status', value: '2 / 3 CHP Units' },
    description: 'Combined Heat & Power units (3 × 100 kVA) co-generating electricity and recovering thermal jacket heat.',
    whyItMatters: 'CHP trip cuts both electricity and thermal recovery, spiking load on remaining units and auxiliary boilers.'
  },
  {
    id: 'habitat',
    label: 'Station Habitation',
    category: 'LIFE SUPPORT',
    domain: 'Life Support',
    impactType: 'Operational',
    x: 500,
    y: 35,
    width: 150,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Occupancy', value: '23', unit: 'pax' },
    secondaryMetric: { label: 'Indoor Temp', value: '+20.5°C' },
    description: 'Triple-deck aerodynamic main building housing all living quarters, laboratories, and operational control rooms.',
    whyItMatters: 'Compact integrated structure concentrates thermal and electrical loads, making life support dependent on CHP uptime.'
  },
  {
    id: 'logistics',
    label: 'Progress Corridor',
    category: 'LOGISTICS',
    domain: 'Logistics',
    impactType: 'Logistics',
    x: 710,
    y: 35,
    width: 145,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Sea-Ice Link', value: 'Open', unit: '' },
    secondaryMetric: { label: 'Next Vessel', value: '14 d ETA' },
    description: 'Seasonal maritime resupply via cargo vessel, helicopter ship-to-shore airlift, and Larsemann Hills access tracks.',
    whyItMatters: 'Sea-ice breakup or heavy blizzards prevent helicopter sorties and tanker transfers, extending autonomy burn.'
  },
  // Bharati Signature Water Path: Seawater Intake -> Pump -> RO Plant -> Storage -> Autonomy
  {
    id: 'seawater_intake',
    label: 'Seawater Intake',
    category: 'WATER',
    domain: 'Life Support',
    impactType: 'Operational',
    x: 30,
    y: 195,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Intake Flow', value: '140', unit: 'L/min' },
    secondaryMetric: { label: 'Water Temp', value: '-1.8°C' },
    description: 'Sub-ice seawater suction manifold supplying raw saline feed water to Bharati water treatment plant.',
    whyItMatters: 'Ice blockage or intake freezing cuts raw feed water, stopping desalination and draining station water storage.'
  },
  {
    id: 'heating',
    label: 'Thermal & HVAC',
    category: 'ENERGY',
    domain: 'Energy',
    impactType: 'Operational',
    x: 270,
    y: 195,
    width: 165,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Thermal Supply', value: '118', unit: 'kWth' },
    secondaryMetric: { label: 'CHP Recovery', value: '86 kWth' },
    description: 'Hydronic heating network warmed primarily by CHP waste heat recovery, backed by secondary auxiliary boilers.',
    whyItMatters: 'Thermal loop protects RO raw feed lines from icing and maintains the building envelope at +20°C.'
  },
  {
    id: 'fuel',
    label: 'Jet A-1 Fuel Farm',
    category: 'FUEL',
    domain: 'Infrastructure',
    impactType: 'Resource',
    x: 690,
    y: 195,
    width: 165,
    height: 95,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Fuel On Hand', value: '242.0', unit: 'kL' },
    secondaryMetric: { label: 'Burn Rate', value: '92 L/h' },
    description: 'Insulated bulk Jet A-1 fuel tank farm (296-300 kL class) with pre-heated day tanks feeding the CHP plant.',
    whyItMatters: 'Jet A-1 powers the entire CHP electrical and thermal ecosystem; fuel depletion halts station life support.'
  },
  {
    id: 'water_pump',
    label: 'Seawater Pump',
    category: 'WATER',
    domain: 'Life Support',
    impactType: 'Operational',
    x: 30,
    y: 355,
    width: 155,
    height: 95,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Delivery Press', value: '4.2', unit: 'bar' },
    secondaryMetric: { label: 'Pump Speed', value: '1,450 RPM' },
    description: 'High-pressure seawater transfer pumps conveying saline water through heated double-wall pipeline to the RO plant.',
    whyItMatters: 'Pump degradation directly reduces reverse osmosis membrane feed pressure, cutting freshwater output.'
  },
  {
    id: 'ro_plant',
    label: 'RO Desalination',
    category: 'WATER',
    domain: 'Life Support',
    impactType: 'Resource',
    x: 235,
    y: 355,
    width: 165,
    height: 100,
    status: 'Operational',
    provenance: 'REFERENCE',
    primaryMetric: { label: 'Freshwater Out', value: '2,850', unit: 'L/d' },
    secondaryMetric: { label: 'Recovery Rate', value: '35%' },
    description: 'Reverse Osmosis desalination trains with pre-heating and remineralization providing all potable water for Bharati.',
    whyItMatters: 'Bharati has no meltwater lake nearby; RO is the single lifeline for drinking, cooking, hygiene, and medical safety.'
  },
  {
    id: 'freshwater_storage',
    label: 'Potable Storage',
    category: 'WATER',
    domain: 'Life Support',
    impactType: 'Resource',
    x: 435,
    y: 355,
    width: 155,
    height: 100,
    status: 'Operational',
    provenance: 'SIMULATED',
    primaryMetric: { label: 'Potable Buffer', value: '22.0', unit: 'kL' },
    secondaryMetric: { label: 'Daily Draw', value: '2,400 L/d' },
    description: 'Insulated potable water holding tanks feeding station pressurized sanitary and laboratory utility loops.',
    whyItMatters: 'When RO output drops below station consumption, storage depletes rapidly, triggering emergency rationing.'
  },
  {
    id: 'autonomy',
    label: 'MISSION AUTONOMY',
    category: 'MISSION',
    domain: 'Mission',
    impactType: 'Autonomy',
    x: 640,
    y: 355,
    width: 220,
    height: 120,
    status: 'Operational',
    provenance: 'DERIVED',
    primaryMetric: { label: 'Endurance', value: '9.2', unit: 'Days' },
    secondaryMetric: { label: 'Limiting Factor', value: 'Water (RO Buffer)' },
    description: 'Unified Bharati mission endurance derived from real-time minimization of water, fuel, power margin, and logistics access.',
    whyItMatters: 'Downstream terminal metric determining how long Bharati can safely sustain autonomous crew survival without resupply.'
  }
];

const BHARATI_EDGES: GraphEdgeDef[] = [
  // Bharati Signature Path: Seawater Intake -> Pump -> RO Plant -> Storage -> Autonomy
  { source: 'environment', target: 'seawater_intake', type: 'direct', criticality: 'high', relationship: 'ice_freeze_risk', label: 'Sub-ice Freeze Risk' },
  { source: 'seawater_intake', target: 'water_pump', type: 'critical', criticality: 'critical', relationship: 'raw_feedwater', label: 'Saline Suction Line' },
  { source: 'water_pump', target: 'ro_plant', type: 'critical', criticality: 'critical', relationship: 'pressurized_feed', label: 'High Pressure Feed' },
  { source: 'ro_plant', target: 'freshwater_storage', type: 'critical', criticality: 'critical', relationship: 'potable_production', label: 'Desalinated Water' },
  { source: 'freshwater_storage', target: 'autonomy', type: 'critical', criticality: 'critical', relationship: 'water_endurance', label: 'Water Endurance Bottleneck' },
  // Path 1: Weather -> Heating -> CHP Load -> Fuel -> Autonomy
  { source: 'environment', target: 'heating', type: 'direct', criticality: 'high', relationship: 'thermal_demand', label: 'Space Heat Demand' },
  { source: 'heating', target: 'chp_fleet', type: 'direct', criticality: 'high', relationship: 'thermal_coupling', label: 'CHP Thermal Load' },
  { source: 'chp_fleet', target: 'fuel', type: 'critical', criticality: 'critical', relationship: 'jet_a1_consumption', label: 'CHP Fuel Burn' },
  { source: 'fuel', target: 'autonomy', type: 'critical', criticality: 'critical', relationship: 'fuel_endurance', label: 'Jet A-1 Depletion Limit' },
  // Auxiliary CHP & Heating couplings
  { source: 'chp_fleet', target: 'water_pump', type: 'direct', criticality: 'normal', relationship: 'pump_power', label: 'Pump Electrical Power' },
  { source: 'chp_fleet', target: 'ro_plant', type: 'direct', criticality: 'high', relationship: 'ro_power', label: 'RO Membrane Power' },
  { source: 'heating', target: 'ro_plant', type: 'direct', criticality: 'normal', relationship: 'feed_preheat', label: 'Feedwater Preheat' },
  // Habitation & Logistics
  { source: 'habitat', target: 'freshwater_storage', type: 'normal', criticality: 'normal', relationship: 'potable_consumption', label: 'Crew Water Consumption' },
  { source: 'logistics', target: 'fuel', type: 'direct', criticality: 'high', relationship: 'fuel_resupply', label: 'Tanker Discharge' },
  { source: 'logistics', target: 'autonomy', type: 'critical', criticality: 'high', relationship: 'resupply_buffer', label: 'Progress Resupply Window' }
];

// ---------------------------------------------------------------------------
// SCENARIO DEFINITIONS
// ---------------------------------------------------------------------------

const MAITRI_SCENARIOS: Record<string, ScenarioDef> = {
  generator_degradation: {
    id: 'generator_degradation',
    name: 'DG-02 Degradation',
    affectedNode: 'power',
    tagline: 'Alternator bearing wear & electrical derating',
    description: 'DG-02 mechanical degradation drops generation capacity by 33%, causing bus imbalance, shifting electrical load onto DG-01 and accelerating diesel burn rate.',
    causalPath: ['assets', 'power', 'fuel', 'autonomy'],
    nodeDeltas: {
      assets: { delta: '-22%', direction: 'down', status: 'Degraded' },
      power: { delta: '-33%', direction: 'down', status: 'Critical' },
      fuel: { delta: '+11% Burn', direction: 'up', status: 'Watch' },
      autonomy: { delta: '-1.7 Days', direction: 'down', status: 'Critical' }
    },
    autonomyImpact: { days: 6.7, delta: '-1.7 d', limiting: 'Power Margin', secondary: 'Fuel Depletion' },
    mitigations: [
      'Immediately shed non-essential science loads (-18 kW)',
      'Inspect DG-02 exciter brushes & calibrate voltage regulator',
      'Warm up DG-03 cold-standby unit for bus synchronization'
    ],
    cascadeSteps: [
      { system: 'Asset Health', metric: 'DG-02 Alternator', delta: '-22%', severity: 'High', color: '#f59e0b' },
      { system: 'Power Generation', metric: 'Capacity', delta: '-33%', severity: 'Critical', color: '#ef4444' },
      { system: 'Power Margin', metric: 'Reserve Bus', delta: '-32%', severity: 'Critical', color: '#ef4444' },
      { system: 'Fuel Consumption', metric: 'Burn Rate', delta: '+11%', severity: 'High', color: '#f97316' },
      { system: 'Fuel Endurance', metric: 'Days Buffer', delta: '-1.8 d', severity: 'High', color: '#ef4444' },
      { system: 'Mission Autonomy', metric: 'Overall Envelope', delta: '-1.7 d', severity: 'Critical', color: '#a855f7' }
    ]
  },
  polar_storm: {
    id: 'polar_storm',
    name: 'Extreme Polar Storm (-36°C)',
    affectedNode: 'environment',
    tagline: 'Catabatic gale winds & intense thermal loss',
    description: 'Catabatic storm brings ambient temperatures down to -36°C with 65 km/h winds, spiking heating furnace demand by 38% and increasing trace heating load on water pipelines.',
    causalPath: ['environment', 'heating', 'power', 'fuel', 'autonomy'],
    nodeDeltas: {
      environment: { delta: '-11.2°C', direction: 'down', status: 'Critical' },
      heating: { delta: '+38% Load', direction: 'up', status: 'Critical' },
      power: { delta: '+24% Load', direction: 'up', status: 'Watch' },
      fuel: { delta: '+18% Burn', direction: 'up', status: 'Critical' },
      autonomy: { delta: '-2.4 Days', direction: 'down', status: 'Critical' }
    },
    autonomyImpact: { days: 6.0, delta: '-2.4 d', limiting: 'Fuel (Thermal Surge)', secondary: 'Power Margin' },
    mitigations: [
      'Lock down module thermal corridors to reduce infiltration',
      'Optimize hydronic boiler recirculation setpoints',
      'Suspend non-vital vehicle movements to conserve fuel'
    ],
    cascadeSteps: [
      { system: 'Environment', metric: 'Ambient Temp', delta: '-36°C', severity: 'Critical', color: '#38bdf8' },
      { system: 'Heating Demand', metric: 'Hydronic Boilers', delta: '+38%', severity: 'Critical', color: '#ef4444' },
      { system: 'Electrical Demand', metric: 'Circulation Pumps', delta: '+24%', severity: 'High', color: '#f59e0b' },
      { system: 'Fuel Consumption', metric: 'Polar Diesel Burn', delta: '+18%', severity: 'Critical', color: '#f97316' },
      { system: 'Fuel Endurance', metric: 'Reserve Days', delta: '-2.6 d', severity: 'Critical', color: '#ef4444' },
      { system: 'Mission Autonomy', metric: 'Autonomy Envelope', delta: '-2.4 d', severity: 'Critical', color: '#a855f7' }
    ]
  },
  novo_delay: {
    id: 'novo_delay',
    name: 'Novo Resupply Delay (+3d)',
    affectedNode: 'logistics',
    tagline: 'Runway blizzard hold delaying spare parts & cargo',
    description: 'Severe blizzard conditions close Novo blue-ice runway for 72 hours, postponing scheduled air freight delivery and consuming buffer inventory.',
    causalPath: ['logistics', 'assets', 'autonomy'],
    nodeDeltas: {
      logistics: { delta: '+3 d ETA', direction: 'up', status: 'Watch' },
      assets: { delta: '-15% Spares', direction: 'down', status: 'Watch' },
      autonomy: { delta: '-1.5 Days', direction: 'down', status: 'Watch' }
    },
    autonomyImpact: { days: 6.9, delta: '-1.5 d', limiting: 'Critical Spares Margin', secondary: 'Fuel Depletion' },
    mitigations: [
      'Enact preventive component maintenance moratorium',
      'Reprioritize spare part allocation to primary generators',
      'Confirm satellite comms link with Cape Town logistics base'
    ],
    cascadeSteps: [
      { system: 'Logistics Corridor', metric: 'Novo Runway', delta: 'Closed (72h)', severity: 'High', color: '#f59e0b' },
      { system: 'Resupply Arrival', metric: 'Cargo Flight', delta: '+3 Days ETA', severity: 'High', color: '#f59e0b' },
      { system: 'Spare Parts Buffer', metric: 'Critical Stock', delta: '-15%', severity: 'High', color: '#f97316' },
      { system: 'Critical Asset Margin', metric: 'Safety Factor', delta: '-20%', severity: 'High', color: '#ef4444' },
      { system: 'Mission Autonomy', metric: 'Autonomy Envelope', delta: '-1.5 d', severity: 'High', color: '#a855f7' }
    ]
  }
};

const BHARATI_SCENARIOS: Record<string, ScenarioDef> = {
  chp_trip: {
    id: 'chp_trip',
    name: 'CHP-02 Trip Failure',
    affectedNode: 'chp_fleet',
    tagline: 'Sudden electrical trip & waste heat loss',
    description: 'CHP-02 trips offline due to cooling jacket fault. Electrical capacity drops by 33% and thermal waste heat recovery falls by 42 kWth, forcing auxiliary diesel boilers to fire.',
    causalPath: ['chp_fleet', 'heating', 'fuel', 'autonomy'],
    nodeDeltas: {
      chp_fleet: { delta: '-33% Out', direction: 'down', status: 'Critical' },
      heating: { delta: '+25% Aux Boil', direction: 'up', status: 'Watch' },
      fuel: { delta: '+12% Burn', direction: 'up', status: 'High' as any },
      autonomy: { delta: '-1.7 Days', direction: 'down', status: 'Critical' }
    },
    autonomyImpact: { days: 7.5, delta: '-1.7 d', limiting: 'Power Margin', secondary: 'Jet A-1 Fuel' },
    mitigations: [
      'Initiate cold-start sequence for standby CHP-03',
      'Shed non-vital scientific labs and cargo bay heating loops',
      'Verify water RO preheating loop valve bypass'
    ],
    cascadeSteps: [
      { system: 'CHP Fleet', metric: 'Generation Capacity', delta: '-33%', severity: 'Critical', color: '#ef4444' },
      { system: 'Power Margin', metric: 'Bus Reserve', delta: '-35%', severity: 'Critical', color: '#ef4444' },
      { system: 'Heat Recovery', metric: 'Waste Heat Flue', delta: '-42 kWth', severity: 'High', color: '#f97316' },
      { system: 'Auxiliary Boilers', metric: 'Fuel Firing', delta: '+25%', severity: 'High', color: '#f59e0b' },
      { system: 'Jet A-1 Burn', metric: 'Fuel Consumption', delta: '+12%', severity: 'High', color: '#ef4444' },
      { system: 'Mission Autonomy', metric: 'Autonomy Envelope', delta: '-1.7 d', severity: 'Critical', color: '#a855f7' }
    ]
  },
  ro_pump_degradation: {
    id: 'ro_pump_degradation',
    name: 'RO Seawater Pump Degradation',
    affectedNode: 'water_pump',
    tagline: 'Signature Bharati Water Lifeline Cascade',
    description: 'Seawater transfer pump cavitation drops feed pressure by 40%. RO desalination drops freshwater production by 45%, forcing station to draw from storage and threatening mission autonomy.',
    causalPath: ['water_pump', 'ro_plant', 'freshwater_storage', 'autonomy'],
    nodeDeltas: {
      water_pump: { delta: '-40% Press', direction: 'down', status: 'Critical' },
      ro_plant: { delta: '-45% Output', direction: 'down', status: 'Critical' },
      freshwater_storage: { delta: '-25% Buffer', direction: 'down', status: 'Critical' },
      autonomy: { delta: '-4.9 Days', direction: 'down', status: 'Critical' }
    },
    autonomyImpact: { days: 4.3, delta: '-4.9 d', limiting: 'Water Endurance (RO Failure)', secondary: 'Jet A-1 Fuel' },
    mitigations: [
      'Switch intake line to redundant secondary seawater pump',
      'Enact Level-2 water conservation protocol (50 L/person-day)',
      'Inspect sub-ice Quilty Bay suction foot valve for frazil ice'
    ],
    cascadeSteps: [
      { system: 'Seawater Pump', metric: 'Feed Pressure', delta: '-40%', severity: 'Critical', color: '#ef4444' },
      { system: 'RO Desalination', metric: 'Freshwater Rate', delta: '-45%', severity: 'Critical', color: '#ef4444' },
      { system: 'Potable Buffer', metric: 'Daily Net Balance', delta: '-950 L/d', severity: 'Critical', color: '#f97316' },
      { system: 'Freshwater Storage', metric: 'Storage Draw', delta: '-25%', severity: 'Critical', color: '#ef4444' },
      { system: 'Water Endurance', metric: 'Potable Autonomy', delta: '4.3 Days', severity: 'Critical', color: '#ef4444' },
      { system: 'Mission Autonomy', metric: 'Bottleneck Shift', delta: '-4.9 d (Water)', severity: 'Critical', color: '#a855f7' }
    ]
  },
  quilty_ice_blockage: {
    id: 'quilty_ice_blockage',
    name: 'Quilty Bay Sea-Ice Delay',
    affectedNode: 'logistics',
    tagline: 'Pack ice blockage stalling resupply vessel',
    description: 'Unexpected coastal pack ice drift prevents cargo vessel mooring at Progress corridor, delaying Jet A-1 fuel barge transfer by 4 days.',
    causalPath: ['logistics', 'fuel', 'autonomy'],
    nodeDeltas: {
      logistics: { delta: '+4 d Berth', direction: 'up', status: 'Watch' },
      fuel: { delta: '-28% Buffer', direction: 'down', status: 'Watch' },
      autonomy: { delta: '-1.2 Days', direction: 'down', status: 'Watch' }
    },
    autonomyImpact: { days: 8.0, delta: '-1.2 d', limiting: 'Logistics Resupply Buffer', secondary: 'Water (RO Buffer)' },
    mitigations: [
      'Schedule helicopter sling sorties for critical rations',
      'Reduce non-essential generator bus idling',
      'Coordinate with Russian Progress Station icebreaker support'
    ],
    cascadeSteps: [
      { system: 'Progress Corridor', metric: 'Pack Ice Density', delta: '8/10 Octas', severity: 'High', color: '#38bdf8' },
      { system: 'Resupply Vessel', metric: 'Berth Window', delta: '+4 Days', severity: 'High', color: '#f59e0b' },
      { system: 'Fuel Replenish', metric: 'Barge Transfer', delta: 'Postponed', severity: 'High', color: '#f97316' },
      { system: 'Fuel Buffer', metric: 'Operational Margin', delta: '-28%', severity: 'High', color: '#ef4444' },
      { system: 'Mission Autonomy', metric: 'Autonomy Envelope', delta: '-1.2 d', severity: 'High', color: '#a855f7' }
    ]
  }
};

export const DependencyGraphView: React.FC<Props> = ({ graphData, onNavigate, onViewProvenance }) => {
  const [selectedStation, setSelectedStation] = useState<'MAITRI' | 'BHARATI'>('MAITRI');
  const [viewMode, setViewMode] = useState<ViewMode>('System');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('power');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdgeDef | null>(null);

  // Switch node set based on station
  const currentNodes = useMemo(() => {
    return selectedStation === 'MAITRI' ? MAITRI_NODES : BHARATI_NODES;
  }, [selectedStation]);

  const currentEdges = useMemo(() => {
    return selectedStation === 'MAITRI' ? MAITRI_EDGES : BHARATI_EDGES;
  }, [selectedStation]);

  const scenarios = useMemo(() => {
    return selectedStation === 'MAITRI' ? MAITRI_SCENARIOS : BHARATI_SCENARIOS;
  }, [selectedStation]);

  const activeScenario = activeScenarioId ? scenarios[activeScenarioId] : null;

  // Handle station switch
  const handleStationChange = (station: 'MAITRI' | 'BHARATI') => {
    setSelectedStation(station);
    setActiveScenarioId(null);
    setSelectedNodeId(station === 'MAITRI' ? 'power' : 'ro_plant');
  };

  // Node lookup map
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNodeDef>();
    currentNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [currentNodes]);

  // Compute upstream ancestors (BFS/DFS backward)
  const upstreamNodeIds = useMemo(() => {
    const targetId = activeScenario ? activeScenario.affectedNode : selectedNodeId;
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      currentEdges.forEach((e) => {
        if (e.target === curr && !visited.has(e.source)) {
          visited.add(e.source);
          queue.push(e.source);
        }
      });
    }
    return visited;
  }, [selectedNodeId, activeScenario, currentEdges]);

  // Compute downstream descendants (BFS/DFS forward)
  const downstreamNodeIds = useMemo(() => {
    const targetId = activeScenario ? activeScenario.affectedNode : selectedNodeId;
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      currentEdges.forEach((e) => {
        if (e.source === curr && !visited.has(e.target)) {
          visited.add(e.target);
          queue.push(e.target);
        }
      });
    }
    return visited;
  }, [selectedNodeId, activeScenario, currentEdges]);

  // Active causal path for scenario
  const scenarioPathSet = useMemo(() => {
    if (!activeScenario) return new Set<string>();
    return new Set(activeScenario.causalPath);
  }, [activeScenario]);

  // Determine if an edge is active
  const isEdgeActive = (edge: GraphEdgeDef) => {
    if (activeScenario) {
      // Edge is in scenario causal path
      for (let i = 0; i < activeScenario.causalPath.length - 1; i++) {
        if (activeScenario.causalPath[i] === edge.source && activeScenario.causalPath[i + 1] === edge.target) {
          return true;
        }
      }
      return false;
    }
    // Edge is connected to selected node
    const isUpstreamEdge = upstreamNodeIds.has(edge.source) && (edge.target === selectedNodeId || upstreamNodeIds.has(edge.target));
    const isDownstreamEdge = (edge.source === selectedNodeId || downstreamNodeIds.has(edge.source)) && downstreamNodeIds.has(edge.target);
    const isDirect = edge.source === selectedNodeId || edge.target === selectedNodeId;
    return isUpstreamEdge || isDownstreamEdge || isDirect;
  };

  // Get edge color based on context
  const getEdgeStroke = (edge: GraphEdgeDef) => {
    const active = isEdgeActive(edge);
    if (activeScenario) {
      if (active) return '#ef4444'; // Scenario cascade alert
      return 'rgba(255, 255, 255, 0.08)';
    }

    if (!active) return 'rgba(255, 255, 255, 0.1)';

    if (edge.source === selectedNodeId || downstreamNodeIds.has(edge.target)) {
      return '#00d2ff'; // Downstream cascade
    }
    if (edge.target === selectedNodeId || upstreamNodeIds.has(edge.source)) {
      return '#f59e0b'; // Upstream cause
    }
    if (edge.type === 'critical') return '#ef4444';
    return '#38bdf8';
  };

  // Selected node definition
  const activeNode = nodeMap.get(selectedNodeId) || currentNodes[0];

  // Direct upstream connections for selected node
  const directUpstream = useMemo(() => {
    return currentEdges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => ({
        sourceNode: nodeMap.get(e.source),
        edge: e
      }))
      .filter((item) => item.sourceNode !== undefined);
  }, [selectedNodeId, currentEdges, nodeMap]);

  // Direct downstream connections for selected node
  const directDownstream = useMemo(() => {
    return currentEdges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => ({
        targetNode: nodeMap.get(e.target),
        edge: e
      }))
      .filter((item) => item.targetNode !== undefined);
  }, [selectedNodeId, currentEdges, nodeMap]);

  // Domain coloring palette
  const getDomainColor = (domain: GraphNodeDef['domain']) => {
    switch (domain) {
      case 'Environment': return '#38bdf8';
      case 'Energy': return '#f59e0b';
      case 'Life Support': return '#34d399';
      case 'Infrastructure': return '#f97316';
      case 'Logistics': return '#a855f7';
      case 'Mission': return '#00d2ff';
    }
  };

  // Impact coloring palette
  const getImpactColor = (impact: GraphNodeDef['impactType']) => {
    switch (impact) {
      case 'Operational': return '#38bdf8';
      case 'Resource': return '#f97316';
      case 'Maintenance': return '#f59e0b';
      case 'Logistics': return '#2dd4bf';
      case 'Autonomy': return '#00d2ff';
    }
  };

  // Calculate Autonomy display
  const currentAutonomyDisplay = useMemo(() => {
    if (activeScenario) {
      return {
        days: activeScenario.autonomyImpact.days.toFixed(1),
        delta: activeScenario.autonomyImpact.delta,
        limiting: activeScenario.autonomyImpact.limiting,
        secondary: activeScenario.autonomyImpact.secondary,
        isReduced: true
      };
    }
    const defaultDays = selectedStation === 'MAITRI' ? '8.4' : '9.2';
    const defaultLimiting = selectedStation === 'MAITRI' ? 'Fuel Depletion' : 'Water (RO Buffer)';
    const defaultSecondary = selectedStation === 'MAITRI' ? 'Critical Asset Margin' : 'Jet A-1 Fuel';
    return {
      days: defaultDays,
      delta: 'Nominal',
      limiting: defaultLimiting,
      secondary: defaultSecondary,
      isReduced: false
    };
  }, [activeScenario, selectedStation]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: '#070d18' }}>
      {/* Top Header & Operational Control Strip */}
      <div className="antwin-panel" style={{ padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
              Dependency Graph
            </h1>
            <ProvenanceBadge dataClass="DERIVED" />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.68rem',
              color: '#38bdf8'
            }}>
              <Clock size={12} />
              <span>REPLAY: 27 Sep 2026 • 18:00 (Hour 19 / 168)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 3 }}>
            Causal operational risk model: trace dependencies from environmental drivers and asset failures to Mission Autonomy.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Station Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>STATION:</span>
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => handleStationChange('MAITRI')}
                style={{
                  background: selectedStation === 'MAITRI' ? '#0284c7' : 'transparent',
                  color: selectedStation === 'MAITRI' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                MAITRI
              </button>
              <button
                onClick={() => handleStationChange('BHARATI')}
                style={{
                  background: selectedStation === 'BHARATI' ? '#0284c7' : 'transparent',
                  color: selectedStation === 'BHARATI' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                BHARATI
              </button>
            </div>
          </div>

          {/* View Mode Toggle: System / Domain / Impact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>VIEW MODE:</span>
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {(['System', 'Domain', 'Impact'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    background: viewMode === mode ? '#0284c7' : 'transparent',
                    color: viewMode === mode ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 5,
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Grid: Interactive 2D SVG Canvas (Left) | System Details & Scenario Panel (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Left: Interactive Canvas */}
        <div
          className="antwin-panel"
          style={{
            minHeight: '560px',
            position: 'relative',
            overflow: 'hidden',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            border: activeScenario ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Active Banner for Scenario Mode */}
          {activeScenario && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} color="#ef4444" />
                <span style={{ color: '#ffffff', fontWeight: 700 }}>ACTIVE SCENARIO:</span>
                <span style={{ color: '#fca5a5', fontWeight: 600 }}>{activeScenario.name}</span>
                <span style={{ color: '#94a3b8' }}>— {activeScenario.tagline}</span>
              </div>
              <button
                onClick={() => setActiveScenarioId(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={10} /> Reset Baseline
              </button>
            </div>
          )}

          {/* SVG Diagram Canvas */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              viewBox="0 0 880 520"
              style={{ width: '100%', height: '100%', minHeight: '520px', display: 'block' }}
            >
              {/* Background Grid Pattern */}
              <defs>
                <pattern id="graph-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                </pattern>

                {/* Arrowhead Markers */}
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(255, 255, 255, 0.25)" />
                </marker>

                <marker
                  id="arrow-active-cyan"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00d2ff" />
                </marker>

                <marker
                  id="arrow-active-amber"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                </marker>

                <marker
                  id="arrow-critical-red"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#graph-grid)" />

              {/* Edge Connections */}
              <g className="edges-layer">
                {currentEdges.map((edge, idx) => {
                  const src = nodeMap.get(edge.source);
                  const tgt = nodeMap.get(edge.target);
                  if (!src || !tgt) return null;

                  // Compute attachment points
                  const srcCenter = { x: src.x + src.width / 2, y: src.y + src.height / 2 };
                  const tgtCenter = { x: tgt.x + tgt.width / 2, y: tgt.y + tgt.height / 2 };

                  let startX = srcCenter.x;
                  let startY = srcCenter.y;
                  let endX = tgtCenter.x;
                  let endY = tgtCenter.y;

                  // Snap to boundaries
                  if (tgtCenter.x > srcCenter.x + src.width / 2) {
                    startX = src.x + src.width;
                    endX = tgt.x;
                  } else if (tgtCenter.x < srcCenter.x - src.width / 2) {
                    startX = src.x;
                    endX = tgt.x + tgt.width;
                  } else if (tgtCenter.y > srcCenter.y) {
                    startY = src.y + src.height;
                    endY = tgt.y;
                  } else {
                    startY = src.y;
                    endY = tgt.y + tgt.height;
                  }

                  // Smooth curve control points
                  const dx = endX - startX;
                  const dy = endY - startY;
                  const cp1x = startX + dx * 0.45;
                  const cp1y = startY + dy * 0.1;
                  const cp2x = startX + dx * 0.55;
                  const cp2y = startY + dy * 0.9;
                  const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

                  const active = isEdgeActive(edge);
                  const strokeColor = getEdgeStroke(edge);
                  const strokeWidth = active ? 2.5 : 1.2;
                  const strokeDash = edge.type === 'indirect' ? '5 3' : undefined;

                  let markerId = 'arrow-normal';
                  if (active) {
                    if (activeScenario) markerId = 'arrow-critical-red';
                    else if (edge.source === selectedNodeId || downstreamNodeIds.has(edge.target)) markerId = 'arrow-active-cyan';
                    else markerId = 'arrow-active-amber';
                  }

                  return (
                    <g
                      key={`edge-${idx}`}
                      onMouseEnter={() => setHoveredEdge(edge)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Transparent wider stroke for hover targeting */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="12"
                      />
                      {/* Visible Edge */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDash}
                        markerEnd={`url(#${markerId})`}
                        style={{
                          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
                          filter: active ? `drop-shadow(0 0 4px ${strokeColor}80)` : 'none'
                        }}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Node Cards */}
              <g className="nodes-layer">
                {currentNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isUpstream = upstreamNodeIds.has(node.id);
                  const isDownstream = downstreamNodeIds.has(node.id);
                  const isInScenarioPath = scenarioPathSet.has(node.id);

                  // Opacity dimming when not relevant
                  let opacity = 1;
                  if (activeScenario) {
                    opacity = isInScenarioPath ? 1 : 0.22;
                  } else if (selectedNodeId && !isSelected && !isUpstream && !isDownstream) {
                    opacity = 0.25;
                  }

                  // Border & Glow
                  let strokeColor = 'rgba(255, 255, 255, 0.12)';
                  let strokeWidth = 1.2;
                  let filterGlow = 'none';

                  if (isSelected) {
                    strokeColor = '#00d2ff';
                    strokeWidth = 2.5;
                    filterGlow = 'drop-shadow(0 0 10px rgba(0, 210, 255, 0.45))';
                  } else if (activeScenario && isInScenarioPath) {
                    strokeColor = '#ef4444';
                    strokeWidth = 2.2;
                    filterGlow = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))';
                  } else if (isDownstream) {
                    strokeColor = '#38bdf8';
                    strokeWidth = 1.8;
                  } else if (isUpstream) {
                    strokeColor = '#f59e0b';
                    strokeWidth = 1.8;
                  }

                  // View Mode specific accent badge color
                  let accentColor = '#38bdf8';
                  if (viewMode === 'Domain') {
                    accentColor = getDomainColor(node.domain);
                  } else if (viewMode === 'Impact') {
                    accentColor = getImpactColor(node.impactType);
                  }

                  // Scenario delta badge if active
                  const nodeDelta = activeScenario?.nodeDeltas[node.id];

                  // Autonomy Node has custom highlight
                  if (node.id === 'autonomy') {
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        style={{ cursor: 'pointer', opacity, transition: 'opacity 0.2s ease' }}
                      >
                        <rect
                          width={node.width}
                          height={node.height}
                          rx={10}
                          fill="linear-gradient(135deg, #091b33 0%, #0d284a 100%)"
                          stroke={currentAutonomyDisplay.isReduced ? '#ef4444' : '#00d2ff'}
                          strokeWidth={isSelected ? 3 : 2}
                          filter={filterGlow !== 'none' ? filterGlow : 'drop-shadow(0 0 14px rgba(0, 210, 255, 0.25))'}
                        />
                        {/* Header */}
                        <text x="14" y="24" fill="#00d2ff" fontSize="11" fontWeight="800" letterSpacing="0.04em">
                          🎯 {node.label}
                        </text>
                        <text x={node.width - 14} y="24" textAnchor="end" fill="#94a3b8" fontSize="8" fontWeight="700">
                          DERIVED
                        </text>

                        {/* Autonomy Days Value */}
                        <text x="14" y="58" fill="#ffffff" fontSize="22" fontWeight="800">
                          {currentAutonomyDisplay.days} <tspan fontSize="12" fill="#94a3b8" fontWeight="600">Days</tspan>
                        </text>

                        {/* Delta indicator */}
                        <rect
                          x={node.width - 78}
                          y="42"
                          width="64"
                          height="20"
                          rx="4"
                          fill={currentAutonomyDisplay.isReduced ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}
                          stroke={currentAutonomyDisplay.isReduced ? '#ef4444' : '#10b981'}
                          strokeWidth="1"
                        />
                        <text
                          x={node.width - 46}
                          y="56"
                          textAnchor="middle"
                          fill={currentAutonomyDisplay.isReduced ? '#ef4444' : '#34d399'}
                          fontSize="9"
                          fontWeight="700"
                        >
                          {currentAutonomyDisplay.delta}
                        </text>

                        {/* Constraints line */}
                        <line x1="14" y1="72" x2={node.width - 14} y2="72" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                        <text x="14" y="88" fill="#94a3b8" fontSize="9" fontWeight="600">
                          Limiting: <tspan fill="#fca5a5" fontWeight="700">{currentAutonomyDisplay.limiting}</tspan>
                        </text>
                        <text x="14" y="104" fill="#64748b" fontSize="8" fontWeight="500">
                          Secondary: {currentAutonomyDisplay.secondary}
                        </text>
                      </g>
                    );
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNodeId(node.id)}
                      style={{ cursor: 'pointer', opacity, transition: 'opacity 0.2s ease' }}
                    >
                      {/* Node Container Card */}
                      <rect
                        width={node.width}
                        height={node.height}
                        rx={8}
                        fill="#0c1830"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        filter={filterGlow}
                      />

                      {/* Header Title & Provenance Badge */}
                      <text x="10" y="19" fill="#ffffff" fontSize="9.5" fontWeight="700">
                        {node.label}
                      </text>
                      <rect
                        x={node.width - (viewMode === 'Domain' || viewMode === 'Impact' ? 64 : 50)}
                        y="8"
                        width={viewMode === 'Domain' || viewMode === 'Impact' ? 56 : 42}
                        height="14"
                        rx="3"
                        fill="rgba(255, 255, 255, 0.04)"
                        stroke={accentColor}
                        strokeWidth="0.8"
                      />
                      <text
                        x={node.width - (viewMode === 'Domain' || viewMode === 'Impact' ? 36 : 29)}
                        y="18.5"
                        textAnchor="middle"
                        fill={accentColor}
                        fontSize="7"
                        fontWeight="700"
                        letterSpacing="0.03em"
                      >
                        {viewMode === 'Domain' ? node.domain : viewMode === 'Impact' ? node.impactType : node.provenance}
                      </text>

                      {/* Primary Metric Box */}
                      <rect
                        x="10"
                        y="32"
                        width={node.width - 20}
                        height="32"
                        rx="4"
                        fill="rgba(255, 255, 255, 0.03)"
                        stroke="rgba(255, 255, 255, 0.07)"
                        strokeWidth="1"
                      />
                      <text x="16" y="45" fill="#94a3b8" fontSize="8" fontWeight="600">
                        {node.primaryMetric.label}
                      </text>
                      <text x="16" y="58" fill="#ffffff" fontSize="11" fontWeight="700">
                        {node.primaryMetric.value} {node.primaryMetric.unit || ''}
                      </text>

                      {/* Secondary Metric or Scenario Delta */}
                      {nodeDelta ? (
                        <rect
                          x="10"
                          y="68"
                          width={node.width - 20}
                          height="18"
                          rx="3"
                          fill="rgba(239, 68, 68, 0.15)"
                          stroke="rgba(239, 68, 68, 0.4)"
                          strokeWidth="1"
                        />
                      ) : (
                        <text x="12" y="82" fill="#94a3b8" fontSize="8" fontWeight="500">
                          {node.secondaryMetric?.label}: <tspan fill="#cbd5e1" fontWeight="600">{node.secondaryMetric?.value}</tspan>
                        </text>
                      )}

                      {nodeDelta && (
                        <text x={node.width / 2} y="81" textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="700">
                          {nodeDelta.direction === 'down' ? '↓' : '↑'} {nodeDelta.delta}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredEdge && (
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 16,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.72rem',
                color: '#ffffff',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                <Info size={14} color="#38bdf8" />
                <span>
                  <strong>{nodeMap.get(hoveredEdge.source)?.label}</strong>
                  <span style={{ color: '#38bdf8', margin: '0 6px' }}>➔</span>
                  <strong>{nodeMap.get(hoveredEdge.target)?.label}</strong>:
                  <span style={{ color: '#94a3b8', marginLeft: 6 }}>{hoveredEdge.label} ({hoveredEdge.relationship})</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: System Details + Legend + Scenario Impact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. System Details Inspector */}
          <div className="antwin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={16} color="#00d2ff" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>System Details</h3>
              </div>
              <ProvenanceBadge dataClass={activeNode.provenance} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{activeNode.label}</strong>
              <span style={{
                background: activeNode.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.15)',
                color: activeNode.status === 'Critical' ? '#ef4444' : '#34d399',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4
              }}>
                {activeNode.status}
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '0.85rem' }}>
              {activeNode.description}
            </p>

            {/* Quick Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              marginBottom: '0.9rem',
              fontSize: '0.72rem',
              background: 'rgba(255,255,255,0.02)',
              padding: '0.5rem',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Category</span>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>{activeNode.category}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Primary Value</span>
                <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                  {activeNode.primaryMetric.value} {activeNode.primaryMetric.unit || ''}
                </div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Dependencies</span>
                <div style={{ color: '#00d2ff', fontWeight: 600 }}>
                  {directUpstream.length + directDownstream.length} links
                </div>
              </div>
            </div>

            {/* Upstream Dependencies */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span>UPSTREAM CAUSES</span>
                <span style={{ color: '#f59e0b', fontSize: '0.68rem' }}>{directUpstream.length} incoming</span>
              </div>
              {directUpstream.length === 0 ? (
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontStyle: 'italic', padding: '3px 0' }}>
                  Root environmental driver or independent asset
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {directUpstream.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedNodeId(item.sourceNode!.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{item.sourceNode?.label}</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>{item.edge.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream Impact */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span>DOWNSTREAM CONSEQUENCES</span>
                <span style={{ color: '#00d2ff', fontSize: '0.68rem' }}>{directDownstream.length} outgoing</span>
              </div>
              {directDownstream.length === 0 ? (
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontStyle: 'italic', padding: '3px 0' }}>
                  Terminal downstream mission anchor
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {directDownstream.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedNodeId(item.targetNode!.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.7rem',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{item.targetNode?.label}</span>
                      <span style={{ color: '#00d2ff', fontSize: '0.65rem' }}>{item.edge.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Why It Matters */}
            <div style={{
              background: 'rgba(2, 132, 199, 0.06)',
              borderLeft: '3px solid #0284c7',
              padding: '6px 10px',
              borderRadius: '0 4px 4px 0',
              fontSize: '0.68rem',
              color: '#94a3b8',
              lineHeight: 1.4
            }}>
              <strong style={{ color: '#38bdf8', display: 'block', marginBottom: 2 }}>WHY IT MATTERS:</strong>
              {activeNode.whyItMatters}
            </div>
          </div>

          {/* 2. Legend Panel */}
          <div className="antwin-panel">
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>
              Dependency & Flow Legend
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.7rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, background: '#38bdf8' }} />
                <span>Direct Dependency</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, borderBottom: '2px dashed #94a3b8' }} />
                <span>Indirect Coupling</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
                <span style={{ color: '#fca5a5' }}>Critical Path</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, background: '#00d2ff', boxShadow: '0 0 6px #00d2ff' }} />
                <span style={{ color: '#7dd3fc' }}>Active Cascade</span>
              </div>
            </div>
          </div>

          {/* 3. Scenario Impact Injection Panel */}
          <div
            className="antwin-panel"
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(14, 25, 47, 0.6) 100%)',
              border: activeScenario ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} color={activeScenario ? '#ef4444' : '#38bdf8'} />
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Scenario Impact</strong>
              </div>
              {activeScenario && (
                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
                  INJECTED
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.35 }}>
              Select a scenario to propagate cascading degradation across physical dependencies toward Mission Autonomy.
            </p>

            {/* Scenario Selector Dropdown / Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '0.9rem' }}>
              {Object.values(scenarios).map((sc) => {
                const isActive = activeScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      if (isActive) {
                        setActiveScenarioId(null);
                      } else {
                        setActiveScenarioId(sc.id);
                        setSelectedNodeId(sc.affectedNode);
                      }
                    }}
                    style={{
                      background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isActive ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#ffffff' : '#cbd5e1',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{sc.name}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: isActive ? '#ef4444' : '#94a3b8',
                      fontWeight: 700
                    }}>
                      {sc.autonomyImpact.delta}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explainable Mitigation Actions (Visible when scenario is active) */}
            {activeScenario && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '8px 10px',
                borderRadius: 6,
                marginBottom: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
                  EXPLAINABLE MITIGATIONS:
                </div>
                <ul style={{ margin: 0, paddingLeft: 14, fontSize: '0.67rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  {activeScenario.mitigations.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {activeScenario ? (
                <button
                  onClick={() => setActiveScenarioId(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <RotateCcw size={12} /> Reset Baseline
                </button>
              ) : (
                <button
                  onClick={() => {
                    const firstScenario = Object.keys(scenarios)[0];
                    setActiveScenarioId(firstScenario);
                    setSelectedNodeId(scenarios[firstScenario].affectedNode);
                  }}
                  className="btn-run-sim"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
                >
                  <Play size={13} fill="#ffffff" /> Run Sample Scenario
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cascading Risk Analysis Strip (Bottom Horizontal Propagation Sequence) */}
      <div className="antwin-panel" style={{ padding: '0.85rem 1.25rem', border: activeScenario ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} color={activeScenario ? '#ef4444' : '#f59e0b'} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              Cascading Risk Analysis {activeScenario ? `— ${activeScenario.name}` : `— Focused on ${activeNode.label}`}
            </h3>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {activeScenario ? 'Deterministic physical cascade model' : 'Dynamic causal trace from selected node'}
          </span>
        </div>

        {/* Dynamic Horizontal Cascade Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {activeScenario ? (
            activeScenario.cascadeSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${step.color}50`,
                  borderRadius: 6,
                  padding: '0.5rem 0.75rem',
                  textAlign: 'center',
                  flex: 1,
                  boxShadow: `0 0 8px ${step.color}15`
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                    {step.system}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>
                    {step.metric}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: step.color, marginTop: 2 }}>
                    {step.delta}
                  </div>
                </div>
                {idx < activeScenario.cascadeSteps.length - 1 && (
                  <ArrowRight size={14} color="#64748b" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))
          ) : (
            // Dynamic sequence generated when browsing normal nodes
            [
              { label: directUpstream[0]?.sourceNode?.label || 'Environment', sub: 'Upstream Cause', delta: 'Nominal', color: '#38bdf8' },
              { label: activeNode.label, sub: 'Selected Subsystem', delta: `${activeNode.primaryMetric.value} ${activeNode.primaryMetric.unit || ''}`, color: '#00d2ff' },
              { label: directDownstream[0]?.targetNode?.label || 'Station Habitation', sub: 'Direct Consequence', delta: 'Nominal', color: '#f59e0b' },
              { label: selectedStation === 'MAITRI' ? 'Polar Diesel Farm' : 'Freshwater Storage', sub: 'Resource Buffer', delta: 'Buffer OK', color: '#f97316' },
              { label: 'Mission Autonomy', sub: currentAutonomyDisplay.limiting, delta: `${currentAutonomyDisplay.days} Days`, color: '#a855f7' }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${step.color}40`,
                  borderRadius: 6,
                  padding: '0.5rem 0.75rem',
                  textAlign: 'center',
                  flex: 1
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>
                    {step.sub}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: step.color, marginTop: 2 }}>
                    {step.delta}
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <ArrowRight size={14} color="#64748b" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
