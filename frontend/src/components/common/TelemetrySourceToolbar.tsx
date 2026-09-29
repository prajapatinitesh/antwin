import React from 'react';
import {
  Radio,
  Clock,
  Database
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Props {
  stationId?: 'MAITRI' | 'BHARATI';
  replayHour?: number;
  totalReplayRecords?: number;
  replayTimestamp?: string;
  isReplayPlaying?: boolean;
}

export const TelemetrySourceToolbar: React.FC<Props> = ({
  stationId,
  replayHour = 1,
  totalReplayRecords = 168,
  replayTimestamp,
  isReplayPlaying = false
}) => {
  const {
    telemetryMode,
    setTelemetryMode,
    isLiveRunning,
    liveDemoTimestamp
  } = useTelemetry();

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(8, 20, 42, 0.95) 0%, rgba(5, 12, 26, 0.95) 100%)',
      borderRadius: 12,
      border: telemetryMode === 'LIVE_DEMO'
        ? '1px solid rgba(0, 210, 255, 0.4)'
        : '1px solid rgba(56, 189, 248, 0.3)',
      boxShadow: telemetryMode === 'LIVE_DEMO'
        ? '0 6px 24px rgba(0, 210, 255, 0.12)'
        : '0 6px 24px rgba(0, 0, 0, 0.45)',
      padding: '0.85rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.85rem',
      transition: 'border 0.2s ease, box-shadow 0.2s ease'
    }}>
      {/* Left: Mode Switcher Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
            TELEMETRY SOURCE:
          </span>
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: 3,
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* 1. LIVE DEMO Button */}
            <button
              id="btn-telemetry-live-demo"
              onClick={() => setTelemetryMode('LIVE_DEMO')}
              style={{
                background: telemetryMode === 'LIVE_DEMO'
                  ? 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)'
                  : 'transparent',
                color: telemetryMode === 'LIVE_DEMO' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                boxShadow: telemetryMode === 'LIVE_DEMO' ? '0 2px 10px rgba(0, 210, 255, 0.4)' : 'none'
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: telemetryMode === 'LIVE_DEMO' ? '#ffffff' : '#34d399',
                boxShadow: telemetryMode === 'LIVE_DEMO' ? '0 0 6px #ffffff' : 'none'
              }} />
              <span>LIVE DEMO</span>
            </button>

            {/* 2. 7-DAY WINTER REPLAY Button */}
            <button
              id="btn-telemetry-replay"
              onClick={() => setTelemetryMode('REPLAY')}
              style={{
                background: telemetryMode === 'REPLAY'
                  ? 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)'
                  : 'transparent',
                color: telemetryMode === 'REPLAY' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                boxShadow: telemetryMode === 'REPLAY' ? '0 2px 10px rgba(13, 148, 136, 0.4)' : 'none'
              }}
            >
              <Database size={13} color={telemetryMode === 'REPLAY' ? '#ffffff' : '#14b8a6'} />
              <span>7-DAY WINTER REPLAY</span>
            </button>
          </div>
        </div>

        {/* Provenance Badge & Operational Tag */}
        {telemetryMode === 'LIVE_DEMO' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: 'rgba(0, 210, 255, 0.12)',
              border: '1px solid rgba(0, 210, 255, 0.35)',
              color: '#38bdf8',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Radio size={12} className={isLiveRunning ? 'pulse-radar' : ''} />
              <span>LOCAL SIMULATION • 1 Hz</span>
            </span>
            <ProvenanceBadge dataClass="SIMULATED" />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>168-HR HISTORICAL REPLAY</span>
            </span>
            <ProvenanceBadge dataClass="REPLAY" />
          </div>
        )}
      </div>

      {/* Right: Timestamp & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Dynamic Timestamp */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: '0.76rem',
          color: '#e2e8f0'
        }}>
          <Clock size={13} color={telemetryMode === 'LIVE_DEMO' ? '#00d2ff' : '#38bdf8'} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {telemetryMode === 'LIVE_DEMO'
              ? liveDemoTimestamp
              : (replayTimestamp ? replayTimestamp.replace('T', ' ').slice(0, 16) + ' UTC' : '2014-07-15 14:00 UTC')
            }
          </span>
          <span style={{ color: '#64748b', fontSize: '0.68rem' }}>
            {telemetryMode === 'LIVE_DEMO'
              ? '(Continuous Stream)'
              : `(Hr ${replayHour} / ${totalReplayRecords})`
            }
          </span>
        </div>
      </div>
    </div>
  );
};
