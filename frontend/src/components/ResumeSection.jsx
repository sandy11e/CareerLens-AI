import React, { useState } from 'react';
import { FileText, CheckCircle, Sparkles, Copy, Check, Briefcase, GraduationCap, FolderGit2, Tag, ChevronRight, BarChart2, Award, ExternalLink, ShieldCheck } from 'lucide-react';
import AtsBenchmarkBarChart from './charts/AtsBenchmarkBarChart';

export default function ResumeSection({ data }) {
  const [copied, setCopied] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState('all');

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

  const scoreMetrics = [
    { key: 'ats_compatibility', label: 'ATS Compatibility', score: scores.ats_compatibility || 75, color: 'var(--primary)' },
    { key: 'content_quality', label: 'Content & Impact Quality', score: scores.content_quality || 70, color: 'var(--indigo)' },
    { key: 'market_relevance', label: 'Market Skill Relevance', score: scores.market_relevance || 80, color: 'var(--emerald)' },
    { key: 'experience_depth', label: 'Experience Depth', score: scores.experience_depth || 65, color: 'var(--amber)' },
    { key: 'education_rating', label: 'Education Credibility', score: scores.education_rating || 85, color: '#ec4899' },
    { key: 'formatting_structure', label: 'Formatting & Layout', score: scores.formatting_structure || 90, color: 'var(--sky)' },
  ];

  const skillCategories = [
    { id: 'all', label: `All Skills (${allSkills.length})` },
    { id: 'languages', label: `Languages (${skills.languages?.length || 0})` },
    { id: 'frameworks_and_libraries', label: `Frameworks (${skills.frameworks_and_libraries?.length || 0})` },
    { id: 'databases', label: `Databases (${skills.databases?.length || 0})` },
    { id: 'cloud_and_devops', label: `Cloud & DevOps (${skills.cloud_and_devops?.length || 0})` },
    { id: 'tools_and_platforms', label: `Tools (${skills.tools_and_platforms?.length || 0})` },
  ];

  const currentSkillsList = activeSkillCategory === 'all'
    ? allSkills
    : (skills[activeSkillCategory] || []);

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

      {/* Actionable Recommendations & Insights */}
      {((insights.strengths && insights.strengths.length > 0) || recommendations.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {/* Strengths */}
          <div className="card-solid" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CheckCircle size={17} color="var(--emerald)" />
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Identified Strengths
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(insights.strengths || []).map((str, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="card-solid" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={17} color="var(--amber)" />
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ATS Recommendations
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(recommendations.length > 0 ? recommendations : (insights.actionable_recommendations || []).map(r => ({ tip: r }))).map((rec, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-subtle)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)'
                }}>
                  <ChevronRight size={13} color="var(--primary)" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{rec.tip || rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extracted Categorized Skills */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={17} color="var(--primary)" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Extracted Skills ({allSkills.length})
            </h3>
          </div>

          <button onClick={handleCopySkills} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.76rem' }}>
            {copied ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Skills'}</span>
          </button>
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
                padding: '4px 12px',
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
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: '0.8rem',
                fontWeight: 500
              }}
            >
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

      {/* Experience Timeline */}
      {experiences.length > 0 && (
        <div className="card-solid" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Briefcase size={17} color="var(--indigo)" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Work Experience
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {experiences.map((exp, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  <div>
                    <h4 className="font-display" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {exp.title}
                    </h4>
                    <div style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 500 }}>
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </div>
                  </div>
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                    {exp.start_date || 'Start'} – {exp.end_date || (exp.is_current ? 'Present' : 'End')}
                  </span>
                </div>

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul style={{ paddingLeft: 16, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {exp.highlights.map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {exp.technologies_used && exp.technologies_used.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                    {exp.technologies_used.map((t, tIdx) => (
                      <span key={tIdx} style={{ fontSize: '0.7rem', background: '#ffffff', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '1px 6px', borderRadius: 4 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
