import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle2, Clock, Calendar, ShieldCheck, ChevronDown } from 'lucide-react';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

export const ReportsView: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<'MAITRI' | 'BHARATI'>('MAITRI');
  const [isGenerated, setIsGenerated] = useState<boolean>(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div className="antwin-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={24} color="#00d2ff" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Mission Operational Reports
                </h1>
                <ProvenanceBadge dataClass="DERIVED" />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                Standardized polar operational summaries, daily station situational briefs, and compliance records.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setSelectedStation('MAITRI')}
              style={{
                background: selectedStation === 'MAITRI' ? '#0284c7' : 'transparent',
                color: selectedStation === 'MAITRI' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Maitri Station
            </button>
            <button
              onClick={() => setSelectedStation('BHARATI')}
              style={{
                background: selectedStation === 'BHARATI' ? '#0284c7' : 'transparent',
                color: selectedStation === 'BHARATI' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Bharati Station
            </button>
          </div>

          <button
            onClick={() => window.print()}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Download size={14} />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* Generated Report Sheet */}
      <div className="antwin-panel" style={{ background: '#0a1426', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1.75rem' }}>
        {/* Report Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Ministry of Earth Sciences (MoES) • National Centre for Polar and Ocean Research (NCPOR)
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
              Daily Station Mission Situational Brief (DMR-26060)
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Station: <strong style={{ color: '#ffffff' }}>{selectedStation === 'MAITRI' ? 'Maitri (Schirmacher Oasis)' : 'Bharati (Larsemann Hills)'}</strong> • 44th Indian Scientific Expedition to Antarctica
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b' }}>
            Replay Timestamp: <strong style={{ color: '#e2e8f0' }}>27 Sep 2026, 18:00 UTC</strong><br />
            Report Classification: <strong style={{ color: '#38bdf8' }}>INTERNAL OPERATIONAL</strong>
          </div>
        </div>

        {/* 8 Report Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Section 1: Overall Operational Status */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>01. STATION STATUS</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>OPERATIONAL</div>
            <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Winter Over: 25 Personnel</span>
          </div>

          {/* Section 2: Environment */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>02. ENVIRONMENT</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171', margin: '4px 0' }}>
              {selectedStation === 'MAITRI' ? '-24.8°C' : '-28.4°C'}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>
              Wind: {selectedStation === 'MAITRI' ? '12.6 km/h' : '22.4 km/h'}
            </span>
          </div>

          {/* Section 3: Energy Margin */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>03. POWER SYSTEM</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
              {selectedStation === 'MAITRI' ? '61 kW Margin' : '37% Margin'}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>
              {selectedStation === 'MAITRI' ? '2 Gensets Online' : '3x 100 kVA CHP Fleet'}
            </span>
          </div>

          {/* Section 4: Mission Autonomy */}
          <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 6, padding: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>04. MISSION AUTONOMY</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', margin: '3px 0' }}>
              {selectedStation === 'MAITRI' ? '8.4 Days' : '9.2 Days'}
            </div>
            <span style={{ fontSize: '0.65rem', color: '#34d399' }}>ANTWIN Bottleneck: Fuel / Water</span>
          </div>
        </div>

        {/* Detailed Sections 5-8 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Fuel & Thermal */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.85rem' }}>
            <strong style={{ fontSize: '0.78rem', color: '#ffffff', display: 'block', marginBottom: 6 }}>
              05. Fuel Storage & Thermal Demand Summary
            </strong>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              Bulk fuel reserves at {selectedStation === 'MAITRI' ? '214.5 kL' : '242.0 kL'} (Polar Diesel class). Daily consumption rate currently stabilized at {selectedStation === 'MAITRI' ? '116 L/h' : '124 L/h'}. Space heating circuits maintaining +19.5°C indoor habitable envelope.
            </p>
          </div>

          {/* Water & Life Support */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.85rem' }}>
            <strong style={{ fontSize: '0.78rem', color: '#ffffff', display: 'block', marginBottom: 6 }}>
              06. Water Utility & Life Support
            </strong>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              {selectedStation === 'MAITRI'
                ? 'Lake Priyadarshini water line trace heating active at 14.5 kW. Daily freshwater extraction nominal at 2,400 L/d; storage tank reserve at 18,500 L.'
                : 'Quilty Bay seawater intake pump operational. Reverse osmosis plant delivered 2,850 L/d nominal output; potable tank buffer holding 22,000 L.'}
            </p>
          </div>

          {/* Asset Health & Logistics */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.85rem' }}>
            <strong style={{ fontSize: '0.78rem', color: '#ffffff', display: 'block', marginBottom: 6 }}>
              07. Critical Equipment & Fleet Health
            </strong>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              Equipment fleet overall health indexed at 88%. Generator-02 vibration under passive watch. Snow vehicle mobile readiness 2/2 operational for medical or traverse response.
            </p>
          </div>

          {/* Data Provenance & Verification */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 6, padding: '0.85rem' }}>
            <strong style={{ fontSize: '0.78rem', color: '#ffffff', display: 'block', marginBottom: 6 }}>
              08. Data Provenance & Verification Sign-Off
            </strong>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              Environmental values grounded on 7-Day Winter Replay dataset. Engineering capacities certified against official NCPOR tender reference records. Autonomy calculated deterministically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
