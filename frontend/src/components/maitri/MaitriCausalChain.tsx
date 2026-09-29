import React from 'react';
import {
  Thermometer,
  Flame,
  Zap,
  Gauge,
  Activity,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Droplets,
  HelpCircle
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface Props {
  whyAutonomyChanged: Array<{
    step: string;
    factor: string;
    delta_str: string;
    impact: string;
  }>;
  temperatureC: number;
  windSpeedKmh: number;
  windSpeedKnots: number;
  heatingDemandKwth: number;
  powerDemandKwe: number;
  fuelBurnRateLDay: number;
  missionAutonomyDays: number;
  limitingConstraint: string;
  fieldTransitStatus: 'SAFE' | 'CAUTION' | 'RESTRICTED' | 'NO_GO';
  lakeWaterIntakeStatus: string;
  pipeTraceHeatingKw: number;
}

export const MaitriCausalChain: React.FC<Props> = ({
  whyAutonomyChanged,
  temperatureC,
  windSpeedKmh,
  windSpeedKnots,
  heatingDemandKwth,
  powerDemandKwe,
  fuelBurnRateLDay,
  missionAutonomyDays,
  limitingConstraint,
  fieldTransitStatus,
  lakeWaterIntakeStatus,
  pipeTraceHeatingKw
}) => {
  const getFieldTransitBadge = (status: string) => {
    switch (status) {
      case 'SAFE':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399', label: 'Field Operations: SAFE' };
      case 'CAUTION':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', label: 'Field Operations: CAUTION' };
      case 'RESTRICTED':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171', label: 'Field Operations: RESTRICTED' };
      case 'NO_GO':
      default:
        return { bg: 'rgba(220, 38, 38, 0.25)', border: 'rgba(220, 38, 38, 0.5)', color: '#ef4444', label: 'Field Operations: NO-GO BLIZZARD' };
    }
  };

  const transitBadge = getFieldTransitBadge(fieldTransitStatus);

  const steps = [
    {
      title: '1. Weather Trigger',
      icon: Thermometer,
      color: '#38bdf8',
      currentVal: `${temperatureC}°C | ${windSpeedKmh} km/h`,
      subtext: `Wind: ${Number(windSpeedKnots || 0).toFixed(1)} kn`,
      delta: whyAutonomyChanged?.[0]?.delta_str || 'Baseline',
      desc: whyAutonomyChanged?.[0]?.impact || 'Ambient polar temperature & wind force'
    },
    {
      title: '2. Thermal Demand',
      icon: Flame,
      color: '#f59e0b',
      currentVal: `${Number(heatingDemandKwth || 0).toFixed(1)} kWth`,
      subtext: `Trace Heat: ${Number(pipeTraceHeatingKw || 0).toFixed(1)} kW`,
      delta: whyAutonomyChanged?.[1]?.delta_str || 'Nominal',
      desc: whyAutonomyChanged?.[1]?.impact || 'Central hydronic + Lake Priyadarshini pipe trace heat'
    },
    {
      title: '3. Electrical Load',
      icon: Zap,
      color: '#eab308',
      currentVal: `${Number(powerDemandKwe || 0).toFixed(1)} kWe`,
      subtext: '415V Bus Load',
      delta: whyAutonomyChanged?.[2]?.delta_str || 'Nominal',
      desc: whyAutonomyChanged?.[2]?.impact || 'Base load + electric heaters + water pumps'
    },
    {
      title: '4. Fuel Burn Rate',
      icon: Gauge,
      color: '#f97316',
      currentVal: `${Math.round(Number(fuelBurnRateLDay || 0))} L/day`,
      subtext: `${(Number(fuelBurnRateLDay || 0) / 24).toFixed(1)} L/hr`,
      delta: whyAutonomyChanged?.[3]?.delta_str || 'Nominal',
      desc: whyAutonomyChanged?.[3]?.impact || 'Generator diesel consumption at load'
    },
    {
      title: '5. Mission Autonomy',
      icon: Activity,
      color: '#00d2ff',
      currentVal: `${Number(missionAutonomyDays || 0).toFixed(1)} days`,
      subtext: `Limit: ${limitingConstraint}`,
      delta: whyAutonomyChanged?.[4]?.delta_str || 'Calibrated',
      desc: whyAutonomyChanged?.[4]?.impact || 'Days until next essential resupply requirement'
    }

  ];

  return (
    <div className="antwin-panel" style={{ padding: '1rem 1.25rem' }}>
      {/* Header with Title and Auxiliary Status Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#38bdf8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Dependency-Aware Causal Chain: "Why Did Autonomy Change?"
          </h3>
          <ProvenanceBadge
            dataClass="DERIVED"
            provenance={{
              data_class: 'DERIVED',
              source: 'Maitri Dynamic Operational Correlation Engine',
              formula: 'MA = min(E, F, W, P, S, A, L) where Fuel_Endurance = Remaining / Daily_Burn(Weather)',
              inputs: ['maitri_weather_observation', 'thermal_envelope_model', 'generator_loading_curve']
            }}
          />
        </div>

        {/* Operational Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Lake Water Intake Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#67e8f9',
            padding: '3px 9px',
            borderRadius: 6,
            fontSize: '0.72rem',
            fontWeight: 600
          }}>
            <Droplets size={13} color="#22d3ee" />
            <span>Lake Priyadarshini: {lakeWaterIntakeStatus}</span>
          </div>

          {/* Field Transit Envelope Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: transitBadge.bg,
            border: `1px solid ${transitBadge.border}`,
            color: transitBadge.color,
            padding: '3px 9px',
            borderRadius: 6,
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            <Compass size={13} color={transitBadge.color} />
            <span>{transitBadge.label}</span>
          </div>
        </div>
      </div>

      {/* 5-Step Connected Causal Cards Flow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        position: 'relative'
      }}>
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${st.color}35`,
                borderRadius: 8,
                padding: '0.75rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                position: 'relative',
                boxShadow: `0 4px 16px ${st.color}10`
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>
                  {st.title}
                </span>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: `${st.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={12} color={st.color} />
                </div>
              </div>

              {/* Main Metric & Delta */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 }}>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {st.currentVal}
                </strong>
              </div>

              {/* Delta badge */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: st.delta.includes('+') ? '#f59e0b' : (st.delta.includes('-') ? '#38bdf8' : '#34d399'),
                fontFamily: 'var(--font-mono)'
              }}>
                Δ {st.delta}
              </div>

              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                {st.subtext}
              </div>

              {/* Impact Narrative */}
              <div style={{
                marginTop: 'auto',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: 6,
                fontSize: '0.66rem',
                color: '#cbd5e1',
                lineHeight: 1.3
              }}>
                {st.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
