import React, { useEffect, useState, useMemo } from 'react';
import { 
  Loader2, FileSearch, Code2, ShieldCheck, CheckCircle2, 
  Database, Sparkles, Terminal, Cpu, Activity, Zap, 
  FileText, Check, Award, Layers, BarChart2, ShieldAlert
} from 'lucide-react';
import DnaTechBackground from './DnaTechBackground';

const STAGES = [
  { 
    id: 1, 
    label: 'Document Ingestion & Semantic Vectorization', 
    icon: FileSearch, 
    tag: 'PDF ENGINE v3.4',
    detail: 'Extracting text layers, typography hierarchy, section weights, and raw semantic tokens',
    duration: 1800
  },
  { 
    id: 2, 
    label: 'Deep Skill & Architecture Feature Extraction', 
    icon: Code2, 
    tag: 'NLP FEATURE ENGINE',
    detail: 'Mapping core languages, frameworks, Google XYZ impact verbs, and quantified achievements',
    duration: 2600
  },
  { 
    id: 3, 
    label: '6-Vector ATS Compatibility Audit', 
    icon: ShieldCheck, 
    tag: 'ATS AUDITOR',
    detail: 'Evaluating formatting traps, keyword density, recruiter readability, and parsing robustness',
    duration: 2800
  },
  { 
    id: 4, 
    label: 'Telemetry Cross-Verification (GitHub & LeetCode)', 
    icon: Database, 
    tag: 'PROOF-OF-WORK VERIFIER',
    detail: 'Cross-referencing declared skills against live repositories, commit cadence, and DSA problem stats',
    duration: 3200
  },
  { 
    id: 5, 
    label: 'Multi-Role Match & Career Blueprint Synthesis', 
    icon: Sparkles, 
    tag: 'AI CAREER ENGINE',
    detail: 'Synthesizing personalized career roadmaps, salary benchmarks, and gap-closing action plans',
    duration: 2400
  },
];

const TELEMETRY_LOGS = [
  '[INGEST] Initializing PDF stream buffer & character bounding boxes...',
  '[PARSER] Vectorizing 3,420 document tokens across 4 semantic sections...',
  '[NLP] Extracted stack: React, TypeScript, FastAPI, PostgreSQL, Docker, Redis...',
  '[ATS_ENGINE] Evaluating document layout against 120,000+ top tech hire benchmarks...',
  '[XYZ_METRIC] Detected 5 quantified impact statements (e.g. +38% latency reduction)...',
  '[DEV_SYNC] Querying public GitHub repository graph for language cadence...',
  '[DEV_SYNC] Verifying commit frequency, repo stars, and production code complexity...',
  '[LEETCODE] Fetching DSA solve rates across Easy, Medium, and Hard problem tiers...',
  '[CROSS_VERIFY] Validating declared resume skills against commit-verified proof of work...',
  '[JD_MATCHER] Computing high-dimensional cosine embeddings for 12 target roles...',
  '[ROADMAP] Compiling 90-day prioritized skill-acquisition technical blueprints...',
  '[FINALIZING] Packaging 360° candidate intelligence dossier & Career Copilot context...'
];

const EXTRACTED_KEYWORDS = [
  'React 18', 'TypeScript', 'FastAPI', 'PostgreSQL', 
  'Docker', 'System Design', 'Redis Caching', 'CI/CD Pipelines'
];

