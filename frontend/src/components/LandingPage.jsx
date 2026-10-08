import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, Code2, FileText, Briefcase, 
  Sparkles, CheckCircle2, BarChart3, Award,
  Zap, Compass, Lock, Star, Terminal
} from 'lucide-react';
import { GithubIcon, LeetCodeIcon } from './Icons';

export default function LandingPage({ 
  onStartAudit, 
  onOpenAuth, 
  hasData, 
  onViewDashboard,
  currentUser 
}) {
  const features = [
    {
      icon: FileText, color: 'var(--primary)',
      title: 'ATS Resume Audit',
      description: 'Multi-dimensional 6-metric ATS analysis checking layout compliance, impact quantification, action verbs, and verified certification extraction.',
      gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
    },
    {
      icon: GithubIcon, color: 'var(--violet)',
      title: 'Live GitHub Engineering Proof',
      description: 'Evaluate code quality, repository architecture, commit velocity, star recognition, and multi-language proficiency from your GitHub handle.',
      gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)'
    },
    {
      icon: LeetCodeIcon, color: 'var(--amber)',
      title: 'LeetCode Problem-Solving',
      description: 'Analysis of your algorithmic track record across Easy, Medium, and Hard tiers with a holistic DSA readiness index.',
      gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)'
    },
    {
      icon: Briefcase, color: 'var(--emerald)',
      title: 'Custom JD Matcher',
      description: 'Paste any job description or upload a PDF. Get instant match percentages, identified skill gaps, and interview prep questions.',
      gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
    },
    {
      icon: ShieldCheck, color: 'var(--rose)',
      title: 'Cross-Verification Engine',
      description: 'Automatically cross-checks resume claims against real GitHub repositories and commits to establish verified engineering credibility.',
      gradient: 'linear-gradient(135deg, #fff1f2, #ffe4e6)'
    },
    {
      icon: Compass, color: 'var(--sky)',
      title: 'Adaptive Growth Roadmap',
      description: 'Dynamic 30-60-90 day personalized roadmap bridging skill gaps with curated learning tasks, interview targets, and portfolio projects.',
      gradient: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)'
    }
  ];

  const steps = [
    { num: '01', title: 'Create Account & Sign In', desc: 'Register securely to create a personal workspace backed by your evaluation history.', icon: Lock },
    { num: '02', title: 'Upload Resume & Handles', desc: 'Upload your PDF resume and connect your GitHub and LeetCode handles for 360° analysis.', icon: Terminal },
    { num: '03', title: 'Unlock 360° Intelligence', desc: 'Access your ATS audit, verified code proof, custom JD results, and conversational AI Career Copilot.', icon: Sparkles },
  ];

  const stats = [
    { label: 'Signals Analyzed', value: '6+', icon: BarChart3 },
    { label: 'Cross-Verified Claims', value: '100%', icon: ShieldCheck },
    { label: 'AI-Powered Insights', value: '360°', icon: Sparkles },
    { label: 'Cert Extraction', value: 'Auto', icon: Award },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 80, paddingBottom: 60 }}>

      {/* Active evaluation banner */}
      {hasData && (
        <div className="animate-fade-in-down" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 14,
          padding: '14px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginTop: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="glow-dot" style={{ background: 'var(--emerald)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Active Report Ready</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your 360° candidate report is loaded.</div>
            </div>
          </div>
          <button onClick={onViewDashboard} className="btn-brand" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
            <span>View Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ========== HERO SECTION ========== */}
      <section style={{
        position: 'relative',
        padding: 'clamp(36px, 6vw, 72px) clamp(14px, 4vw, 24px) 36px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Ambient orbs */}
        <div className="ambient-orb" style={{
          width: 500, height: 500, top: -120, left: '20%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
        }} />
        <div className="ambient-orb" style={{
          width: 400, height: 400, top: -60, right: '15%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          animationDelay: '3s',
        }} />
        <div className="ambient-orb" style={{
          width: 300, height: 300, bottom: -80, left: '10%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
          animationDelay: '1.5s',
        }} />

        {/* Announcement pill */}
        <div className="animate-fade-in-down" style={{
          position: 'relative', zIndex: 1,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '6px 16px', borderRadius: 24,
          fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600,
          marginBottom: 24, backdropFilter: 'blur(8px)',
          maxWidth: '100%',
          textAlign: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Sparkles size={14} />
          <span>360° Developer Profile Evaluation</span>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>Resume + GitHub + LeetCode</span>
        </div>

        {/* Main headline */}
        <h1 className="font-display animate-fade-in-up" style={{
          position: 'relative', zIndex: 1,
          fontSize: 'clamp(1.9rem, 5.5vw, 3.8rem)',
          fontWeight: 900, lineHeight: 1.15,
          color: 'var(--text-main)',
          maxWidth: 880, letterSpacing: '-0.035em',
          marginBottom: 18,
        }}>
          Prove Your Engineering
          <br />
          <span className="gradient-text">Power Beyond The Resume</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200" style={{
          position: 'relative', zIndex: 1,
          fontSize: 'clamp(0.92rem, 2vw, 1.12rem)',
          color: 'var(--text-muted)', maxWidth: 640,
          lineHeight: 1.6, marginBottom: 36,
        }}>
          Traditional ATS scanners only match keywords. CareerLens AI audits your resume compliance,
          validates real GitHub code, evaluates LeetCode performance, and matches any custom Job Description.
        </p>

        {/* Hero CTAs */}
        <div className="animate-fade-in-up delay-300" style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 12,
          flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 40,
          width: '100%',
          maxWidth: 440
        }}>
          <button
            onClick={onStartAudit}
            className="btn-brand"
            style={{
              padding: '14px 32px', fontSize: '1rem', fontWeight: 700,
              boxShadow: '0 8px 24px var(--primary-glow)',
              borderRadius: 'var(--radius-lg)',
              flex: '1 1 200px',
              minHeight: 48
            }}
          >
            <span>{currentUser ? 'Go to Evaluator' : 'Get Started Free'}</span>
            <ArrowRight size={18} />
          </button>

          {!currentUser && (
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-secondary"
              style={{
                padding: '14px 28px', fontSize: '0.94rem', fontWeight: 600,
                borderRadius: 'var(--radius-lg)',
                flex: '1 1 140px',
                minHeight: 48,
                justifyContent: 'center'
              }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Trust signals */}
        <div className="animate-fade-in-up delay-400" style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 20,
          flexWrap: 'wrap', justifyContent: 'center',
          fontSize: '0.8rem', color: 'var(--text-muted)',
        }}>
          {['Authenticated Workspace', 'PDF Resume & JD Parser', 'AI Career Copilot'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="var(--emerald)" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Preview stats cards */}
        <div className="animate-fade-in-up delay-500" style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 860,
          marginTop: 44,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card-solid interactive-card" style={{
                padding: '16px 14px', textAlign: 'center',
                animationDelay: `${0.5 + i * 0.1}s`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--primary-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                }}>
                  <Icon size={17} color="var(--primary)" />
                </div>
                <div className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" style={{ maxWidth: 1120, margin: '0 auto', width: '100%', padding: '0 16px', scrollMarginTop: 90 }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="badge badge-gradient" style={{ fontSize: '0.76rem', marginBottom: 12, display: 'inline-flex' }}>
            <Zap size={12} />
            Complete 360° Intelligence
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Engineered For Modern Engineers
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 560, margin: '10px auto 0' }}>
            Everything you need to audit your application materials, uncover skill gaps, and prepare for interviews.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="card-solid interactive-card animate-fade-in-up"
                style={{ 
                  padding: '24px 20px',
                  animationDelay: `${idx * 0.08}s`,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: item.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                  transition: 'transform 0.3s ease',
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" style={{
        background: 'var(--gradient-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: 'clamp(44px, 7vw, 72px) clamp(16px, 4vw, 20px)',
        scrollMarginTop: 90,
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-indigo" style={{ fontSize: '0.76rem', marginBottom: 12, display: 'inline-flex' }}>
            <Lock size={11} />
            Secure Workflow
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 40, letterSpacing: '-0.02em' }}>
            How CareerLens Evaluates Your Profile
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16, textAlign: 'left',
          }}>
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="card-solid animate-fade-in-up" style={{ padding: '24px 20px', animationDelay: `${i * 0.12}s` }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'var(--gradient-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 800, fontSize: '0.88rem',
                      boxShadow: '0 4px 12px var(--primary-glow)',
                    }}>
                      {st.num}
                    </div>
                    <div>
                      <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {st.title}
                      </h3>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== COMPARISON SECTION ========== */}
      <section style={{ maxWidth: 940, margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div className="card-solid" style={{ padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)', overflow: 'visible' }}>
          <h3 className="font-display" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.35rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 20, textAlign: 'center' }}>
            Why Single-Signal Evaluation Fails Modern Hiring
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div className="animate-slide-left" style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '1px solid #fecdd3', borderRadius: 14, padding: '20px 18px' }}>
              <div style={{ fontWeight: 700, color: 'var(--rose)', fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.1rem' }}>✕</span> Traditional ATS Scanners
              </div>
              <ul style={{ paddingLeft: 16, fontSize: '0.82rem', color: '#9f1239', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Only search for raw keyword repetitions</li>
                <li>Cannot verify if you actually built projects</li>
                <li>Ignores code quality and commit history</li>
                <li>No algorithmic or problem-solving context</li>
              </ul>
            </div>

            <div className="animate-slide-right" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0', borderRadius: 14, padding: '20px 18px' }}>
              <div style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.1rem' }}>✓</span> CareerLens Multi-Signal Engine
              </div>
              <ul style={{ paddingLeft: 16, fontSize: '0.82rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Multi-dimensional parsing: layout, metrics, certs</li>
                <li>Inspects real repository architecture & commits</li>
                <li>Cross-verifies claims for Portfolio Trust Score</li>
                <li>Custom JD matcher with gap remediation & roadmap</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '0 16px' }}>
        <div style={{
          background: 'var(--gradient-accent)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 6s ease infinite',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(36px, 6vw, 56px) clamp(20px, 5vw, 40px)',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 16px 48px var(--primary-glow)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle decorative circles */}
          <div style={{
            position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', top: -40, right: -40,
          }} />
          <div style={{
            position: 'absolute', width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', bottom: -20, left: 40,
          }} />

          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Star size={24} />
          </div>

          <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
            Ready To Evaluate Your Profile?
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.85)', maxWidth: 540, lineHeight: 1.6, marginBottom: 28, position: 'relative', zIndex: 1 }}>
            Create an account to benchmark your resume, audit your GitHub repos, and prepare for your dream role.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <button
              onClick={onStartAudit}
              style={{
                background: '#ffffff', color: 'var(--primary-deep)',
                padding: '14px 32px', borderRadius: 'var(--radius-lg)', fontSize: '0.95rem',
                fontWeight: 700, border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
            >
              <span>{currentUser ? 'Launch Evaluator' : 'Get Started Free'}</span>
              <ArrowRight size={17} />
            </button>

            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff', padding: '14px 28px', borderRadius: 'var(--radius-lg)',
                  fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
