import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Zap,
  Flame,
  ShieldCheck,
  CheckSquare,
  Square,
  HelpCircle,
  Sliders,
  RotateCcw,
  Info,
  Droplets
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scenarioImpact?: {
    active_scenario_name?: string | null;
    severity_pct?: number;
    active_mitigations?: string[];
    baseline_autonomy_days?: number;
    scenario_autonomy_days?: number;
    mitigated_autonomy_days?: number;
    available_mitigations?: Array<{
      id: string;
      name: string;
      category: string;
      explanation: string;
    }>;
  };
  onInjectScenario: (name: string, severity: number) => void;
  onClearScenario: () => void;
  onToggleMitigation: (name: string) => void;
}

const BHARATI_SCENARIOS = [
  {
    name: 'CHP-02 Failure',
    category: 'Power & Thermal (Hero Scenario)',
    severityDefault: 100,
    hasSeveritySlider: false,
    description: 'Catastrophic mechanical trip of 100 kVA CHP-02 unit. Available power drops from 160 kWe to 80 kWe, thermal recovery drops by 45 kWth, forcing emergency load shedding or standby CHP-03 dispatch.'
  },
  {
    name: 'RO Plant Degradation',
    category: 'Water & Life Support (Hero Scenario)',
    severityDefault: 50,
    hasSeveritySlider: true,
    description: 'High-pressure seawater RO membrane scaling drops fresh water output by up to 60%. Tank buffer depletes at 215 L/h, making water endurance the primary mission-limiting constraint.'
  },
  {
    name: 'CHP-01 Degradation',
    category: 'Power & Thermal',
    severityDefault: 35,
    hasSeveritySlider: true,
    description: 'Turbocharger fouling and injector wear on prime CHP-01 unit. Output drops and Specific Fuel Consumption (SFC) increases by 15%.'
  },
  {
    name: 'CHP-03 Failure',
    category: 'Power & Thermal',
    severityDefault: 100,
    hasSeveritySlider: false,
    description: 'Control panel fault on standby CHP-03 unit. Station loses n-1 generation redundancy, severely depressing critical spare coverage.'
  },
  {
    name: 'Extreme Cold Shock (-32°C)',
    category: 'Thermal Environment',
    severityDefault: 40,
    hasSeveritySlider: true,
    description: 'Sudden synoptic polar freeze in Larsemann Hills increases building envelope convective loss by 32 kWth, elevating auxiliary hydronic burner demand.'
  },
  {
    name: 'High Wind / Maritime Gale',
    category: 'Environmental / Logistics',
    severityDefault: 50,
    hasSeveritySlider: true,
    description: 'Prydz Bay gale with gusts exceeding 45 knots closes the Novo/Progress air network window and restricts all external field vehicle transit.'
  },
  {
    name: 'Seawater Pump House Failure',
    category: 'Water Utility',
    severityDefault: 100,
    hasSeveritySlider: false,
    description: 'Quilty Bay heated pipeline intake freeze-up or submersible pump electrical fault trips raw seawater feed to the RO plant.'
  },
  {
    name: 'Jet A-1 Fuel Line Restriction',
    category: 'Fuel Infrastructure',
    severityDefault: 30,
    hasSeveritySlider: true,
    description: 'Partial ice crystal contamination in automated fuel farm transfer manifold restricts continuous delivery from 300,000 L bulk tanks.'
  },
  {
    name: 'Water Storage Tank Contamination Risk',
    category: 'Life Support',
    severityDefault: 45,
    hasSeveritySlider: true,
    description: 'Primary 45,000 L storage buffer partition isolated for emergency UV sanitization, cutting active freshwater reserve in half.'
  },
  {
    name: 'SATCOM Dome Blackout',
    category: 'Communications',
    severityDefault: 100,
    hasSeveritySlider: false,
    description: 'C-band antenna steering servo failure cuts high-speed telemetry link to NCPOR Headquarters in Goa, forcing failover to VHF radio.'
  },
  {
    name: '3-Day Resupply Window Cancellation',
    category: 'Expedition Logistics',
    severityDefault: 60,
    hasSeveritySlider: true,
    description: 'Sea-ice pack drift delays Prydz Bay expedition vessel resupply operations by 3 days, depleting scheduled mission inventory.'
  },
  {
    name: 'Hägglunds Tracked Vehicle Breakdown',
    category: 'Polar Mobility Fleet',
    severityDefault: 75,
    hasSeveritySlider: true,
    description: 'Drive sprocket failure on primary heavy transporter halts remote science traverse operations and cargo hauling.'
  }
];

