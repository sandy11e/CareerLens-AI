import React from 'react';
import { 
  ArrowRight, ShieldCheck, Sparkles, LogIn, CheckCircle2, Target
} from 'lucide-react';
import { GithubIcon, LeetCodeIcon } from './Icons';
import DnaTechBackground from './DnaTechBackground';

export default function LandingPage({ 
  onStartAudit, 
  onOpenAuth, 
  hasData, 
  onViewDashboard,
  currentUser 
}) {
  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 58px)',
      maxHeight: 'calc(100vh - 58px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 24px'
    }}>
      {/* Live 3D Multicolor DNA Tech Background Animation */}
      <DnaTechBackground opacity={0.88} diagonal={true} glow={true} />

      {/* Main Minimal Content Wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 860,
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        padding: '20px 0'
      }}>
        {/* Active Session Notification Pill (if evaluation already loaded) */}
        {hasData ? (
          <div
            onClick={onViewDashboard}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 16px',
              borderRadius: 30,
              background: 'var(--card-bg)',
              border: '1px solid var(--emerald-border)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Active Evaluation Loaded
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Resume Dashboard <ArrowRight size={13} />
            </span>
          </div>
        ) : (
          /* Subtle Brand Badge */
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-medium)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--primary)',
            letterSpacing: '0.01em',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}>
            <Sparkles size={13} />
            <span>Devlyzer AI</span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>Candidate Intelligence & Verification</span>
          </div>
        )}

        {/* Hero Title */}
        <h1 className="font-display" style={{
          fontSize: 'clamp(2.4rem, 5.8vw, 4.4rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.035em',
          color: 'var(--text-main)',
          margin: 0,
          textShadow: '0 2px 20px rgba(0,0,0,0.06)'
        }}>
          Prove Technical Power.
          <br />
          <span style={{
            color: 'var(--primary)',
            fontWeight: 800
          }}>
            Beyond The Resume.
          </span>
        </h1>

        {/* Minimal Subtitle */}
        <p style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: 620,
          margin: 0,
          textShadow: '0 1px 10px rgba(0,0,0,0.04)'
        }}>
          Multi-dimensional 360° candidate intelligence. Audit ATS compliance, authenticate live GitHub code quality, analyze LeetCode signals, and match custom Job Descriptions.
        </p>

        {/* Minimal CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 6
        }}>
          {hasData ? (
            <button
              onClick={onViewDashboard}
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '0.94rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <span>View Active Report</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onStartAudit}
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: '0.94rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <span>Start Evaluation</span>
              <ArrowRight size={16} />
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-secondary"
              style={{
                padding: '12px 22px',
                fontSize: '0.92rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Minimal Feature Highlights Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginTop: 18,
          paddingTop: 18,
          borderTop: '1px solid var(--border-subtle)',
          width: '100%',
          maxWidth: 720
        }}>
          {[
            { label: 'ATS Compliance 2.0', icon: ShieldCheck },
            { label: 'GitHub Code Proof', icon: GithubIcon },
            { label: 'LeetCode Signals', icon: LeetCodeIcon },
            { label: 'Custom JD Matcher', icon: Target },
            { label: 'AI Career Copilot', icon: Sparkles }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-xs)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <Icon size={12} color="var(--primary)" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Whisper-quiet trust footer */}
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 2
        }}>
          <CheckCircle2 size={12} color="var(--emerald)" />
          <span>MongoDB Atlas Persistent Audits • Groq AI Accelerated • Privacy First</span>
        </div>
      </div>
    </div>
  );
}
