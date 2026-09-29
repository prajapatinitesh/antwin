import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { ProvenanceModal } from './components/common/ProvenanceModal';
import { RemoteMissionControl } from './pages/RemoteMissionControl';
import { StationDigitalTwin } from './pages/StationDigitalTwin';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { DependencyGraphView } from './pages/DependencyGraphView';
import { DataProvenanceView } from './pages/DataProvenanceView';
import { LogisticsView } from './pages/LogisticsView';
import { AlertsView } from './pages/AlertsView';
import { ReportsView } from './pages/ReportsView';
import { SettingsView } from './pages/SettingsView';
import { antwinApi } from './services/api';
import {
  StationSummary,
  StationTwinState,
  AutonomyData,
  LogisticsData,
  DependencyGraphData,
  CommunicationState,
  SimulationResult,
  Provenance
} from './types/antwin';
import { TelemetryProvider } from './context/TelemetryContext';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('overview');
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [maitriState, setMaitriState] = useState<StationTwinState | null>(null);
  const [bharatiState, setBharatiState] = useState<StationTwinState | null>(null);
  const [autonomy, setAutonomy] = useState<AutonomyData | undefined>();
  const [logistics, setLogistics] = useState<LogisticsData | undefined>();
  const [dependencies, setDependencies] = useState<DependencyGraphData | null>(null);
  const [commState, setCommState] = useState<CommunicationState | undefined>();
  const [simResult, setSimResult] = useState<SimulationResult | undefined>();
  const [activeProvenance, setActiveProvenance] = useState<Provenance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      try {
        const [stList, mState, bState, aut, log, dep, comm, sim] = await Promise.all([
          antwinApi.getStations(),
          antwinApi.getStationState('MAITRI'),
          antwinApi.getStationState('BHARATI'),
          antwinApi.getAutonomy('MAITRI'),
          antwinApi.getLogistics('MAITRI'),
          antwinApi.getDependencies('MAITRI'),
          antwinApi.getCommunication('MAITRI'),
          antwinApi.runSimulation({
            station_id: 'MAITRI',
            scenario_type: 'COMBINED',
            scenario_name: 'Severe Cold + Generator Degradation',
            parameters: {
              temperature_c: -35.0,
              wind_speed_kmh: 60.0,
              resupply_delay_days: 7,
              generator_degradation_pct: 50.0
            }
          })
        ]);

        setStations(stList);
        setMaitriState(mState);
        setBharatiState(bState);
        setAutonomy(aut);
        setLogistics(log);
        setDependencies(dep);
        setCommState(comm);
        setSimResult(sim);
      } catch (err) {
        console.error('Failed to load initial ANTWIN data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // WebSocket Live Streaming
  useEffect(() => {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const wsUrl = `${wsProto}//${wsHost}/ws/stations/MAITRI`;
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Heartbeat or telemetry event
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      // ignore
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Toggle SATCOM Link Loss Simulation
  const handleToggleLinkLoss = async () => {
    if (!commState) return;
    try {
      if (commState.link_status === 'CONNECTED') {
        const updated = await antwinApi.simulateLinkLoss('MAITRI');
        setCommState(updated);
      } else {
        const updated = await antwinApi.restoreLink('MAITRI');
        setCommState(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // TopBar Breadcrumb configuration
  const getBreadcrumb = () => {
    if (activePage === 'overview') {
      return undefined;
    }
    if (activePage === 'maitri') {
      return [
        { label: 'Mission Control', pageId: 'overview' },
        { label: 'Maitri Station' }
      ];
    }
    if (activePage === 'bharati') {
      return [
        { label: 'Mission Control', pageId: 'overview' },
        { label: 'Bharati Station' }
      ];
    }
    if (activePage === 'scenarios') {
      return [
        { label: 'Mission Control', pageId: 'overview' },
        { label: 'Scenario Simulator' }
      ];
    }
    if (activePage === 'dependencies') {
      return [
        { label: 'Mission Control', pageId: 'overview' },
        { label: 'Maitri Station', pageId: 'maitri' },
        { label: 'Dependency Graph' }
      ];
    }
    if (activePage === 'provenance') {
      return [
        { label: 'Mission Control', pageId: 'overview' },
        { label: 'Data Truth & Provenance' }
      ];
    }
    return [
      { label: 'Mission Control', pageId: 'overview' },
      { label: activePage.charAt(0).toUpperCase() + activePage.slice(1) }
    ];
  };

  const getSubtitle = () => {
    if (activePage === 'maitri') {
      return 'Schirmacher Oasis, East Antarctica | 70°45\' S, 11°44\' E | Elevation: 117 m';
    }
    if (activePage === 'bharati') {
      return 'Larsemann Hills, Ingrid Christensen Coast | 69°24\' S, 76°33\' E | Elevation: 35 m';
    }
    if (activePage === 'scenarios') {
      return 'Model • Analyse • Predict • Recommend';
    }
    if (activePage === 'dependencies') {
      return 'Station Overview • System Analysis • Dependency Graph';
    }
    return 'Monitor • Analyze • Decide • Keep Antarctica Running';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-space)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p)}
        commState={commState}
        onToggleLinkLoss={handleToggleLinkLoss}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          breadcrumb={getBreadcrumb()}
          subtitle={getSubtitle()}
          onNavigate={(p) => setActivePage(p)}
          stationStatus={activePage === 'maitri' || activePage === 'bharati' ? 'Operational' : undefined}
        />

        <main style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#38bdf8' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Initializing ANTWIN Digital Twin Engine...</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Synchronizing station parameters and public observations</div>
              </div>
            </div>
          ) : (
            <>
              {activePage === 'overview' && (
                <RemoteMissionControl
                  stations={stations}
                  autonomy={autonomy}
                  logistics={logistics}
                  onEnterStation={(stId) => setActivePage(stId.toLowerCase())}
                  onNavigate={(p) => setActivePage(p)}
                  onViewProvenance={(prov) => setActiveProvenance(prov)}
                />
              )}

              {activePage === 'maitri' && maitriState && (
                <StationDigitalTwin
                  stationState={maitriState}
                  onNavigate={(p) => setActivePage(p)}
                  onViewProvenance={(prov) => setActiveProvenance(prov)}
                />
              )}

              {activePage === 'bharati' && bharatiState && (
                <StationDigitalTwin
                  stationState={bharatiState}
                  onNavigate={(p) => setActivePage(p)}
                  onViewProvenance={(prov) => setActiveProvenance(prov)}
                />
              )}

              {activePage === 'scenarios' && (
                <ScenarioSimulator
                  initialResult={simResult}
                  onViewProvenance={(prov) => setActiveProvenance(prov)}
                />
              )}

              {activePage === 'dependencies' && dependencies && (
                <DependencyGraphView
                  graphData={dependencies}
                  onNavigate={(p) => setActivePage(p)}
                  onViewProvenance={(prov) => setActiveProvenance(prov)}
                />
              )}

              {activePage === 'provenance' && (
                <DataProvenanceView />
              )}

              {activePage === 'logistics' && (
                <LogisticsView onNavigate={(p) => setActivePage(p)} />
              )}

              {activePage === 'alerts' && (
                <AlertsView />
              )}

              {activePage === 'reports' && (
                <ReportsView />
              )}

              {activePage === 'settings' && (
                <SettingsView />
              )}

            </>
          )}
        </main>
      </div>

      {/* Global Data Truth Provenance Modal */}
      <ProvenanceModal
        provenance={activeProvenance}
        onClose={() => setActiveProvenance(null)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TelemetryProvider>
      <AppContent />
    </TelemetryProvider>
  );
};

export default App;
