import React, { useState } from 'react';
import { Compass, Radio } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

export interface StationMapMarker {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  elevationM: number;
  temperatureC?: number;
  windSpeedKmh?: number;
  autonomyDays?: number;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
  color: string;
}

interface Props {
  stations?: StationMapMarker[];
  activeStationId?: string | null;
  onSelectStation?: (stationId: string) => void;
  onEnterStation?: (stationId: string) => void;
}

// Polar Stereographic Projection centered on the South Pole (-90°S)
// Mapping (lat, lon) -> (x, y) on canvas of width W, height H
export function projectSouthPolar(
  lat: number,
  lon: number,
  cx: number = 300,
  cy: number = 230,
  maxRadius: number = 195
): { x: number; y: number } {
  // Colatitude: 0 at -90° (South Pole), 30 at -60° (outer edge boundary)
  const colatitude = Math.max(0, Math.min(35, 90 + lat));
  const r = (colatitude / 30.0) * maxRadius;
  // 0° longitude points directly North/upward (angle -90° in standard math coords)
  // Longitude increases Eastward (clockwise in polar projection)
  const angleRad = ((lon - 90.0) * Math.PI) / 180.0;
  return {
    x: Math.round((cx + r * Math.cos(angleRad)) * 10) / 10,
    y: Math.round((cy + r * Math.sin(angleRad)) * 10) / 10
  };
}

// Authentic Antarctica boundary polygon coordinates (lat, lon) in clockwise order
// tracing: Antarctic Peninsula -> Weddell Sea -> Dronning Maud Land -> Enderby -> Prydz Bay -> Wilkes -> Victoria -> Ross Sea -> Marie Byrd -> Ellsworth
const ANTARCTIC_COASTLINE_GEO: Array<[number, number]> = [
  // 1. Antarctic Peninsula (Graham Land & Palmer Land)
  [-63.3, -57.0], [-63.6, -56.2], [-64.2, -56.8], [-64.8, -59.5], [-65.8, -61.2],
  [-66.8, -62.8], [-68.0, -64.2], [-69.4, -63.5], [-70.8, -62.0],
  // 2. Weddell Sea Coast & Ronne-Filchner Ice Shelf front margin
  [-72.4, -60.0], [-74.2, -58.5], [-76.2, -54.0], [-77.8, -48.0], [-78.5, -42.0],
  [-78.0, -36.0], [-77.2, -32.5],
  // 3. Coats Land & Caird Coast
  [-75.8, -28.0], [-74.2, -23.0], [-73.0, -17.5], [-71.8, -13.0],
  // 4. Queen Maud Land (Dronning Maud Land) - Princess Martha Coast
  [-71.0, -8.0], [-70.4, -2.5], [-70.1, 3.5], [-69.8, 8.5],
  // 5. Princess Astrid Coast (Schirmacher Oasis - Maitri Station vicinity)
  [-70.4, 12.0], [-69.8, 16.5], [-69.5, 21.0],
  // 6. Princess Ragnhild & Prince Harald Coasts (Lützow-Holm Bay)
  [-69.7, 26.0], [-69.4, 31.0], [-69.1, 36.0], [-69.6, 39.5],
  // 7. Enderby Land & Cape Ann prominent outward projection
  [-68.2, 44.0], [-66.4, 48.5], [-66.0, 52.5], [-67.0, 57.0],
  // 8. Mac. Robertson Coast & Prydz Bay / Amery Ice Shelf indentation
  [-67.5, 62.0], [-68.0, 67.0], [-69.0, 71.0], [-69.8, 73.0],
  // 9. Larsemann Hills (Bharati Station vicinity) & Ingrid Christensen Coast
  [-69.4, 76.2], [-68.6, 79.5], [-68.3, 83.0],
  // 10. Queen Mary Coast & Shackleton Ice Shelf
  [-67.0, 86.0], [-66.3, 90.0], [-66.5, 94.5], [-65.3, 97.5], [-65.6, 101.5], [-66.2, 104.5],
  // 11. Wilkes Land (Knox, Budd & Sabrina Coasts - Casey vicinity)
  [-66.4, 108.5], [-66.2, 112.0], [-66.5, 117.0], [-66.2, 122.5], [-66.4, 128.5], [-66.3, 134.5],
  // 12. Adélie Coast & George V Coast (Dumont d'Urville vicinity)
  [-66.8, 140.0], [-67.0, 143.5], [-67.5, 148.0], [-68.2, 153.0],
  // 13. Oates Coast & Victoria Land (Cape Adare)
  [-69.6, 158.5], [-70.8, 164.0], [-71.3, 170.2], [-72.6, 171.2], [-74.2, 166.5],
  [-76.2, 163.8], [-77.6, 166.0],
  // 14. Ross Ice Shelf front margin (deep continental embayment toward South Pole)
  [-78.2, 171.0], [-78.8, 178.0], [-78.6, -176.0], [-78.3, -169.0], [-78.0, -163.5],
  // 15. Edward VII Peninsula & Marie Byrd Land
  [-77.0, -156.5], [-76.0, -151.0], [-74.8, -144.0], [-74.3, -136.5], [-73.8, -128.5],
  [-73.4, -120.0], [-72.8, -111.0],
  // 16. Ellsworth Land / Walgreen Coast & Amundsen Sea
  [-72.4, -103.5], [-73.5, -98.5], [-72.0, -95.5], [-72.8, -88.5], [-73.0, -81.5], [-73.5, -74.5],
  // 17. Alexander Island & Bellingshausen Sea
  [-72.0, -71.0], [-70.6, -69.2], [-71.5, -67.5],
  // 18. West coast of Antarctic Peninsula (Marguerite Bay, Danco Coast back to tip)
  [-68.5, -66.5], [-66.5, -64.5], [-65.0, -63.0], [-63.8, -59.5], [-63.3, -57.0]
];

