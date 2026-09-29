import React, { useState } from 'react';
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  Zap,
  Droplets,
  Wind,
  Truck,
  Box,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export interface BharatiSchematicZoneData {
  id: string;
  name: string;
  short_code: string;
  reference_label: string;
  coordinates: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  status_reason?: string;
  category: string;
  subsystems: Array<{
    name: string;
    status: string;
    detail: string;
  }>;
  active_metrics?: Record<string, string>;
  notes?: string;
}

interface Props {
  zones: BharatiSchematicZoneData[];
  windSpeedKmh: number;
  windSpeedKnots: number;
  windDirectionCardinal: string;
  temperatureC: number;
  onSelectZone?: (zone: BharatiSchematicZoneData | null) => void;
  selectedZoneId?: string | null;
}

export const BharatiStationSchematic: React.FC<Props> = ({
  zones,
  windSpeedKmh,
  windSpeedKnots,
  windDirectionCardinal,
  temperatureC,
  onSelectZone,
  selectedZoneId: externalSelectedZoneId
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    ModularStructure: true,
    CHPGrid: true,
    QuiltyBayWater: true,
    FuelLines: true,
    Environment: true
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedId = externalSelectedZoneId !== undefined ? externalSelectedZoneId : internalSelectedId;
  const selectedZone = zones.find(z => z.id === selectedId) || null;

  const handleZoneClick = (zone: BharatiSchematicZoneData) => {
    const nextId = selectedId === zone.id ? null : zone.id;
    setInternalSelectedId(nextId);
    if (onSelectZone) {
      onSelectZone(nextId ? zone : null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.22)', badge: '#f87171' };
      case 'WARNING':
        return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.20)', badge: '#fbbf24' };
      case 'NORMAL':
      default:
        return { stroke: '#0284c7', fill: 'rgba(2, 132, 199, 0.16)', badge: '#38bdf8' };
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(8, 18, 36, 0.95) 0%, rgba(4, 9, 20, 0.98) 100%)',
      borderRadius: 14,
      border: '1px solid rgba(56, 189, 248, 0.35)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={20} color="#38bdf8" />
            <h3 style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: 0.5
            }}>
              BHARATI OPERATIONAL SCHEMATIC — Reference Geometry
            </h3>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              Not to Scale
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3 }}>
            Modular 4-level main building (30m × 50m) + Quilty Bay seawater intake + automated Jet A-1 fuel farm
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ProvenanceBadge
            dataClass="REFERENCE"
            provenance={{
              data_class: 'REFERENCE',
              source: 'NCPOR Bharati Station Reference (Bölling & Lennox Design)',
              source_year: 2017,
              station: 'Bharati'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 3 }}>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: 4, cursor: 'pointer' }}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: 4, cursor: 'pointer' }}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: 4, cursor: 'pointer' }}
              title="Reset Zoom"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Layer Visibility Toggles */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        fontSize: '0.72rem',
        color: '#94a3b8'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#cbd5e1' }}>
          <Layers size={13} color="#38bdf8" />
          SYSTEM LAYERS:
        </span>
        {Object.keys(activeLayers).map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }))}
            style={{
              background: activeLayers[layer] ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeLayers[layer] ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
              color: activeLayers[layer] ? '#38bdf8' : '#64748b',
              borderRadius: 4,
              padding: '3px 9px',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {layer}
          </button>
        ))}
      </div>

      {/* Schematic Layout: SVG Canvas with Interactive Zones + Slide-out Zone Inspector */}
      <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
        <div style={{
          flex: 1,
          background: 'radial-gradient(ellipse at center, rgba(14, 28, 54, 0.6) 0%, rgba(3, 7, 16, 0.95) 100%)',
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 480
        }}>
          <svg
            viewBox="0 0 840 480"
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease'
            }}
          >
            <defs>
              <linearGradient id="bhaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#081428" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#020610" stopOpacity="0.95" />
              </linearGradient>

              {/* Grid pattern */}
              <pattern id="bhaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>

              {/* Water Pipe gradient */}
              <linearGradient id="pipeWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Fuel Pipe gradient */}
              <linearGradient id="pipeFuelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect width="840" height="480" fill="url(#bhaGrid)" />

            {/* Coastline / Quilty Bay Graphic (East) */}
            {activeLayers.QuiltyBayWater && (
              <g id="quilty-bay-backdrop">
                <path
                  d="M 680 0 Q 720 180 700 320 T 740 480 L 840 480 L 840 0 Z"
                  fill="rgba(2, 132, 199, 0.08)"
                  stroke="rgba(56, 189, 248, 0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text x="750" y="80" fill="#38bdf8" fontSize="11" fontWeight="700" opacity="0.6">QUILTY BAY</text>
                <text x="750" y="96" fill="#64748b" fontSize="8" opacity="0.8">Raw Seawater Source</text>
              </g>
            )}

            {/* Heated Seawater Pipeline: Quilty Bay Pump House -> Level 2 Utility Plant */}
            {activeLayers.QuiltyBayWater && (
              <g id="water-pipeline">
                <path
                  d="M 620 260 L 560 260"
                  fill="none"
                  stroke="url(#pipeWaterGrad)"
                  strokeWidth="3.5"
                  strokeDasharray="6 3"
                />
                <circle cx="590" cy="260" r="4" fill="#38bdf8" />
                <text x="568" y="250" fill="#38bdf8" fontSize="8" fontWeight="600">300m Heated Seawater Pipe</text>
              </g>
            )}

            {/* Jet A-1 Fuel Pipeline: External Fuel Farm -> Level 2 CHP Skid */}
            {activeLayers.FuelLines && (
              <g id="fuel-pipeline">
                <path
                  d="M 210 260 L 240 260"
                  fill="none"
                  stroke="url(#pipeFuelGrad)"
                  strokeWidth="3"
                  strokeDasharray="5 3"
                />
                <circle cx="225" cy="260" r="4" fill="#fbbf24" />
                <text x="135" y="200" fill="#fbbf24" fontSize="8" fontWeight="600">Jet A-1 Day Feed</text>
              </g>
            )}

            {/* Main Station Modular Building Enclosure (30m x 50m Footprint) */}
            {activeLayers.ModularStructure && (
              <g id="main-building-frame">
                <rect
                  x="230"
                  y="35"
                  width="340"
                  height="350"
                  rx="10"
                  fill="rgba(15, 23, 42, 0.65)"
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="8 4"
                />
                <text x="245" y="420" fill="#94a3b8" fontSize="9" fontWeight="700">
                  BHARATI MAIN BUILDING ENVELOPE (4-LEVEL MODULAR STRUCTURE)
                </text>
              </g>
            )}

            {/* Render 7 Documented Bharati Operational Zones */}
            {zones.map((zone) => {
              const coords = zone.coordinates || { x: 240, y: 100, w: 320, h: 70 };
              const colorInfo = getStatusColor(zone.status);
              const isSelected = selectedId === zone.id;

              return (
                <g
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Zone Background Box */}
                  <rect
                    x={coords.x}
                    y={coords.y}
                    width={coords.w}
                    height={coords.h}
                    rx="8"
                    fill={isSelected ? 'rgba(56, 189, 248, 0.28)' : colorInfo.fill}
                    stroke={isSelected ? '#38bdf8' : colorInfo.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter={isSelected ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' : 'none'}
                  />

                  {/* Zone Short Code Badge */}
                  <rect
                    x={coords.x + 8}
                    y={coords.y + 8}
                    width="62"
                    height="18"
                    rx="4"
                    fill="rgba(0, 0, 0, 0.45)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                  <text
                    x={coords.x + 39}
                    y={coords.y + 20}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {zone.short_code}
                  </text>

                  {/* Status Indicator Dot */}
                  <circle
                    cx={coords.x + coords.w - 14}
                    cy={coords.y + 14}
                    r="4.5"
                    fill={colorInfo.stroke}
                  />

                  {/* Zone Name Label */}
                  <text
                    x={coords.x + 78}
                    y={coords.y + 20}
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {zone.name.length > 34 ? `${zone.name.slice(0, 32)}...` : zone.name}
                  </text>

                  {/* Reference Label / Description */}
                  <text
                    x={coords.x + 12}
                    y={coords.y + 40}
                    fill="#94a3b8"
                    fontSize="8.5"
                  >
                    {zone.reference_label}
                  </text>

                  {/* Subsystems Count / Metrics Preview */}
                  <text
                    x={coords.x + 12}
                    y={coords.y + coords.h - 10}
                    fill="#cbd5e1"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    Status: <tspan fill={colorInfo.badge} fontWeight="700">{zone.status}</tspan> | Subsystems: {zone.subsystems?.length || 4}
                  </text>
                </g>
              );
            })}

            {/* Environmental Wind Vector Overlay */}
            {activeLayers.Environment && (
              <g id="wind-overlay" transform="translate(40, 410)">
                <rect x="0" y="0" width="160" height="55" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
                <Wind size={14} color="#38bdf8" x="8" y="10" />
                <text x="30" y="22" fill="#cbd5e1" fontSize="9" fontWeight="700">WIND VECTOR</text>
                <text x="10" y="42" fill="#38bdf8" fontSize="11" fontWeight="800" fontFamily="monospace">
                  {windDirectionCardinal} @ {Number(windSpeedKnots || 0).toFixed(0)} kt ({Number(windSpeedKmh || 0).toFixed(0)} km/h)
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Slide-out Zone Inspector Drawer */}
        {selectedZone && (
          <div style={{
            width: 340,
            background: 'linear-gradient(135deg, rgba(11, 25, 48, 0.98) 0%, rgba(6, 14, 28, 0.98) 100%)',
            borderRadius: 10,
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            overflowY: 'auto',
            maxHeight: 480
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}>
                  {selectedZone.short_code}
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc' }}>
                  {selectedZone.name}
                </h4>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                  {selectedZone.reference_label}
                </div>
              </div>
              <button
                onClick={() => setInternalSelectedId(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Health Status Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Subsystem Health:</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: selectedZone.status === 'CRITICAL' ? '#f87171' : (selectedZone.status === 'WARNING' ? '#fbbf24' : '#38bdf8')
              }}>
                {selectedZone.status}
              </span>
            </div>

            {/* Subsystems List */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6, textTransform: 'uppercase' }}>
                Active Subsystems ({selectedZone.subsystems?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedZone.subsystems?.map((sub, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 6,
                      padding: '6px 8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                        {sub.name}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: sub.status === 'CRITICAL' || sub.status === 'OFFLINE' ? '#f87171' : (sub.status === 'WARNING' || sub.status === 'DEGRADED' ? '#fbbf24' : '#34d399')
                      }}>
                        {sub.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                      {sub.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Telemetry Metrics */}
            {selectedZone.active_metrics && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 6, textTransform: 'uppercase' }}>
                  Operational Telemetry
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {Object.entries(selectedZone.active_metrics).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 4,
                        padding: '5px 8px',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{key}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginTop: 1, fontFamily: 'monospace' }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architectural Reference Notes */}
            {selectedZone.notes && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '0.68rem',
                color: '#94a3b8',
                lineHeight: 1.3
              }}>
                <strong style={{ color: '#38bdf8' }}>Architecture: </strong>
                {selectedZone.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
