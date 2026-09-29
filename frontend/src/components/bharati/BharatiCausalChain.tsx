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
  Droplets,
  ShieldCheck,
  Plane
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface Props {
  whyAutonomyChanged?: Array<{
    step?: number | string;
    title?: string;
    factor?: string;
    metric?: string;
    delta_str?: string;
    impact?: string;
  }>;
  temperatureC: number;
  windSpeedKmh: number;
  windSpeedKnots: number;
  thermalDemandKwth: number;
  powerDemandKwe: number;
  availableGenKwe: number;
  fuelBurnRateLDay: number;
  waterProductionLDay: number;
  missionAutonomyDays: number;
  limitingConstraint: string;
  fieldAccess: string;
  airNetworkWindow: string;
}

export const BharatiCausalChain: React.FC<Props> = ({
  whyAutonomyChanged,
  temperatureC,
  windSpeedKmh,
  windSpeedKnots,
  thermalDemandKwth,
  powerDemandKwe,
  availableGenKwe,
  fuelBurnRateLDay,
  waterProductionLDay,
  missionAutonomyDays,
  limitingConstraint,
  fieldAccess,
  airNetworkWindow
}) => {
  const getFieldTransitBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399', label: 'Field Access: NORMAL' };
      case 'CONSTRAINED':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', label: 'Field Access: CONSTRAINED' };
      case 'RESTRICTED':
      default:
        return { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.5)', color: '#f87171', label: 'Field Access: RESTRICTED' };
    }
  };

  const transitBadge = getFieldTransitBadge(fieldAccess);

  const steps = [
    {
      title: '1. Weather Trigger',
      icon: Thermometer,
      color: '#38bdf8',
      currentVal: `${Number(temperatureC || 0).toFixed(1)}°C | ${Number(windSpeedKmh || 0).toFixed(0)} km/h`,
      subtext: `Wind: ${Number(windSpeedKnots || 0).toFixed(0)} kn`,
      delta: whyAutonomyChanged?.[0]?.delta_str || 'Baseline',
      desc: whyAutonomyChanged?.[0]?.impact || 'Larsemann Hills coastal maritime environment'
    },
    {
      title: '2. HVAC Thermal Demand',
      icon: Flame,
      color: '#f59e0b',
      currentVal: `${Number(thermalDemandKwth || 0).toFixed(1)} kWth`,
      subtext: 'Building envelope loss',
      delta: whyAutonomyChanged?.[1]?.delta_str || 'Nominal',
      desc: whyAutonomyChanged?.[1]?.impact || 'Circulating hydronic HVAC + auxiliary heat'
    },
    {
      title: '3. 3x CHP Generation',
      icon: Zap,
      color: '#eab308',
      currentVal: `${Number(powerDemandKwe || 0).toFixed(1)} / ${Number(availableGenKwe || 0).toFixed(0)} kWe`,
      subtext: `Margin: ${(Number(availableGenKwe || 0) - Number(powerDemandKwe || 0)).toFixed(1)} kWe`,
      delta: whyAutonomyChanged?.[2]?.delta_str || 'Synchronized',
      desc: whyAutonomyChanged?.[2]?.impact || 'Cogeneration electrical bus & thermal recovery'
    },
    {
      title: '4. Jet A-1 & Water Balance',
      icon: Droplets,
      color: '#f97316',
      currentVal: `${Math.round(Number(fuelBurnRateLDay || 0))} L/d | RO ${Math.round(Number(waterProductionLDay || 0))} L/d`,
      subtext: `${(Number(fuelBurnRateLDay || 0) / 24).toFixed(1)} L/h burn`,
      delta: whyAutonomyChanged?.[3]?.delta_str || 'Nominal',
      desc: whyAutonomyChanged?.[3]?.impact || 'Quilty Bay seawater RO + Jet A-1 fuel farm'
    },
    {
      title: '5. Mission Autonomy',
      icon: ShieldCheck,
      color: '#22c55e',
      currentVal: `${Number(missionAutonomyDays || 0).toFixed(1)} Days`,
      subtext: `Limiting: ${limitingConstraint || 'Energy'}`,
      delta: whyAutonomyChanged?.[4]?.delta_str || 'Calculated',
      desc: whyAutonomyChanged?.[4]?.impact || 'Deterministic multi-domain mission endurance'
    }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(8, 20, 42, 0.85) 0%, rgba(5, 12, 26, 0.95) 100%)',
      borderRadius: 12,
      border: '1px solid rgba(56, 189, 248, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      padding: '1rem 1.25rem'
    }}>
      {/* Header with Title, Field Transit Badge, and Air Link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#38bdf8" />
          <h3 style={{
            margin: 0,
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#f8fafc',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            BHARATI CAUSAL PROPAGATION CHAIN
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            (Explainable Multi-Domain Physics: Weather → HVAC → 3xCHP → Fuel/RO → Autonomy)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            background: transitBadge.bg,
            border: `1px solid ${transitBadge.border}`,
            color: transitBadge.color,
            padding: '3px 8px',
            borderRadius: 4
          }}>
            {transitBadge.label}
          </span>

          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            background: airNetworkWindow === 'OPEN' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${airNetworkWindow === 'OPEN' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: airNetworkWindow === 'OPEN' ? '#86efac' : '#fca5a5',
            padding: '3px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Plane size={11} />
            Novo Link: {airNetworkWindow}
          </span>
        </div>
      </div>

      {/* 5-Step Propagation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.75rem'
      }}>
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Icon size={14} color={st.color} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#cbd5e1' }}>
                    {st.title}
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                  {st.currentVal}
                </div>

                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                  {st.subtext}
                </div>
              </div>

              <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: st.color, marginBottom: 2 }}>
                  {st.delta}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.25 }}>
                  {st.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
