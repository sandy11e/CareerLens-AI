import React, { useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, Code2, FileText, Briefcase, 
  Sparkles, CheckCircle2, ChevronRight, BarChart3, Award,
  Terminal, Zap, Compass, Users, Lock, Star, ExternalLink, Check
} from 'lucide-react';
import { GithubIcon, LeetCodeIcon } from './Icons';
import HeroUpload from './HeroUpload';

export default function LandingPage({ 
  onAnalyze, 
  isLoading, 
  onOpenAuth, 
  hasData, 
  onViewDashboard 
}) {
  const evaluatorRef = useRef(null);

  const scrollToEvaluator = () => {
    evaluatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: FileText,
      color: 'var(--primary)',
      title: 'ATS Resume Audit & Extraction',
      description: 'Multi-dimensional 6-metric ATS analysis checking layout compliance, impact quantification, action verbs, and verified certification extraction.'
    },
    {
      icon: GithubIcon,
      color: 'var(--indigo)',
      title: 'Live GitHub Engineering Proof',
      description: 'Connect your GitHub handle to evaluate code quality, repository architecture, commit velocity, star recognition, and multi-language proficiency.'
    },
    {
      icon: LeetCodeIcon,
      color: 'var(--amber)',
      title: 'LeetCode Problem-Solving Signal',
      description: 'Accurate analysis of your algorithmic problem-solving track record across Easy, Medium, and Hard tiers, computing a holistic DSA readiness index.'
    },
    {
      icon: Briefcase,
      color: 'var(--emerald)',
      title: 'Precision Custom JD Matcher',
      description: 'Paste any target job description or upload a company JD PDF. Receive instant match percentages, identified skill gaps, and interview prep questions.'
    },
    {
      icon: ShieldCheck,
      color: '#ec4899',
      title: 'Cross-Verification Trust Score',
      description: 'Evidence engine that automatically cross-checks resume claims against real GitHub repositories and commits to establish verified engineering credibility.'
    },
    {
      icon: Compass,
      color: 'var(--sky)',
      title: 'Adaptive Growth Roadmap',
      description: 'Dynamic 30-60-90 day personalized roadmap bridging identified skill gaps with curated learning tasks, interview targets, and portfolio projects.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload & Connect',
      desc: 'Upload your PDF resume and input your GitHub and LeetCode handles. No target role required upfront.'
    },
    {
      num: '02',
      title: 'Multi-Signal AI Audit',
      desc: 'Our pipeline extracts skills, evaluates ATS compliance, queries live dev APIs, and cross-verifies claims.'
    },
    {
      num: '03',
      title: 'Unlock Career Intelligence',
      desc: 'Explore your 360° dashboard, match custom job descriptions, and chat with your dedicated AI Career Copilot.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64, paddingBottom: 60 }}>
      {/* Active Evaluation Banner if hasData */}
      {hasData && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderRadius: 14,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald)'
            }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                Active Evaluation Report Loaded
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Your 360° candidate report, ATS breakdown, code verification, and custom JD matches are ready.
              </div>
            </div>
          </div>
          <button
            onClick={onViewDashboard}
            className="btn-primary"
            style={{ padding: '9px 20px', fontSize: '0.86rem' }}
          >
            <span>View Results Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '48px 24px 24px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          maxWidth: 800,
          height: 350,
          background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 80%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Top Announcement Pill */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          padding: '6px 16px',
          borderRadius: 24,
          fontSize: '0.82rem',
          color: 'var(--primary)',
          fontWeight: 600,
          marginBottom: 24,
          backdropFilter: 'blur(8px)'
        }}>
          <Sparkles size={14} color="var(--primary)" />
          <span>Next-Gen 360° Developer Evaluation Platform</span>
          <span style={{ color: 'var(--border-medium)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>Resume + GitHub + LeetCode</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display" style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: 'var(--text-main)',
          maxWidth: 920,
          letterSpacing: '-0.03em',
          marginBottom: 20
        }}>
          Prove Your Engineering Power Beyond the Static Resume.
        </h1>

        {/* Subtitle */}
        <p style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(1rem, 2vw, 1.22rem)',
          color: 'var(--text-secondary)',
          maxWidth: 720,
          lineHeight: 1.6,
          marginBottom: 36
        }}>
          Traditional ATS scanners only match keywords. CareerLens AI audits your resume compliance, 
          validates your real GitHub code architecture, evaluates LeetCode problem-solving, and matches any custom Job Description.
        </p>

        {/* Hero CTAs */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 48
        }}>
          <button
            onClick={scrollToEvaluator}
            className="btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)'
            }}
          >
            <span>Start Free Profile Audit</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onOpenAuth('register')}
            className="btn-secondary"
            style={{
              padding: '14px 28px',
              fontSize: '0.96rem',
              fontWeight: 600
            }}
          >
            <span>Create Free Account</span>
          </button>
        </div>

        {/* Trust & Signal Badges */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="var(--emerald)" />
            <span>Zero Target Role Needed Upfront</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="var(--emerald)" />
            <span>PDF Resume & Custom JD Parser</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="var(--emerald)" />
            <span>AI Career Copilot Advisor</span>
          </div>
        </div>

        {/* Interactive Preview Cards Grid */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1040,
          marginTop: 48,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 18
        }}>
          {/* Card 1: Resume */}
          <div className="card-solid" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="badge badge-blue">Resume Audit</span>
              <FileText size={18} color="var(--primary)" />
            </div>
            <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              88/100
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              6-Metric ATS Score • Extracted Certifications
            </div>
          </div>

          {/* Card 2: GitHub */}
          <div className="card-solid" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="badge badge-indigo">Code Signals</span>
              <GithubIcon size={18} />
            </div>
            <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              92/100
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Architecture Depth • Commit Velocity Verified
            </div>
          </div>

          {/* Card 3: LeetCode */}
          <div className="card-solid" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="badge badge-amber">Algorithmic DSA</span>
              <LeetCodeIcon size={18} />
            </div>
            <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Ready Tier
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Balanced Easy/Medium/Hard Problem Ratio
            </div>
          </div>

          {/* Card 4: JD Match */}
          <div className="card-solid" style={{ padding: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="badge badge-emerald">JD Matcher</span>
              <Briefcase size={18} color="var(--emerald)" />
            </div>
            <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              94% Fit
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Custom PDF / Text Matcher with Gaps
            </div>
          </div>
        </div>
      </section>

      {/* CORE INTEGRATION: EMBEDDED EVALUATOR PORTAL */}
      <section 
        id="evaluator-portal" 
        ref={evaluatorRef} 
        style={{ 
          maxWidth: 820, 
          margin: '0 auto', 
          width: '100%', 
          padding: '0 20px',
          scrollMarginTop: 90
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className="badge badge-blue" style={{ fontSize: '0.8rem', marginBottom: 10 }}>
            Unified Evaluation Portal
          </span>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Audit Your Profile Now
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Upload your resume and enter your developer handles to generate your holistic 360° evaluation.
          </p>
        </div>

        {/* Embedded Upload Component */}
        <HeroUpload onAnalyze={onAnalyze} isLoading={isLoading} />
      </section>

      {/* Core Capabilities Grid */}
      <section id="features" style={{ maxWidth: 1120, margin: '0 auto', width: '100%', padding: '0 20px', scrollMarginTop: 90 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span className="badge badge-slate" style={{ fontSize: '0.78rem', marginBottom: 12 }}>
            Complete 360° Developer Intelligence
          </span>
          <h2 className="font-display" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Engineered For Modern Software Engineers
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: 600, margin: '8px auto 0 auto' }}>
            Everything you need to audit your application materials, uncover skill gaps, and land interviews with confidence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 22
        }}>
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="card-solid"
                style={{ 
                  padding: '28px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Icon size={22} color={item.color} />
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" style={{
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '64px 20px',
        scrollMarginTop: 90
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-blue" style={{ fontSize: '0.78rem', marginBottom: 12 }}>
            Fast & Deterministic Pipeline
          </span>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 40 }}>
            How CareerLens Evaluates Your Profile in Seconds
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            textAlign: 'left'
          }}>
            {steps.map((st, i) => (
              <div key={i} className="card-solid" style={{ padding: '26px 24px' }}>
                <div className="font-display" style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  opacity: 0.85,
                  marginBottom: 12
                }}>
                  {st.num}
                </div>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                  {st.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: Traditional ATS vs CareerLens */}
      <section style={{ maxWidth: 940, margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div className="card-solid" style={{ padding: '36px 32px' }}>
          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 20, textAlign: 'center' }}>
            Why Single-Signal Evaluation Fails Modern Hiring
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontWeight: 700, color: '#c53030', fontSize: '0.92rem', marginBottom: 10 }}>
                Traditional ATS Scanners
              </div>
              <ul style={{ paddingLeft: 18, fontSize: '0.82rem', color: '#742a2a', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Only search for raw keyword repetitions in plain text</li>
                <li>Cannot verify if you actually built the projects listed</li>
                <li>Completely ignores your code quality and Git commit history</li>
                <li>No algorithmic verification or live problem-solving context</li>
              </ul>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.92rem', marginBottom: 10 }}>
                CareerLens AI Multi-Signal Engine
              </div>
              <ul style={{ paddingLeft: 18, fontSize: '0.82rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Multi-dimensional parsing across layout, metrics, and certs</li>
                <li>Inspects real repository architecture and commit consistency</li>
                <li>Cross-verifies claims to produce a Portfolio Trust Score</li>
                <li>Custom JD matcher with gap remediation & tailored roadmap</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--text-main) 0%, #1e293b 100%)',
          borderRadius: 20,
          padding: '44px 36px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Ready To Evaluate Your Developer Profile?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)', maxWidth: 600, lineHeight: 1.6, marginBottom: 28 }}>
            Join software engineers using CareerLens AI to audit their resumes, benchmark GitHub repositories, and prepare for interviews.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={scrollToEvaluator}
              className="btn-primary"
              style={{
                background: '#ffffff',
                color: 'var(--text-main)',
                padding: '13px 30px',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <span>Audit Profile Now</span>
              <ArrowRight size={17} color="var(--text-main)" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '13px 26px',
                borderRadius: 9,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>Sign In to Account</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
