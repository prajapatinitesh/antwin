import React from 'react';
import { Radio, AlertTriangle, ShieldCheck, Clock, Activity, Building, Compass } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Props {
  replayIndex?: number;
  totalHours?: number;
  replayTimestamp?: string;
  activeAlertCount?: number;
  maitriAutonomyDays?: number;
  bharatiAutonomyDays?: number;
}

export const MissionStatusStrip: React.FC<Props> = ({
  replayIndex = 18,
  totalHours = 168,
  replayTimestamp = '2015-07-08T18:00:00Z',
  activeAlertCount = 2,
  maitriAutonomyDays = 8.4,
  bharatiAutonomyDays = 9.5
}) => {
  // Format readable replay date/time
  const formattedReplayDate = (() => {
    try {
      const d = new Date(replayTimestamp);
      return d.toUTCString().replace('GMT', 'UTC');
    } catch {
      return replayTimestamp;
    }
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* 1. Compact Header Panel */}
      <div
        className="antwin-panel"
        style={{
          padding: '1rem 1.4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(8, 23, 49, 0.95) 0%, rgba(5, 14, 28, 0.9) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.04em',
                margin: 0,
                textTransform: 'uppercase'
              }}
            >
              REMOTE MISSION CONTROL
            </h1>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              POLAR COMMAND
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0 0', fontWeight: 500 }}>
            Monitor • Analyze • Decide • Keep Antarctica Running
          </p>
        </div>

        {/* Replay Timestamp & Telemetry Source Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TELEMETRY SOURCE:</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                [ 7-DAY WINTER REPLAY ]
              </span>
              <ProvenanceBadge dataClass="REPLAY" />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Hour {replayIndex + 1} / {totalHours} • {formattedReplayDate}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-Level 5-Item KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {/* Metric 1: STATIONS */}
        <div
          className="antwin-panel"
          style={{
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Building size={16} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Stations
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              2 <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>(Maitri & Bharati)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: OPERATIONAL STATUS */}
        <div
          className="antwin-panel"
          style={{
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={16} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Operational
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              2 / 2 <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600 }}>ONLINE</span>
            </div>
          </div>
        </div>

        {/* Metric 3: ACTIVE ALERTS */}
        <div
          className="antwin-panel"
          style={{
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: activeAlertCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={16} color={activeAlertCount > 0 ? '#f59e0b' : '#10b981'} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Warnings
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: activeAlertCount > 0 ? '#f59e0b' : '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {activeAlertCount} <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>Monitored</span>
            </div>
          </div>
        </div>

        {/* Metric 4: REPLAY CLOCK */}
        <div
          className="antwin-panel"
          style={{
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Clock size={16} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Replay Clock
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
              Hour {replayIndex + 1} <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>/ {totalHours}</span>
            </div>
          </div>
        </div>

        {/* Metric 5: MISSION AUTONOMY SUMMARY */}
        <div
          className="antwin-panel"
          style={{
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Activity size={16} color="#06b6d4" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mission Autonomy
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#10b981' }}>M: {maitriAutonomyDays.toFixed(1)}d</span>
              <span style={{ color: '#475569', margin: '0 4px' }}>|</span>
              <span style={{ color: '#38bdf8' }}>B: {bharatiAutonomyDays.toFixed(1)}d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