// Major Ice Shelves geometries (in lat, lon)
const RONNE_FILCHNER_SHELF_GEO: Array<[number, number]> = [
  [-74.2, -58.5], [-76.2, -54.0], [-77.8, -48.0], [-78.5, -42.0], [-78.0, -36.0],
  [-77.2, -32.5], [-79.5, -40.0], [-82.0, -50.0], [-78.0, -62.0], [-74.2, -58.5]
];

const ROSS_ICE_SHELF_GEO: Array<[number, number]> = [
  [-77.6, 166.0], [-78.2, 171.0], [-78.8, 178.0], [-78.6, -176.0], [-78.3, -169.0],
  [-78.0, -163.5], [-80.5, -165.0], [-84.0, -175.0], [-84.5, 175.0], [-81.0, 165.0], [-77.6, 166.0]
];

const AMERY_ICE_SHELF_GEO: Array<[number, number]> = [
  [-68.0, 67.0], [-69.0, 71.0], [-69.8, 73.0], [-71.5, 71.0], [-72.5, 68.5], [-70.5, 68.0], [-68.0, 67.0]
];

// Default station definitions if not provided
const DEFAULT_STATIONS: StationMapMarker[] = [
  {
    id: 'MAITRI',
    name: 'Maitri Station',
    region: 'Schirmacher Oasis',
    lat: -70.7668,
    lon: 11.7308,
    elevationM: 117,
    status: 'OPERATIONAL',
    color: '#10b981'
  },
  {
    id: 'BHARATI',
    name: 'Bharati Station',
    region: 'Larsemann Hills',
    lat: -69.4068,
    lon: 76.1953,
    elevationM: 35,
    status: 'OPERATIONAL',
    color: '#0284c7'
  }
];

