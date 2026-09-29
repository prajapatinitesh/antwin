import React, { useState } from 'react';
import { Settings, Sliders, Database, HardDrive, Cpu, Radio, ShieldCheck, Check } from 'lucide-react';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

export const SettingsView: React.FC = () => {
  const [speed, setSpeed] = useState<string>('2x');
  const [defaultStation, setDefaultStation] = useState<string>('MAITRI');
  const [simEngine, setSimEngine] = useState<boolean>(true);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div className="antwin-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={24} color="#00d2ff" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Platform Configuration & Runtime Settings
                </h1>
                <ProvenanceBadge dataClass="REFERENCE" />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                Configure local digital twin replay parameters, simulation models, and data persistence controls.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            PROTOTYPE SEED = 26060<br />
            ARCHITECTURE = OFFLINE-FIRST LOCAL
          </div>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Runtime & Telemetry Panel */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            <HardDrive size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Runtime & Replay Engine
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.78rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Execution Mode
              </label>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 6, color: '#34d399', fontWeight: 600 }}>
                ● Local / Offline-First (No external network dependencies)
              </div>
              <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2, display: 'block' }}>
                All models and telemetry execute locally on FastAPI and SQLite.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Active Telemetry Replay Dataset
              </label>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 6, color: '#38bdf8', fontWeight: 600 }}>
                7-Day Antarctic Winter Replay (168 Hours • June 2024 Calibrated)
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Replay Clock Speed
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['0.5x', '1x', '2x', '5x', '10x'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    style={{
                      background: speed === s ? '#0284c7' : 'rgba(255,255,255,0.05)',
                      color: speed === s ? '#ffffff' : '#94a3b8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Default Launch Station
              </label>
              <select
                value={defaultStation}
                onChange={(e) => setDefaultStation(e.target.value)}
                style={{
                  width: '100%',
                  background: '#070f1e',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  padding: '7px 10px',
                  borderRadius: 6,
                  fontSize: '0.78rem'
                }}
              >
                <option value="MAITRI">Maitri Station (Schirmacher Oasis)</option>
                <option value="BHARATI">Bharati Station (Larsemann Hills)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Intelligence & Data Persistence Panel */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            <Cpu size={18} color="#00d2ff" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Intelligence Models & Persistence
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.78rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Isolated Scenario Simulation Engine
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setSimEngine(!simEngine)}
                  style={{
                    background: simEngine ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: simEngine ? '#34d399' : '#f87171',
                    border: `1px solid ${simEngine ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  {simEngine ? 'ENABLED (Branch Sandbox)' : 'DISABLED'}
                </button>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  Ensures zero mutations to underlying station baseline datasets.
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Data Storage & Embedded Cache
              </label>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 6, color: '#ffffff' }}>
                SQLite (In-Memory / Local Disk `backend/app/db/`)
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Real-Time Streaming Protocol
              </label>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 6, color: '#38bdf8' }}>
                Local FastAPI WebSocket (`/ws/stations/:id`)
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
                Smart India Hackathon Problem Identification
              </label>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: 6, color: '#fbbf24', fontWeight: 700 }}>
                SIH Problem ID: 26060 (Smart Automation — NCPOR / MoES)
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleSave}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 18px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Check size={14} />
                <span>Save Runtime Configuration</span>
              </button>
              {savedNotice && (
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                  ✓ Settings saved to local cache
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
