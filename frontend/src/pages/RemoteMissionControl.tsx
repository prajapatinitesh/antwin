import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Info,
  Calendar,
  Compass,
  Building,
  Ship,
  Clock,
  Radio,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { StationSummary, AutonomyData, LogisticsData, Provenance } from '../types/antwin';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { AntarcticaMap, StationMapMarker } from '../components/common/AntarcticaMap';
import { StationOverviewCard, StationCardData } from '../components/common/StationOverviewCard';
import { MissionStatusStrip } from '../components/common/MissionStatusStrip';
import { antwinApi } from '../services/api';
import { useTelemetry } from '../context/TelemetryContext';
import { TelemetrySourceToolbar } from '../components/common/TelemetrySourceToolbar';

interface Props {
  stations: StationSummary[];
  autonomy?: AutonomyData;
  logistics?: LogisticsData;
  onEnterStation: (stationId: string) => void;
  onNavigate: (pageId: string) => void;
  onViewProvenance: (prov: Provenance) => void;
}

export const RemoteMissionControl: React.FC<Props> = ({
  stations,
  autonomy,
  logistics,
  onEnterStation,
  onNavigate,
  onViewProvenance
}) => {
  const { telemetryMode, maitriLive, bharatiLive, liveDemoTimestamp } = useTelemetry();
  const isLive = telemetryMode === 'LIVE_DEMO';

  // Dynamic Replay State from Centralized Replay Engine
  const [maitriReplay, setMaitriReplay] = useState<any>(null);
  const [bharatiReplay, setBharatiReplay] = useState<any>(null);

  // Initial load and periodic subscription to centralized replay states
  useEffect(() => {
    let isMounted = true;

    const syncReplayStates = async () => {
      try {
        const [mRep, bRep] = await Promise.all([
          antwinApi.getMaitriReplayCurrent().catch(() => null),
          antwinApi.getBharatiReplayCurrent().catch(() => null)
        ]);
        if (!isMounted) return;
        if (mRep) setMaitriReplay(mRep);
        if (bRep) setBharatiReplay(bRep);
      } catch (err) {
        console.error('Failed to sync replay states on Mission Control:', err);
      }
    };

    syncReplayStates();
    const interval = setInterval(syncReplayStates, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Resolved dynamic values for Maitri (Live Demo vs 7-Day Replay)
  const maitriWeather = {
    temperatureC: isLive ? maitriLive.temperatureC : (maitriReplay?.current_weather?.temperature_c ?? -24.8),
    windSpeedKmh: isLive ? maitriLive.windSpeedKmh : (maitriReplay?.current_weather?.wind_speed_kmh ?? 12.6),
    pressureHpa: isLive ? maitriLive.pressureHpa : (maitriReplay?.current_weather?.pressure_hpa ?? 973.2)
  };
  const maitriOps = maitriReplay?.current_operations || (maitriReplay as any)?.operational_twin;
  const maitriAutonomyDays = isLive ? maitriLive.missionAutonomyDays : Number(maitriOps?.mission_autonomy_days ?? 8.4);
  const maitriLimitingConstraint = isLive ? maitriLive.limitingConstraint : (maitriOps?.limiting_constraint || 'Energy Margin');

  // Resolved dynamic values for Bharati (Live Demo vs 7-Day Replay)
  const bharatiWeather = {
    temperatureC: isLive ? bharatiLive.temperatureC : (bharatiReplay?.current_weather?.temperature_c ?? -18.2),
    windSpeedKmh: isLive ? bharatiLive.windSpeedKmh : (bharatiReplay?.current_weather?.wind_speed_kmh ?? 31.1),
    pressureHpa: isLive ? bharatiLive.pressureHpa : (bharatiReplay?.current_weather?.pressure_hpa ?? 983.4)
  };
  const bharatiOps = bharatiReplay?.current_operations;
  const bharatiAutonomyDays = isLive ? bharatiLive.missionAutonomyDays : Number(bharatiOps?.mission_autonomy?.overall_days ?? 9.5);
  const bharatiLimitingConstraint = isLive ? bharatiLive.limitingConstraint : (bharatiOps?.mission_autonomy?.limiting_constraint || 'Energy Margin');

  // Replay index and timestamp from centralized clock
  const currentReplayIndex = maitriReplay?.current_index ?? bharatiReplay?.current_index ?? 18;
  const currentReplayTimestamp = maitriReplay?.current_timestamp ?? bharatiReplay?.current_timestamp ?? '2015-07-08T18:00:00Z';

  // Map Station Markers
  const mapStations: StationMapMarker[] = [
    {
      id: 'MAITRI',
      name: 'Maitri Station',
      region: 'Schirmacher Oasis',
      lat: -70.7668,
      lon: 11.7308,
      elevationM: 117,
      temperatureC: maitriWeather.temperatureC,
      windSpeedKmh: maitriWeather.windSpeedKmh,
      autonomyDays: maitriAutonomyDays,
      status: 'OPERATIONAL',
      color: '#10b981'
    },
    {
      id: 'BHARATI',
      name: 'Bharati Station',
      region: 'Larsemann Hills',
      lat: -69.4068,
      lon: 76.1953,
      elevationM: 35,
      temperatureC: bharatiWeather.temperatureC,
      windSpeedKmh: bharatiWeather.windSpeedKmh,
      autonomyDays: bharatiAutonomyDays,
      status: 'OPERATIONAL',
      color: '#0284c7'
    }
  ];

  // Maitri Card Data
  const maitriCardData: StationCardData = {
    id: 'MAITRI',
    name: 'Maitri Station',
    region: 'Schirmacher Oasis',
    coordinates: "70° 45' S, 11° 44' E",
    elevationM: 117,
    status: 'OPERATIONAL',
    weather: maitriWeather,
    autonomy: {
      days: maitriAutonomyDays,
      limitingConstraint: maitriLimitingConstraint
    },
    subsystems: {
      powerStatus: `${maitriOps?.active_generators ?? 2} Gensets Online`,
      powerState: 'NORMAL',
      secondaryLabel: 'Heating',
      secondaryStatus: `${Number(maitriOps?.heating_demand_kwth ?? 110).toFixed(1)} kWth`,
      secondaryState: 'NORMAL',
      logisticsStatus: 'Novo Air Link',
      logisticsState: 'NORMAL',
      commStatus: 'SATCOM Link',
      commState: 'NORMAL'
    },
    dataClass: isLive ? 'SIMULATED' : 'REPLAY'
  };

  // Bharati Card Data
  const bharatiCardData: StationCardData = {
    id: 'BHARATI',
    name: 'Bharati Station',
    region: 'Larsemann Hills',
    coordinates: "69° 24' S, 76° 11' E",
    elevationM: 35,
    status: 'OPERATIONAL',
    weather: bharatiWeather,
    autonomy: {
      days: bharatiAutonomyDays,
      limitingConstraint: bharatiLimitingConstraint
    },
    subsystems: {
      powerStatus: `${bharatiOps?.power_state?.active_chp_count ?? 2}x CHP Active`,
      powerState: (bharatiOps?.power_state?.available_generation_kwe ?? 160) < 120 ? 'WARNING' : 'NORMAL',
      secondaryLabel: 'Water',
      secondaryStatus: `Quilty RO (${Math.round(bharatiOps?.water_state?.storage_level_l ?? 38500).toLocaleString()}L)`,
      secondaryState: bharatiOps?.water_state?.ro_plant_status === 'WARNING' ? 'WARNING' : 'NORMAL',
      logisticsStatus: 'Progress Link',
      logisticsState: 'NORMAL',
      commStatus: 'SATCOM Link',
      commState: 'NORMAL'
    },
    dataClass: isLive ? 'SIMULATED' : 'REPLAY'
  };

  // Structured Alerts according to Section 11 requirements
  const alertItems = [
    {
      severity: 'CRITICAL' as const,
      station: 'MAITRI',
      title: 'Generator-02 Alternator Vibration Warning',
      detail: 'Maitri Power Plant | 2.4 mm/s (operating threshold 2.0 mm/s)',
      time: '2h ago',
      provenance: 'SIMULATED' as const,
      stationId: 'maitri'
    },
    {
      severity: 'WARNING' as const,
      station: 'BHARATI',
      title: 'Quilty Bay RO Plant Bio-Fouling Rate ↑ 14%',
      detail: 'Bharati Water Utility | Membrane pressure differential 4.2 bar',
      time: '4h ago',
      provenance: 'DERIVED' as const,
      stationId: 'bharati'
    },
    {
      severity: 'INFO' as const,
      station: 'BOTH',
      title: 'Polar Weather Transition: Coastal Wind Inflow',
      detail: 'East Antarctica Maritime Belt | Larsemann & Schirmacher Oasis',
      time: '6h ago',
      provenance: 'REPLAY' as const,
      stationId: 'overview'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
      {/* 1. Replaced Compact Mission Control Header & 5-Item KPI Strip */}
      <MissionStatusStrip
        replayIndex={currentReplayIndex}
        totalHours={168}
        replayTimestamp={currentReplayTimestamp}
        activeAlertCount={alertItems.length}
        maitriAutonomyDays={maitriAutonomyDays}
        bharatiAutonomyDays={bharatiAutonomyDays}
      />

      {/* 2. Global Telemetry Source Toolbar (LIVE DEMO vs 7-DAY WINTER REPLAY) */}
      <TelemetrySourceToolbar
        replayHour={currentReplayIndex + 1}
        totalReplayRecords={168}
        replayTimestamp={currentReplayTimestamp}
      />

      {/* 3. Main Operations Area: Antarctica Operational Map (Left ~58%) + Station Cards (Right ~42%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gap: '1.25rem',
          alignItems: 'stretch'
        }}
      >
        {/* Left: Geographically Recognizable Antarctica Operational Map */}
        <div style={{ minHeight: '460px' }}>
          <AntarcticaMap
            stations={mapStations}
            onSelectStation={(id) => onEnterStation(id)}
            onEnterStation={(id) => onEnterStation(id)}
          />
        </div>

        {/* Right: Stacked Station Overview Cards for Maitri and Bharati */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <StationOverviewCard
            data={maitriCardData}
            onEnterStation={(id) => onEnterStation(id)}
            onViewProvenance={onViewProvenance}
          />
          <StationOverviewCard
            data={bharatiCardData}
            onEnterStation={(id) => onEnterStation(id)}
            onViewProvenance={onViewProvenance}
          />
        </div>
      </div>

      {/* 3. Bottom Operational Area: Alerts & Events (Col 1) | Logistics Pipeline (Col 2) | Mission Autonomy (Col 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.15fr 1fr', gap: '1.25rem' }}>
        {/* Col 1: Recent Alerts & Events */}
        <div className="antwin-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                RECENT ALERTS & EVENTS
              </h3>
              <ProvenanceBadge dataClass="SIMULATED" />
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alertItems.map((item, idx) => {
              const isCrit = item.severity === 'CRITICAL';
              const isWarn = item.severity === 'WARNING';
              const bg = isCrit
                ? 'rgba(239, 68, 68, 0.08)'
                : isWarn
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(56, 189, 248, 0.06)';
              const border = isCrit
                ? 'rgba(239, 68, 68, 0.3)'
                : isWarn
                ? 'rgba(245, 158, 11, 0.3)'
                : 'rgba(56, 189, 248, 0.25)';
              const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#38bdf8';

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.stationId !== 'overview') onEnterStation(item.station);
                  }}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 3,
                          background: color,
                          color: '#050e1d'
                        }}
                      >
                        {item.severity}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: item.station === 'MAITRI' ? '#10b981' : item.station === 'BHARATI' ? '#38bdf8' : '#a78bfa'
                        }}
                      >
                        [ {item.station} ]
                      </span>
                      <strong style={{ fontSize: '0.78rem', color: '#f8fafc' }}>{item.title}</strong>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.detail}</span>
                    <ProvenanceBadge dataClass={item.provenance} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Logistics / Resupply Pipeline */}
        <div className="antwin-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                LOGISTICS & RESUPPLY
              </h3>
              <ProvenanceBadge dataClass="REFERENCE" />
            </div>
            <button
              onClick={() => onNavigate('logistics')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              Pipeline <ArrowRight size={12} />
            </button>
          </div>

          {/* Stepper Pipeline: Goa -> Cape Town -> Expedition Vessel -> Antarctica -> Stations */}
          <div style={{ marginTop: '0.4rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 7,
                  left: 14,
                  right: 14,
                  height: 2,
                  background: 'rgba(255,255,255,0.08)',
                  zIndex: 1
                }}
              />
              {[
                { stage: 'Goa (NCPOR)', status: 'COMPLETED' },
                { stage: 'Cape Town', status: 'COMPLETED' },
                { stage: 'Vessel (Southern Ocean)', status: 'ACTIVE' },
                { stage: 'Coastal Ice', status: 'PENDING' },
                { stage: 'Stations', status: 'PENDING' }
              ].map((step, i) => {
                const isActive = step.status === 'ACTIVE';
                const isDone = step.status === 'COMPLETED';
                const circleBg = isActive ? '#00d2ff' : isDone ? '#10b981' : '#1e293b';
                const circleBorder = isActive ? '#ffffff' : isDone ? '#10b981' : '#475569';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: circleBg,
                        border: `2px solid ${circleBorder}`,
                        boxShadow: isActive ? '0 0 10px #00d2ff' : 'none'
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.62rem',
                        color: isActive ? '#38bdf8' : isDone ? '#94a3b8' : '#64748b',
                        fontWeight: isActive ? 700 : 500,
                        marginTop: 5,
                        textAlign: 'center'
                      }}
                    >
                      {step.stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: '0.72rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 0.8rem', borderRadius: 6 }}>
              <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Active Campaign</div>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>44th ISEA Resupply</div>
              <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.68rem', marginTop: 3 }}>
                Aviation Fuel & Generator Spares
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 0.8rem', borderRadius: 6 }}>
              <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Access Corridors</div>
              <div style={{ fontWeight: 700, color: '#10b981', marginTop: 2 }}>Novo / Progress Air Link</div>
              <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: 3 }}>Weather Dependent Window</div>
            </div>
          </div>
        </div>

        {/* Col 3: Mission Autonomy Card */}
        <div className="antwin-panel" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                MISSION AUTONOMY
              </h3>
              <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Current limiting operational constraint
              </p>
            </div>
            <ProvenanceBadge dataClass="DERIVED" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Maitri Station Row */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 8,
                padding: '0.65rem 0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => onEnterStation('MAITRI')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>MAITRI STATION</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {maitriAutonomyDays.toFixed(1)} <span style={{ fontSize: '0.7rem' }}>days</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                <span>Limiting: <strong style={{ color: '#f8fafc' }}>{maitriLimitingConstraint}</strong></span>
                <span>Secondary: Fuel Reserve</span>
              </div>
            </div>

            {/* Bharati Station Row */}
            <div
              style={{
                background: 'rgba(2, 132, 199, 0.06)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: 8,
                padding: '0.65rem 0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => onEnterStation('BHARATI')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>BHARATI STATION</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {bharatiAutonomyDays.toFixed(1)} <span style={{ fontSize: '0.7rem' }}>days</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                <span>Limiting: <strong style={{ color: '#f8fafc' }}>{bharatiLimitingConstraint}</strong></span>
                <span>Secondary: Quilty RO Margin</span>
              </div>
            </div>

            <div style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.3 }}>
              Formulation: min(energy, fuel, water, provisions, critical_spares, asset_margin, logistics)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.72rem',
          color: '#64748b'
        }}
      >
        <span>ANTWIN | National Centre for Polar and Ocean Research (NCPOR) | Ministry of Earth Sciences (MoES)</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ color: '#38bdf8' }}>Smart Automation • Theme 26060</span>
          <span>Smarter Decisions. Safer Missions.</span>
        </div>
      </footer>
    </div>
  );
};
