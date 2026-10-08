import React from 'react';
import { Layers, ShieldCheck, FileText, Code2, Briefcase, ExternalLink, MapPin, Mail, Compass, ArrowRight, ArrowUpRight, Target, Award } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Candidate Profile Header Card */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              background: data.github_signals?.avatar_url
                ? `url(${data.github_signals.avatar_url}) center/cover`
                : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-medium)',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0
            }}>
              {!data.github_signals?.avatar_url && (candidate.name ? candidate.name[0].toUpperCase() : 'C')}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {candidate.name || 'Candidate Profile'}
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

              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
                {data.headline || 'Software Engineer'}
              </div>

              {/* Meta links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {candidate.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail size={13} />
                    <span>{candidate.email}</span>
                  </div>
                )}
                {candidate.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.github && (
                  <a
                    href={`https://github.com/${candidate.github.replace('https://github.com/', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    <GithubIcon size={13} />
                    <span>github.com/{candidate.github.replace('https://github.com/', '')}</span>
                    <ArrowUpRight size={11} />
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
                      gap: 5,
                      color: 'var(--amber)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                    title="Click to view extracted certificates in Resume section"
                  >
                    <Award size={13} />
                    <span>{data.certifications.length} {data.certifications.length === 1 ? 'Certificate' : 'Certificates'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Holistic Score Badge */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <ScoreGauge score={data.holistic_score} size={70} strokeWidth={6} label="" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overall Readiness
              </div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {Math.round(data.holistic_score || 0)} / 100
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Composite Talent Quotient
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Career Readiness Stage Stepper Track */}
      <div className="card-solid" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Comprehensive Candidate Readiness Pipeline
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            {data.readiness_category || 'Interview Ready'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12
        }}>
          {/* Stage 1 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
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
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Resume & ATS</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {Math.round(data.resume_overall_score || 0)}/100 Audited
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: data.github_signals ? 'var(--emerald)' : 'var(--amber)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              flexShrink: 0
            }}>
              {data.github_signals ? '✓' : '2'}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>GitHub Footprint</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {data.github_signals ? `${data.github_signals.public_repos || 0} Repos Verified` : 'Pending Authentication'}
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
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
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>DSA Algorithms</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {data.leetcode_signals ? `${data.leetcode_signals.total_solved || 0} Problems Solved` : 'Target Benchmarked'}
              </div>
            </div>
          </div>

          {/* Stage 4 */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10
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
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Market Fit</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {data.job_matches?.length || 0} Roles Mapped
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Job Description Highlight Banner if matched */}
      {data.custom_jd_match && (
        <div className="card-solid" style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, var(--primary-subtle) 0%, #ffffff 100%)',
          border: '1.5px solid var(--primary-border, #bfdbfe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <Target size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                  Target Job Description Evaluated
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                  {data.custom_jd_match.fit_score}% Match Fit
                </span>
              </div>
              <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 3 }}>
                {data.custom_jd_match.job_title}
                {data.custom_jd_match.company_name && (
                  <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                    at {data.custom_jd_match.company_name}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {data.custom_jd_match.matched_skills?.length || 0} skills aligned • {data.custom_jd_match.missing_skills?.length || 0} skill gaps identified
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('jobs')}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.84rem' }}
          >
            <span>View Complete JD Match & ATS Tips</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Middle Row: Radar Chart + Roadmap Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Radar Chart */}
        <div className="card-solid" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Competency Radar
              </h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Candidate signals mapped against industry 80% benchmark
              </div>
            </div>
            <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>Interactive</span>
          </div>

          <RadarReadinessChart data={data} />
        </div>

        {/* Personalized Roadmap Callout Card */}
        <div className="card-solid" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #ffffff 0%, var(--bg-subtle) 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Compass size={18} color="var(--primary)" />
              <span className="badge badge-blue">
                Target Role Plan
              </span>
            </div>

            <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              Target: {data.roadmap?.target_role || data.target_role || 'Software Engineer'}
            </h4>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
              {data.roadmap?.summary || 'Tailored action plan with concrete milestones, recommended proof-of-work project architecture, and DSA curriculum.'}
            </p>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Estimated Duration:
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', marginTop: 1 }}>
                {data.roadmap?.estimated_weeks || 8} Weeks Structured Action Plan
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="btn-primary"
            style={{ width: '100%', padding: '10px 18px', justifyContent: 'center' }}
          >
            <span>View Action Roadmap</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16
      }}>
        {/* Pillar 1: Resume & ATS */}
        <div className="card-solid interactive-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('resume')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--sky-subtle)', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky)' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Resume & ATS</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Parsing & formatting</div>
              </div>
            </div>
            <ScoreGauge score={data.resume_overall_score || scores.ats_compatibility || 70} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Audited across 6 ATS metrics: parsing compatibility, action verb density, and skill relevance.
          </div>
          <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>View ATS audit</span> →
          </div>
        </div>

        {/* Pillar 2: GitHub Engineering */}
        <div className="card-solid interactive-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('dev')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--indigo-subtle)', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)' }}>
                <GithubIcon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Engineering Proof</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GitHub repositories</div>
              </div>
            </div>
            <ScoreGauge score={devReadiness.engineering_score || 0} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {data.github_signals
              ? `Evaluated ${data.github_signals.public_repos || 0} repos across ${data.github_signals.top_repos?.length || 0} active projects.`
              : 'Add GitHub username to evaluate codebase depth, language entropy, and stars.'}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Inspect repositories</span> →
          </div>
        </div>

        {/* Pillar 3: LeetCode DSA */}
        <div className="card-solid interactive-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('dev')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                <Code2 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>DSA & Problem Solving</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LeetCode performance</div>
              </div>
            </div>
            <ScoreGauge score={devReadiness.dsa_score || 0} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {data.leetcode_signals
              ? `Solved ${data.leetcode_signals.total_solved || 0} problems with ${data.leetcode_signals.acceptance_rate || 0}% acceptance rate.`
              : 'Add LeetCode username to evaluate problem-solving consistency.'}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Review DSA stats</span> →
          </div>
        </div>

        {/* Pillar 4: Portfolio Trust */}
        <div className="card-solid interactive-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('verification')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--emerald-subtle)', border: '1px solid var(--emerald-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Portfolio Trust</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Claim validation</div>
              </div>
            </div>
            <ScoreGauge score={crossVer.trust_score || 60} size={54} strokeWidth={5} label="" />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {crossVer.verified_skills_count || 0} skills authenticated with code proof and repositories.
          </div>
          <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Check verification matrix</span> →
          </div>
        </div>
      </div>

      {/* Top Matched Job Highlight */}
      {topJob && (
        <div className="card-solid" style={{ padding: '20px 24px', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Briefcase size={15} color="var(--primary)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Top Matched Career Role
                </span>
              </div>
              <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {topJob.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Estimated Salary: <strong style={{ color: 'var(--emerald)' }}>{topJob.salary_range}</strong> • {topJob.experience_level}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {topJob.fit_score}%
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Skill Match</div>
              </div>
              <button onClick={() => setActiveTab('jobs')} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <span>View All Matches</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
