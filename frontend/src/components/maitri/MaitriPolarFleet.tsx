import React from 'react';
import { Truck, CheckCircle2, AlertCircle, Wrench, Shield, Compass } from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export interface FleetVehicle {
  id: string;
  type: string;
  unit: string;
  role: string;
  status: string;
  engine_hours?: number;
  battery_health?: string;
  location: string;
  winterized: boolean;
}

interface Props {
  fleet: FleetVehicle[];
}

export const MaitriPolarFleet: React.FC<Props> = ({ fleet }) => {
  return (
    <div className="antwin-panel" style={{ padding: '1rem 1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={17} color="#38bdf8" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Polar Mobility Fleet Registry (Heavy Traverse & Field Vehicles)
          </h3>
          <ProvenanceBadge
            dataClass="REFERENCE"
            provenance={{
              data_class: 'REFERENCE',
              source: 'NCPOR Indian Antarctic Expedition Fleet Register (43rd ISEA 2024-2025)',
              source_year: 2025,
              station: 'Maitri'
            }}
          />
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          Garage & Depot Location: West Perimeter
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '10px'
      }}>
        {fleet.map((v) => (
          <div
            key={v.id}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 8,
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.8rem' }}>
                {v.unit}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 4,
                background: v.status === 'Operational' || v.status === 'Ready'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
                color: v.status === 'Operational' || v.status === 'Ready'
                  ? '#34d399'
                  : '#fbbf24',
                border: `1px solid ${v.status === 'Operational' || v.status === 'Ready' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                {v.status}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
              {v.type}
            </div>

            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
              Role: <span style={{ color: '#cbd5e1' }}>{v.role}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.65rem',
              color: '#64748b',
              marginTop: 4,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: 4
            }}>
              <span>Hours: {v.engine_hours || 420}h</span>
              <span>Loc: {v.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
