import React from 'react';
import { Layers, FileText, Code2, ShieldCheck, Briefcase, MessageSquare, Compass, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, hasData, onReset, groqStatus }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'roadmap', label: 'Action Roadmap', icon: Compass },
    { id: 'resume', label: 'Resume & ATS', icon: FileText },
    { id: 'dev', label: 'Engineering Proof', icon: Code2 },
    { id: 'verification', label: 'Cross-Verification', icon: ShieldCheck },
    { id: 'jobs', label: 'Job Matches', icon: Briefcase },
    { id: 'copilot', label: 'Career Advisor', icon: MessageSquare },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="app-header-inner">
        {/* Brand */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} 
          onClick={() => setActiveTab('overview')}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Code2 size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                CareerLens
              </span>
              <span className="badge badge-slate" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                PRO
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }} className="hide-on-mobile">
              Candidate Verification & Career Intelligence
            </div>
          </div>
        </div>

        {/* Navigation Tabs (visible when analysis data exists) */}
        {hasData && (
          <nav className="nav-scroll-container" style={{
            background: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 10,
            border: '1px solid var(--border-subtle)'
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
                    padding: '6px 12px',
                    borderRadius: 7,
                    border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={15} color={isActive ? 'var(--primary)' : 'currentColor'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasData && (
            <button
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Start New Profile Evaluation"
            >
              <RotateCcw size={14} />
              <span className="hide-on-mobile">New Audit</span>
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-subtle)',
            padding: '5px 10px',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: groqStatus?.groq_active ? 'var(--emerald)' : 'var(--amber)'
            }} />
            <span className="hide-on-mobile">
              {groqStatus?.groq_active ? 'Engine Online' : 'Local Fallback'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
