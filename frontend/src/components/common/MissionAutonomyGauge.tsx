import React from 'react';
import { AutonomyData, Provenance } from '../../types/antwin';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Props {
  autonomy?: AutonomyData;
  onViewProvenance?: (prov: Provenance) => void;
}

export const MissionAutonomyGauge: React.FC<Props> = ({ autonomy, onViewProvenance }) => {
  const days = autonomy?.overall_autonomy_days ?? 8.4;
  const status = autonomy?.status ?? 'Within Safe Range';
  const breakdown = autonomy?.breakdown ?? {
    energy_days: 9.1,
    fuel_days: 11.2,
    water_days: 15.6,
    provisions_days: 17.8,
    spare_days: 8.7,
    asset_margin_days: 6.8,
    logistics_days: 9.0
  };

  const isSafe = days >= 7.0;

  const items = [
    { label: 'Energy', value: `${breakdown.energy_days} d`, color: '#38bdf8' },
    { label: 'Fuel', value: `${breakdown.fuel_days} d`, color: '#2dd4bf' },
    { label: 'Water', value: `${breakdown.water_days} d`, color: '#3b82f6' },
    { label: 'Food', value: `${breakdown.provisions_days} d`, color: '#818cf8' },
    { label: 'Spare Parts', value: `${breakdown.spare_days} d`, color: '#f59e0b' },
    { label: 'Assets', value: `${breakdown.asset_margin_days} d`, color: '#fb923c' },
    { label: 'Logistics', value: `${breakdown.logistics_days} d`, color: '#eab308' },
  ];

  return (
    <div className="antwin-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Mission Autonomy</h3>
          <ProvenanceBadge
            dataClass="DERIVED"
            provenance={autonomy?.provenance}
            onClick={onViewProvenance}
          />
        </div>
        <span style={{
          background: isSafe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isSafe ? '#34d399' : '#f87171',
          border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          fontSize: '0.68rem',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 9999
        }}>
          {status}
        </span>
      </div>

      {/* Body: Donut and Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flex: 1 }}>
        {/* Circular Donut Ring */}
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
            />
            {/* Multi-segment simulated stroke */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#00d2ff"
              strokeWidth="10"
              strokeDasharray="180 251"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray="80 251"
              strokeDashoffset="-90"
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {days}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              days
            </span>
          </div>
        </div>

        {/* Breakdown Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: it.color }} />
                <span style={{ color: '#cbd5e1' }}>{it.label}</span>
              </div>
              <span style={{ fontWeight: 600, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {it.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
