import React from 'react';
import { 
  Layers, FileText, Code2, ShieldCheck, Briefcase, 
  MessageSquare, Compass, RotateCcw, User, LogOut, 
  Home, History, Menu, X, Sparkles, Sun, Moon,
  PanelLeftClose, PanelLeft, ChevronRight
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
  groqStatus,
  theme,
  toggleTheme,
  sidebarOpen,
  onToggleSidebar
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

  const activeTabObj = tabs.find(t => t.id === activeTab);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all 0.3s ease',
    }}>
      <div className="app-header-inner">
        {/* Left Side: Toggle + Brand + Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasData && currentView === 'app' && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="btn-ghost"
              style={{ padding: 6 }}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
          )}

          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} 
            onClick={() => onNavigate('landing')}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Sparkles size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                  Devlyzer AI
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Breadcrumb in Command Center mode */}
          {hasData && currentView === 'app' && (
            <div className="hide-on-mobile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginLeft: 8,
              paddingLeft: 12,
              borderLeft: '1px solid var(--border-subtle)'
            }}>
              <span>Command Center</span>
              <ChevronRight size={13} style={{ opacity: 0.4 }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                {activeTabObj?.label || 'Dashboard'}
              </span>
            </div>
          )}
        </div>

        {/* Landing Page Nav (when not in dashboard) */}
        {(!hasData || currentView !== 'app') && (
          <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
             
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
                <span>{hasData ? 'Command Center' : 'Evaluator'}</span>
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

          {/* Theme Toggle Button (Desktop & Mobile) */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            style={{
              padding: '6px 8px',
              borderRadius: 9,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 34,
              minWidth: 34,
              transition: 'all 0.2s ease',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun size={16} color="#fbbf24" />
            ) : (
              <Moon size={16} color="var(--primary)" />
            )}
          </button>

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
          background: 'var(--bg-glass)',
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

              {/* Theme Switcher in Mobile Drawer */}
              <div
                className="mobile-nav-link"
                onClick={() => toggleTheme()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="var(--primary)" />}
                  <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                </div>
                <span className="badge badge-slate" style={{ fontSize: '0.66rem' }}>
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
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
