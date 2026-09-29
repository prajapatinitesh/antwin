import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Filter, ShieldCheck, Database, Clock } from 'lucide-react';
import { ProvenanceBadge } from '../components/common/ProvenanceBadge';

interface AlertItem {
  id: string;
  station: 'MAITRI' | 'BHARATI' | 'ALL';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  dataClass: 'REPLAY' | 'REFERENCE' | 'SIMULATED' | 'DERIVED';
  affectedSystem: string;
  acknowledged: boolean;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-M01',
    station: 'MAITRI',
    severity: 'WARNING',
    title: 'Generator-02 Vibration Elevation',
    message: 'Bearing vibration recorded at 2.4 mm/s exceeding nominal 2.0 mm/s limit. Alternator remains online.',
    timestamp: '2024-06-27 18:00 (Hour 19)',
    dataClass: 'SIMULATED',
    affectedSystem: 'Power Generation Plant (DG-02)',
    acknowledged: false
  },
  {
    id: 'ALT-B01',
    station: 'BHARATI',
    severity: 'WARNING',
    title: 'Fuel Endurance Approaching Reserve Threshold',
    message: 'Calculated fuel endurance drops to 15.6 days due to auxiliary boiler firing during sub-zero catabatic gusts.',
    timestamp: '2024-06-27 18:00 (Hour 19)',
    dataClass: 'DERIVED',
    affectedSystem: 'Fuel Farm & Thermal Loop',
    acknowledged: false
  },
  {
    id: 'ALT-ALL01',
    station: 'ALL',
    severity: 'INFO',
    title: 'Sub-Zero Ambient Cold Surge Detected',
    message: 'Regional Antarctic weather front recorded outdoor temperature dropping below -25°C across Dronning Maud Land and Larsemann Hills.',
    timestamp: '2024-06-27 17:30 (Hour 18)',
    dataClass: 'REPLAY',
    affectedSystem: 'Environmental Condition Engine',
    acknowledged: true
  },
  {
    id: 'ALT-M02',
    station: 'MAITRI',
    severity: 'INFO',
    title: 'Lake Priyadarshini Trace Heating Active',
    message: 'Trace heating loop energized at 14.5 kW to maintain potable water intake flow during sub-zero plunge.',
    timestamp: '2024-06-27 16:45 (Hour 17)',
    dataClass: 'SIMULATED',
    affectedSystem: 'Water Utility Pipeline',
    acknowledged: true
  },
  {
    id: 'ALT-B02',
    station: 'BHARATI',
    severity: 'INFO',
    title: 'Quilty Bay Reverse Osmosis Cycle Complete',
    message: 'Daily desalination cycle produced 2,850 L of potable water; indoor storage buffer at 94% capacity.',
    timestamp: '2024-06-27 15:00 (Hour 15)',
    dataClass: 'REFERENCE',
    affectedSystem: 'Reverse Osmosis Utility',
    acknowledged: true
  }
];

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [stationFilter, setStationFilter] = useState<'ALL' | 'MAITRI' | 'BHARATI'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const toggleAcknowledge = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const filteredAlerts = alerts.filter(a => {
    if (stationFilter !== 'ALL' && a.station !== 'ALL' && a.station !== stationFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div className="antwin-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={24} color="#00d2ff" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Operational Alerts & Event Ledger
                </h1>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  BASE OPERATIONAL FEED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                Unified event log from central replay engine. Temporary scenario-injected faults remain isolated in the Scenario Simulator and do not pollute this operational feed.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            SCENARIO_ALERT_POLLUTION = FORBIDDEN<br />
            REPLAY_CLOCK = SYNCHRONIZED
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="antwin-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={15} color="#38bdf8" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Filter by Station:</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 2 }}>
            {(['ALL', 'MAITRI', 'BHARATI'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStationFilter(st)}
                style={{
                  background: stationFilter === st ? '#0284c7' : 'transparent',
                  color: stationFilter === st ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? 'All Stations' : (st === 'MAITRI' ? 'Maitri' : 'Bharati')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Severity:</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 2 }}>
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  background: severityFilter === sev ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: severityFilter === sev ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredAlerts.length === 0 ? (
          <div className="antwin-panel" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No operational alerts match the selected filters.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';
            const borderColor = isCrit ? 'rgba(239, 68, 68, 0.4)' : (isWarn ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.3)');
            const bg = isCrit ? 'rgba(239, 68, 68, 0.05)' : (isWarn ? 'rgba(245, 158, 11, 0.05)' : 'rgba(56, 189, 248, 0.03)');

            return (
              <div
                key={alert.id}
                className="antwin-panel"
                style={{
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                  <div style={{ marginTop: 2 }}>
                    {isCrit && <AlertCircle size={18} color="#ef4444" />}
                    {isWarn && <AlertTriangle size={18} color="#f59e0b" />}
                    {!isCrit && !isWarn && <Info size={18} color="#38bdf8" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{alert.title}</strong>
                      <span style={{
                        background: isCrit ? 'rgba(239, 68, 68, 0.2)' : (isWarn ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)'),
                        color: isCrit ? '#f87171' : (isWarn ? '#fbbf24' : '#38bdf8'),
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#94a3b8',
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: 4
                      }}>
                        {alert.station}
                      </span>
                      <ProvenanceBadge dataClass={alert.dataClass} />
                    </div>

                    <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45, margin: '4px 0' }}>
                      {alert.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.68rem', color: '#64748b', marginTop: 6 }}>
                      <span>System: <strong style={{ color: '#94a3b8' }}>{alert.affectedSystem}</strong></span>
                      <span>•</span>
                      <span>Recorded: <strong style={{ color: '#94a3b8' }}>{alert.timestamp}</strong></span>
                      <span>•</span>
                      <span>ID: <strong style={{ color: '#94a3b8' }}>{alert.id}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleAcknowledge(alert.id)}
                  style={{
                    background: alert.acknowledged ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: alert.acknowledged ? '#34d399' : '#94a3b8',
                    border: `1px solid ${alert.acknowledged ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>{alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