export const BharatiScenarioInjector: React.FC<Props> = ({
  isOpen,
  onClose,
  scenarioImpact,
  onInjectScenario,
  onClearScenario,
  onToggleMitigation
}) => {
  const [selectedScenarioName, setSelectedScenarioName] = useState<string>('CHP-02 Failure');
  const [severity, setSeverity] = useState<number>(100);

  if (!isOpen) return null;

  const activeScenario = scenarioImpact?.active_scenario_name;
  const activeMitigations = scenarioImpact?.active_mitigations || [];
  const currentScenarioObj = BHARATI_SCENARIOS.find(s => s.name === selectedScenarioName) || BHARATI_SCENARIOS[0];

  const handleSelectScenario = (sc: typeof BHARATI_SCENARIOS[0]) => {
    setSelectedScenarioName(sc.name);
    setSeverity(sc.severityDefault);
  };

  const baselineDays = Number(scenarioImpact?.baseline_autonomy_days || 9.1).toFixed(1);
  const scenarioDays = Number(scenarioImpact?.scenario_autonomy_days || (activeScenario ? 7.3 : 9.1)).toFixed(1);
  const mitigatedDays = Number(scenarioImpact?.mitigated_autonomy_days || (activeScenario ? 8.5 : 9.1)).toFixed(1);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #091322 0%, #050b14 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: 14,
        boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(56, 189, 248, 0.15)',
        width: '100%',
        maxWidth: 960,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(56, 189, 248, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={22} color="#38bdf8" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: 0.5 }}>
                ⚡ BHARATI SCENARIO & FAULT INJECTOR
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                Controlled operational fault simulation layer (Does NOT corrupt historical weather replay dataset)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: 6,
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Left column Scenario selector, Right column impact & mitigations */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1.25fr',
          gap: '1.25rem',
          padding: '1.25rem 1.5rem',
          overflowY: 'auto'
        }}>
          {/* Left Column: Selectable Scenarios */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
              1. Select Bharati Operational Scenario
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
              {BHARATI_SCENARIOS.map((sc) => {
                const isSelected = selectedScenarioName === sc.name;
                const isHero = sc.name.includes('Hero');
                return (
                  <div
                    key={sc.name}
                    onClick={() => handleSelectScenario(sc)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 8,
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.07)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#38bdf8' : '#e2e8f0' }}>
                        {sc.name}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: sc.category.includes('Hero') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: sc.category.includes('Hero') ? '#fbbf24' : '#94a3b8'
                      }}>
                        {sc.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.3 }}>
                      {sc.description.slice(0, 85)}...
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Severity Slider */}
            {currentScenarioObj.hasSeveritySlider && (
              <div style={{ marginTop: 14, background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sliders size={13} color="#38bdf8" />
                    Fault Severity Level:
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {severity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>
            )}

            {/* Action Buttons: Inject & Reset */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => onInjectScenario(selectedScenarioName, severity)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: '1px solid #38bdf8',
                  borderRadius: 6,
                  color: '#ffffff',
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Zap size={14} />
                <span>Inject Selected Scenario</span>
              </button>

              <button
                onClick={onClearScenario}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 6,
                  color: '#cbd5e1',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Clear all injected faults and return to nominal"
              >
                <RotateCcw size={13} />
                <span>Reset to Nominal</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Before/After Comparison & Explainable Mitigations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              2. Mission Autonomy Impact Analysis
            </div>

            {/* Before / Scenario / Mitigated Autonomy Display */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              borderRadius: 10,
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                BASELINE vs SCENARIO vs MITIGATED
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Nominal Baseline</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
                    {baselineDays} <span style={{ fontSize: '0.75rem' }}>days</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '8px 10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#f87171' }}>Under Scenario</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: 2 }}>
                    {scenarioDays} <span style={{ fontSize: '0.75rem' }}>days</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '8px 10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#86efac' }}>With Mitigations</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginTop: 2 }}>
                    {mitigatedDays} <span style={{ fontSize: '0.75rem' }}>days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable Mitigation Checklist */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={15} color="#22c55e" />
                <span>EXPLAINABLE MITIGATION CHECKLIST</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {scenarioImpact?.available_mitigations?.map((mit) => {
                  const isActive = activeMitigations.includes(mit.name);
                  return (
                    <div
                      key={mit.id}
                      onClick={() => onToggleMitigation(mit.name)}
                      style={{
                        padding: '0.65rem 0.8rem',
                        borderRadius: 6,
                        border: isActive ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div style={{ marginTop: 2 }}>
                        {isActive ? <CheckSquare size={16} color="#22c55e" /> : <Square size={16} color="#64748b" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isActive ? '#86efac' : '#cbd5e1' }}>
                            {mit.name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', background: 'rgba(255, 255, 255, 0.05)', padding: '1px 5px', borderRadius: 3 }}>
                            {mit.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 3, lineHeight: 1.3 }}>
                          {mit.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={13} color="#38bdf8" />
            <span>Active Scenario modifications apply to operational twin loads; historical replay dataset remains pristine.</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 4,
              color: '#e2e8f0',
              padding: '4px 12px',
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
