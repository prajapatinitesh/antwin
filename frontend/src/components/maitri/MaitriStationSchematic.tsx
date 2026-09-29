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
  ChevronRight
} from 'lucide-react';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

export interface SchematicZoneData {
  id: string;
  name: string;
  reference_label: string;
  coordinates_grid: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  status_reason?: string;
  category: string;
  capacity?: {
    winter: number;
    summer: number;
    current_occupancy: number;
  };
  capacity_total_l?: number;
  current_level_l?: number;
  gensets_installed?: number;
  gensets_online?: number;
  total_output_kw?: number;
  subsystems: Array<{
    name: string;
    status: string;
    [key: string]: any;
  }>;
  historical_reference?: string;
}

interface Props {
  zones: SchematicZoneData[];
  windSpeedKmh: number;
  windDirectionCardinal: string;
  temperatureC: number;
  onSelectZone?: (zone: SchematicZoneData | null) => void;
  selectedZoneId?: string | null;
}

export const MaitriStationSchematic: React.FC<Props> = ({
  zones,
  windSpeedKmh,
  windDirectionCardinal,
  temperatureC,
  onSelectZone,
  selectedZoneId: externalSelectedZoneId
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    Structures: true,
    PowerGrid: true,
    WaterIntake: true,
    FuelLines: true,
    Environment: true
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedId = externalSelectedZoneId !== undefined ? externalSelectedZoneId : internalSelectedId;
  const selectedZone = zones.find(z => z.id === selectedId) || null;

  const handleZoneClick = (zone: SchematicZoneData) => {
    const nextId = selectedId === zone.id ? null : zone.id;
    setInternalSelectedId(nextId);
    if (onSelectZone) {
      onSelectZone(nextId ? zone : null);
    }
  };

  const toggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      case 'NORMAL':
      default: return '#10b981';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(8, 16, 32, 0.95)',
      borderRadius: 12,
      border: '1px solid rgba(56, 189, 248, 0.2)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Schematic Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(5, 11, 24, 0.8)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#38bdf8',
            boxShadow: '0 0 8px #38bdf8'
          }} />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            MAITRI OPERATIONAL SCHEMATIC — Reference Geometry
          </h3>
          <ProvenanceBadge
            dataClass="REFERENCE"
            provenance={{
              data_class: 'REFERENCE',
              source: 'ATS Inspection Report (2001) & Survey of India / NCPOR 2025 Advisory Map',
              source_year: 2025,
              station: 'Maitri'
            }}
          />
        </div>

        {/* Layer Controls & Zoom Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Layer Toggles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.7rem'
          }}>
            <Layers size={13} color="#94a3b8" style={{ marginRight: 4 }} />
            {[
              { id: 'Structures', label: 'Buildings' },
              { id: 'PowerGrid', label: 'Power', icon: Zap, color: '#eab308' },
              { id: 'WaterIntake', label: 'Water', icon: Droplets, color: '#06b6d4' },
              { id: 'FuelLines', label: 'Fuel', icon: Flame, color: '#f97316' },
              { id: 'Environment', label: 'Wind/Env', icon: Wind, color: '#38bdf8' }
            ].map(layer => {
              const active = activeLayers[layer.id];
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  style={{
                    background: active ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: active ? '#38bdf8' : '#64748b',
                    border: active ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              title="Zoom In"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.8))}
              title="Zoom Out"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset View"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Vector Canvas + Interactive Inspector Panel */}
      <div style={{ display: 'flex', position: 'relative', minHeight: '440px', overflow: 'hidden' }}>
        {/* SVG Schematic Canvas Viewport */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          background: 'radial-gradient(ellipse at 45% 45%, #0e1d35 0%, #060d1b 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          {/* Compass Indicator in Top Right */}
          <div style={{
            position: 'absolute',
            top: 14,
            right: selectedZone ? 330 : 16,
            zIndex: 10,
            background: 'rgba(7, 14, 28, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 8,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.68rem',
            color: '#94a3b8',
            pointerEvents: 'none',
            transition: 'right 0.2s ease'
          }}>
            <Compass size={16} color="#38bdf8" />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700 }}>TRUE NORTH ↑</div>
              <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Schirmacher Oasis 70°46′S</div>
            </div>
          </div>

          {/* SVG Vector Drawing */}
          <div style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
            width: '100%',
            maxWidth: '820px'
          }}>
            <svg
              viewBox="0 0 760 520"
              style={{
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))'
              }}
            >
              <defs>
                {/* Patterns & Gradients */}
                <pattern id="oasis-rock-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 0 15 Q 8 10 15 15 T 30 15" stroke="rgba(255,255,255,0.02)" fill="none" />
                  <circle cx="12" cy="8" r="0.8" fill="rgba(255,255,255,0.04)" />
                  <circle cx="24" cy="22" r="0.6" fill="rgba(255,255,255,0.03)" />
                </pattern>

                <linearGradient id="lake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#0284c7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
                </linearGradient>

                <linearGradient id="main-building-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="50%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                <linearGradient id="generator-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#854d0e" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>

                <linearGradient id="fuel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9a3412" />
                  <stop offset="100%" stopColor="#431407" />
                </linearGradient>

                {/* Animated Dash Array for Power Bus */}
                <style>{`
                  @keyframes powerFlow {
                    from { stroke-dashoffset: 40; }
                    to { stroke-dashoffset: 0; }
                  }
                  .power-bus-active {
                    animation: powerFlow 2s linear infinite;
                  }
                  @keyframes waterFlow {
                    from { stroke-dashoffset: 30; }
                    to { stroke-dashoffset: 0; }
                  }
                  .water-pipe-active {
                    animation: waterFlow 3s linear infinite;
                  }
                  @keyframes fuelFlow {
                    from { stroke-dashoffset: 20; }
                    to { stroke-dashoffset: 0; }
                  }
                  .fuel-pipe-active {
                    animation: fuelFlow 4s linear infinite;
                  }
                  .zone-hoverable {
                    transition: all 0.2s ease;
                  }
                  .zone-hoverable:hover {
                    filter: brightness(1.25);
                  }
                `}</style>
              </defs>

              {/* 1. Oasis Terrain Background & Rocky Contours */}
              <rect x="0" y="0" width="760" height="520" fill="url(#oasis-rock-pattern)" />

              {/* Topographic Elevation Ridges */}
              <path
                d="M 20 180 Q 220 140 450 170 T 740 160"
                stroke="rgba(56, 189, 248, 0.08)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M 10 320 Q 260 280 500 310 T 750 300"
                stroke="rgba(56, 189, 248, 0.06)"
                strokeWidth="1.5"
                fill="none"
              />

              {/* 2. Lake Priyadarshini Shoreline on South */}
              <path
                d="M 0 450 Q 200 425 410 440 T 760 435 L 760 520 L 0 520 Z"
                fill="url(#lake-gradient)"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x="590" y="495" fill="#38bdf8" opacity="0.6" fontSize="13" fontWeight="700" letterSpacing="1.5">
                LAKE PRIYADARSHINI
              </text>
              <text x="590" y="510" fill="#7dd3fc" opacity="0.45" fontSize="9">
                Perennial Glacial Freshwater Source (1.2 km²)
              </text>

              {/* 3. Utility Networks: Power, Water, Fuel */}

              {/* Water Intake Pipeline (Heated & Insulated) - Lake Pump House -> Main Building */}
              {activeLayers.WaterIntake && (
                <g>
                  {/* Trace heating insulation casing */}
                  <path
                    d="M 470 420 L 470 330 L 440 330"
                    stroke="#0891b2"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                  {/* Internal water flow line */}
                  <path
                    d="M 470 420 L 470 330 L 440 330"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    className="water-pipe-active"
                    fill="none"
                  />
                  <text x="478" y="380" fill="#67e8f9" fontSize="8" fontWeight="600" opacity="0.8">
                    Insulated Trace-Heated Pipe (320m)
                  </text>
                </g>
              )}

              {/* Power Bus Line: Generator Complex -> Main Building & Summer Camp */}
              {activeLayers.PowerGrid && (
                <g>
                  {/* Heavy Power Trunk */}
                  <path
                    d="M 280 270 L 380 270"
                    stroke="#ca8a04"
                    strokeWidth="6"
                    opacity="0.3"
                  />
                  <path
                    d="M 280 270 L 380 270"
                    stroke="#facc15"
                    strokeWidth="2.5"
                    strokeDasharray="8 4"
                    className="power-bus-active"
                    fill="none"
                  />
                  {/* Feed to Summer Camp */}
                  <path
                    d="M 490 210 L 490 155"
                    stroke="#eab308"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="power-bus-active"
                    fill="none"
                    opacity="0.7"
                  />
                  <text x="295" y="262" fill="#fde047" fontSize="8" fontWeight="700">
                    415V Main Bus (3-Phase)
                  </text>
                </g>
              )}

              {/* Fuel Transfer Pipeline: Fuel Farm -> Generator Complex */}
              {activeLayers.FuelLines && (
                <g>
                  <path
                    d="M 220 380 L 220 320"
                    stroke="#ea580c"
                    strokeWidth="5"
                    opacity="0.3"
                  />
                  <path
                    d="M 220 380 L 220 320"
                    stroke="#fb923c"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    className="fuel-pipe-active"
                    fill="none"
                  />
                  <text x="145" y="355" fill="#fdba74" fontSize="8" fontWeight="600">
                    Day Tank Transfer Line
                  </text>
                </g>
              )}

              {/* 4. Wind Vectors Overlay (Environment Layer) */}
              {activeLayers.Environment && (
                <g opacity="0.65">
                  {[
                    { x: 80, y: 70 },
                    { x: 320, y: 50 },
                    { x: 620, y: 90 },
                    { x: 80, y: 230 },
                    { x: 670, y: 260 },
                    { x: 260, y: 450 }
                  ].map((pos, i) => (
                    <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                      {/* Wind directional arrow representing SE Katabatic flow */}
                      <path
                        d="M -18 10 L 18 -10 M 18 -10 L 8 -11 M 18 -10 L 17 -1"
                        stroke="#38bdf8"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <circle cx="0" cy="0" r="1.5" fill="#38bdf8" />
                    </g>
                  ))}
                  <text x="640" y="30" fill="#38bdf8" fontSize="9" fontWeight="600">
                    💨 {windDirectionCardinal} @ {windSpeedKmh} km/h ({temperatureC}°C)
                  </text>
                </g>
              )}

              {/* 5. Documented Maitri Structures & Zones */}

              {/* Zone A: Main Building (U-Shaped Complex) */}
              {activeLayers.Structures && (() => {
                const mb = zones.find(z => z.id === 'main_building');
                const isSelected = selectedId === 'main_building';
                const statusColor = getStatusColor(mb?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => mb && handleZoneClick(mb)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pulsing selection aura */}
                    {isSelected && (
                      <rect
                        x="372"
                        y="202"
                        width="256"
                        height="156"
                        rx="12"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    {/* Elevated Foundation Piers (Pillars) */}
                    {[385, 430, 480, 530, 580, 610].map((px, idx) => (
                      <rect key={idx} x={px} y="352" width="6" height="8" fill="#475569" />
                    ))}

                    {/* U-Shaped Main Structure (Central Corridor + East & West Wings) */}
                    {/* West Wing */}
                    <rect
                      x="380"
                      y="210"
                      width="60"
                      height="140"
                      rx="6"
                      fill="url(#main-building-grad)"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    {/* East Wing */}
                    <rect
                      x="560"
                      y="210"
                      width="60"
                      height="140"
                      rx="6"
                      fill="url(#main-building-grad)"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    {/* Connecting Central Spine / Corridor */}
                    <rect
                      x="440"
                      y="260"
                      width="120"
                      height="50"
                      rx="4"
                      fill="#1e293b"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth="1.2"
                    />

                    {/* Station Roof Identification Details */}
                    <text x="500" y="285" fill="#f8fafc" fontSize="10" fontWeight="800" textAnchor="middle">
                      MAITRI MAIN BLOCK
                    </text>
                    <text x="500" y="299" fill="#94a3b8" fontSize="7.5" textAnchor="middle">
                      U-SHAPED COMPLEX (1989)
                    </text>

                    {/* West Wing Labels */}
                    <text x="410" y="235" fill="#93c5fd" fontSize="7" fontWeight="600" textAnchor="middle">
                      LIVING / MED
                    </text>
                    <text x="410" y="335" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
                      LOUNGE
                    </text>

                    {/* East Wing Labels */}
                    <text x="590" y="235" fill="#93c5fd" fontSize="7" fontWeight="600" textAnchor="middle">
                      COMMS / LABS
                    </text>
                    <text x="590" y="335" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
                      METEOROLOGY
                    </text>

                    {/* Status Badge Tag */}
                    <rect x="575" y="198" width="50" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="583" cy="205" r="3" fill={statusColor} />
                    <text x="590" y="209" fill="#ffffff" fontSize="7" fontWeight="700">
                      {mb?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}

              {/* Zone B: Generator Complex */}
              {activeLayers.Structures && (() => {
                const gc = zones.find(z => z.id === 'generator_complex');
                const isSelected = selectedId === 'generator_complex';
                const statusColor = getStatusColor(gc?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => gc && handleZoneClick(gc)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect
                        x="152"
                        y="202"
                        width="136"
                        height="126"
                        rx="10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}
                    <rect
                      x="160"
                      y="210"
                      width="120"
                      height="110"
                      rx="6"
                      fill="url(#generator-grad)"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Exhaust Silencer Stacks */}
                    <circle cx="185" cy="225" r="4.5" fill="#1e293b" stroke="#78350f" strokeWidth="1.5" />
                    <circle cx="215" cy="225" r="4.5" fill="#1e293b" stroke="#78350f" strokeWidth="1.5" />
                    <circle cx="245" cy="225" r="4.5" fill="#1e293b" stroke="#78350f" strokeWidth="1.5" />

                    {/* Genset Slots (10-bank historical reference) */}
                    <rect x="175" y="245" width="90" height="22" rx="3" fill="rgba(0,0,0,0.3)" />
                    <text x="220" y="259" fill="#fde047" fontSize="8" fontWeight="700" textAnchor="middle">
                      {gc?.subsystems?.[0]?.active_count || '2 Online'} / 10 Gensets
                    </text>

                    <text x="220" y="284" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">
                      POWER HOUSE
                    </text>
                    <text x="220" y="296" fill="#fcd34d" fontSize="7" textAnchor="middle">
                      62.5 kVA Units + CHP Manifold
                    </text>

                    {/* Status Badge */}
                    <rect x="235" y="200" width="48" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="243" cy="207" r="3" fill={statusColor} />
                    <text x="250" y="211" fill="#ffffff" fontSize="7" fontWeight="700">
                      {gc?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}

              {/* Zone C: Fuel Farm & Day Storage */}
              {activeLayers.Structures && (() => {
                const ff = zones.find(z => z.id === 'fuel_farm');
                const isSelected = selectedId === 'fuel_farm';
                const statusColor = getStatusColor(ff?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => ff && handleZoneClick(ff)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect
                        x="152"
                        y="372"
                        width="176"
                        height="116"
                        rx="10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    {/* Secondary Containment Bund Outer Border */}
                    <rect
                      x="160"
                      y="380"
                      width="160"
                      height="100"
                      rx="6"
                      fill="url(#fuel-grad)"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* 4 Cylindrical Bulk Tanks */}
                    <circle cx="195" cy="415" r="16" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
                    <text x="195" y="418" fill="#ffedd5" fontSize="7" fontWeight="700" textAnchor="middle">T-1</text>

                    <circle cx="240" cy="415" r="16" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
                    <text x="240" y="418" fill="#ffedd5" fontSize="7" fontWeight="700" textAnchor="middle">T-2</text>

                    <circle cx="285" cy="415" r="16" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
                    <text x="285" y="418" fill="#ffedd5" fontSize="7" fontWeight="700" textAnchor="middle">T-3</text>

                    <text x="240" y="452" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">
                      FUEL FARM
                    </text>
                    <text x="240" y="465" fill="#fed7aa" fontSize="7" textAnchor="middle">
                      Polar Diesel Class A (300 kL Cap)
                    </text>

                    {/* Status Badge */}
                    <rect x="275" y="372" width="48" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="283" cy="379" r="3" fill={statusColor} />
                    <text x="290" y="383" fill="#ffffff" fontSize="7" fontWeight="700">
                      {ff?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}

              {/* Zone D: Lake Water Pump House */}
              {activeLayers.Structures && (() => {
                const wph = zones.find(z => z.id === 'water_pump_house');
                const isSelected = selectedId === 'water_pump_house';
                const statusColor = getStatusColor(wph?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => wph && handleZoneClick(wph)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect
                        x="402"
                        y="412"
                        width="156"
                        height="86"
                        rx="10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    <rect
                      x="410"
                      y="420"
                      width="140"
                      height="70"
                      rx="6"
                      fill="#0e7490"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Submerged Intake Pipe Extending into Lake Priyadarshini */}
                    <path
                      d="M 450 490 L 450 515"
                      stroke="#06b6d4"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="450" cy="515" r="4" fill="#67e8f9" />

                    <text x="480" y="445" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">
                      PUMP HOUSE
                    </text>
                    <text x="480" y="458" fill="#a5f3fc" fontSize="7" textAnchor="middle">
                      Priyadarshini Lake Intake
                    </text>
                    <text x="480" y="470" fill="#cffafe" fontSize="6.5" textAnchor="middle">
                      Sub-ice Pump & Filter Unit
                    </text>

                    {/* Status Badge */}
                    <rect x="505" y="412" width="48" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="513" cy="419" r="3" fill={statusColor} />
                    <text x="520" y="423" fill="#ffffff" fontSize="7" fontWeight="700">
                      {wph?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}

              {/* Zone E: Summer Camp Complex (Northeast) */}
              {activeLayers.Structures && (() => {
                const sc = zones.find(z => z.id === 'summer_camp');
                const isSelected = selectedId === 'summer_camp';
                const statusColor = getStatusColor(sc?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => sc && handleZoneClick(sc)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect
                        x="472"
                        y="52"
                        width="216"
                        height="106"
                        rx="10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    {/* Modular Containerized Accommodation Blocks */}
                    <rect
                      x="480"
                      y="60"
                      width="200"
                      height="90"
                      rx="6"
                      fill="#1e293b"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* 3 Modular Living Pods */}
                    <rect x="495" y="75" width="50" height="28" rx="3" fill="#334155" stroke="#475569" />
                    <rect x="555" y="75" width="50" height="28" rx="3" fill="#334155" stroke="#475569" />
                    <rect x="615" y="75" width="50" height="28" rx="3" fill="#334155" stroke="#475569" />

                    <text x="580" y="122" fill="#ffffff" fontSize="8.5" fontWeight="700" textAnchor="middle">
                      SUMMER CAMP MODULES
                    </text>
                    <text x="580" y="135" fill="#94a3b8" fontSize="7" textAnchor="middle">
                      Expansion Quarters (Capacity: 40)
                    </text>

                    {/* Status Badge */}
                    <rect x="635" y="52" width="48" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="643" cy="59" r="3" fill={statusColor} />
                    <text x="650" y="63" fill="#ffffff" fontSize="7" fontWeight="700">
                      {sc?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}

              {/* Zone F: Garage & Heavy Workshop (West) */}
              {activeLayers.Structures && (() => {
                const gw = zones.find(z => z.id === 'garage_workshop');
                const isSelected = selectedId === 'garage_workshop';
                const statusColor = getStatusColor(gw?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => gw && handleZoneClick(gw)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect
                        x="22"
                        y="202"
                        width="116"
                        height="126"
                        rx="10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    <rect
                      x="30"
                      y="210"
                      width="100"
                      height="110"
                      rx="6"
                      fill="#1f2937"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Roller Doors & Crane silhouette */}
                    <rect x="42" y="275" width="32" height="35" rx="2" fill="#111827" stroke="#374151" />
                    <rect x="84" y="275" width="32" height="35" rx="2" fill="#111827" stroke="#374151" />

                    <text x="80" y="240" fill="#ffffff" fontSize="8.5" fontWeight="700" textAnchor="middle">
                      GARAGE / WORKSHOP
                    </text>
                    <text x="80" y="254" fill="#9ca3af" fontSize="7" textAnchor="middle">
                      Fleet Maintenance Depot
                    </text>

                    {/* Vehicle track marks */}
                    <path d="M 45 320 L 45 345 M 55 320 L 55 345" stroke="#4b5563" strokeDasharray="3 2" />

                    {/* Status Badge */}
                    <rect x="85" y="202" width="48" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="93" cy="209" r="3" fill={statusColor} />
                    <text x="100" y="213" fill="#ffffff" fontSize="7" fontWeight="700">
                      {gw?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}

              {/* Zone G: Container Storage Lines (East) */}
              {activeLayers.Structures && (() => {
                const cs = zones.find(z => z.id === 'container_storage');
                const isSelected = selectedId === 'container_storage';
                const statusColor = getStatusColor(cs?.status || 'NORMAL');
                return (
                  <g
                    className="zone-hoverable"
                    onClick={() => cs && handleZoneClick(cs)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <rect
                        x="642"
                        y="202"
                        width="112"
                        height="186"
                        rx="10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    )}

                    <rect
                      x="650"
                      y="210"
                      width="96"
                      height="170"
                      rx="6"
                      fill="#131d2e"
                      stroke={isSelected ? '#38bdf8' : statusColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* 20ft ISO Shipping Containers Arranged in Lines */}
                    {[225, 255, 285, 315].map((cy, idx) => (
                      <g key={idx}>
                        <rect x="660" y={cy} width="35" height="18" rx="1" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.8" />
                        <rect x="702" y={cy} width="35" height="18" rx="1" fill="#b45309" stroke="#f59e0b" strokeWidth="0.8" />
                      </g>
                    ))}

                    <text x="698" y="355" fill="#ffffff" fontSize="8" fontWeight="700" textAnchor="middle">
                      CONTAINER LINES
                    </text>
                    <text x="698" y="367" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
                      Spares & Cold Stores
                    </text>

                    {/* Status Badge */}
                    <rect x="700" y="202" width="48" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke={statusColor} strokeWidth="1" />
                    <circle cx="708" cy="209" r="3" fill={statusColor} />
                    <text x="715" y="213" fill="#ffffff" fontSize="7" fontWeight="700">
                      {cs?.status || 'NORMAL'}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Interactive Zone Inspector Drawer (Right Panel) */}
        {selectedZone && (
          <div style={{
            width: '320px',
            background: 'rgba(7, 14, 28, 0.95)',
            borderLeft: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            zIndex: 20,
            boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Inspector Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    {selectedZone.name}
                  </h4>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: selectedZone.status === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' :
                      (selectedZone.status === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                    color: getStatusColor(selectedZone.status),
                    border: `1px solid ${getStatusColor(selectedZone.status)}40`
                  }}>
                    {selectedZone.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3 }}>
                  {selectedZone.reference_label}
                </div>
              </div>
              <button
                onClick={() => {
                  setInternalSelectedId(null);
                  if (onSelectZone) onSelectZone(null);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: '#94a3b8',
                  borderRadius: 4,
                  padding: 4,
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Inspector Body */}
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Status Reason Banner */}
              {selectedZone.status_reason && (
                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: 6,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.75rem',
                  color: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Info size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span>{selectedZone.status_reason}</span>
                </div>
              )}

              {/* Subsystems List */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                  Active Subsystems & Telemetry
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedZone.subsystems.map((sub, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: 6,
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.72rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{sub.name}</span>
                        <span style={{
                          color: sub.status === 'Nominal' || sub.status === 'Active' || sub.status === 'Operational' || sub.status === 'Ready' || sub.status === 'Clean' || sub.status === 'Duty Cycle'
                            ? '#34d399'
                            : '#f59e0b',
                          fontWeight: 500,
                          fontSize: '0.68rem'
                        }}>
                          {sub.status}
                        </span>
                      </div>
                      {/* Metric pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {Object.entries(sub)
                          .filter(([k]) => k !== 'name' && k !== 'status')
                          .map(([key, val]) => (
                            <span
                              key={key}
                              style={{
                                background: 'rgba(56, 189, 248, 0.1)',
                                color: '#7dd3fc',
                                padding: '1px 6px',
                                borderRadius: 3,
                                fontSize: '0.65rem'
                              }}
                            >
                              {key.replace(/_/g, ' ')}: <strong style={{ color: '#ffffff' }}>{String(val)}</strong>
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Engineering Reference & Provenance */}
              {selectedZone.historical_reference && (
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '0.75rem',
                  fontSize: '0.7rem',
                  color: '#94a3b8'
                }}>
                  <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>Official Specification</span>
                    <ProvenanceBadge dataClass="REFERENCE" />
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.4, fontStyle: 'italic' }}>
                    "{selectedZone.historical_reference}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schematic Footer Legend */}
      <div style={{
        padding: '0.6rem 1.25rem',
        background: 'rgba(5, 11, 24, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Warning
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Critical
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8' }}>Click any facility to view active telemetry & engineering specs</span>
        </div>
        <div style={{ color: '#94a3b8' }}>
          Coordinate Grid: Schirmacher Oasis Station Perimeter
        </div>
      </div>
    </div>
  );
};
