import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Sparkles,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Tag,
  ChevronRight,
  BarChart2,
  Award,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  Zap,
  TrendingUp,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';
import AtsBenchmarkBarChart from './charts/AtsBenchmarkBarChart';

// Helper to highlight quantifiable numbers, percentages, and metrics in experience bullets
function highlightMetricsInText(text) {
  if (!text || typeof text !== 'string') return text;
  // Regex to catch percentages, multiples, dollar amounts, large numbers, latencies, requests
  const regex = /(\+?\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?[KkMmBb]?|\b\d+(?:\.\d+)?x\b|\b\d{1,3}(?:,\d{3})+\+?|\b\d+\+?(?:\s*(?:users|active users|req\/s|requests\/sec|ms|seconds|minutes|hours|stars|queries|repos|services|engineers|clients|nodes))\b)/gi;
  
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (regex.test(part)) {
      return (
        <span key={idx} className="visual-metric-tag" title="Quantified Impact Metric">
          <TrendingUp size={11} style={{ marginRight: 2 }} />
          {part}
        </span>
      );
    }
    return part;
  });
}

// Categorize recommendation impact level
function getRecMeta(recText) {
  const t = (recText || '').toLowerCase();
  if (t.includes('metric') || t.includes('quantif') || t.includes('number') || t.includes('%') || t.includes('result')) {
    return { level: 'High Impact', color: 'var(--rose)', bg: 'var(--rose-subtle)', border: 'var(--rose-border)', category: 'Impact & Metrics' };
  }
  if (t.includes('keyword') || t.includes('skill') || t.includes('match') || t.includes('term')) {
    return { level: 'ATS Keywords', color: 'var(--primary)', bg: 'var(--primary-subtle)', border: '#c7d2fe', category: 'Keyword Density' };
  }
  if (t.includes('format') || t.includes('bullet') || t.includes('section') || t.includes('layout')) {
    return { level: 'ATS Parsing', color: 'var(--sky)', bg: 'var(--sky-subtle)', border: '#bae6fd', category: 'Structure & Format' };
  }
  return { level: 'Recommended', color: 'var(--amber)', bg: 'var(--amber-subtle)', border: 'var(--amber-border)', category: 'Best Practice' };
}

