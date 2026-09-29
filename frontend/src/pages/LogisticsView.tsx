import React from 'react';
import { Truck, Ship, Plane, Calendar, Clock, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, Anchor } from 'lucide-react';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

interface Props {
  onNavigate: (pageId: string) => void;
}

export const LogisticsView: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div className="antwin-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={24} color="#00d2ff" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Expedition Logistics & Resupply Pipeline
                </h1>
                <ProvenanceBadge dataClass="REFERENCE" />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                End-to-end mission resupply corridors, sea-ice access windows, and polar air transit lines supporting Maitri and Bharati.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            MISSION = 44th INDIAN SCIENTIFIC EXPEDITION TO ANTARCTICA (ISEA)<br />
            STATUS = OPERATIONAL RESUPPLY WINDOW
          </div>
        </div>
      </div>

      {/* Main 5-Stage Intercontinental Resupply Pipeline */}
      <div className="antwin-panel">
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
          Intercontinental Maritime & Air Pipeline (Goa → Antarctica)
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.75rem',
          position: 'relative'
        }}>
          {/* Stage 1 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399' }}>STAGE 01</span>
              <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 6px', borderRadius: 4 }}>COMPLETED</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Goa Headquarter</strong>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>NCPOR Base Facility</span>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 8 }}>
              • Cargo packaging & cold chain staging<br />
              • Scientific instruments validation
            </div>
          </div>

          {/* Stage 2 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399' }}>STAGE 02</span>
              <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 6px', borderRadius: 4 }}>COMPLETED</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Cape Town Port</strong>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>South Africa Gateway</span>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 8 }}>
              • Bunkering Polar Jet A-1 fuel<br />
              • Expedition vessel vessel clearance
            </div>
          </div>

          {/* Stage 3 */}
          <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8' }}>STAGE 03</span>
              <span style={{ fontSize: '0.62rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '1px 6px', borderRadius: 4 }}>EN ROUTE</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Expedition Vessel</strong>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>MV Vasiliy Golovnin</span>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 8 }}>
              • Southern Ocean crossing<br />
              • ETA India Bay: 12 days
            </div>
          </div>

          {/* Stage 4 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>STAGE 04</span>
              <span style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '1px 6px', borderRadius: 4 }}>STANDBY</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Antarctic Sea Ice</strong>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fast-Ice Offloading</span>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 8 }}>
              • Ship-to-shore heavy sledging<br />
              • Kamov Ka-32 helicopter airlift
            </div>
          </div>

          {/* Stage 5 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>STAGE 05</span>
              <span style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '1px 6px', borderRadius: 4 }}>TARGET</span>
            </div>
            <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>Maitri & Bharati</strong>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Station Depots</span>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: 8 }}>
              • Bulk fuel farm replenishment<br />
              • Critical spare inventory refresh
            </div>
          </div>
        </div>
      </div>

      {/* Two Corridors: Maitri Air/Land vs Bharati Maritime/Ice */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Maitri Logistics Profile */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plane size={18} color="#10b981" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                Maitri Transit & Access Envelope
              </h3>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
              AIR & OVERLAND
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Blue-Ice Airfield:</span>
              <strong style={{ color: '#ffffff' }}>Novolazarevskaya (Novo Runway, 14 km)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Flight Access Window:</span>
              <strong style={{ color: '#ffffff' }}>November – February (DROMLAN Network)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Overland Snowcat Corridor:</span>
              <strong style={{ color: '#10b981' }}>Passable (2 PistenBully 300 Polar Ready)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#94a3b8' }}>Weather Dependency:</span>
              <strong style={{ color: '#fbbf24' }}>Gale wind &gt;45 knots triggers immediate lockout</strong>
            </div>
          </div>
        </div>

        {/* Bharati Logistics Profile */}
        <div className="antwin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ship size={18} color="#0284c7" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                Bharati Coastal Access Envelope
              </h3>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(2, 132, 199, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
              MARITIME & HELICOPTER
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Primary Anchorage:</span>
              <strong style={{ color: '#ffffff' }}>Prydz Bay / Larsemann Hills Coastal Anchorage</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Summer Nav Window:</span>
              <strong style={{ color: '#ffffff' }}>December – March (Ice-Class Cargo Vessel)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Helicopter Ship-to-Shore:</span>
              <strong style={{ color: '#10b981' }}>Helipad Operational (Clear Visibility)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#94a3b8' }}>Pack-Ice Risk:</span>
              <strong style={{ color: '#ef4444' }}>Progress ice-lockout can impose 7–14 day delays</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics -> Mission Autonomy Causal Propagation */}
      <div className="antwin-panel">
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>
          Logistics Impact on Mission Autonomy (Causal Coupling)
        </h3>
        <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '1rem' }}>
          In polar operations, resupply delays directly compress the mission autonomy safety envelope:
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 8,
          padding: '1rem',
          fontSize: '0.75rem'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Resupply Delay</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>+7 Days</div>
            <span style={{ color: '#64748b', fontSize: '0.65rem' }}>Pack-Ice Freeze</span>
          </div>

          <ArrowRight size={18} color="#64748b" />

          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ color: '#f87171', fontWeight: 600 }}>Logistics Buffer</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', margin: '4px 0' }}>-50%</div>
            <span style={{ color: '#64748b', fontSize: '0.65rem' }}>Safety Margin Depleted</span>
          </div>

          <ArrowRight size={18} color="#64748b" />

          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>Fuel & Spares Endurance</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', margin: '4px 0' }}>9.1 Days</div>
            <span style={{ color: '#64748b', fontSize: '0.65rem' }}>Daily Burn Continues</span>
          </div>

          <ArrowRight size={18} color="#64748b" />

          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ color: '#00d2ff', fontWeight: 600 }}>Mission Autonomy</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>6.8 Days</div>
            <span style={{ color: '#34d399', fontSize: '0.65rem' }}>ANTWIN Bottleneck Limit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
