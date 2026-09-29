import React, { useState } from 'react';
import {
  AlertTriangle,
  Zap,
  Flame,
  Wind,
  Gauge,
  Radio,
  Clock,
  Truck,
  Wrench,
  CheckSquare,
  Square,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export interface ScenarioImpact {
  active_scenario: string;
  severity_pct: number;
  baseline_autonomy_days: number;
  scenario_autonomy_days: number;
  mitigated_autonomy_days: number;
  active_mitigations: string[];
  mitigation_options: Array<{
    id: string;
    name: string;
    reason: string;
    expected_effect: string;
    recovery_days: number;
    applied: boolean;
  }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scenarioImpact?: ScenarioImpact;
  onInjectScenario: (name: string, severity: number) => void;
  onClearScenario: () => void;
  onToggleMitigation: (mitigationName: string) => void;
}

export const MaitriScenarioInjector: React.FC<Props> = ({
  isOpen,
  onClose,
  scenarioImpact,
  onInjectScenario,
  onClearScenario,
  onToggleMitigation
}) => {
  if (!isOpen) return null;

  const SCENARIOS = [
    { id: 'Generator-02 Degradation', label: 'Generator-02 Degradation', icon: Zap, color: '#f59e0b', desc: 'Mechanical wear reduces alternator output & thermal recovery.' },
    { id: 'Generator-02 Failure', label: 'Generator-02 Failure', icon: AlertTriangle, color: '#ef4444', desc: 'Total unexpected trip of Gen-02; single generator islanding.' },
    { id: 'Extreme Cold', label: 'Extreme Cold (-35°C Snap)', icon: Flame, color: '#06b6d4', desc: 'Sudden polar temperature plunge elevates hydronic heating load.' },
    { id: 'High Wind', label: 'High Wind (Catabatic Gale)', icon: Wind, color: '#38bdf8', desc: 'Severe 75+ km/h wind restricts outdoor perimeter traversal.' },
    { id: 'Fuel Constraint', label: 'Fuel Constraint / Transfer Hold', icon: Gauge, color: '#f97316', desc: 'Manifold valve maintenance restricts usable diesel buffer.' },
    { id: 'Communication Loss', label: 'Communication Loss (SATCOM Blackout)', icon: Radio, color: '#a855f7', desc: 'Solar storm degrades Inmarsat link; station enters store-and-forward.' },
    { id: '3-Day Resupply Delay', label: '3-Day Resupply Delay', icon: Clock, color: '#eab308', desc: 'Pack ice delays resupply vessel voyage from Cape Town.' },
    { id: 'Vehicle Unavailable', label: 'Vehicle Unavailable (PistenBully Repair)', icon: Truck, color: '#64748b', desc: 'Heavy groomer maintenance halts deep ice core traverse.' },
    { id: 'Critical Asset Failure', label: 'Critical Asset Failure (Intake Pump)', icon: Wrench, color: '#dc2626', desc: 'Lake Priyadarshini water pump trip requires electrical switchover.' }
  ];

  const currentScenario = scenarioImpact?.active_scenario && scenarioImpact.active_scenario !== 'NONE'
    ? scenarioImpact.active_scenario
    : null;

  const [selectedScenario, setSelectedScenario] = useState<string>(currentScenario || SCENARIOS[0].id);
  const [severity, setSeverity] = useState<number>(scenarioImpact?.severity_pct || 35);

  const handleApply = () => {
    onInjectScenario(selectedScenario, severity);
  };

  const handleClear = () => {
    onClearScenario();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0b1528 0%, #060c18 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: 14,
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(8, 16, 32, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Scenario & Fault Injector (Deterministic Operational Simulation)
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, marginTop: 2 }}>
                Applies controlled operational faults onto the physical twin model without altering historical weather observations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: 6,
              padding: 6,
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Active Scenario Indicator Banner */}
          {currentScenario ? (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 8,
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} color="#fbbf24" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    ACTIVE SCENARIO: <span style={{ color: '#fbbf24' }}>{currentScenario.toUpperCase()}</span> ({scenarioImpact?.severity_pct}%)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 2 }}>
                    Operational model is evaluating cascading impact and autonomy resilience.
                  </div>
                </div>
              </div>
              <button
                onClick={handleClear}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RotateCcw size={13} /> Reset to Nominal
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 8,
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#34d399'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>SCENARIO STATUS: <strong>NOMINAL BASELINE</strong> (No active faults injected)</span>
              </div>
            </div>
          )}

          {/* Before / After Autonomy Comparison Strip */}
          {scenarioImpact && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Autonomy Impact Evaluation (Before vs After)
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {/* Baseline */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: '0.85rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>1. BASELINE AUTONOMY</div>
                  <strong style={{ fontSize: '1.4rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {scenarioImpact.baseline_autonomy_days} days
                  </strong>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 3 }}>Nominal operating envelope</div>
                </div>

                {/* Scenario (Raw impact) */}
                <div style={{
                  background: currentScenario ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: currentScenario ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 8,
                  padding: '0.85rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.68rem', color: currentScenario ? '#f87171' : '#94a3b8', fontWeight: 600 }}>
                    2. SCENARIO IMPACT
                  </div>
                  <strong style={{
                    fontSize: '1.4rem',
                    color: currentScenario ? '#ef4444' : '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {scenarioImpact.scenario_autonomy_days} days
                  </strong>
                  <div style={{ fontSize: '0.65rem', color: currentScenario ? '#fca5a5' : '#64748b', marginTop: 3 }}>
                    {currentScenario ? `Δ -${(scenarioImpact.baseline_autonomy_days - scenarioImpact.scenario_autonomy_days).toFixed(1)} days reduction` : 'No degradation'}
                  </div>
                </div>

                {/* Mitigated */}
                <div style={{
                  background: scenarioImpact.active_mitigations.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: scenarioImpact.active_mitigations.length > 0 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 8,
                  padding: '0.85rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.68rem', color: scenarioImpact.active_mitigations.length > 0 ? '#34d399' : '#94a3b8', fontWeight: 600 }}>
                    3. MITIGATED RECOVERY
                  </div>
                  <strong style={{
                    fontSize: '1.4rem',
                    color: scenarioImpact.active_mitigations.length > 0 ? '#34d399' : '#ffffff',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {scenarioImpact.mitigated_autonomy_days} days
                  </strong>
                  <div style={{ fontSize: '0.65rem', color: scenarioImpact.active_mitigations.length > 0 ? '#6ee7b7' : '#64748b', marginTop: 3 }}>
                    {scenarioImpact.active_mitigations.length > 0
                      ? `+${(scenarioImpact.mitigated_autonomy_days - scenarioImpact.scenario_autonomy_days).toFixed(1)} days recovered`
                      : 'Select mitigations below'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Selection Grid */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
              Select Operational Fault to Inject
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {SCENARIOS.map((sc) => {
                const Icon = sc.icon;
                const isSelected = selectedScenario === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 8,
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} color={sc.color} />
                      <strong style={{ fontSize: '0.78rem', color: isSelected ? '#38bdf8' : '#ffffff' }}>
                        {sc.label}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.66rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                      {sc.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Slider */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 8,
            padding: '0.85rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>
                Fault Severity: <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{severity}%</strong>
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Scales capacity degradation, thermal shock, or logistical delay
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                accentColor: '#38bdf8',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Actionable Explainable Mitigations Checklist */}
          {scenarioImpact?.mitigation_options && scenarioImpact.mitigation_options.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Explainable Mitigation Actions (Test Resilience)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {scenarioImpact.mitigation_options.map((mit) => (
                  <div
                    key={mit.id}
                    onClick={() => onToggleMitigation(mit.name)}
                    style={{
                      background: mit.applied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: mit.applied ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 8,
                      padding: '0.7rem 0.9rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {mit.applied ? (
                        <CheckSquare size={16} color="#10b981" />
                      ) : (
                        <Square size={16} color="#64748b" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: mit.applied ? '#34d399' : '#f1f5f9' }}>
                          {mit.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                          +{mit.recovery_days} days autonomy
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                        <strong>Reason:</strong> {mit.reason}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#6ee7b7', marginTop: 2 }}>
                        <strong>Expected effect:</strong> {mit.expected_effect}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(8, 16, 32, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Data Classification: <span style={{ color: '#38bdf8' }}>SIMULATED</span> | Provenance: ANTWIN Physics Model
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={handleApply}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '6px 18px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Sparkles size={14} /> Inject Selected Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
