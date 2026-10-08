import React, { useEffect, useState } from 'react';
import { Loader2, FileSearch, Code2, ShieldCheck, CheckCircle2, Database } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Reading PDF & Extracting Content', icon: FileSearch, detail: 'Parsing document structure, text layers, and tables' },
  { id: 2, label: 'Structured Skill & Career Extraction', icon: Code2, detail: 'Extracting technical competencies, metrics, and role history' },
  { id: 3, label: 'Auditing 6-Metric ATS Compatibility', icon: ShieldCheck, detail: 'Evaluating keyword relevance, formatting, and impact verbs' },
  { id: 4, label: 'Cross-Referencing GitHub & LeetCode Signals', icon: Database, detail: 'Validating declared claims against public repositories and problems' },
  { id: 5, label: 'Compiling Analysis & Action Plan', icon: CheckCircle2, detail: 'Generating job matches, readiness score, and roadmap' },
];

export default function LoadingProgress({ uploadProgress = 0 }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStage(1), 1200);
    const timer2 = setTimeout(() => setCurrentStage(2), 3000);
    const timer3 = setTimeout(() => setCurrentStage(3), 5500);
    const timer4 = setTimeout(() => setCurrentStage(4), 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="card-solid" style={{
      maxWidth: 640,
      margin: '40px auto',
      padding: '36px 32px',
      textAlign: 'center'
    }}>
      {/* Crisp spinner */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: 'var(--primary-subtle)',
        border: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 18px',
        color: 'var(--primary)'
      }}>
        <Loader2 size={26} className="spin-animation" />
      </div>

      <h2 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
        Evaluating Candidate Profile
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 28 }}>
        Processing resume content and cross-referencing developer signals...
      </p>

      {/* Upload progress bar if uploading */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{ marginBottom: 24, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Uploading Document...</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{uploadProgress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      {/* Steps Pipeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
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
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                background: isCurrent ? 'var(--primary-subtle)' : isDone ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                border: `1px solid ${isCurrent ? '#bfdbfe' : isDone ? 'var(--emerald-border)' : 'var(--border-subtle)'}`,
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isDone ? 'var(--emerald-subtle)' : isCurrent ? '#ffffff' : 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDone ? 'var(--emerald)' : isCurrent ? 'var(--primary)' : 'var(--text-dim)',
                border: `1px solid ${isDone ? 'var(--emerald-border)' : isCurrent ? '#bfdbfe' : 'transparent'}`
              }}>
                {isDone ? (
                  <CheckCircle2 size={18} />
                ) : isCurrent ? (
                  <Loader2 size={16} className="spin-animation" />
                ) : (
                  <Icon size={16} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: isDone ? 'var(--emerald)' : isCurrent ? 'var(--text-main)' : 'var(--text-muted)'
                }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {stage.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
