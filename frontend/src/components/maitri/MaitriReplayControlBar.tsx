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

export const MaitriReplayControlBar: React.FC<Props> = ({
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
              source: 'docs/Content/data/maitri/maitri_winter_replay.csv (168h series)',
              source_year: 2014,
              station: 'Maitri'
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              <CloudSnow size={13} color="#ef4444" />
              <span>{activeEvents[0]}</span>
            </div>
          )}
        </div>

        {/* Right: Replay Timestamp & Scenario Injector Trigger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: '0.75rem',
            color: '#cbd5e1'
          }}>
            <Clock size={13} color="#38bdf8" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {currentTimestamp ? currentTimestamp.replace('T', ' ').slice(0, 16) : '2014-07-15 14:00'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.68rem' }}>
              (Hr {currentIndex + 1} / {totalRecords})
            </span>
          </div>

          {/* Scenario Injector Trigger Button */}
          <button
            onClick={onOpenScenarioModal}
            style={{
              background: activeScenario
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)',
              border: activeScenario
                ? '1px solid rgba(245, 158, 11, 0.5)'
                : '1px solid rgba(56, 189, 248, 0.35)',
              color: activeScenario ? '#fbbf24' : '#38bdf8',
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={13} />
            <span>Scenario Injector</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Progress Slider with Hour markers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min={0}
          max={totalRecords > 0 ? totalRecords - 1 : 167}
          value={currentIndex}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          style={{
            flex: 1,
            accentColor: '#38bdf8',
            cursor: 'pointer',
            height: '6px'
          }}
        />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: '#38bdf8',
          fontWeight: 700,
          minWidth: '45px',
          textAlign: 'right'
        }}>
          {progressPct.toFixed(0)}%
        </span>
      </div>

      {/* Bottom Row: Controls (Play/Pause, Step Back/Forward, Speed multipliers, Reset) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Playback Transport Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onSeek(Math.max(0, currentIndex - 1))}
            title="Step Back 1 Hour"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={onPlayPause}
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '6px 16px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {isPlaying ? (
              <>
                <Pause size={14} fill="#ffffff" /> Pause Replay
              </>
            ) : (
              <>
                <Play size={14} fill="#ffffff" /> Play Replay
              </>
            )}
          </button>

          <button
            onClick={() => onSeek(Math.min(totalRecords - 1, currentIndex + 1))}
            title="Step Forward 1 Hour"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={onReset}
            title="Reset to Day 1 Hour 0"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.72rem'
            }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        {/* Speed Multipliers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: 4 }}>Playback Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                color: speed === s ? '#38bdf8' : '#94a3b8',
                border: speed === s ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: speed === s ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
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
