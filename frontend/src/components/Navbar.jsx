import React from 'react';
import { 
  Layers, FileText, Code2, ShieldCheck, Briefcase, 
  MessageSquare, Compass, RotateCcw, User, LogOut, 
  Home, History, Menu, X, Sparkles
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  onNavigate, 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onOpenHistory,
  activeTab, 
  setActiveTab, 
  hasData, 
  onReset, 
  groqStatus 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'resume', label: 'Resume & ATS', icon: FileText },
    { id: 'dev', label: 'Engineering', icon: Code2 },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'jobs', label: 'Job Matches', icon: Briefcase },
    { id: 'copilot', label: 'AI Advisor', icon: MessageSquare },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(250, 251, 253, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all 0.3s ease',
    }}>
      <div className="app-header-inner">
        {/* Brand */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} 
          onClick={() => onNavigate('landing')}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px var(--primary-glow)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(-8deg) scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
          >
            <Sparkles size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                CareerLens
              </span>
              <span className="badge badge-gradient" style={{ fontSize: '0.62rem', padding: '1px 8px' }}>
                AI
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.01em' }} className="hide-on-mobile">
              Candidate Intelligence Platform
            </div>
          </div>
        </div>

        {/* Dashboard Tabs (when in Application Dashboard with data) */}
        {hasData && currentView === 'app' && (
          <nav className="nav-scroll-container hide-on-mobile" style={{
            background: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 12,
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => onNavigate('landing')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 9,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-dim)',
                fontWeight: 500,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Home size={13} />
            </button>

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 9,
                    border: 'none',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                >
                  <Icon size={14} color={isActive ? 'var(--primary)' : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Landing Page Nav */}
        {(!hasData || currentView !== 'app') && (
          <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[
              { label: 'Home', view: 'landing' },
              { label: 'Features', scroll: 'features' },
              { label: 'How It Works', scroll: 'how-it-works' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.scroll) {
                    if (currentView !== 'landing') onNavigate('landing');
                    setTimeout(() => {
                      document.getElementById(item.scroll)?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    onNavigate(item.view);
                  }
                }}
                className="btn-ghost"
                style={{
                  fontWeight: currentView === item.view ? 700 : 500,
                  color: currentView === item.view ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                }}
              >
                {item.label}
              </button>
            ))}

            {currentUser && (
              <button
                onClick={() => onNavigate('app')}
                className="btn-ghost"
                style={{
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  gap: 5,
                }}
              >
                <Layers size={14} />
                <span>{hasData ? 'Dashboard' : 'Evaluator'}</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* New Audit */}
          {hasData && currentView === 'app' && (
            <button
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              title="Start New Evaluation"
            >
              <RotateCcw size={13} />
              <span className="hide-on-mobile">New Audit</span>
            </button>
          )}

          {/* Engine status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
          }}>
            <div className="glow-dot" style={{
              background: groqStatus?.groq_active ? 'var(--emerald)' : 'var(--amber)',
            }} />
            <span className="hide-on-mobile" style={{ fontWeight: 500 }}>
              {groqStatus?.groq_active ? 'AI Active' : 'Fallback'}
            </span>
          </div>

          {/* Auth & History */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={onOpenHistory}
                className="btn-ghost"
                style={{ padding: '5px 8px', fontSize: '0.78rem', gap: 5 }}
                title="View Audit History"
              >
                <History size={14} color="var(--primary)" />
                <span className="hide-on-mobile">History</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-main)'
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'var(--gradient-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.65rem', fontWeight: 800
                }}>
                  {(currentUser.name || currentUser.email || '?')[0].toUpperCase()}
                </div>
                <span className="hide-on-mobile">{currentUser.name || currentUser.email}</span>
              </div>

              <button
                onClick={onLogout}
                className="btn-ghost"
                style={{ padding: '5px 8px', color: 'var(--text-dim)' }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-ghost"
                style={{ fontSize: '0.84rem', fontWeight: 600 }}
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn-brand hide-on-mobile"
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn-ghost"
            style={{ display: 'none', padding: 6 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav tabs for dashboard */}
      {hasData && currentView === 'app' && (
        <div className="nav-scroll-container" style={{
          display: 'none',
          padding: '4px 8px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={13} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .app-header-inner > nav.hide-on-mobile + div button[style*="display: none"] {
            display: flex !important;
          }
          header > div:last-child {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
