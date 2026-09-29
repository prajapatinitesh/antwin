import React from 'react';
import { X, ShieldCheck, Database, Calendar, Award, FunctionSquare, Info } from 'lucide-react';
import { Provenance } from '../../types/antwin';

interface Props {
  provenance: Provenance | null;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<Props> = ({ provenance, onClose }) => {
  if (!provenance) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#00d2ff" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Data Truth & Provenance Record</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Traceable pedigree for operational metric</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 8 }}>
            <span style={{ color: '#94a3b8' }}>Classification:</span>
            <span className={`prov-badge ${provenance.data_class}`}>{provenance.data_class}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Database size={16} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Source Document / Provider:</div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{provenance.source}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Calendar size={16} color="#38bdf8" style={{ marginTop: 2 }} />
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Reference Year / Status:</div>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                  {provenance.source_year || '2025'} ({provenance.temporal_status || 'CURRENT'})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Award size={16} color="#10b981" style={{ marginTop: 2 }} />
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Verified Confidence:</div>
                <div style={{ fontWeight: 600, color: '#34d399' }}>{provenance.confidence || 'HIGH'}</div>
              </div>
            </div>
          </div>

          {provenance.formula && (
            <div style={{ background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', padding: '0.75rem', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00d2ff', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                <FunctionSquare size={14} /> ANTWIN Mathematical Formula:
              </div>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#e2e8f0', wordBreak: 'break-all' }}>
                {provenance.formula}
              </code>
            </div>
          )}

          {provenance.inputs && (
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>Calculation Inputs:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {provenance.inputs.map((inp, idx) => (
                  <span key={idx} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {inp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provenance.notes && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: 6, color: '#94a3b8', fontSize: '0.78rem' }}>
              <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{provenance.notes}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
