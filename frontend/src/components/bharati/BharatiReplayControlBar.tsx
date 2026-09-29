import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Gauge,
  Clock,
  Sparkles,
  CloudSnow,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface Props {
  isPlaying: boolean;
  speed: number;
  currentIndex: number;
  totalRecords: number;
  currentTimestamp: string;
  activeEvents: string[];
  activeScenario?: { name: string; severity: number; mitigations?: string[]; active_mitigations?: string[] } | null;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (index: number) => void;
  onReset: () => void;
  onOpenScenarioModal: () => void;
}

export const BharatiReplayControlBar: React.FC<Props> = ({
  isPlaying,
  speed,
  currentIndex,
  totalRecords,
  currentTimestamp,
  activeEvents,
  activeScenario,
  onPlayPause,
  onSpeedChange,
  onSeek,
  onReset,
  onOpenScenarioModal
}) => {
  const speeds = [0.5, 1, 2, 5, 10];
  const progressPct = totalRecords > 0 ? (currentIndex / (totalRecords - 1)) * 100 : 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(8, 20, 42, 0.95) 0%, rgba(5, 12, 26, 0.95) 100%)',
      borderRadius: 12,
      border: '1px solid rgba(56, 189, 248, 0.3)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45)',
      padding: '0.85rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      {/* Top Row: Telemetry Source (Offline REPLAY), Active Scenario Badge, Timestamp & Scenario Injector Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: Strict Telemetry Source Label & Provenance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            TELEMETRY SOURCE:
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            padding: '4px 10px',
            borderRadius: 6,
            color: '#38bdf8',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
            7-Day Winter Replay
          </div>
          <ProvenanceBadge
            dataClass="REPLAY"
            provenance={{
              data_class: 'REPLAY',
              source: 'docs/Content/data/bharati/bharati_winter_replay.csv (168h series)',
              source_year: 2015,
              station: 'Bharati'
            }}
          />
        </div>

        {/* Center: Active Scenario or Weather Event Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeScenario && activeScenario.name ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <AlertTriangle size={13} color="#f59e0b" />
              <span>SCENARIO: {activeScenario.name.toUpperCase()} ({activeScenario.severity}%)</span>
            </div>
          ) : (
            <div style={{
              fontSize: '0.68rem',
              color: '#64748b',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              SCENARIO: <span style={{ color: '#94a3b8' }}>NONE (Nominal)</span>
            </div>
          )}

          {activeEvents && activeEvents.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {activeEvents.slice(0, 2).map((ev, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <CloudSnow size={11} />
                  {ev}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Timestamp & Scenario Injector Trigger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <Clock size={14} color="#38bdf8" />
            <span>{currentTimestamp ? currentTimestamp.replace('T', ' ').slice(0, 16) : '2015-07-08 00:00'} UTC</span>
            <span style={{ color: '#64748b', marginLeft: 4 }}>
              (Hr {currentIndex + 1} / {totalRecords || 168})
            </span>
          </div>

          <button
            onClick={onOpenScenarioModal}
            style={{
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: 6,
              color: '#fbbf24',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            title="Open Bharati Scenario & Fault Injector"
          >
            <Zap size={14} color="#f59e0b" />
            <span>⚡ Scenario Injector</span>
          </button>
        </div>
      </div>

      {/* Scrubber Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalRecords - 1)}
          value={currentIndex}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            height: 6,
            accentColor: '#38bdf8',
            cursor: 'pointer',
            borderRadius: 3
          }}
        />
        <span style={{
          fontSize: '0.72rem',
          color: '#94a3b8',
          fontFamily: 'monospace',
          minWidth: 45,
          textAlign: 'right'
        }}>
          {progressPct.toFixed(0)}%
        </span>
      </div>

      {/* Bottom Controls Row: Play/Pause, Step, Speeds, Reset */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingTop: 4,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Playback action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onSeek(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 6,
              color: currentIndex === 0 ? '#475569' : '#cbd5e1',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Step Back 1 Hour"
          >
            <SkipBack size={13} />
            <span>-1h</span>
          </button>

          <button
            onClick={onPlayPause}
            style={{
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
              border: `1px solid ${isPlaying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
              borderRadius: 6,
              color: isPlaying ? '#fca5a5' : '#86efac',
              padding: '5px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Replay' : 'Resume Play'}</span>
          </button>

          <button
            onClick={() => onSeek((currentIndex + 1) % (totalRecords || 1))}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 6,
              color: '#cbd5e1',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Step Forward 1 Hour"
          >
            <span>+1h</span>
            <SkipForward size={13} />
          </button>

          <button
            onClick={onReset}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 6,
              color: '#94a3b8',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Reset to Hour 0"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed multiplier selector buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginRight: 2 }}>
            <Gauge size={13} />
            SPEED:
          </span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? '#0284c7' : 'rgba(255, 255, 255, 0.04)',
                border: speed === s ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                color: speed === s ? '#ffffff' : '#94a3b8',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: speed === s ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
