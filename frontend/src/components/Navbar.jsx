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

          {/* Mobile hamburger toggle */}
          <button
            className="show-on-mobile btn-ghost"
            style={{ padding: '8px', minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={22} color="var(--primary)" /> : <Menu size={22} color="var(--text-main)" />}
          </button>
        </div>
      </div>

      {/* Mobile nav tabs for dashboard (visible on mobile when user has evaluation loaded) */}
      {hasData && currentView === 'app' && (
        <div className="show-on-mobile" style={{
          width: '100%',
          overflowX: 'auto',
          padding: '6px 10px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'none',
          alignItems: 'center',
          gap: 6,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
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
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  background: isActive ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 4px var(--primary-glow)' : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minHeight: 34
                }}
              >
                <Icon size={14} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-nav-drawer">
            {/* User Profile Card (if logged in) */}
            {currentUser ? (
              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--gradient-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.82rem', fontWeight: 800
                  }}>
                    {(currentUser.name || currentUser.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {currentUser.name || 'Member'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <div className="glow-dot" style={{
                  background: groqStatus?.groq_active ? 'var(--emerald)' : 'var(--amber)',
                }} title={groqStatus?.groq_active ? 'AI Engine Active' : 'Fallback Engine'} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                  className="btn-brand"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Navigation Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                className="mobile-nav-link"
                onClick={() => { setMobileMenuOpen(false); onNavigate('landing'); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Home size={17} color="var(--primary)" />
                  <span>Home</span>
                </div>
              </div>

              <div
                className="mobile-nav-link"
                onClick={() => { setMobileMenuOpen(false); onNavigate('app'); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Layers size={17} color="var(--primary)" />
                  <span>{hasData ? 'Active Dashboard' : 'Candidate Evaluator'}</span>
                </div>
                {hasData && <span className="badge badge-emerald" style={{ fontSize: '0.64rem' }}>Ready</span>}
              </div>

              {currentUser && (
                <div
                  className="mobile-nav-link"
                  onClick={() => { setMobileMenuOpen(false); onOpenHistory(); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <History size={17} color="var(--indigo)" />
                    <span>Audit History</span>
                  </div>
                </div>
              )}

              {hasData && currentView === 'app' && (
                <div
                  className="mobile-nav-link"
                  onClick={() => { setMobileMenuOpen(false); onReset(); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <RotateCcw size={17} color="var(--rose)" />
                    <span>Start New Evaluation</span>
                  </div>
                </div>
              )}

              <div
                className="mobile-nav-link"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView !== 'landing') onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={17} color="var(--amber)" />
                  <span>Features & Methodology</span>
                </div>
              </div>

              <div
                className="mobile-nav-link"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView !== 'landing') onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={17} color="var(--emerald)" />
                  <span>How It Works</span>
                </div>
              </div>
            </div>

            {/* Logout button (if logged in) */}
            {currentUser && (
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  color: 'var(--rose)',
                  background: 'var(--rose-subtle)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: '0.84rem'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            )}

            {/* Status indicator bar in drawer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div className="glow-dot" style={{
                background: groqStatus?.groq_active ? 'var(--emerald)' : 'var(--amber)'
              }} />
              <span>AI Engine: {groqStatus?.groq_active ? 'Active & High-Speed' : 'Fallback Mode'}</span>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
