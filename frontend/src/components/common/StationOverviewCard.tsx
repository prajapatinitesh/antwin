import React from 'react';
import {
  Thermometer,
  Wind,
  Gauge,
  ArrowRight,
  Zap,
  Droplets,
  Radio,
  Truck,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { Provenance } from '../../types/antwin';

export interface StationCardData {
  id: string; // 'MAITRI' | 'BHARATI'
  name: string;
  region: string;
  coordinates: string;
  elevationM: number;
  imageUrl?: string;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
  weather: {
    temperatureC: number;
    windSpeedKmh: number;
    windSpeedKnots?: number;
    pressureHpa: number;
  };
  autonomy: {
    days: number;
    limitingConstraint: string;
  };
  subsystems: {
    powerStatus: string;
    powerState: 'NORMAL' | 'WARNING' | 'CRITICAL';
    secondaryStatus?: string;
    secondaryLabel?: string; // 'Water' for Bharati, 'Heating' for Maitri
    secondaryState?: 'NORMAL' | 'WARNING' | 'CRITICAL';
    logisticsStatus: string;
    logisticsState: 'NORMAL' | 'WARNING' | 'CRITICAL';
    commStatus: string;
    commState: 'NORMAL' | 'WARNING' | 'CRITICAL';
  };
  provenance?: Provenance;
  dataClass?: 'REPLAY' | 'SIMULATED' | 'REFERENCE' | 'DERIVED';
}

interface Props {
  data: StationCardData;
  onEnterStation: (stationId: string) => void;
  onViewProvenance?: (prov: Provenance) => void;
}

export const StationOverviewCard: React.FC<Props> = ({
  data,
  onEnterStation,
  onViewProvenance
}) => {
  const isMaitri = data.id === 'MAITRI';
  const accentColor = isMaitri ? '#10b981' : '#0284c7';
  const accentBorder = isMaitri ? 'rgba(16, 185, 129, 0.35)' : 'rgba(2, 132, 199, 0.35)';
  const accentGlow = isMaitri ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)';

  const getStateColor = (st?: string) => {
    if (st === 'CRITICAL') return '#ef4444';
    if (st === 'WARNING') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div
      className="antwin-panel"
      style={{
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        border: `1px solid ${accentBorder}`,
        background: `linear-gradient(135deg, rgba(8, 23, 49, 0.7) 0%, rgba(5, 14, 28, 0.85) 100%)`,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
        position: 'relative',
        borderRadius: 10
      }}
    >
      {/* 1. Header: Station Name + Operational Status + REPLAY badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              border: `1px solid ${accentBorder}`
            }}
          >
            <img
              src={
                data.imageUrl ||
                (isMaitri
                  ? 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=400&q=80'
                  : 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=400&q=80')
              }
              alt={data.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: accentColor,
                  boxShadow: `0 0 8px ${accentColor}`
                }}
              />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                {data.name.toUpperCase()}
              </h3>
              <ProvenanceBadge dataClass={data.dataClass || 'SIMULATED'} />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
              {data.region} • East Antarctica
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span
            style={{
              background: data.status === 'OPERATIONAL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: data.status === 'OPERATIONAL' ? '#34d399' : '#f87171',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
              letterSpacing: '0.04em'
            }}
          >
            ● {data.status}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            Elev: {data.elevationM} m
          </span>
        </div>
      </div>

      {/* 2. Middle Row: Environmental Observation Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: '0.6rem 0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Thermometer size={16} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {data.weather.temperatureC.toFixed(1)}°C
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Temperature</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wind size={16} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {Math.round(data.weather.windSpeedKmh)} <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>km/h</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
              Wind {data.weather.windSpeedKnots ? `(${data.weather.windSpeedKnots.toFixed(0)} kt)` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Gauge size={16} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {data.weather.pressureHpa.toFixed(1)} <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>hPa</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Barometric</div>
          </div>
        </div>
      </div>

      {/* 3. Mission Autonomy & Limiting Constraint Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: accentGlow,
          border: `1px solid ${accentBorder}`,
          borderRadius: 8,
          padding: '0.6rem 0.85rem'
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Mission Autonomy
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {data.autonomy.days.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: accentColor }}>days</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Limiting Constraint</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            {data.autonomy.limitingConstraint}
          </div>
        </div>
      </div>

      {/* 4. Subsystems Status Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {/* Power */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 6,
            padding: '5px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={11} color={getStateColor(data.subsystems.powerState)} />
            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Power</span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: getStateColor(data.subsystems.powerState) }}>
            {data.subsystems.powerStatus}
          </span>
        </div>

        {/* Secondary: Water for Bharati or Heating for Maitri */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 6,
            padding: '5px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isMaitri ? (
              <Activity size={11} color={getStateColor(data.subsystems.secondaryState)} />
            ) : (
              <Droplets size={11} color={getStateColor(data.subsystems.secondaryState)} />
            )}
            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
              {data.subsystems.secondaryLabel || (isMaitri ? 'Heating' : 'Water')}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: getStateColor(data.subsystems.secondaryState) }}>
            {data.subsystems.secondaryStatus || 'Stable'}
          </span>
        </div>

        {/* Logistics */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 6,
            padding: '5px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Truck size={11} color={getStateColor(data.subsystems.logisticsState)} />
            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Logistics</span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: getStateColor(data.subsystems.logisticsState) }}>
            {data.subsystems.logisticsStatus}
          </span>
        </div>

        {/* Communication */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 6,
            padding: '5px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Radio size={11} color={getStateColor(data.subsystems.commState)} />
            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>SATCOM</span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: getStateColor(data.subsystems.commState) }}>
            {data.subsystems.commStatus}
          </span>
        </div>
      </div>

      {/* 5. Primary Action Button: ENTER STATION */}
      <button
        onClick={() => onEnterStation(data.id)}
        style={{
          width: '100%',
          marginTop: '0.25rem',
          padding: '9px 16px',
          background: isMaitri
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(14, 165, 233, 0.15) 100%)',
          border: `1px solid ${accentBorder}`,
          borderRadius: 7,
          color: '#ffffff',
          fontSize: '0.85rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.2s ease',
          boxShadow: `0 2px 10px ${accentGlow}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 4px 16px ${accentBorder}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 2px 10px ${accentGlow}`;
        }}
      >
        <span>ENTER {data.name.toUpperCase()}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
