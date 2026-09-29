import React from 'react';
import {
  LayoutDashboard,
  Home,
  Building2,
  Compass,
  SlidersHorizontal,
  GitBranch,
  Bell,
  Truck,
  FileText,
  Database,
  Settings,
  Radio,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { CommunicationState } from '../../types/antwin';
import { useTelemetry } from '../../context/TelemetryContext';

interface Props {
  activePage: string;
  onNavigate: (pageId: string) => void;
  commState?: CommunicationState;
  onToggleLinkLoss?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activePage,
  onNavigate,
  commState,
  onToggleLinkLoss
}) => {
  const isLinkLoss = commState?.link_status === 'LINK_LOSS' || commState?.link_status === 'BUFFERING';
  const { telemetryMode } = useTelemetry();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'maitri', label: 'Maitri Station', icon: Home },
    { id: 'bharati', label: 'Bharati Station', icon: Building2 },
    { id: 'scenarios', label: 'Scenarios', icon: SlidersHorizontal },
    { id: 'dependencies', label: 'Dependency Graph', icon: GitBranch },
    { id: 'alerts', label: 'Alerts & Events', icon: Bell, badge: '3' },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'provenance', label: 'Data & Provenance', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#070f1e',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      userSelect: 'none'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Logo Mountain Icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0284c7 0%, #00d2ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#ffffff',
              lineHeight: 1
            }}>
              ANTWIN
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: '#94a3b8',
              lineHeight: 1.2,
              marginTop: 4
            }}>
              ANTarctic Digital TWIN for<br />Intelligent Operations & Monitoring
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#0f294d' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? '#38bdf8' : '#64748b'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Card: Local Data Fabric & Simulated Communication */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        background: 'linear-gradient(to top, rgba(14, 25, 47, 0.9), transparent)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: 8,
          padding: '0.75rem',
          fontSize: '0.75rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Engine Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
              LOCAL DATA FABRIC
            </span>
            <span style={{ color: telemetryMode === 'LIVE_DEMO' ? '#00d2ff' : '#10b981', fontSize: '0.68rem', fontWeight: 700 }}>
              {telemetryMode === 'LIVE_DEMO' ? 'LIVE DEMO' : 'REPLAY ACTIVE'}
            </span>
          </div>

          {/* Simulated Link Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isLinkLoss ? (
                <WifiOff size={14} color="#f59e0b" />
              ) : (
                <Radio size={14} color={telemetryMode === 'LIVE_DEMO' ? '#00d2ff' : '#10b981'} />
              )}
              <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Simulated Link:</span>
            </div>
            <span style={{
              color: isLinkLoss ? '#f59e0b' : '#34d399',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}>
              {isLinkLoss ? 'BUFFERING' : 'CONNECTED'}
            </span>
          </div>

          <div style={{ color: '#64748b', fontSize: '0.68rem' }}>
            Source: {telemetryMode === 'LIVE_DEMO' ? 'Deterministic Live Feed (1 Hz)' : '7-Day Winter Replay (Offline)'}
          </div>

          {isLinkLoss && (
            <div style={{
              marginTop: 6,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 4,
              padding: '4px 6px',
              color: '#fbbf24',
              fontSize: '0.68rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Store-and-Forward:</span>
              <strong>{commState?.queued_records || 14} pkts</strong>
            </div>
          )}

          {onToggleLinkLoss && (
            <button
              onClick={onToggleLinkLoss}
              style={{
                width: '100%',
                marginTop: 8,
                background: isLinkLoss ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: isLinkLoss ? '#34d399' : '#f59e0b',
                border: `1px solid ${isLinkLoss ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                padding: '4px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <RefreshCw size={12} />
              {isLinkLoss ? 'Restore Simulated Link' : 'Simulate Link Loss'}
            </button>
          )}
        </div>


        {/* Ice Mountain Silhouette Graphic */}
        <div style={{
          marginTop: 6,
          height: 38,
          overflow: 'hidden',
          opacity: 0.35,
          pointerEvents: 'none'
        }}>
          <svg viewBox="0 0 200 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <polygon points="0,40 20,24 45,32 70,12 95,28 125,8 155,26 180,16 200,40" fill="#00d2ff" />
            <polygon points="10,40 35,26 65,34 90,18 120,30 145,14 175,28 200,40" fill="#38bdf8" opacity="0.6" />
          </svg>
        </div>
      </div>
    </aside>
  );
};