export const AntarcticaMap: React.FC<Props> = ({
  stations = DEFAULT_STATIONS,
  activeStationId,
  onSelectStation,
  onEnterStation
}) => {
  const [hoveredStation, setHoveredStation] = useState<StationMapMarker | null>(null);

  const cx = 300;
  const cy = 230;
  const maxR = 195;

  // Convert geographic coastline to SVG path string
  const continentPathD = (() => {
    const pts = ANTARCTIC_COASTLINE_GEO.map(([lat, lon]) => projectSouthPolar(lat, lon, cx, cy, maxR));
    return pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '') + ' Z';
  })();

  const ronneShelfD = (() => {
    const pts = RONNE_FILCHNER_SHELF_GEO.map(([lat, lon]) => projectSouthPolar(lat, lon, cx, cy, maxR));
    return pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '') + ' Z';
  })();

  const rossShelfD = (() => {
    const pts = ROSS_ICE_SHELF_GEO.map(([lat, lon]) => projectSouthPolar(lat, lon, cx, cy, maxR));
    return pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '') + ' Z';
  })();

  const ameryShelfD = (() => {
    const pts = AMERY_ICE_SHELF_GEO.map(([lat, lon]) => projectSouthPolar(lat, lon, cx, cy, maxR));
    return pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '') + ' Z';
  })();

  // Project stations mathematically from coordinates
  const maitriCoord = projectSouthPolar(-70.7668, 11.7308, cx, cy, maxR);
  const bharatiCoord = projectSouthPolar(-69.4068, 76.1953, cx, cy, maxR);

  // Curved Trans-Antarctic Operational Link
  const controlPointX = (maitriCoord.x + bharatiCoord.x) / 2 + 25;
  const controlPointY = (maitriCoord.y + bharatiCoord.y) / 2 + 35;
  const linkPathD = `M ${maitriCoord.x} ${maitriCoord.y} Q ${controlPointX} ${controlPointY} ${bharatiCoord.x} ${bharatiCoord.y}`;

  // Latitude ring radii (colatitude: 90 + lat)
  const r80 = (10 / 30.0) * maxR; // 80°S (colat = 10°)
  const r70 = (20 / 30.0) * maxR; // 70°S (colat = 20°)
  const r60 = (30 / 30.0) * maxR; // 60°S (colat = 30°)

  return (
    <div
      className="antwin-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '440px',
        position: 'relative',
        padding: '1.25rem'
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em', margin: 0 }}>
              ANTARCTICA OPERATIONAL MAP
            </h3>
            <ProvenanceBadge dataClass="REFERENCE" />
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
            Station positions and mission connectivity • South Polar Stereographic Projection
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.08)', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <Radio size={12} className="pulse-radar" />
          <span>POLAR TELEMETRY GRID</span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Subtle Compass Indicator */}
        <div style={{ position: 'absolute', top: 8, left: 8, opacity: 0.7, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Compass size={22} color="#38bdf8" />
          <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>N (0° Mer)</span>
        </div>

        <svg viewBox="0 0 600 460" style={{ width: '100%', height: '100%', maxHeight: '420px', userSelect: 'none' }}>
          <defs>
            {/* Ice mass glow & texture */}
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#08162d" />
              <stop offset="85%" stopColor="#050e1d" />
              <stop offset="100%" stopColor="#030812" />
            </radialGradient>

            <linearGradient id="iceSheetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a66" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#122748" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0d1b32" stopOpacity="0.85" />
            </linearGradient>

            <filter id="iceGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.25" />
            </filter>

            <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00d2ff" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Deep Southern Ocean Background Circle */}
          <circle cx={cx} cy={cy} r={maxR + 15} fill="url(#oceanGradient)" />

          {/* Polar Coordinate Rings */}
          {/* 60°S (Outer boundary) */}
          <circle cx={cx} cy={cy} r={r60} fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeDasharray="3 3" />
          <text x={cx + 4} y={cy - r60 - 3} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">60°S (Antarctic Circle)</text>

          {/* 70°S */}
          <circle cx={cx} cy={cy} r={r70} fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeDasharray="3 3" />
          <text x={cx + 4} y={cy - r70 - 3} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">70°S</text>

          {/* 80°S */}
          <circle cx={cx} cy={cy} r={r80} fill="none" stroke="rgba(56, 189, 248, 0.18)" strokeDasharray="3 3" />
          <text x={cx + 4} y={cy - r80 - 3} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">80°S</text>

          {/* Meridian Spokes */}
          {/* 0° / 180° line (Greenwich / Antimeridian) */}
          <line x1={cx} y1={cy - maxR - 10} x2={cx} y2={cy + maxR + 10} stroke="rgba(56, 189, 248, 0.1)" strokeDasharray="2 4" />
          <text x={cx - 16} y={cy - maxR - 12} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">0° (Prime)</text>
          <text x={cx - 12} y={cy + maxR + 20} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">180°</text>

          {/* 90°W / 90°E line */}
          <line x1={cx - maxR - 10} y1={cy} x2={cx + maxR + 10} y2={cy} stroke="rgba(56, 189, 248, 0.1)" strokeDasharray="2 4" />
          <text x={cx - maxR - 28} y={cy + 3} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">90°W</text>
          <text x={cx + maxR + 12} y={cy + 3} fill="#64748b" fontSize="8" fontFamily="var(--font-mono)">90°E</text>

          {/* Major Ice Shelves (Ronne, Ross, Amery) */}
          <path
            d={ronneShelfD}
            fill="rgba(56, 189, 248, 0.12)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <text x="210" y="195" fill="rgba(148, 163, 184, 0.6)" fontSize="7.5" fontStyle="italic" textAnchor="middle">
            Ronne-Filchner
          </text>

          <path
            d={rossShelfD}
            fill="rgba(56, 189, 248, 0.12)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <text x="315" y="335" fill="rgba(148, 163, 184, 0.6)" fontSize="7.5" fontStyle="italic" textAnchor="middle">
            Ross Ice Shelf
          </text>

          <path
            d={ameryShelfD}
            fill="rgba(56, 189, 248, 0.12)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <text x="400" y="210" fill="rgba(148, 163, 184, 0.6)" fontSize="7" fontStyle="italic" textAnchor="middle">
            Amery
          </text>

          {/* Geographically Accurate Antarctic Continental Landmass */}
          <path
            d={continentPathD}
            fill="url(#iceSheetGradient)"
            stroke="#38bdf8"
            strokeWidth="1.6"
            strokeLinejoin="round"
            filter="url(#iceGlow)"
          />

          {/* Region Annotations on Continent */}
          <text x="330" y="150" fill="rgba(255, 255, 255, 0.35)" fontSize="9" letterSpacing="1.5" fontWeight="600">
            DRONNING MAUD LAND
          </text>
          <text x="375" y="270" fill="rgba(255, 255, 255, 0.3)" fontSize="8.5" letterSpacing="1.2" fontWeight="600">
            WILKES LAND
          </text>
          <text x="180" y="280" fill="rgba(255, 255, 255, 0.3)" fontSize="8.5" letterSpacing="1.2" fontWeight="600">
            MARIE BYRD LAND
          </text>
          <text x="142" y="115" fill="rgba(56, 189, 248, 0.65)" fontSize="8" fontWeight="700" transform="rotate(-40 142 115)">
            ANTARCTIC PENINSULA
          </text>

          {/* South Pole (Amundsen-Scott) Marker in Center */}
          <g transform={`translate(${cx}, ${cy})`}>
            <circle cx="0" cy="0" r="3.5" fill="#f8fafc" />
            <circle cx="0" cy="0" r="7" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeDasharray="2 2" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.8" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.8" />
            <text x="10" y="-8" fill="#f8fafc" fontSize="8" fontWeight="700" fontFamily="var(--font-mono)">
              SOUTH POLE
            </text>
            <text x="10" y="2" fill="#94a3b8" fontSize="7" fontFamily="var(--font-mono)">
              90° 00' S
            </text>
          </g>

          {/* Operational Link between Maitri & Bharati */}
          <path
            d={linkPathD}
            fill="none"
            stroke="#00d2ff"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          {/* Animated pulse dot travelling along route */}
          <circle r="3.5" fill="#38bdf8" filter="url(#markerGlow)">
            <animateMotion dur="4s" repeatCount="indefinite" path={linkPathD} />
          </circle>
          {/* Route Label */}
          <text x={controlPointX + 10} y={controlPointY + 8} fill="#38bdf8" fontSize="8" fontWeight="600" letterSpacing="0.5">
            Operational Link
          </text>

          {/* Station Markers (Maitri & Bharati) */}
          {/* 1. Maitri Station */}
          <g
            transform={`translate(${maitriCoord.x}, ${maitriCoord.y})`}
            style={{ cursor: 'pointer' }}
            onClick={() => onEnterStation?.('MAITRI')}
            onMouseEnter={() => setHoveredStation(stations.find(s => s.id === 'MAITRI') || null)}
            onMouseLeave={() => setHoveredStation(null)}
          >
            {/* Beacon pulse */}
            <circle cx="0" cy="0" r="14" fill="rgba(16, 185, 129, 0.2)" className="pulse-radar" />
            <circle cx="0" cy="0" r="7" fill="#10b981" filter="url(#markerGlow)" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

            {/* Label Card */}
            <rect
              x="-60"
              y="-38"
              width="120"
              height="26"
              rx="4"
              fill="rgba(11, 20, 38, 0.9)"
              stroke="#10b981"
              strokeWidth="1.2"
            />
            <text x="0" y="-25" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
              MAITRI STATION
            </text>
            <text x="0" y="-15" fill="#34d399" fontSize="7.5" textAnchor="middle" fontFamily="var(--font-mono)">
              Schirmacher Oasis • 70°45'S
            </text>
            <line x1="0" y1="-12" x2="0" y2="0" stroke="#10b981" strokeWidth="1.2" />
          </g>

          {/* 2. Bharati Station */}
          <g
            transform={`translate(${bharatiCoord.x}, ${bharatiCoord.y})`}
            style={{ cursor: 'pointer' }}
            onClick={() => onEnterStation?.('BHARATI')}
            onMouseEnter={() => setHoveredStation(stations.find(s => s.id === 'BHARATI') || null)}
            onMouseLeave={() => setHoveredStation(null)}
          >
            {/* Beacon pulse */}
            <circle cx="0" cy="0" r="14" fill="rgba(2, 132, 199, 0.2)" className="pulse-radar" />
            <circle cx="0" cy="0" r="7" fill="#0284c7" filter="url(#markerGlow)" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

            {/* Label Card */}
            <rect
              x="12"
              y="-14"
              width="122"
              height="26"
              rx="4"
              fill="rgba(11, 20, 38, 0.9)"
              stroke="#0284c7"
              strokeWidth="1.2"
            />
            <text x="73" y="-1" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
              BHARATI STATION
            </text>
            <text x="73" y="9" fill="#38bdf8" fontSize="7.5" textAnchor="middle" fontFamily="var(--font-mono)">
              Larsemann Hills • 69°24'S
            </text>
            <line x1="0" y1="0" x2="12" y2="0" stroke="#0284c7" strokeWidth="1.2" />
          </g>
        </svg>

        {/* Hover Tooltip Overlay if hovered */}
        {hoveredStation && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(11, 22, 44, 0.95)',
              border: `1px solid ${hoveredStation.color}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: '0.72rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
              zIndex: 30
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: hoveredStation.color }} />
              <strong style={{ color: '#ffffff' }}>{hoveredStation.name}</strong>
              <span style={{ color: '#10b981', fontSize: '0.65rem' }}>● OPERATIONAL</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: 3 }}>
              {hoveredStation.region} • Elevation: {hoveredStation.elevationM} m
            </div>
            <div style={{ color: '#38bdf8', fontSize: '0.68rem', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
              Coord: {Math.abs(hoveredStation.lat).toFixed(2)}°S, {Math.abs(hoveredStation.lon).toFixed(2)}°E
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: '#94a3b8',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '0.65rem',
          marginTop: '0.25rem'
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <strong style={{ color: '#f8fafc' }}>Maitri Station</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }} />
            <strong style={{ color: '#f8fafc' }}>Bharati Station</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 2, borderBottom: '2px dashed #00d2ff' }} />
            Operational connection
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>+</span>
            South Pole
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
          Scale: 0 ── 500 ── 1,000 ── 1,500 km
        </div>
      </div>
    </div>
  );
};
