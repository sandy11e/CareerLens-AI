import React from 'react';
import { Layers, ShieldCheck, FileText, Code2, Briefcase, ExternalLink, MapPin, Mail, Compass, ArrowRight, ArrowUpRight, Target, Award, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import ScoreGauge from './ScoreGauge';
import RadarReadinessChart from './charts/RadarReadinessChart';

export default function OverviewSection({ data, setActiveTab }) {
  if (!data) return null;

  const candidate = data.candidate_info || {};
  const scores = data.scores || {};
  const devReadiness = data.developer_readiness || {};
  const crossVer = data.cross_verification || {};
  const topJob = data.job_matches?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Candidate Profile Header Card */}
      <div className="card-solid" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar */}
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 'var(--radius-md)',
              background: data.github_signals?.avatar_url
                ? `url(${data.github_signals.avatar_url}) center/cover`
                : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-medium)',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#ffffff',
              flexShrink: 0
            }}>
              {!data.github_signals?.avatar_url && (candidate.name ? candidate.name[0].toUpperCase() : 'C')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                  {candidate.name || 'Developer Candidate'}
                </h2>
                <span className="badge badge-emerald">
                  {data.readiness_category || 'Interview Ready'}
                </span>
                {data.experience_level && (
                  <span className="badge badge-slate">
                    {data.experience_level}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>
                {data.headline || 'Software Engineer'}
              </div>

              {/* Meta details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {candidate.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} />
                    <span>{candidate.email}</span>
                  </div>
                )}
                {candidate.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.github && (
                  <a
                    href={`https://github.com/${candidate.github.replace('https://github.com/', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <GithubIcon size={14} />
                    <span>github.com/{candidate.github.replace('https://github.com/', '')}</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}
                {data.certifications && data.certifications.length > 0 && (
                  <button
                    onClick={() => setActiveTab('resume')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--amber)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    title="View extracted certificates"
                  >
                    <Award size={14} />
                    <span>{data.certifications.length} {data.certifications.length === 1 ? 'Certificate' : 'Certificates'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Holistic Overall Readiness Gauge Card */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <ScoreGauge score={data.holistic_score} size={68} strokeWidth={6} label="" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overall Readiness
              </div>
              <div className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 1 }}>
                {Math.round(data.holistic_score || 0)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Multi-Vector Quotient
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Career Readiness Pipeline Stepper */}
      <div className="card-solid" style={{ padding: '22px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Multi-Signal Evaluation Pipeline
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
            Verified
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14
        }}>
          {/* Stage 1 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--emerald)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              flexShrink: 0
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Resume & ATS</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {Math.round(data.resume_overall_score || 0)}/100 Audited
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--emerald)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              flexShrink: 0
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>GitHub Signals</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {data.github_signals?.public_repos || 0} Repos Synced
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: data.leetcode_signals ? 'var(--emerald)' : 'var(--amber)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              flexShrink: 0
            }}>
              {data.leetcode_signals ? '✓' : '3'}
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>DSA Algorithms</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {data.leetcode_signals ? `${data.leetcode_signals.total_solved || 0} Problems Solved` : 'Target Benchmarked'}
              </div>
            </div>
          </div>

          {/* Stage 4 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              flexShrink: 0
            }}>
              4
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>Market Matches</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {data.job_matches?.length || 0} Roles Mapped
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Job Description Banner (If Matched) */}
      {data.custom_jd_match && (
        <div className="card-solid" style={{
          padding: '22px 28px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--primary-border, var(--border-medium))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border, var(--border-subtle))',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Target size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  Target Role Evaluated
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  {data.custom_jd_match.fit_score}% Match Fit
                </span>
              </div>
              <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                {data.custom_jd_match.job_title}
                {data.custom_jd_match.company_name && (
                  <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                    at {data.custom_jd_match.company_name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                {data.custom_jd_match.matched_skills?.length || 0} skills aligned • {data.custom_jd_match.missing_skills?.length || 0} skill gaps identified
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('jobs')}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
          >
            <span>View JD Match & ATS Gaps</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Middle Row: Radar Chart + Roadmap Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Radar Chart */}
        <div className="card-solid" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Competency Radar
              </h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Candidate signals mapped against 80% industry benchmark
              </div>
            </div>
            <span className="badge badge-slate" style={{ fontSize: '0.66rem' }}>Benchmark</span>
          </div>

          <RadarReadinessChart data={data} />
        </div>

        {/* Action Roadmap Card */}
        <div className="card-solid" style={{
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Compass size={18} color="var(--primary)" />
              <span className="badge badge-primary">
                Action Roadmap
              </span>
            </div>

            <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Target: {data.roadmap?.target_role || data.target_role || 'Software Engineer'}
            </h4>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
              {data.roadmap?.summary || 'Tailored action plan with concrete milestones, recommended proof-of-work project architecture, and DSA curriculum.'}
            </p>

            <div style={{ background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Timeline
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem', marginTop: 2 }}>
                {data.roadmap?.estimated_weeks || 8} Weeks Structured Action Plan
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="btn-primary"
            style={{ width: '100%', padding: '11px 18px', justifyContent: 'center' }}
          >
            <span>View Action Roadmap</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 4 Core Evaluation Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 18
      }}>
        {/* Pillar 1: Resume & ATS */}
        <div className="card-solid interactive-card" style={{ padding: '22px 24px', cursor: 'pointer' }} onClick={() => setActiveTab('resume')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Resume & ATS</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Syntax & format</div>
              </div>
            </div>
            <ScoreGauge score={data.resume_overall_score || scores.ats_compatibility || 70} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Audited across 6 ATS metrics: parsing robustness, impact verb density, and layout compliance.
          </div>
          <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>View ATS audit</span> →
          </div>
        </div>

        {/* Pillar 2: GitHub Engineering */}
        <div className="card-solid interactive-card" style={{ padding: '22px 24px', cursor: 'pointer' }} onClick={() => setActiveTab('dev')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <GithubIcon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Engineering Proof</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>GitHub repositories</div>
              </div>
            </div>
            <ScoreGauge score={devReadiness.engineering_score || 0} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {data.github_signals
              ? `Evaluated ${data.github_signals.public_repos || 0} repositories across ${data.github_signals.top_repos?.length || 0} production codebases.`
              : 'Add GitHub handle to evaluate code depth, architecture, and commit cadence.'}
          </div>
          <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Inspect repositories</span> →
          </div>
        </div>

        {/* Pillar 3: LeetCode DSA */}
        <div className="card-solid interactive-card" style={{ padding: '22px 24px', cursor: 'pointer' }} onClick={() => setActiveTab('dev')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                <Code2 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>DSA Algorithms</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>LeetCode problem solving</div>
              </div>
            </div>
            <ScoreGauge score={devReadiness.dsa_score || 0} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {data.leetcode_signals
              ? `Solved ${data.leetcode_signals.total_solved || 0} problems with ${data.leetcode_signals.acceptance_rate || 0}% acceptance rate.`
              : 'Add LeetCode handle to evaluate algorithmic readiness and patterns.'}
          </div>
          <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Review DSA stats</span> →
          </div>
        </div>

        {/* Pillar 4: Portfolio Trust */}
        <div className="card-solid interactive-card" style={{ padding: '22px 24px', cursor: 'pointer' }} onClick={() => setActiveTab('verification')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--emerald-subtle)', border: '1px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>Portfolio Trust</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Authenticity check</div>
              </div>
            </div>
            <ScoreGauge score={crossVer.trust_score || 60} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {crossVer.verified_skills_count || 0} declared skills cross-referenced with repository commit telemetry.
          </div>
          <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Check verification matrix</span> →
          </div>
        </div>
      </div>

      {/* Top Matched Job Role Banner */}
      {topJob && (
        <div className="card-solid" style={{ padding: '24px 28px', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Briefcase size={15} color="var(--primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Top Matched Role
                </span>
              </div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {topJob.title}
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Estimated Salary: <strong style={{ color: 'var(--emerald)' }}>{topJob.salary_range}</strong> • {topJob.experience_level}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {topJob.fit_score}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skill Match</div>
              </div>
              <button onClick={() => setActiveTab('jobs')} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '0.84rem' }}>
                <span>View All Matches</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
