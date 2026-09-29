import React, { useEffect, useState } from 'react';
import { Database, ShieldCheck, ExternalLink, Calendar, Tag, CheckCircle2, Calculator, BookOpen, Layers } from 'lucide-react';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';
import { antwinApi } from '../services/api';

export const DataProvenanceView: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    antwinApi.getSources().then(setSources).catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div className="antwin-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={24} color="#00d2ff" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Data Truth & Provenance Explorer
                </h1>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  OFFLINE-FIRST ARCHITECTURE
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                Multi-class operational data honesty ledger. Telemetry, engineering references, and derived physics models are strictly segregated.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            DATA_INTEGRITY_POLICY = ENFORCED<br />
            NO_SCRAPED_OR_SYNTHETIC_LIVE = TRUE
          </div>
        </div>
      </div>

      {/* 4 Classifications Explainers (Strictly REPLAY, REFERENCE, SIMULATED, DERIVED) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {/* 1. REPLAY */}
        <div className="antwin-panel" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ProvenanceBadge dataClass="REPLAY" />
          </div>
          <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', marginBottom: 4 }}>
            Local 7-Day Winter Replay
          </strong>
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            Deterministic historical and replay-style environmental and station telemetry calibrated from verified NCPOR, IMD, and NPDC AWS observations.
          </p>
        </div>

        {/* 2. REFERENCE */}
        <div className="antwin-panel" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ProvenanceBadge dataClass="REFERENCE" />
          </div>
          <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', marginBottom: 4 }}>
            Official Station Specifications
          </strong>
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            Documented engineering designs, architectural capacity limits, expedition logistics advisories, and planned parameters preserved as baseline truth.
          </p>
        </div>

        {/* 3. SIMULATED */}
        <div className="antwin-panel" style={{ borderLeft: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ProvenanceBadge dataClass="SIMULATED" />
          </div>
          <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', marginBottom: 4 }}>
            Deterministic Scenario State
          </strong>
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            Prototype-generated operational telemetry where station BMS/SCADA is confidential, plus temporary injected faults in isolated branches.
          </p>
        </div>

        {/* 4. DERIVED */}
        <div className="antwin-panel" style={{ borderLeft: '4px solid #14b8a6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ProvenanceBadge dataClass="DERIVED" />
          </div>
          <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', marginBottom: 4 }}>
            Multi-Constraint Calculations
          </strong>
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            Metrics calculated transparently by ANTWIN physics and dependency models: Mission Autonomy, thermal loss, fuel burn rates, and cascading risks.
          </p>
        </div>
      </div>

      {/* How ANTWIN Derives Operational Metrics (Formulas) */}
      <div className="antwin-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
          <Calculator size={18} color="#00d2ff" />
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
            How ANTWIN Derives Operational Metrics
          </h2>
        </div>
        <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '1rem' }}>
          Every derived calculation is traceable to mathematical formulas rather than opaque black-box estimates:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {/* Formula 1: Mission Autonomy */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
              Mission Autonomy (MA)
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#34d399', marginBottom: 6 }}>
              min(Energy, Fuel, Water, Provisions, Spares, Logistics)
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>
              The acute bottleneck among all life-support and mission endurance resources determines the overall station survival window in days.
            </p>
          </div>

          {/* Formula 2: Fuel Endurance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>
              Fuel Endurance
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#fbbf24', marginBottom: 6 }}>
              Remaining Fuel (L) / Projected Burn Rate (L/day)
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Combines electrical generator fuel draw with thermal boiler firing rates based on outdoor temperature differentials.
            </p>
          </div>

          {/* Formula 3: Heating Demand */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>
              Heating Demand (kWth)
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#f87171', marginBottom: 6 }}>
              UA × (T_indoor - T_outdoor) + Ventilation + Life-Support
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Thermal envelope heat loss model parameterized by module insulation, wind infiltration, and indoor comfort setpoints.
            </p>
          </div>

          {/* Formula 4: Water Endurance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2dd4bf', marginBottom: 4 }}>
              Water Endurance
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#2dd4bf', marginBottom: 6 }}>
              Potable Tank Storage / Net Daily Deficit Rate
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Models production buffer from Lake Priyadarshini (Maitri) or Quilty Bay RO desalination minus daily crew demand.
            </p>
          </div>
        </div>
      </div>

      {/* Official Sources Table */}
      <div className="antwin-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
          <BookOpen size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
            Official Reference Citations & Engineering Registry
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map((src, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 8,
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{src.title}</strong>
                  <span className={`prov-badge ${src.data_class}`}>{src.data_class}</span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: 4 }}>
                    {src.temporal_status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                  Publisher: {src.publisher} | ID: {src.id}
                </div>
                {src.use && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {src.use.map((u: string, i: number) => (
                      <span key={i} style={{ fontSize: '0.65rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                        #{u}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#00d2ff',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    background: 'rgba(0, 210, 255, 0.1)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    flexShrink: 0
                  }}
                >
                  Document Reference <ExternalLink size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
