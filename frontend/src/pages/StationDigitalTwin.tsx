import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer,
  Wind,
  Gauge,
  Droplets,
  Zap,
  Flame,
  Activity,
  ArrowRight,
  Maximize2,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Play,
  GitBranch,
  FileDown,
  Compass,
  AlertTriangle,
  Clock,
  Radio
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  StationTwinState,
  Provenance,
  MaitriReplayStatus,
  PolarFleetItem
} from '../types/antwin';
import { MissionAutonomyGauge } from '../components/common/MissionAutonomyGauge';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { antwinApi } from '../services/api';
import { MaitriStationSchematic, SchematicZoneData } from '../components/maitri/MaitriStationSchematic';
import { MaitriReplayControlBar } from '../components/maitri/MaitriReplayControlBar';
import { MaitriCausalChain } from '../components/maitri/MaitriCausalChain';
import { MaitriPolarFleet, FleetVehicle } from '../components/maitri/MaitriPolarFleet';
import { MaitriScenarioInjector } from '../components/maitri/MaitriScenarioInjector';
import { BharatiStationSchematic, BharatiSchematicZoneData } from '../components/bharati/BharatiStationSchematic';
import { BharatiReplayControlBar } from '../components/bharati/BharatiReplayControlBar';
import { BharatiCausalChain } from '../components/bharati/BharatiCausalChain';
import { BharatiScenarioInjector } from '../components/bharati/BharatiScenarioInjector';
import { useTelemetry } from '../context/TelemetryContext';
import { TelemetrySourceToolbar } from '../components/common/TelemetrySourceToolbar';

interface Props {
  stationState: StationTwinState;
  onNavigate: (pageId: string) => void;
  onViewProvenance: (prov: Provenance) => void;
}

