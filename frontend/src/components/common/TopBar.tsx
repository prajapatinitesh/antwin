import React from 'react';
import { ChevronRight, ChevronDown, User, Activity } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  breadcrumb?: { label: string; pageId?: string }[];
  onNavigate?: (pageId: string) => void;
  stationStatus?: string;
}

export const TopBar: React.FC<Props> = ({
  title,
  subtitle,
  breadcrumb,
  onNavigate,
  stationStatus
}) => {
  // Live system clock following the host computer system date and time
  const [currentSystemTime, setCurrentSystemTime] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    // Immediate synchronization on mount
    setCurrentSystemTime(new Date());

    // Continuous 1-second tick interval following host system clock
    const timer = setInterval(() => {
      setCurrentSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    const timeStr = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    let tzName = 'IST';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') {
        tzName = 'IST';
      } else {
        const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(date);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        tzName = tzPart?.value || 'IST';
      }
    } catch {
      tzName = 'IST';
    }
    return `${timeStr} ${tzName}`;
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.85rem 1.75rem',
      backgroundColor: 'rgba(11, 20, 38, 0.75)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left: Title or Breadcrumb */}
      <div>
        {breadcrumb && breadcrumb.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700 }}>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={16} color="#64748b" />}
                <span
                  onClick={() => crumb.pageId && onNavigate && onNavigate(crumb.pageId)}
                  style={{
                    color: idx === breadcrumb.length - 1 ? '#ffffff' : '#94a3b8',
                    cursor: crumb.pageId ? 'pointer' : 'default',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (crumb.pageId) e.currentTarget.style.color = '#38bdf8'; }}
                  onMouseLeave={(e) => { if (crumb.pageId) e.currentTarget.style.color = idx === breadcrumb.length - 1 ? '#ffffff' : '#94a3b8'; }}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
            {stationStatus && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '1px 8px',
                borderRadius: 9999,
                marginLeft: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399' }} />
                {stationStatus}
              </span>
            )}
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {title || 'Remote Mission Control'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
              {subtitle || 'Monitor • Analyze • Decide • Keep Antarctica Running'}
            </p>
          </div>
        )}
        {subtitle && breadcrumb && (
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Operational Status, Clock & Operator Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 10px #10b981',
            display: 'inline-block'
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>System Online</span>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div
            id="system-live-date"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#f8fafc',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{formatDate(currentSystemTime)}</span>
          </div>
          <div
            id="system-live-clock"
            style={{
              fontSize: '0.74rem',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
                display: 'inline-block'
              }}
            />
            <span>{formatTime(currentSystemTime)}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.35rem 0.75rem',
          borderRadius: 8,
          cursor: 'pointer'
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <User size={16} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Mission Operator</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>NCPOR / MoES</div>
          </div>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>
    </header>
  );
};
