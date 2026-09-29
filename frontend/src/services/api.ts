import {
  StationSummary,
  StationTwinState,
  AutonomyData,
  SimulationResult,
  DependencyGraphData,
  LogisticsData,
  CommunicationState,
  Provenance
} from '../types/antwin';

/**
 * Resolves the HTTP API base URL.
 * - Local development: defaults to '/api' (proxied via Vite to http://127.0.0.1:8000).
 * - Production: uses VITE_API_BASE_URL (e.g. https://antwin-backend.onrender.com/api) or production fallback.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  if (import.meta.env.PROD) {
    return 'https://antwin-backend.onrender.com/api';
  }
  return '/api';
}

export const API_BASE = getApiBaseUrl();

/**
 * Resolves the WebSocket URL for live telemetry streaming.
 * - Local development: connects to ws://127.0.0.1:8000/ws/stations/MAITRI
 * - Production: connects to wss://antwin-backend.onrender.com/ws/stations/MAITRI
 */
export function getWebSocketUrl(path: string = '/ws/stations/MAITRI'): string {
  const explicitWs = (import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_WS_URL || '').trim();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (explicitWs) {
    return `${explicitWs.replace(/\/+$/, '')}${cleanPath}`;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (apiBase) {
    try {
      const url = new URL(apiBase.startsWith('http') ? apiBase : `https://${apiBase}`);
      const wsProto = url.protocol === 'http:' ? 'ws:' : 'wss:';
      return `${wsProto}//${url.host}${cleanPath}`;
    } catch {
      const wsProto = apiBase.startsWith('http:') ? 'ws:' : 'wss:';
      const host = apiBase.replace(/^https?:\/\//, '').split('/')[0];
      return `${wsProto}//${host}${cleanPath}`;
    }
  }

  if (import.meta.env.PROD) {
    return `wss://antwin-backend.onrender.com${cleanPath}`;
  }

  return `ws://127.0.0.1:8000${cleanPath}`;
}

export const antwinApi = {
  async getStations(): Promise<StationSummary[]> {
    const res = await fetch(`${API_BASE}/stations`);
    if (!res.ok) throw new Error('Failed to fetch stations');
    return res.json();
  },

  async getStationState(stationId: string): Promise<StationTwinState> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/state`);
    if (!res.ok) throw new Error(`Failed to fetch station state for ${stationId}`);
    return res.json();
  },

  async getAutonomy(stationId: string): Promise<AutonomyData> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/autonomy`);
    if (!res.ok) throw new Error(`Failed to fetch autonomy for ${stationId}`);
    return res.json();
  },

  async getLogistics(stationId: string): Promise<LogisticsData> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/logistics`);
    if (!res.ok) throw new Error(`Failed to fetch logistics for ${stationId}`);
    return res.json();
  },

  async getDependencies(stationId: string): Promise<DependencyGraphData> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/dependencies`);
    if (!res.ok) throw new Error(`Failed to fetch dependencies for ${stationId}`);
    return res.json();
  },

  async runSimulation(payload: any): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
  },

  async recalculateMitigation(simulationId: string, selectedMitigations: string[]): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/recalculate-mitigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulation_id: simulationId, selected_mitigations: selectedMitigations })
    });
    if (!res.ok) throw new Error('Failed to recalculate mitigation');
    return res.json();
  },

  async getCommunication(stationId: string): Promise<CommunicationState> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/communication`);
    if (!res.ok) throw new Error('Failed to fetch communication status');
    return res.json();
  },

  async simulateLinkLoss(stationId: string): Promise<CommunicationState> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/communication/simulate-loss`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to simulate link loss');
    return res.json();
  },

  async restoreLink(stationId: string): Promise<CommunicationState> {
    const res = await fetch(`${API_BASE}/stations/${stationId}/communication/restore`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to restore link');
    return res.json();
  },

  async getProvenance(entityType: string, entityId: string): Promise<Provenance> {
    const res = await fetch(`${API_BASE}/provenance/${entityType}/${entityId}`);
    if (!res.ok) throw new Error('Failed to fetch provenance');
    return res.json();
  },

  async getSources(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/provenance/sources`);
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
  },

  // --- Maitri Specific Dynamic Replay & Operational Endpoints ---
  async getMaitriReplayCurrent(): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/replay/current`);
    if (!res.ok) throw new Error('Failed to fetch Maitri replay state');
    return res.json();
  },

  async tickMaitriReplay(): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/replay/tick`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to tick Maitri replay');
    return res.json();
  },

  async controlMaitriReplay(controls: {
    action?: 'play' | 'pause' | 'seek' | 'reset';
    index?: number;
    speed?: number;
    mode?: 'REPLAY' | 'LIVE' | 'DEMO';
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/replay/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(controls)
    });
    if (!res.ok) throw new Error('Failed to control Maitri replay');
    return res.json();
  },

  async getMaitriTimeline(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/maitri/replay/timeline`);
    if (!res.ok) throw new Error('Failed to fetch Maitri timeline');
    return res.json();
  },

  async getMaitriReplayHistory(hours: number = 24): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/replay/history?hours=${hours}`);
    if (!res.ok) throw new Error('Failed to fetch Maitri replay history');
    return res.json();
  },

  async getMaitriSchematicZones(): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/schematic/zones`);
    if (!res.ok) throw new Error('Failed to fetch Maitri schematic zones');
    return res.json();
  },

  async getMaitriZoneDetail(zoneId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/schematic/zone/${zoneId}`);
    if (!res.ok) throw new Error(`Failed to fetch Maitri zone detail for ${zoneId}`);
    return res.json();
  },

  async getMaitriFleet(): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/assets/fleet`);
    if (!res.ok) throw new Error('Failed to fetch Maitri fleet registry');
    return res.json();
  },

  async injectMaitriScenario(scenarioName: string | null, severityPct: number = 35.0, mitigations: string[] = []): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/scenario/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_name: scenarioName, severity_pct: severityPct, mitigations })
    });
    if (!res.ok) throw new Error('Failed to inject Maitri scenario');
    return res.json();
  },

  async toggleMaitriMitigation(mitigationName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/maitri/scenario/mitigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mitigation_name: mitigationName })
    });
    if (!res.ok) throw new Error('Failed to toggle Maitri mitigation');
    return res.json();
  },

  // --- Bharati Specific Dynamic Replay & Operational Endpoints ---
  async getBharatiReplayCurrent(): Promise<any> {
    const res = await fetch(`${API_BASE}/bharati/replay/current`);
    if (!res.ok) throw new Error('Failed to fetch Bharati replay state');
    return res.json();
  },

  async tickBharatiReplay(): Promise<any> {
    const res = await fetch(`${API_BASE}/bharati/replay/tick`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to tick Bharati replay');
    return res.json();
  },

  async controlBharatiReplay(controls: {
    action?: 'play' | 'pause' | 'seek' | 'reset';
    index?: number;
    speed?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/bharati/replay/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(controls)
    });
    if (!res.ok) throw new Error('Failed to control Bharati replay');
    return res.json();
  },

  async getBharatiTimeline(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/bharati/timeline`);
    if (!res.ok) throw new Error('Failed to fetch Bharati timeline');
    return res.json();
  },

  async getBharatiSchematicZones(): Promise<any> {
    const res = await fetch(`${API_BASE}/bharati/schematic/zones`);
    if (!res.ok) throw new Error('Failed to fetch Bharati schematic zones');
    return res.json();
  },

  async injectBharatiScenario(scenarioName: string | null, severityPct: number = 35.0, mitigations: string[] = []): Promise<any> {
    const res = await fetch(`${API_BASE}/bharati/scenario/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_name: scenarioName, severity_pct: severityPct, mitigations })
    });
    if (!res.ok) throw new Error('Failed to inject Bharati scenario');
    return res.json();
  },

  async toggleBharatiMitigation(mitigationName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/bharati/scenario/mitigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mitigation_name: mitigationName })
    });
    if (!res.ok) throw new Error('Failed to toggle Bharati mitigation');
    return res.json();
  }
};



