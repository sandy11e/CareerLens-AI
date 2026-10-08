import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, PlusCircle, Code, GitCommit, Sparkles, Check, ArrowRight } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

export default function CrossVerificationSection({ data }) {
  if (!data) return null;

  const crossVer = data.cross_verification || {};
  const verifiedSkills = crossVer.verified_skills || [];
  const unverifiedSkills = crossVer.unverified_skills || [];
  const omittedStrengths = crossVer.omitted_github_strengths || [];

  const totalEvaluated = verifiedSkills.length + unverifiedSkills.length || 1;
  const verifiedRatio = Math.round((verifiedSkills.length / totalEvaluated) * 100);
  const unverifiedRatio = 100 - verifiedRatio;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Trust Score Header Banner */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={20} color="var(--emerald)" />
              <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Proof of Work Cross-Verification
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Compares every declared skill on your resume against public repositories, commits, and LeetCode algorithmic solutions.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">
                {verifiedSkills.length} Verified with Code
              </span>
              <span className="badge badge-amber">
                {unverifiedSkills.length} Unverified Claims
              </span>
              {omittedStrengths.length > 0 && (
                <span className="badge badge-primary">
                  {omittedStrengths.length} Unclaimed Strengths Found
                </span>
              )}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <ScoreGauge score={crossVer.trust_score || 75} size={70} strokeWidth={6} label="" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Portfolio Trust Score
              </div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {crossVer.trust_score || 75}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Verification Confidence
              </div>
            </div>
          </div>
        </div>

        {/* Visual Trust Ratio Bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
            <span>Verification Proof Ratio</span>
            <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>
              {verifiedRatio}% Verified by Code Evidence • {unverifiedRatio}% Unverified Claims
            </span>
          </div>

          <div className="visual-segmented-bar" style={{ height: 10 }}>
            <div style={{ width: `${verifiedRatio}%`, background: 'var(--emerald)' }} title={`Verified: ${verifiedRatio}%`} />
            <div style={{ width: `${unverifiedRatio}%`, background: 'var(--amber)' }} title={`Unverified: ${unverifiedRatio}%`} />
          </div>
        </div>
      </div>

      {/* Discovery Alert: Skills on GitHub but NOT on Resume */}
      {omittedStrengths.length > 0 && (
        <div className="card-solid" style={{
          padding: '18px 22px',
          background: 'var(--primary-subtle)',
          border: '1px solid var(--border-medium)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <PlusCircle size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: 2 }}>
                Unclaimed Strengths Detected in Public Code
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                The following technologies were detected in your active GitHub repositories but are <strong>not listed on your resume</strong>. Adding them can expand your job opportunities:
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {omittedStrengths.map((str, idx) => (
                  <span key={idx} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--primary)',
                    padding: '3px 10px',
                    borderRadius: 16,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    + Add {str} to Resume
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Grid Cards: Verified vs Unverified */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Verified Claims Card */}
        <div className="card-solid" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle2 size={18} color="var(--emerald)" />
            <div>
              <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Verified Claims ({verifiedSkills.length})
              </h4>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Authenticated against public repositories and code commits
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {verifiedSkills.map((item, idx) => (
              <div key={idx} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--emerald-border)',
                borderRadius: 10,
                padding: '12px 14px',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      {item.skill}
                    </span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.64rem' }}>
                    {item.proof_type || 'Verified Code'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, paddingLeft: 14 }}>
                  {item.evidence}
                </div>
              </div>
            ))}

            {verifiedSkills.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No direct code verification found. Connect your GitHub or LeetCode username to authenticate resume claims.
              </div>
            )}
          </div>
        </div>

        {/* Unverified Claims Card */}
        <div className="card-solid" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertCircle size={18} color="var(--amber)" />
            <div>
              <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Unverified Claims ({unverifiedSkills.length})
              </h4>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Skills listed on resume without matching public code
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unverifiedSkills.map((item, idx) => (
              <div key={idx} style={{
                background: 'var(--amber-subtle)',
                border: '1px solid var(--amber-border)',
                borderRadius: 10,
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.86rem' }}>
                    {item.skill}
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '0.62rem' }}>
                    Unverified
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  💡 Authenticate by creating a public GitHub repository or pushing sample tests showcasing {item.skill}.
                </div>
              </div>
            ))}

            {unverifiedSkills.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--emerald)', fontSize: '0.82rem', fontWeight: 600 }}>
                All major claimed skills have public proof of work!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