export default function ResumeSection({ data }) {
  const [copied, setCopied] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState('all');
  const [completedRecs, setCompletedRecs] = useState({});

  if (!data) return null;

  const scores = data.scores || {};
  const skills = data.skills || {};
  const allSkills = data.all_skills || [];
  const experiences = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const insights = data.ats_insights || {};
  const recommendations = data.recommendations || [];

  const normalizedCerts = certifications.map((c) => {
    if (typeof c === 'string') {
      return { name: c, issuer: null, year: null, credential_id_or_url: null };
    }
    return {
      name: c.name || c.title || 'Certification',
      issuer: c.issuer || c.organization || null,
      year: c.year || c.date || null,
      credential_id_or_url: c.credential_id_or_url || c.credential_id || c.url || null
    };
  });

  const handleCopySkills = () => {
    navigator.clipboard.writeText(allSkills.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRec = (idx) => {
    setCompletedRecs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const scoreMetrics = [
    { key: 'ats_compatibility', label: 'ATS Compatibility', score: scores.ats_compatibility || 75, color: 'var(--primary)' },
    { key: 'content_quality', label: 'Content & Impact Quality', score: scores.content_quality || 70, color: 'var(--indigo)' },
    { key: 'market_relevance', label: 'Market Skill Relevance', score: scores.market_relevance || 80, color: 'var(--emerald)' },
    { key: 'experience_depth', label: 'Experience Depth', score: scores.experience_depth || 65, color: 'var(--amber)' },
    { key: 'education_rating', label: 'Education Credibility', score: scores.education_rating || 85, color: '#ec4899' },
    { key: 'formatting_structure', label: 'Formatting & Layout', score: scores.formatting_structure || 90, color: 'var(--sky)' },
  ];

  const skillCategories = [
    { id: 'all', label: `All Skills (${allSkills.length})`, count: allSkills.length, color: 'var(--primary)' },
    { id: 'languages', label: `Languages (${skills.languages?.length || 0})`, count: skills.languages?.length || 0, color: 'var(--sky)' },
    { id: 'frameworks_and_libraries', label: `Frameworks (${skills.frameworks_and_libraries?.length || 0})`, count: skills.frameworks_and_libraries?.length || 0, color: 'var(--indigo)' },
    { id: 'databases', label: `Databases (${skills.databases?.length || 0})`, count: skills.databases?.length || 0, color: 'var(--emerald)' },
    { id: 'cloud_and_devops', label: `Cloud & DevOps (${skills.cloud_and_devops?.length || 0})`, count: skills.cloud_and_devops?.length || 0, color: 'var(--amber)' },
    { id: 'tools_and_platforms', label: `Tools (${skills.tools_and_platforms?.length || 0})`, count: skills.tools_and_platforms?.length || 0, color: '#ec4899' },
  ];

  const currentSkillsList = activeSkillCategory === 'all'
    ? allSkills
    : (skills[activeSkillCategory] || []);

  // Compute skill category ratio for visual segmented bar
  const categorizedTotal = (skills.languages?.length || 0) +
    (skills.frameworks_and_libraries?.length || 0) +
    (skills.databases?.length || 0) +
    (skills.cloud_and_devops?.length || 0) +
    (skills.tools_and_platforms?.length || 0) || 1;

  const rawRecsList = recommendations.length > 0 ? recommendations : (insights.actionable_recommendations || []).map(r => ({ tip: r }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner: ATS Audit & 6 Metrics */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={19} color="var(--primary)" />
              <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ATS Compatibility & Resume Audit
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Multi-dimensional evaluation across parsing compliance, action verbs, and quantifiable impact.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 16px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Resume Score:</span>
            <span className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
              {Math.round(data.resume_overall_score || 0)}/100
            </span>
          </div>
        </div>

        {/* 6 Metric Progress Bars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14
        }}>
          {scoreMetrics.map((metric) => (
            <div key={metric.key} style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{metric.label}</span>
                <span className="font-display" style={{ fontSize: '0.9rem', fontWeight: 700, color: metric.color }}>{metric.score}%</span>
              </div>
              <div style={{ height: 6, background: '#ffffff', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${metric.score}%`,
                  height: '100%',
                  background: metric.color,
                  borderRadius: 3,
                  transition: 'width 0.8s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ATS Benchmark Comparison Bar Chart */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <BarChart2 size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
              ATS Metrics vs Industry Benchmark (80%)
            </span>
          </div>
          <AtsBenchmarkBarChart scores={scores} />
        </div>
      </div>

      {/* Actionable Recommendations & Strengths (Visual Action Cards) */}
      {((insights.strengths && insights.strengths.length > 0) || rawRecsList.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {/* Strengths */}
          <div className="card-solid" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CheckCircle size={18} color="var(--emerald)" />
              <div>
                <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Validated Profile Strengths
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Core competitive advantages parsed from your resume
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(insights.strengths || []).map((str, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--emerald-subtle)',
                    border: '1px solid var(--emerald-border)',
                    padding: '10px 14px',
                    borderRadius: 8
                  }}
                >
                  <CheckCircle size={14} color="var(--emerald)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.45 }}>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable ATS Action Checklist */}
          <div className="card-solid" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--amber)" />
                <div>
                  <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Actionable ATS Recommendations
                  </h4>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Click items to track completion
                  </div>
                </div>
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                {Object.values(completedRecs).filter(Boolean).length} / {rawRecsList.length} Addressed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rawRecsList.map((rec, idx) => {
                const text = rec.tip || rec;
                const meta = getRecMeta(text);
                const isChecked = !!completedRecs[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleRec(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: isChecked ? 'var(--bg-subtle)' : '#ffffff',
                      border: `1px solid ${isChecked ? 'var(--border-subtle)' : meta.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isChecked ? 0.6 : 1
                    }}
                  >
                    <div style={{ color: isChecked ? 'var(--emerald)' : meta.color, marginTop: 2, flexShrink: 0 }}>
                      {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: meta.bg,
                          color: meta.color,
                          textTransform: 'uppercase'
                        }}>
                          {meta.level}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {meta.category}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: isChecked ? 'var(--text-muted)' : 'var(--text-main)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        lineHeight: 1.45
                      }}>
                        {text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Extracted Categorized Skills & Visual Proportion Bar */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={17} color="var(--primary)" />
              <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Extracted Skills & Competency Spread ({allSkills.length})
              </h3>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Visual stack balance across core technologies and engineering layers
            </div>
          </div>

          <button onClick={handleCopySkills} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.76rem' }}>
            {copied ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Skills'}</span>
          </button>
        </div>

        {/* Visual Stack Proportion Bar */}
        <div style={{ marginBottom: 18, background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
            <span>Technical Stack Distribution</span>
            <span>{categorizedTotal} Tagged Technologies</span>
          </div>

          <div className="visual-segmented-bar" style={{ height: 10, marginBottom: 10 }}>
            <div style={{ width: `${((skills.languages?.length || 0) / categorizedTotal) * 100}%`, background: 'var(--sky)' }} title={`Languages: ${skills.languages?.length || 0}`} />
            <div style={{ width: `${((skills.frameworks_and_libraries?.length || 0) / categorizedTotal) * 100}%`, background: 'var(--indigo)' }} title={`Frameworks: ${skills.frameworks_and_libraries?.length || 0}`} />
            <div style={{ width: `${((skills.databases?.length || 0) / categorizedTotal) * 100}%`, background: 'var(--emerald)' }} title={`Databases: ${skills.databases?.length || 0}`} />
            <div style={{ width: `${((skills.cloud_and_devops?.length || 0) / categorizedTotal) * 100}%`, background: 'var(--amber)' }} title={`Cloud & DevOps: ${skills.cloud_and_devops?.length || 0}`} />
            <div style={{ width: `${((skills.tools_and_platforms?.length || 0) / categorizedTotal) * 100}%`, background: '#ec4899' }} title={`Tools: ${skills.tools_and_platforms?.length || 0}`} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sky)' }} />
              Languages ({skills.languages?.length || 0})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)' }} />
              Frameworks ({skills.frameworks_and_libraries?.length || 0})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
              Databases ({skills.databases?.length || 0})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
              Cloud & DevOps ({skills.cloud_and_devops?.length || 0})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ec4899' }} />
              Tools ({skills.tools_and_platforms?.length || 0})
            </span>
          </div>
        </div>

        {/* Skill category tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSkillCategory(cat.id)}
              style={{
                background: activeSkillCategory === cat.id ? 'var(--primary)' : 'var(--bg-subtle)',
                border: `1px solid ${activeSkillCategory === cat.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                color: activeSkillCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                padding: '5px 12px',
                borderRadius: 16,
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills pill cloud */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {currentSkillsList.map((skill, idx) => (
            <span
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: '0.8rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
              {skill}
            </span>
          ))}
          {currentSkillsList.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No skills found in this category.
            </div>
          )}
        </div>
      </div>

      {/* Experience Timeline (Interactive Connected Timeline + Metric Highlighter) */}
      {experiences.length > 0 && (
        <div className="card-solid" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color="var(--indigo)" />
              <div>
                <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Work Experience Timeline
                </h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Chronological career path with quantifiable metrics highlighted
                </div>
              </div>
            </div>
            <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
              {experiences.length} Position{experiences.length === 1 ? '' : 's'} Evaluated
            </span>
          </div>

          <div className="visual-timeline">
            {experiences.map((exp, idx) => {
              const compInitial = (exp.company ? exp.company[0] : 'C').toUpperCase();
              return (
                <div key={idx} className="visual-timeline-item">
                  <div className="visual-timeline-node">
                    <Briefcase size={12} color="var(--primary)" />
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 12,
                    padding: '18px 20px',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Company Avatar */}
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, var(--primary) 0%, var(--indigo) 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          flexShrink: 0
                        }}>
                          {compInitial}
                        </div>

                        <div>
                          <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                            {exp.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '0.84rem', fontWeight: 600 }}>
                              {exp.company}
                            </span>
                            {exp.location && (
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={11} />
                                {exp.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-slate" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {exp.start_date || 'Start'} – {exp.end_date || (exp.is_current ? 'Present' : 'End')}
                      </span>
                    </div>

                    {/* Bullet Highlights with Automatic Metric Highlighter */}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                        {exp.highlights.map((bullet, bIdx) => (
                          <div
                            key={bIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              fontSize: '0.82rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              padding: '6px 10px',
                              background: 'var(--bg-subtle)',
                              borderRadius: 6
                            }}
                          >
                            <span style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 1 }}>•</span>
                            <span style={{ flex: 1 }}>
                              {highlightMetricsInText(bullet)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tech Stack Chips */}
                    {exp.technologies_used && exp.technologies_used.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center' }}>
                          Tech:
                        </span>
                        {exp.technologies_used.map((t, tIdx) => (
                          <span key={tIdx} style={{ fontSize: '0.7rem', background: '#ffffff', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Projects Showcase */}
      {projects.length > 0 && (
        <div className="card-solid" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FolderGit2 size={17} color="var(--emerald)" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Projects
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {projects.map((proj, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 className="font-display" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    {proj.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 10 }}>
                    {proj.description}
                  </p>
                </div>

                <div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {proj.technologies.map((tech, tIdx) => (
                        <span key={tIdx} style={{ fontSize: '0.7rem', background: '#ffffff', color: 'var(--emerald)', border: '1px solid var(--emerald-border)', padding: '1px 6px', borderRadius: 4 }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Verified Credentials */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="var(--amber)" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Certifications & Credentials
            </h3>
          </div>
          {normalizedCerts.length > 0 ? (
            <span className="badge badge-amber" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} />
              {normalizedCerts.length} Verified
            </span>
          ) : (
            <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
              0 Detected
            </span>
          )}
        </div>

        {normalizedCerts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {normalizedCerts.map((cert, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--amber)',
                    flexShrink: 0
                  }}>
                    <Award size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 className="font-display" style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
                      {cert.name}
                    </h4>
                    {cert.issuer && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                        {cert.issuer}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {cert.year ? `Issued: ${cert.year}` : 'Accredited Program'}
                  </span>
                  {cert.credential_id_or_url && (
                    cert.credential_id_or_url.startsWith('http') ? (
                      <a
                        href={cert.credential_id_or_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        <span>Verify Credential</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        ID: {cert.credential_id_or_url}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px dashed var(--border-medium)',
            borderRadius: 10,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              flexShrink: 0
            }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                No certifications or licenses detected
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Adding recognized industry credentials (e.g. AWS Certified Developer, CKA, Google Cloud, Meta) helps validate your skill stack and improves ATS ranking.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="card-solid" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <GraduationCap size={17} color="var(--amber)" />
            <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Education
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {education.map((edu, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {edu.institution}
                  </div>
                </div>
                {edu.graduation_year && (
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                    Class of {edu.graduation_year}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