export default function LoadingProgress({ uploadProgress = 0 }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(12);
  const [activeLogIdx, setActiveLogIdx] = useState(0);
  const [analyzedTokens, setAnalyzedTokens] = useState(540);
  const [calibratedAts, setCalibratedAts] = useState(58);
  const [activeHighlightIdx, setActiveHighlightIdx] = useState(0);

  // Progressive simulated pipeline steps
  useEffect(() => {
    const t1 = setTimeout(() => { setCurrentStage(1); setProgressPercent(32); setCalibratedAts(72); }, 1800);
    const t2 = setTimeout(() => { setCurrentStage(2); setProgressPercent(56); setCalibratedAts(84); }, 4400);
    const t3 = setTimeout(() => { setCurrentStage(3); setProgressPercent(78); setCalibratedAts(91); }, 7200);
    const t4 = setTimeout(() => { setCurrentStage(4); setProgressPercent(94); setCalibratedAts(95); }, 10400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Smoothly increment progressive tokens & percentage
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyzedTokens(prev => Math.min(prev + Math.floor(Math.random() * 48 + 16), 3840));
      setProgressPercent(prev => {
        const target = (currentStage + 1) * 20;
        if (prev < target) return Math.min(prev + 1, target);
        return prev;
      });
    }, 160);

    return () => clearInterval(interval);
  }, [currentStage]);

  // Live telemetry stream ticker
  useEffect(() => {
    const logInterval = setInterval(() => {
      setActiveLogIdx(prev => (prev + 1) % TELEMETRY_LOGS.length);
    }, 1250);

    return () => clearInterval(logInterval);
  }, []);

  // Cycle keyword highlights on the document
  useEffect(() => {
    const kwInterval = setInterval(() => {
      setActiveHighlightIdx(prev => (prev + 1) % EXTRACTED_KEYWORDS.length);
    }, 900);

    return () => clearInterval(kwInterval);
  }, []);

  const ActiveIcon = STAGES[Math.min(currentStage, STAGES.length - 1)].icon;

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 58px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px 64px',
      overflow: 'hidden'
    }}>
      {/* Live 3D Multicolor DNA Tech Background in Empty Space */}
      <DnaTechBackground opacity={0.65} diagonal={true} glow={true} />

      <div style={{
        maxWidth: 780,
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Container Card */}
        <div style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '36px 36px 32px'
      }}>
        {/* Subtle top smudged orange accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--gradient-accent)'
        }} />

        {/* ==================== HEADER & AUDIT STATUS ==================== */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-glow)',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 12
          }}>
            <span className="glow-dot" style={{ width: 7, height: 7, background: 'var(--primary)' }} />
            Executive Talent Audit Pipeline Active
          </div>

          <h2 className="font-display" style={{
            fontSize: 'clamp(1.4rem, 3.8vw, 1.95rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            marginBottom: 8
          }}>
            Analyzing Candidate Document & Signals
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            maxWidth: 580,
            margin: '0 auto',
            lineHeight: 1.55
          }}>
            Performing optical layout inspection, ATS keyword extraction, and live GitHub commit cross-validation.
          </p>
        </div>

        {/* ==================== THE RESUME DOCUMENT SCANNER SHOWPIECE ==================== */}
        <div style={{
          position: 'relative',
          maxWidth: 620,
          margin: '0 auto 28px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: '20px 24px',
          overflow: 'hidden'
        }}>
          {/* Laser Scanning Beam (Sweeps Vertically over the Resume Document) */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2.5,
            background: 'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.4) 15%, #ea580c 50%, rgba(249, 115, 22, 0.4) 85%, transparent 100%)',
            boxShadow: '0 0 18px #ea580c, 0 0 8px #f97316, 0 0 32px rgba(234, 88, 12, 0.5)',
            animation: 'scanBeam 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            zIndex: 10,
            pointerEvents: 'none'
          }} />

          {/* Laser Ambient Scan Fog / Soft Glow Trail */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 40,
            background: 'linear-gradient(180deg, rgba(234, 88, 12, 0.12) 0%, transparent 100%)',
            animation: 'scanBeam 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            zIndex: 9,
            pointerEvents: 'none'
          }} />

          {/* Top Document Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 14,
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Document Icon Avatar with warm smudged orange accent */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--primary-subtle)',
                border: '1px solid var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    CANDIDATE_RESUME.pdf
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)'
                  }}>
                    Single-Column
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  OCR Stream • Standard UTF-8 Text Layer
                </div>
              </div>
            </div>

            {/* Live Calibrating ATS Gauge Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Activity size={14} color="var(--primary)" />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                  ATS Calibration
                </div>
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {calibratedAts}%
                </div>
              </div>
            </div>
          </div>

          {/* Stylized Document Sections (Audited in real-time) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Section 1: Experience & Quantified Metrics */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6
              }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Experience & Quantified Metrics (Google XYZ)
                </span>
                <span style={{ fontSize: '0.64rem', color: 'var(--emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} strokeWidth={3} /> 5 Metrics Parsed
                </span>
              </div>

              {/* Simulated typographic lines with live highlighted impact metrics */}
              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 6, width: '38%', background: 'var(--border-medium)', borderRadius: 3 }} />
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 4,
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-glow)'
                  }}>
                    +38% Latency Reduction
                  </span>
                  <div style={{ height: 6, width: '25%', background: 'var(--border-subtle)', borderRadius: 3 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 6, width: '22%', background: 'var(--border-subtle)', borderRadius: 3 }} />
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 4,
                    background: 'rgba(5, 150, 105, 0.12)',
                    color: 'var(--emerald)',
                    border: '1px solid var(--emerald-border)'
                  }}>
                    $1.2M ARR Impact
                  </span>
                  <div style={{ height: 6, width: '45%', background: 'var(--border-medium)', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* Section 2: Real-time Extracted Skill Badges */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6
              }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Extracted Architectural & Tech Keywords
                </span>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Density: Optimal (14.2%)
                </span>
              </div>

              {/* Dynamic tag cluster */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6
              }}>
                {EXTRACTED_KEYWORDS.map((kw, i) => {
                  const isHighlighted = activeHighlightIdx === i;
                  return (
                    <span
                      key={kw}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: isHighlighted ? 800 : 600,
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: isHighlighted ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: isHighlighted ? '#ffffff' : 'var(--text-secondary)',
                        border: isHighlighted ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        boxShadow: isHighlighted ? '0 2px 8px var(--primary-glow)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {isHighlighted ? `⚡ ${kw}` : kw}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== OVERALL PIPELINE PROGRESS BAR ==================== */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: 24,
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontSize: '0.8rem'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} color="var(--primary)" />
              <span>Overall Dossier Completion</span>
            </span>
            <span style={{
              fontWeight: 800,
              color: 'var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem'
            }}>
              {progressPercent}%
            </span>
          </div>

          {/* Segmented Smudged Orange Progress Bar */}
          <div style={{
            height: 8,
            background: 'var(--bg-muted)',
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ea580c 0%, #f97316 65%, #d97706 100%)',
              borderRadius: 6,
              boxShadow: '0 0 14px var(--primary-glow)',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>

          {/* Upload Indicator if uploading */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: 8
            }}>
              <span>Network Upload Buffer:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{uploadProgress}%</span>
            </div>
          )}
        </div>

        {/* ==================== 5-STAGE PROFESSIONAL STEPPER ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = currentStage > idx;
            const isCurrent = currentStage === idx;

            return (
              <div
                key={stage.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent 
                    ? 'var(--primary-subtle)' 
                    : isDone 
                    ? 'var(--bg-surface)' 
                    : 'var(--bg-subtle)',
                  border: isCurrent 
                    ? '1.5px solid var(--primary)' 
                    : isDone 
                    ? '1px solid var(--border-medium)' 
                    : '1px solid var(--border-subtle)',
                  boxShadow: isCurrent ? '0 4px 16px var(--primary-glow)' : 'var(--shadow-xs)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Active Stage Smudged Orange Accent Bar */}
                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: 'var(--primary)',
                    boxShadow: '0 0 10px var(--primary)'
                  }} />
                )}

                {/* Status Icon */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: isDone 
                    ? 'var(--emerald-subtle)' 
                    : isCurrent 
                    ? 'var(--bg-surface)' 
                    : 'var(--bg-muted)',
                  border: isDone 
                    ? '1px solid var(--emerald-border)' 
                    : isCurrent 
                    ? '1.5px solid var(--primary)' 
                    : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDone 
                    ? 'var(--emerald)' 
                    : isCurrent 
                    ? 'var(--primary)' 
                    : 'var(--text-dim)',
                  boxShadow: isDone ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'none',
                  flexShrink: 0
                }}>
                  {isDone ? (
                    <Check size={18} strokeWidth={2.8} />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      color: isDone ? 'var(--text-main)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)'
                    }}>
                      {stage.label}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--bg-muted)',
                      color: 'var(--text-dim)',
                      letterSpacing: '0.04em'
                    }}>
                      {stage.tag}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.74rem',
                    color: isCurrent ? 'var(--text-secondary)' : 'var(--text-dim)',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {stage.detail}
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{ flexShrink: 0 }}>
                  {isDone ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.66rem', padding: '2px 8px' }}>
                      Verified ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="badge badge-orange" style={{ fontSize: '0.66rem', padding: '2px 8px' }}>
                      Auditing...
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      Queued
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== LIVE TELEMETRY TERMINAL LOGS ==================== */}
        <div style={{
          background: '#13100d',
          border: '1px solid rgba(255, 220, 180, 0.12)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: 6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#c9bcab', fontWeight: 600 }}>
              <Terminal size={12} color="var(--primary)" />
              <span>LIVE TELEMETRY STREAM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.68rem', color: '#c9bcab' }}>
              <span>Tokens: <strong style={{ color: '#ffffff' }}>{analyzedTokens.toLocaleString()}</strong></span>
              <span>•</span>
              <span style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="glow-dot" style={{ width: 5, height: 5, background: 'var(--emerald)' }} />
                180ms Latency
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '0.76rem',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 22
          }}>
            <span style={{ color: '#ea580c', fontWeight: 700 }}>❯</span>
            <span style={{ color: '#f7f2ea', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {TELEMETRY_LOGS[activeLogIdx]}
            </span>
            <span style={{
              display: 'inline-block',
              width: 7,
              height: 12,
              background: '#ea580c',
              animation: 'blink-caret 0.9s infinite'
            }} />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