export const StationDigitalTwin: React.FC<Props> = ({
  stationState,
  onNavigate,
  onViewProvenance
}) => {
  const {
    telemetryMode,
    maitriLive,
    bharatiLive,
    liveDemoTimestamp
  } = useTelemetry();

  const {
    summary,
    key_systems,
    power_state,
    fuel_state,
    autonomy,
    assets_health,
    activity_timeline,
    alerts,
    layout_nodes
  } = stationState;

  const isMaitri = summary.id === 'MAITRI';
  const isBharati = summary.id === 'BHARATI';
  const isLive = telemetryMode === 'LIVE_DEMO';
  const activeLive = isMaitri ? maitriLive : bharatiLive;

  // --- Maitri Dynamic Replay & Schematic State ---
  const [replayStatus, setReplayStatus] = useState<MaitriReplayStatus | null>(null);
  const [schematicZones, setSchematicZones] = useState<SchematicZoneData[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [historyTrend, setHistoryTrend] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<SchematicZoneData | null>(null);

  // --- Bharati Dynamic Replay & Schematic State ---
  const [bharatiReplayStatus, setBharatiReplayStatus] = useState<any>(null);
  const [bharatiSchematicZones, setBharatiSchematicZones] = useState<BharatiSchematicZoneData[]>([]);
  const [bharatiSelectedZone, setBharatiSelectedZone] = useState<BharatiSchematicZoneData | null>(null);
  const [isBharatiScenarioModalOpen, setIsBharatiScenarioModalOpen] = useState<boolean>(false);

  // Layer filter state for 2D Station Layout (legacy fallback)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    Buildings: true,
    Power: true,
    Water: true,
    Fuel: true,
    Vehicles: false,
    Environment: false
  });

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Initial load for Bharati
  useEffect(() => {
    if (!isBharati) return;
    let isMounted = true;

    const loadBharatiData = async () => {
      try {
        const [rep, zones] = await Promise.all([
          antwinApi.getBharatiReplayCurrent(),
          antwinApi.getBharatiSchematicZones()
        ]);
        if (!isMounted) return;
        if (rep) {
          setBharatiReplayStatus(rep);
          if (rep.schematic_zones) setBharatiSchematicZones(rep.schematic_zones);
        } else if (zones) {
          setBharatiSchematicZones(zones);
        }
      } catch (err) {
        console.error('Failed to load Bharati initial data:', err);
      }
    };

    loadBharatiData();

    return () => {
      isMounted = false;
    };
  }, [isBharati]);

  // Bharati Replay tick interval timer
  useEffect(() => {
    if (!isBharati || !bharatiReplayStatus?.is_playing) return;

    const speed = bharatiReplayStatus.speed || 2;
    const intervalMs = Math.max(800, Math.floor(2500 / speed));

    const timer = setInterval(async () => {
      try {
        const updated = await antwinApi.tickBharatiReplay();
        if (updated?.current_weather) {
          setBharatiReplayStatus(updated);
          if (updated.schematic_zones) {
            setBharatiSchematicZones(updated.schematic_zones);
          }
        }
      } catch (e) {
        console.error('Error ticking Bharati replay:', e);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isBharati, bharatiReplayStatus?.is_playing, bharatiReplayStatus?.speed]);

  // Bharati Replay Control Handlers
  const handleBharatiPlayPause = async () => {
    if (!bharatiReplayStatus) return;
    const newPlayState = !bharatiReplayStatus.is_playing;
    const action = newPlayState ? 'play' : 'pause';
    const res = await antwinApi.controlBharatiReplay({ action });
    if (res) {
      setBharatiReplayStatus(res);
      if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
    }
  };

  const handleBharatiSpeedChange = async (speed: number) => {
    const res = await antwinApi.controlBharatiReplay({ speed });
    if (res) {
      setBharatiReplayStatus(res);
      if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
    }
  };

  const handleBharatiSeek = async (index: number) => {
    const res = await antwinApi.controlBharatiReplay({ action: 'seek', index });
    if (res) {
      setBharatiReplayStatus(res);
      if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
    }
  };

  const handleBharatiReset = async () => {
    const res = await antwinApi.controlBharatiReplay({ action: 'reset' });
    if (res) {
      setBharatiReplayStatus(res);
      if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
    }
  };

  const handleBharatiInjectScenario = async (scenarioName: string, severity: number) => {
    try {
      const res = await antwinApi.injectBharatiScenario(scenarioName, severity);
      if (res) {
        setBharatiReplayStatus(res);
        if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
      }
    } catch (e) {
      console.error('Failed to inject Bharati scenario:', e);
    }
  };

  const handleBharatiClearScenario = async () => {
    try {
      const res = await antwinApi.injectBharatiScenario(null, 35);
      if (res) {
        setBharatiReplayStatus(res);
        if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
      }
    } catch (e) {
      console.error('Failed to clear Bharati scenario:', e);
    }
  };

  const handleBharatiToggleMitigation = async (mitigationName: string) => {
    try {
      const res = await antwinApi.toggleBharatiMitigation(mitigationName);
      if (res) {
        setBharatiReplayStatus(res);
        if (res.schematic_zones) setBharatiSchematicZones(res.schematic_zones);
      }
    } catch (e) {
      console.error('Failed to toggle Bharati mitigation:', e);
    }
  };

  // Initial load for Maitri
  useEffect(() => {
    if (!isMaitri) return;

    let isMounted = true;

    const loadMaitriData = async () => {
      try {
        const [rep, zonesData, fl, hist] = await Promise.all([
          antwinApi.getMaitriReplayCurrent(),
          antwinApi.getMaitriSchematicZones(),
          antwinApi.getMaitriFleet(),
          antwinApi.getMaitriReplayHistory(24)
        ]);

        if (!isMounted) return;

        if (rep) setReplayStatus(rep);
        if (zonesData?.zones) setSchematicZones(zonesData.zones);
        if (fl?.fleet) setFleetVehicles(fl.fleet);
        if (hist?.history) setHistoryTrend(hist.history);
      } catch (err) {
        console.error('Failed to load Maitri initial data:', err);
      }
    };

    loadMaitriData();

    return () => {
      isMounted = false;
    };
  }, [isMaitri]);

  // Replay tick interval timer
  useEffect(() => {
    if (!isMaitri || !replayStatus?.is_playing) return;

    const speed = replayStatus.speed || 1;
    const intervalMs = Math.max(800, Math.floor(2500 / speed));

    const timer = setInterval(async () => {
      try {
        const updated = await antwinApi.tickMaitriReplay();
        if (updated?.current_weather) {
          setReplayStatus(prev => prev ? {
            ...prev,
            current_index: updated.index,
            current_timestamp: updated.timestamp,
            active_events: updated.active_events || [],
            current_weather: updated.current_weather,
            current_operations: updated.current_operations
          } : null);
        }

        // Periodically refresh zones and history
        const [zonesData, hist] = await Promise.all([
          antwinApi.getMaitriSchematicZones(),
          antwinApi.getMaitriReplayHistory(24)
        ]);
        if (zonesData?.zones) setSchematicZones(zonesData.zones);
        if (hist?.history) setHistoryTrend(hist.history);
      } catch (e) {
        console.error('Error ticking Maitri replay:', e);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isMaitri, replayStatus?.is_playing, replayStatus?.speed]);

  // Replay Control Handlers
  const handlePlayPause = async () => {
    if (!replayStatus) return;
    const newPlayState = !replayStatus.is_playing;
    const action = newPlayState ? 'play' : 'pause';
    const res = await antwinApi.controlMaitriReplay({ action });
    setReplayStatus(prev => prev ? { ...prev, is_playing: newPlayState } : null);
  };

  const handleSpeedChange = async (speed: number) => {
    await antwinApi.controlMaitriReplay({ speed });
    setReplayStatus(prev => prev ? { ...prev, speed } : null);
  };

  const handleSeek = async (index: number) => {
    const res = await antwinApi.controlMaitriReplay({ action: 'seek', index });
    if (res) {
      setReplayStatus(prev => prev ? {
        ...prev,
        current_index: res.current_index,
        current_timestamp: res.current_timestamp,
        current_weather: res.current_weather,
        current_operations: res.current_operations,
        active_events: res.active_events
      } : null);
      const zonesData = await antwinApi.getMaitriSchematicZones();
      if (zonesData?.zones) setSchematicZones(zonesData.zones);
      const hist = await antwinApi.getMaitriReplayHistory(24);
      if (hist?.history) setHistoryTrend(hist.history);
    }
  };

  const handleReset = async () => {
    const res = await antwinApi.controlMaitriReplay({ action: 'reset' });
    if (res) {
      setReplayStatus(prev => prev ? {
        ...prev,
        current_index: res.current_index,
        current_timestamp: res.current_timestamp,
        current_weather: res.current_weather,
        current_operations: res.current_operations,
        active_events: res.active_events
      } : null);
    }
  };

  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);

  const handleInjectScenario = async (scenarioName: string, severity: number) => {
    try {
      const res = await antwinApi.injectMaitriScenario(scenarioName, severity);
      if (res) {
        setReplayStatus(prev => prev ? {
          ...prev,
          current_weather: res.current_weather,
          current_operations: res.current_operations,
          active_scenario: res.active_scenario
        } : null);
        const [zonesData, hist] = await Promise.all([
          antwinApi.getMaitriSchematicZones(),
          antwinApi.getMaitriReplayHistory(24)
        ]);
        if (zonesData?.zones) setSchematicZones(zonesData.zones);
        if (hist?.history) setHistoryTrend(hist.history);
      }
    } catch (e) {
      console.error('Failed to inject scenario:', e);
    }
  };

  const handleClearScenario = async () => {
    try {
      const res = await antwinApi.injectMaitriScenario(null, 35);
      if (res) {
        setReplayStatus(prev => prev ? {
          ...prev,
          current_weather: res.current_weather,
          current_operations: res.current_operations,
          active_scenario: null
        } : null);
        const [zonesData, hist] = await Promise.all([
          antwinApi.getMaitriSchematicZones(),
          antwinApi.getMaitriReplayHistory(24)
        ]);
        if (zonesData?.zones) setSchematicZones(zonesData.zones);
        if (hist?.history) setHistoryTrend(hist.history);
      }
    } catch (e) {
      console.error('Failed to clear scenario:', e);
    }
  };

  const handleToggleMitigation = async (mitigationName: string) => {
    try {
      const res = await antwinApi.toggleMaitriMitigation(mitigationName);
      if (res) {
        setReplayStatus(prev => prev ? {
          ...prev,
          current_weather: res.current_weather,
          current_operations: res.current_operations,
          active_scenario: res.active_scenario
        } : null);
      }
    } catch (e) {
      console.error('Failed to toggle mitigation:', e);
    }
  };


  // Weather values for hero display (Live Demo vs 7-Day Replay)
  const currentTemp = isLive
    ? activeLive.temperatureC
    : (isMaitri && replayStatus?.current_weather
      ? replayStatus.current_weather.temperature_c
      : isBharati && bharatiReplayStatus?.current_weather
        ? bharatiReplayStatus.current_weather.temperature_c
        : summary.temperature_c);

  const currentWindKmh = isLive
    ? activeLive.windSpeedKmh
    : (isMaitri && replayStatus?.current_weather
      ? replayStatus.current_weather.wind_speed_kmh
      : isBharati && bharatiReplayStatus?.current_weather
        ? bharatiReplayStatus.current_weather.wind_speed_kmh
        : summary.wind_speed_kmh);

  const currentPressure = isLive
    ? activeLive.pressureHpa
    : (isMaitri && replayStatus?.current_weather
      ? replayStatus.current_weather.pressure_hpa
      : isBharati && bharatiReplayStatus?.current_weather
        ? bharatiReplayStatus.current_weather.pressure_hpa
        : summary.pressure_hpa);

  const currentHumidity = isLive
    ? activeLive.humidityPct
    : (isMaitri && replayStatus?.current_weather
      ? replayStatus.current_weather.relative_humidity_pct
      : isBharati && bharatiReplayStatus?.current_weather
        ? bharatiReplayStatus.current_weather.relative_humidity_pct
        : summary.humidity_pct);

  const currentWindKnots = isLive
    ? activeLive.windSpeedKnots
    : (isMaitri && replayStatus?.current_weather
      ? replayStatus.current_weather.wind_speed_knots
      : isBharati && bharatiReplayStatus?.current_weather
        ? bharatiReplayStatus.current_weather.wind_speed_knots
        : currentWindKmh / 1.852);

  const currentWindDir = isLive
    ? activeLive.windDir
    : (isMaitri && replayStatus?.current_weather
      ? replayStatus.current_weather.wind_direction_cardinal
      : isBharati && bharatiReplayStatus?.current_weather
        ? bharatiReplayStatus.current_weather.wind_direction_cardinal
        : 'ESE');

  // Operations values for Maitri & Bharati
  const ops: any = replayStatus?.current_operations || (replayStatus as any)?.operational_twin;
  const bharatiOps = bharatiReplayStatus?.current_operations;

  const autonomyDays = isLive
    ? activeLive.missionAutonomyDays
    : (isMaitri && ops
      ? (ops.mission_autonomy_days ?? autonomy.overall_autonomy_days)
      : isBharati && bharatiOps
        ? (bharatiOps.mission_autonomy?.overall_days ?? autonomy.overall_autonomy_days)
        : autonomy.overall_autonomy_days);

  const powerLoadKw = isLive
    ? activeLive.powerDemandKwe
    : (isMaitri && ops
      ? (ops.power_demand_kwe ?? ops.power_load_kw ?? power_state.total_load_kw)
      : isBharati && bharatiOps
        ? (bharatiOps.power_state?.total_demand_kwe ?? power_state.total_load_kw)
        : power_state.total_load_kw);

  const fuelRemainingL = isLive
    ? activeLive.fuelReserveL
    : (isMaitri && ops
      ? (ops.fuel_storage_remaining_l ?? ops.usable_fuel_l ?? fuel_state.current_level_l)
      : isBharati && bharatiOps
        ? (bharatiOps.fuel_state?.current_level_l ?? fuel_state.current_level_l)
        : fuel_state.current_level_l);

  const dailyFuelBurnL = isLive
    ? activeLive.fuelBurnRateLDay
    : (isMaitri && ops
      ? (ops.fuel_burn_rate_l_day ?? ops.daily_fuel_l ?? fuel_state.daily_consumption_l)
      : isBharati && bharatiOps
        ? (bharatiOps.fuel_state?.daily_burn_rate_l ?? fuel_state.daily_consumption_l)
        : fuel_state.daily_consumption_l);

  // Power chart points (Live rolling buffer vs Replay history)
  const powerTrendPoints = isLive
    ? activeLive.trend.map(pt => ({
        time: pt.timeStr,
        generation_kw: activeLive.powerGenerationKwe,
        load_kw: pt.powerKwe
      }))
    : (isMaitri && historyTrend.length > 0
      ? historyTrend.map(pt => ({
          time: pt.time || pt.timestamp?.slice(11, 16) || '00:00',
          generation_kw: pt.power_demand_kwe ? pt.power_demand_kwe * 1.15 : pt.generation_kw,
          load_kw: pt.power_demand_kwe || pt.load_kw
        }))
      : power_state.generation_vs_load_trend);

  // Fuel trend chart points
  const fuelTrendPoints = isLive
    ? activeLive.trend.slice(-14).map((pt, i) => ({
        date: pt.timeStr.slice(0, 5),
        consumption_l: pt.fuelLDay
      }))
    : (isMaitri && historyTrend.length > 0
      ? historyTrend.slice(-7).map((pt, i) => ({
          date: `Day ${i + 1}`,
          consumption_l: pt.fuel_burn_rate_l_day || 750
        }))
      : fuel_state.recent_trend);

  const activeReplay = isMaitri ? replayStatus : bharatiReplayStatus;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
      {/* Telemetry Source Switcher Toolbar (LIVE DEMO vs 7-DAY WINTER REPLAY) */}
      <TelemetrySourceToolbar
        stationId={summary.id as any}
        replayHour={(activeReplay?.current_index ?? 0) + 1}
        totalReplayRecords={activeReplay?.total_records ?? 168}
        replayTimestamp={activeReplay?.current_timestamp}
        isReplayPlaying={Boolean(activeReplay?.is_playing)}
      />

      {/* 1. Station Hero Banner */}
      <div style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background: 'linear-gradient(135deg, rgba(8, 23, 49, 0.95) 0%, rgba(5, 14, 28, 0.85) 100%)',
        minHeight: '170px',
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
      }}>
        {/* Background photo texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${summary.image_url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          opacity: 0.22,
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Left Title & Chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {summary.name}
              </h1>
              <ProvenanceBadge
                dataClass="REPLAY"
                provenance={isMaitri ? {
                  data_class: 'REPLAY',
                  source: 'Maitri 7-Day Winter Replay Series (NPDC Archive)',
                  source_year: 2014,
                  station: 'Maitri',
                  notes: 'Deterministic offline replay derived from local observation sequence.'
                } : {
                  data_class: 'REPLAY',
                  source: 'Bharati 7-Day Winter Replay Series (IIG/IMD AWS Profile)',
                  source_year: 2015,
                  station: 'Bharati',
                  notes: 'Deterministic offline replay calibrated on NCPOR Bharati meteorological patterns.'
                }}
                onClick={onViewProvenance}
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
              Indian Antarctic Research Station — <em>"{summary.tagline}"</em>
            </p>
            <div style={{ display: 'flex', gap: '14px', marginTop: '1rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <span>📍 {summary.location_desc}</span>
              <span>🌐 {summary.latitude > 0 ? `${summary.latitude}° N` : `${Math.abs(summary.latitude)}° S`}, {summary.longitude > 0 ? `${summary.longitude}° E` : `${Math.abs(summary.longitude)}° W`}</span>
              <span>⛰️ Elevation: {isBharati ? '35.0' : summary.elevation} m</span>
              <span>👥 Capacity: {isBharati ? '47 Main (25 Summer, Max 72)' : '25 Winter (65 Summer)'}</span>
            </div>
          </div>

          {/* Right: Current Environment Box */}
          <div style={{
            background: 'rgba(11, 22, 44, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 10,
            padding: '1rem 1.25rem',
            width: '290px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Station Environment</span>
              <ProvenanceBadge dataClass={isLive ? 'SIMULATED' : 'REPLAY'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Thermometer size={16} color="#38bdf8" />
                <div>
                  <strong style={{ color: '#ffffff' }}>{Number(currentTemp || 0).toFixed(1)}°C</strong>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Air Temp</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wind size={16} color="#38bdf8" />
                <div>
                  <strong style={{ color: '#ffffff' }}>{Number(currentWindKmh || 0).toFixed(0)} km/h</strong>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{currentWindDir} ({Number(currentWindKnots || 0).toFixed(0)} kn)</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gauge size={16} color="#38bdf8" />
                <div>
                  <strong style={{ color: '#ffffff' }}>{Number(currentPressure || 0).toFixed(1)} hPa</strong>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Pressure</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Droplets size={16} color="#38bdf8" />
                <div>
                  <strong style={{ color: '#ffffff' }}>{Number(currentHumidity || 0).toFixed(0)}%</strong>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Humidity</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.65rem', color: isLive ? '#38bdf8' : '#64748b', textAlign: 'right', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
              {isLive
                ? `● LIVE DEMO: ${liveDemoTimestamp}`
                : (isMaitri && replayStatus?.current_timestamp
                  ? `Replay Time: ${replayStatus.current_timestamp.replace('T', ' ').slice(0, 16)} UTC`
                  : isBharati && bharatiReplayStatus?.current_timestamp
                    ? `Replay Time: ${bharatiReplayStatus.current_timestamp.replace('T', ' ').slice(0, 16)} UTC`
                    : 'Deterministic Offline Replay')}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAITRI SPECIFIC: Replay Control Bar (Visible in 7-DAY REPLAY mode) --- */}
      {isMaitri && replayStatus && telemetryMode === 'REPLAY' && (
        <MaitriReplayControlBar
          isPlaying={replayStatus.is_playing}
          speed={replayStatus.speed}
          currentIndex={replayStatus.current_index}
          totalRecords={replayStatus.total_records}
          currentTimestamp={replayStatus.current_timestamp}
          activeEvents={replayStatus.active_events}
          activeScenario={replayStatus.active_scenario}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onSeek={handleSeek}
          onReset={handleReset}
          onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        />
      )}

      {/* --- BHARATI SPECIFIC: Replay Control Bar (Visible in 7-DAY REPLAY mode) --- */}
      {isBharati && bharatiReplayStatus && telemetryMode === 'REPLAY' && (
        <BharatiReplayControlBar
          isPlaying={bharatiReplayStatus.is_playing}
          speed={bharatiReplayStatus.speed}
          currentIndex={bharatiReplayStatus.current_index}
          totalRecords={bharatiReplayStatus.total_records}
          currentTimestamp={bharatiReplayStatus.current_timestamp}
          activeEvents={bharatiReplayStatus.active_events || []}
          activeScenario={bharatiReplayStatus.active_scenario}
          onPlayPause={handleBharatiPlayPause}
          onSpeedChange={handleBharatiSpeedChange}
          onSeek={handleBharatiSeek}
          onReset={handleBharatiReset}
          onOpenScenarioModal={() => setIsBharatiScenarioModalOpen(true)}
        />
      )}

      {/* --- MAITRI SPECIFIC: Scenario & Fault Injector Modal --- */}
      {isMaitri && (
        <MaitriScenarioInjector
          isOpen={isScenarioModalOpen}
          onClose={() => setIsScenarioModalOpen(false)}
          scenarioImpact={ops?.scenario_impact}
          onInjectScenario={handleInjectScenario}
          onClearScenario={handleClearScenario}
          onToggleMitigation={handleToggleMitigation}
        />
      )}

      {/* --- BHARATI SPECIFIC: Scenario & Fault Injector Modal --- */}
      {isBharati && (
        <BharatiScenarioInjector
          isOpen={isBharatiScenarioModalOpen}
          onClose={() => setIsBharatiScenarioModalOpen(false)}
          scenarioImpact={bharatiOps?.scenario_impact}
          onInjectScenario={handleBharatiInjectScenario}
          onClearScenario={handleBharatiClearScenario}
          onToggleMitigation={handleBharatiToggleMitigation}
        />
      )}

      {/* --- MAITRI SPECIFIC: Dependency-Aware Causal Chain --- */}
      {isMaitri && ops && (
        <MaitriCausalChain
          whyAutonomyChanged={ops.why_autonomy_changed || []}
          temperatureC={ops.temperature_c ?? ops.outdoor_temp_c ?? -18.5}
          windSpeedKmh={ops.wind_speed_kmh ?? 25.0}
          windSpeedKnots={ops.wind_speed_knots ?? (ops.wind_speed_kmh ? ops.wind_speed_kmh / 1.852 : 13.5)}
          heatingDemandKwth={ops.heating_demand_kwth ?? ops.heating_demand_kw ?? 115.0}
          powerDemandKwe={ops.power_demand_kwe ?? ops.power_load_kw ?? 65.0}
          fuelBurnRateLDay={ops.fuel_burn_rate_l_day ?? ops.daily_fuel_l ?? 780.0}
          missionAutonomyDays={ops.mission_autonomy_days ?? autonomyDays}
          limitingConstraint={ops.limiting_constraint ?? autonomy.limiting_constraint}
          fieldTransitStatus={ops.field_transit_status ?? (ops.field_envelope?.status === 'CRITICAL_SUSPENSION' ? 'NO_GO' : (ops.field_envelope?.status === 'CONSTRAINED_ESSENTIAL' ? 'CAUTION' : 'SAFE'))}
          lakeWaterIntakeStatus={ops.lake_water_intake_status ?? 'Intake flowing freely'}
          pipeTraceHeatingKw={ops.pipe_trace_heating_kw ?? 8.5}
        />
      )}

      {/* --- BHARATI SPECIFIC: Dependency-Aware Causal Chain --- */}
      {isBharati && bharatiOps && (
        <BharatiCausalChain
          whyAutonomyChanged={bharatiOps.causal_chain || []}
          temperatureC={currentTemp}
          windSpeedKmh={currentWindKmh}
          windSpeedKnots={currentWindKnots}
          thermalDemandKwth={bharatiOps.thermal_state?.total_demand_kwth ?? 58.0}
          powerDemandKwe={bharatiOps.power_state?.total_demand_kwe ?? 115.0}
          availableGenKwe={bharatiOps.power_state?.available_generation_kwe ?? 160.0}
          fuelBurnRateLDay={bharatiOps.fuel_state?.daily_burn_rate_l ?? 920.0}
          waterProductionLDay={bharatiOps.water_state?.production_rate_l_per_day ?? 12000.0}
          missionAutonomyDays={bharatiOps.mission_autonomy?.overall_days ?? autonomyDays}
          limitingConstraint={bharatiOps.mission_autonomy?.limiting_constraint ?? 'Energy Margin'}
          fieldAccess={bharatiOps.mobility_state?.field_access ?? 'NORMAL'}
          airNetworkWindow={bharatiOps.mobility_state?.air_network_window ?? 'OPEN'}
        />
      )}

      {/* 2. Key Systems Status Row */}
      <div className="antwin-panel" style={{ padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Key Systems Status</h3>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '1px 8px',
              borderRadius: 9999
            }}>
              Overall Healthy
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {key_systems.map((sys, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 8,
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {sys.type === 'power' && <Zap size={16} color="#10b981" />}
                {sys.type === 'heating' && <Flame size={16} color="#10b981" />}
                {sys.type === 'water' && <Droplets size={16} color="#10b981" />}
                {sys.type === 'wastewater' && <Activity size={16} color="#10b981" />}
                {sys.type === 'fuel' && <Gauge size={16} color="#10b981" />}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>{sys.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 500 }}>
                  {isMaitri && sys.type === 'power' && ops ? `${ops.active_generators ?? 2} Gensets (${ops.genset_load_pct ?? ops.generator_load_pct ?? 50}%)` :
                   isMaitri && sys.type === 'heating' && ops ? `${(ops.heating_demand_kwth ?? ops.heating_demand_kw ?? 110)?.toFixed?.(1) ?? '110.0'} kWth` :
                   isMaitri && sys.type === 'fuel' && ops ? `${Math.round(ops.fuel_burn_rate_l_day ?? ops.daily_fuel_l ?? 750)} L/day` :
                   isBharati && sys.type === 'power' && bharatiOps ? `${bharatiOps.power_state?.active_chp_count ?? 2}x CHP (${Number(bharatiOps.power_state?.total_demand_kwe ?? 65).toFixed(1)} kWe)` :
                   isBharati && sys.type === 'heating' && bharatiOps ? `${Number(bharatiOps.thermal_state?.total_demand_kwth ?? 65).toFixed(1)} kWth (${Number(bharatiOps.thermal_state?.recovered_chp_kwth ?? 42).toFixed(1)} Recov)` :
                   isBharati && sys.type === 'water' && bharatiOps ? `Quilty RO: ${Math.round(bharatiOps.water_state?.storage_level_l ?? 38500).toLocaleString()} L` :
                   isBharati && sys.type === 'wastewater' && bharatiOps ? `MBR: ${Math.round(bharatiOps.wastewater_state?.daily_generation_l ?? 4136)} L/day` :
                   isBharati && sys.type === 'fuel' && bharatiOps ? `Jet A-1: ${Math.round(bharatiOps.fuel_state?.daily_burn_rate_l ?? 620)} L/day` :
                   sys.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* 3. Main Grid: Station Layout 2D (Left) + Power & Fuel (Center) + Overview/Autonomy/Actions (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: (isMaitri || isBharati) ? '1.5fr 1fr' : '1.25fr 1fr 0.9fr',
        gap: '1.25rem'
      }}>
        {/* Left Column: 2D Station Schematic Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isMaitri ? (
            <MaitriStationSchematic
              zones={schematicZones}
              windSpeedKmh={currentWindKmh}
              windDirectionCardinal={currentWindDir}
              temperatureC={currentTemp}
              selectedZoneId={selectedZone?.id}
              onSelectZone={setSelectedZone}
            />
          ) : isBharati ? (
            <BharatiStationSchematic
              zones={bharatiSchematicZones}
              windSpeedKmh={currentWindKmh}
              windSpeedKnots={currentWindKnots}
              windDirectionCardinal={currentWindDir}
              temperatureC={currentTemp}
              selectedZoneId={bharatiSelectedZone?.id}
              onSelectZone={setBharatiSelectedZone}
            />
          ) : (
            /* Bharati Fallback layout */
            <div className="antwin-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Station Layout (2D View)</h3>
                  <ProvenanceBadge dataClass="SIMULATED" />
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '320px', background: '#070d19', borderRadius: 8 }} />
            </div>
          )}

          {/* Maitri Polar Fleet Registry */}
          {isMaitri && fleetVehicles.length > 0 && (
            <MaitriPolarFleet fleet={fleetVehicles} />
          )}

          {/* Bharati Air Link & Mobility Quick Summary */}
          {isBharati && bharatiOps?.mobility_state && (
            <div className="antwin-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Polar Mobility & Novo / Progress Air Link
                </h4>
                <ProvenanceBadge dataClass="REFERENCE" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Field Access</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: bharatiOps.mobility_state.field_access === 'OPEN' ? '#10b981' : '#f59e0b' }}>
                    {bharatiOps.mobility_state.field_access}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Fleet Readiness</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                    {bharatiOps.mobility_state.vehicle_readiness_pct}% Available
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Air Link Window</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa' }}>
                    {bharatiOps.mobility_state.air_network_window}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center / Right Column: Power & Fuel + Overview & Autonomy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Autonomy Gauge Card */}
          <MissionAutonomyGauge
            autonomy={{
              ...autonomy,
              overall_autonomy_days: autonomyDays,
              limiting_constraint: isMaitri && ops ? ops.limiting_constraint : (isBharati && bharatiOps ? bharatiOps.mission_autonomy?.limiting_constraint : autonomy.limiting_constraint)
            }}
            onViewProvenance={onViewProvenance}
          />

          {/* Power & Energy Panel */}
          <div className="antwin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} color="#eab308" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {isBharati ? '3 × 100 kVA Combined Heat & Power (CHP)' : 'Power & Electrical Plant'}
                </h3>
              </div>
              <ProvenanceBadge dataClass="DERIVED" />
            </div>

            {/* If Bharati, show 3x CHP unit status cards */}
            {isBharati && bharatiOps?.power_state?.chp_units ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '0.75rem' }}>
                  {bharatiOps.power_state.chp_units.map((unit: any) => {
                    const isRunning = unit.status === 'RUNNING';
                    const isFailed = unit.status === 'FAILED' || unit.status === 'OFFLINE';
                    const statusColor = isRunning ? '#10b981' : (isFailed ? '#ef4444' : '#64748b');
                    return (
                      <div
                        key={unit.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${statusColor}40`,
                          borderRadius: 6,
                          padding: '6px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>{unit.id}</span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase' }}>
                            {unit.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          {unit.electrical_load_kwe.toFixed(1)} <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>kWe</span>
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#f59e0b' }}>
                          🔥 {unit.thermal_output_kwth.toFixed(1)} kWth
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Station Demand</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {Number(powerLoadKw || 0).toFixed(1)} kWe
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Avail Generation</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                      {(bharatiOps.power_state?.available_generation_kwe ?? 160).toFixed(1)} kWe
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Thermal Recov</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                      {(bharatiOps.thermal_state?.recovered_chp_kwth ?? 42).toFixed(1)} kWth
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>415V Station Demand</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {Number(powerLoadKw || 0).toFixed(1)} kWe
                    </strong>
                    {isMaitri && ops && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        {ops.genset_load_pct}% Load
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Online Alternators</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                      {isMaitri && ops ? `${ops.active_generators} × 62.5 kVA` : '2 Units Active'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Line Chart */}
            <div style={{ height: '115px', width: '100%' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 2 }}>
                Load Dynamics ({powerTrendPoints.length}h Window)
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerTrendPoints}>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#0e192f', border: '1px solid #38bdf8', fontSize: '0.75rem' }} />
                  <Line type="monotone" dataKey="generation_kw" name="Available (kWe)" stroke="#10b981" strokeWidth={1.8} dot={false} />
                  <Line type="monotone" dataKey="load_kw" name="Demand (kWe)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fuel & Inventory Panel */}
          <div className="antwin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gauge size={16} color="#f97316" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {isBharati ? 'Jet A-1 Automated Fuel Farm' : 'Fuel Ledger & Reserves'}
                </h3>
              </div>
              <ProvenanceBadge dataClass="DERIVED" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Usable Fuel Reserve</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(fuelRemainingL || 0).toLocaleString()} L
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                    {((Number(fuelRemainingL || 0) / 300000) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Daily Burn Rate</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(dailyFuelBurnL).toLocaleString()} L/day
                </div>
              </div>
            </div>

            {/* Fuel Bar Chart */}
            <div style={{ height: '95px', width: '100%' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 2 }}>
                Daily Consumption History
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelTrendPoints}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0e192f', border: '1px solid #38bdf8', fontSize: '0.75rem' }} />
                  <Bar dataKey="consumption_l" name="Burn (L)" fill="#f97316" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dedicated Quilty Bay RO Desalination Panel for Bharati */}
          {isBharati && bharatiOps?.water_state && (
            <div className="antwin-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Droplets size={16} color="#06b6d4" />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Quilty Bay RO Desalination & Storage
                  </h3>
                </div>
                <ProvenanceBadge dataClass="DERIVED" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>RO Daily Output</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(bharatiOps.water_state.production_rate_l_per_day).toLocaleString()} L/day
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Nominal: 12,000 L/day</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Freshwater Storage</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(bharatiOps.water_state.storage_level_l).toLocaleString()} L
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                    {bharatiOps.water_state.storage_pct}% of 45,000 L
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span>Crew Demand: 5,170 L/day (47 crew @ 110L/d)</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                  Autonomy: {bharatiOps.water_state.water_endurance_days?.toFixed(1) ?? '7.4'} days
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="antwin-panel">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>
              Operational Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => onNavigate('scenarios')}
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Launch Scenario Simulator</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('dependencies')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Inspect Dependency Graph</span>
                <GitBranch size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Dependencies & Impact | Asset Health | Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1.25rem' }}>
        {/* Col 1: Dependencies & Impact */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Dependencies & Impact</h3>
            <button
              onClick={() => onNavigate('dependencies')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View Graph <ArrowRight size={12} />
            </button>
          </div>

          {/* 5-Step Connected Flow Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {isBharati ? [
              { title: 'Weather', val: `${currentTemp}°C (${currentWindKmh} km/h)`, icon: Thermometer, color: '#38bdf8' },
              { title: 'HVAC', val: `${Number(bharatiOps?.thermal_state?.total_demand_kwth ?? 65).toFixed(1)} kWth`, icon: Flame, color: '#f59e0b' },
              { title: '3x CHP', val: `${Number(bharatiOps?.power_state?.total_demand_kwe ?? 65).toFixed(1)} kWe`, icon: Zap, color: '#10b981' },
              { title: 'Jet A-1', val: `${Math.round(bharatiOps?.fuel_state?.daily_burn_rate_l ?? 620)} L/d`, icon: Gauge, color: '#f97316' },
              { title: 'Quilty RO', val: `${Math.round(bharatiOps?.water_state?.storage_level_l ?? 38500).toLocaleString()} L`, icon: Droplets, color: '#06b6d4' }
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <React.Fragment key={i}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${node.color}40`,
                    borderRadius: 8,
                    padding: '0.6rem 0.5rem',
                    width: '95px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: `${node.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4
                    }}>
                      <Icon size={14} color={node.color} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>{node.title}</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>{node.val}</span>
                  </div>
                  {i < 4 && <ArrowRight size={16} color="#64748b" style={{ flexShrink: 0 }} />}
                </React.Fragment>
              );
            }) : [
              { title: 'Weather', val: `${currentTemp}°C (${currentWindKmh} km/h)`, icon: Thermometer, color: '#38bdf8' },
              { title: 'Heating', val: isMaitri && ops ? `${(ops.heating_demand_kwth ?? ops.heating_demand_kw ?? 110)?.toFixed?.(1) ?? '110.0'} kWth` : 'Heating Load ↑ 18%', icon: Flame, color: '#f59e0b' },
              { title: 'Power', val: isMaitri && ops ? `${(ops.power_demand_kwe ?? ops.power_load_kw ?? 65)?.toFixed?.(1) ?? '65.0'} kWe` : 'Power Load ↑ 12%', icon: Zap, color: '#10b981' },
              { title: 'Fuel', val: isMaitri && ops ? `${Math.round(ops.fuel_burn_rate_l_day ?? ops.daily_fuel_l ?? 750)} L/day` : 'Fuel Consumption ↑ 15%', icon: Gauge, color: '#f97316' },
              { title: 'Autonomy', val: `${Number(autonomyDays || 8.5).toFixed(1)} days`, icon: Activity, color: '#00d2ff' }
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <React.Fragment key={i}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${node.color}40`,
                    borderRadius: 8,
                    padding: '0.6rem 0.5rem',
                    width: '95px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: `${node.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4
                    }}>
                      <Icon size={14} color={node.color} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>{node.title}</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>{node.val}</span>
                  </div>
                  {i < 4 && <ArrowRight size={16} color="#64748b" style={{ flexShrink: 0 }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Col 2: Asset Health */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Asset Health Register</h3>
            <span style={{ color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer' }}>View All →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {assets_health.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#cbd5e1', width: '95px' }}>{a.name}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, margin: '0 10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${a.health_pct}%`,
                    height: '100%',
                    background: a.health_pct >= 85 ? '#10b981' : (a.health_pct >= 75 ? '#38bdf8' : '#f59e0b'),
                    borderRadius: 3
                  }} />
                </div>
                <strong style={{ color: '#ffffff', width: '30px', textAlign: 'right' }}>{a.health_pct}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Recent Activity */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Operational Telemetry Log</h3>
            <span style={{ color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer' }}>View All →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
            {activity_timeline.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{act.time}</span>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: 500 }}>{act.event}</div>
                  <div style={{ color: '#64748b', fontSize: '0.65rem' }}>{act.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
