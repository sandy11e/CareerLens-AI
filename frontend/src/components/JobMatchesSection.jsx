import React, { useState, useRef } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BarChart3,
  FileText,
  Upload,
  FileCheck,
  Sparkles,
  Compass,
  HelpCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Layers,
  X,
  Target
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import JobFitBarChart from './charts/JobFitBarChart';
import api from '../api';

const SAMPLE_JD = `Role: Senior Full Stack Engineer
Company: CloudScale Technologies

About the Role:
We are seeking an experienced Full Stack Engineer to build and scale our high-throughput cloud platforms. You will design resilient microservices, build real-time interactive user interfaces, and collaborate with cross-functional teams.

Key Responsibilities:
- Design and develop scalable web applications using React, TypeScript, and Node.js or Python FastAPI.
- Build and optimize REST and GraphQL APIs backed by PostgreSQL and Redis.
- Architect cloud infrastructure using Docker, Kubernetes, and AWS (ECS, S3, RDS).
- Drive test automation, CI/CD pipelines, and maintain high performance and 99.9% uptime.
- Champion clean code, system design, and mentor team members.

Required Skills & Qualifications:
- 3+ years experience with React, TypeScript, and modern frontend architecture.
- Solid backend experience with Python (FastAPI/Django) or Node.js.
- Strong proficiency in SQL (PostgreSQL) and database modeling.
- Hands-on experience with Docker, CI/CD, and Cloud deployment (AWS or GCP).
- Strong system design fundamentals and problem-solving abilities.`;

export default function JobMatchesSection({ data, onJdMatchUpdate, onRoadmapUpdate, setActiveTab }) {
  const customJd = data?.custom_jd_match;
  const [activeSubTab, setActiveSubTab] = useState('custom');
  const [filterCategory, setFilterCategory] = useState('All');

  // Custom JD Input State
  const [jdMode, setJdMode] = useState('text'); // 'text' | 'pdf'
  const [jdTextInput, setJdTextInput] = useState('');
  const [jdFileInput, setJdFileInput] = useState(null);
  const [isJdDragOver, setIsJdDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdError, setJdError] = useState('');
  const [showInputDrawer, setShowInputDrawer] = useState(!customJd);
  const [isUpdatingRoadmap, setIsUpdatingRoadmap] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const fileInputRef = useRef(null);

  if (!data) return null;

  const matches = data.job_matches || [];
  const categories = ['All', ...new Set(matches.map((m) => m.category).filter(Boolean))];
  const filteredJobs = filterCategory === 'All'
    ? matches
    : matches.filter((m) => m.category === filterCategory);

  const handleJdFileDrop = (e) => {
    e.preventDefault();
    setIsJdDragOver(false);
    setJdError('');
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (!dropped.name.toLowerCase().endsWith('.pdf')) {
        setJdError('Job Description document must be a PDF file.');
        return;
      }
      setJdFileInput(dropped);
    }
  };

  const handleJdFileSelect = (e) => {
    const selected = e.target.files[0];
    setJdError('');
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setJdError('Job Description document must be a PDF file.');
        return;
      }
      setJdFileInput(selected);
    }
  };

  const handleRunJdMatch = async (e) => {
    e?.preventDefault();
    setJdError('');

    if (jdMode === 'text' && (!jdTextInput.trim() || jdTextInput.trim().length < 20)) {
      setJdError('Please paste a job description with at least 20 characters.');
      return;
    }
    if (jdMode === 'pdf' && !jdFileInput) {
      setJdError('Please select or upload a Job Description PDF.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.matchCustomJD({
        jdText: jdMode === 'text' ? jdTextInput.trim() : null,
        jdFile: jdMode === 'pdf' ? jdFileInput : null,
        evaluationId: data.evaluation_id || 'latest',
      });

      if (response?.custom_jd_match) {
        if (onJdMatchUpdate) {
          onJdMatchUpdate(response.custom_jd_match);
        }
        setShowInputDrawer(false);
        setActiveSubTab('custom');
      } else {
        setJdError('Unable to analyze this Job Description. Please check the text or PDF format.');
      }
    } catch (err) {
      console.error('Custom JD Match error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to match resume against Job Description.';
      setJdError(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToRoadmap = async () => {
    if (!customJd?.job_title) return;
    setIsUpdatingRoadmap(true);
    try {
      const updated = await api.generateCustomRoadmap(customJd.job_title, data.evaluation_id || 'latest');
      if (onRoadmapUpdate) {
        onRoadmapUpdate(updated, customJd.job_title);
      }
      if (setActiveTab) {
        setActiveTab('roadmap');
      }
    } catch (err) {
      console.error('Failed to update roadmap:', err);
      alert('Could not update roadmap: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsUpdatingRoadmap(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Main Navigation Switcher */}
      <div className="card-solid" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--primary-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Job Matching & ATS Alignment
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                Match against a specific Job Description (Text/PDF) or compare across curated tech roles.
              </p>
            </div>
          </div>

          {/* SubTab Toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: 4,
            gap: 4
          }}>
            <button
              onClick={() => setActiveSubTab('custom')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 7,
                border: activeSubTab === 'custom' ? '1px solid var(--border-medium)' : '1px solid transparent',
                background: activeSubTab === 'custom' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'custom' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeSubTab === 'custom' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'custom' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Target size={15} color={activeSubTab === 'custom' ? 'var(--primary)' : 'currentColor'} />
              <span>Custom JD Matcher</span>
              {customJd ? (
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {customJd.fit_score}% Match
                </span>
              ) : (
                <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  Text / PDF
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('curated')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 7,
                border: activeSubTab === 'curated' ? '1px solid var(--border-medium)' : '1px solid transparent',
                background: activeSubTab === 'curated' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'curated' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeSubTab === 'curated' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'curated' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart3 size={15} color={activeSubTab === 'curated' ? 'var(--primary)' : 'currentColor'} />
              <span>Market Benchmark Roles ({matches.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CUSTOM JOB DESCRIPTION MATCHER                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Action & Status Bar if Custom JD exists */}
          {customJd && !showInputDrawer && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-blue" style={{ fontSize: '0.74rem' }}>
                  Active Job Posting Analysis
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Evaluated against your verified resume profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInputDrawer(true)}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={13} />
                <span>Test Another Job Description (Text/PDF)</span>
              </button>
            </div>
          )}

          {/* JD Input Drawer / Form */}
          {(!customJd || showInputDrawer) && (
            <div className="card-solid" style={{ padding: '24px 28px', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Target size={18} color="var(--primary)" />
                    <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Match Resume Against Any Job Description
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: 4 }}>
                    Paste text or upload a PDF job description to get an instant match score, missing skills gap breakdown, and ATS optimization tips.
                  </p>
                </div>

                {customJd && (
                  <button
                    type="button"
                    onClick={() => setShowInputDrawer(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.8rem'
                    }}
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {/* Mode Toggle Tabs */}
              <div style={{
                display: 'inline-flex',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: 3,
                marginBottom: 16,
                gap: 2
              }}>
                <button
                  type="button"
                  onClick={() => setJdMode('text')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: 'none',
                    background: jdMode === 'text' ? 'var(--primary)' : 'transparent',
                    color: jdMode === 'text' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={14} />
                  <span>Paste Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode('pdf')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: 'none',
                    background: jdMode === 'pdf' ? 'var(--primary)' : 'transparent',
                    color: jdMode === 'pdf' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Upload size={14} />
                  <span>Upload PDF</span>
                </button>
              </div>

              {/* Text Mode */}
              {jdMode === 'text' && (
                <div>
                  <textarea
                    rows={6}
                    placeholder="Paste job posting text, required qualifications, tech stack, and key responsibilities..."
                    value={jdTextInput}
                    onChange={(e) => setJdTextInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      color: 'var(--text-main)',
                      lineHeight: 1.5,
                      resize: 'vertical',
                      outline: 'none',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setJdTextInput(SAMPLE_JD)}
                        style={{
                          background: 'transparent',
                          border: '1px dashed var(--border-medium)',
                          color: 'var(--primary)',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Load Sample Full-Stack JD</span>
                      </button>
                      {jdTextInput && (
                        <button
                          type="button"
                          onClick={() => setJdTextInput('')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {jdTextInput.length} characters
                    </span>
                  </div>
                </div>
              )}

              {/* PDF Mode */}
              {jdMode === 'pdf' && (
                <div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsJdDragOver(true); }}
                    onDragLeave={() => setIsJdDragOver(false)}
                    onDrop={handleJdFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isJdDragOver ? 'var(--primary)' : jdFileInput ? 'var(--emerald)' : 'var(--border-medium)'}`,
                      background: isJdDragOver ? 'var(--primary-subtle)' : jdFileInput ? 'var(--emerald-subtle)' : 'var(--bg-subtle)',
                      borderRadius: 10,
                      padding: '30px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleJdFileSelect}
                      style={{ display: 'none' }}
                    />

                    {jdFileInput ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: '#ffffff',
                          border: '1px solid var(--emerald-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--emerald)'
                        }}>
                          <FileCheck size={22} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                            {jdFileInput.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {(jdFileInput.size / 1024).toFixed(1)} KB • PDF document ready
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setJdFileInput(null); }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--rose)',
                            cursor: 'pointer',
                            padding: 6,
                            marginLeft: 12
                          }}
                          title="Remove file"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--text-secondary)' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 2 }}>
                          Click to select or drag & drop a Job Description PDF
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Standard PDF job post or job specifications sheet
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {jdError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--rose-subtle)',
                  border: '1px solid var(--rose-border)',
                  color: 'var(--rose)',
                  fontSize: '0.82rem',
                  marginTop: 14
                }}>
                  <XCircle size={15} />
                  <span>{jdError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleRunJdMatch}
                  disabled={isAnalyzing}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={15} className="spinner" />
                      <span>Auditing Match & ATS Fit...</span>
                    </>
                  ) : (
                    <>
                      <span>Match Resume Against This JD</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CUSTOM JD MATCH RESULTS DISPLAY                                           */}
          {/* ========================================================================= */}
          {customJd && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Executive Hero Card */}
              <div className="card-solid" style={{
                padding: '28px',
                background: 'linear-gradient(135deg, #ffffff 0%, var(--bg-subtle) 100%)',
                border: '1px solid var(--border-medium)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 24,
                  alignItems: 'center'
                }}>
                  {/* Left: Role Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.74rem' }}>
                        Custom Analyzed Role
                      </span>
                      {customJd.seniority && (
                        <span className="badge badge-slate" style={{ fontSize: '0.74rem' }}>
                          {customJd.seniority}
                        </span>
                      )}
                      {customJd.company_name && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          at {customJd.company_name}
                        </span>
                      )}
                    </div>

                    <h2 className="font-display" style={{
                      fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: 1.25,
                      marginBottom: 10
                    }}>
                      {customJd.job_title}
                    </h2>

                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
                      {customJd.verdict}
                    </p>

                    {/* Sub-Score Bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 10,
                        padding: '10px 14px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Skill Fit</span>
                          <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>{customJd.skill_fit_score || 0}%</span>
                        </div>
                        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            width: `${customJd.skill_fit_score || 0}%`,
                            height: '100%',
                            background: 'var(--emerald)',
                            borderRadius: 3
                          }} />
                        </div>
                      </div>

                      <div style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 10,
                        padding: '10px 14px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Semantic Relevance</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{customJd.semantic_fit_score || 0}%</span>
                        </div>
                        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            width: `${customJd.semantic_fit_score || 0}%`,
                            height: '100%',
                            background: 'var(--primary)',
                            borderRadius: 3
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Visual Skills Coverage Proportion Bar */}
                    {(() => {
                      const matchedLen = customJd.matched_skills?.length || 0;
                      const missingLen = customJd.missing_skills?.length || 0;
                      const tot = matchedLen + missingLen || 1;
                      const matchedRatio = Math.round((matchedLen / tot) * 100);
                      return (
                        <div style={{ marginTop: 14, background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                            <span>Skills Coverage Breakdown</span>
                            <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                              {matchedLen} Matched ({matchedRatio}%) • {missingLen} Gaps ({100 - matchedRatio}%)
                            </span>
                          </div>
                          <div className="visual-segmented-bar" style={{ height: 8 }}>
                            <div style={{ width: `${matchedRatio}%`, background: 'var(--emerald)' }} title={`Matched: ${matchedRatio}%`} />
                            <div style={{ width: `${100 - matchedRatio}%`, background: 'var(--amber)' }} title={`Missing Gaps: ${100 - matchedRatio}%`} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right: Score Gauge & Action */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    padding: '24px',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <ScoreGauge
                      score={customJd.fit_score || 0}
                      size={120}
                      strokeWidth={10}
                      label="JD Match"
                      subtext="Compatibility"
                    />

                    <button
                      type="button"
                      onClick={handleApplyToRoadmap}
                      disabled={isUpdatingRoadmap}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        marginTop: 18,
                        padding: '10px 16px',
                        fontSize: '0.84rem',
                        justifyContent: 'center'
                      }}
                    >
                      {isUpdatingRoadmap ? (
                        <>
                          <Loader2 size={14} className="spinner" />
                          <span>Generating Plan...</span>
                        </>
                      ) : (
                        <>
                          <Compass size={15} />
                          <span>Set as Target & Update Roadmap</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Skills vs Missing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Matched Skills Card */}
                <div className="card-solid" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: 'var(--emerald-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--emerald)'
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        Matched Skills ({customJd.matched_skills?.length || 0})
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Verified technical skills found in this job posting
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(customJd.matched_skills || []).map((sk, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.78rem',
                        background: 'var(--emerald-subtle)',
                        border: '1px solid var(--emerald-border)',
                        color: 'var(--emerald)',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <CheckCircle2 size={12} />
                        {sk}
                      </span>
                    ))}
                    {(!customJd.matched_skills || customJd.matched_skills.length === 0) && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        No direct keyword matches detected.
                      </span>
                    )}
                  </div>
                </div>

                {/* Skill Gaps / Missing Card */}
                <div className="card-solid" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: 'var(--amber-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--amber)'
                    }}>
                      <XCircle size={16} />
                    </div>
                    <div>
                      <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        Missing Requirements / Skill Gaps ({customJd.missing_skills?.length || 0})
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Required technologies absent from your resume profile
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(customJd.missing_skills || []).map((sk, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.78rem',
                        background: 'var(--amber-subtle)',
                        border: '1px solid var(--amber-border)',
                        color: 'var(--amber)',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <XCircle size={12} />
                        {sk}
                      </span>
                    ))}
                    {(!customJd.missing_skills || customJd.missing_skills.length === 0) && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600 }}>
                        All primary technical requirements are matched!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Candidate Strengths & ATS Optimization Tips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Key Strengths */}
                {customJd.key_strengths && customJd.key_strengths.length > 0 && (
                  <div className="card-solid" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: 'var(--primary-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}>
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          Key Profile Strengths for this Opening
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Why recruiters and hiring managers will notice your application
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {customJd.key_strengths.map((str, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45
                        }}>
                          <span style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            flexShrink: 0,
                            color: 'var(--primary)',
                            marginTop: 1
                          }}>
                            {idx + 1}
                          </span>
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ATS Resume Optimizations */}
                {customJd.ats_resume_optimizations && customJd.ats_resume_optimizations.length > 0 && (
                  <div className="card-solid" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#d97706'
                      }}>
                        <Lightbulb size={16} />
                      </div>
                      <div>
                        <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          ATS Resume Optimization Tips
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Strategic keyword adjustments to pass this job's ATS filter
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {customJd.ats_resume_optimizations.map((tip, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          background: 'var(--bg-subtle)',
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <Lightbulb size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tailored Technical Interview Questions (Interactive Flashcards) */}
              {customJd.interview_questions && customJd.interview_questions.length > 0 && (
                <div className="card-solid" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--purple-subtle, #f5f3ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--purple, #7c3aed)'
                      }}>
                        <HelpCircle size={18} />
                      </div>
                      <div>
                        <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          High-Probability Technical Interview Questions
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Click any question card to inspect interviewer evaluation checkpoints
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                      {customJd.interview_questions.length} Targeted Questions
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                    {customJd.interview_questions.map((q, idx) => {
                      const isExpanded = expandedQuestion === idx;
                      const qTopic = idx % 3 === 0 ? 'System Design & Tradeoffs' : idx % 3 === 1 ? 'Architecture & Concurrency' : 'Data Integrity & Edge Cases';
                      return (
                        <div
                          key={idx}
                          onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                          className="flashcard"
                          style={{
                            border: isExpanded ? '1.5px solid var(--purple, #7c3aed)' : '1px solid var(--border-medium)',
                            background: isExpanded ? 'linear-gradient(180deg, #ffffff 0%, var(--purple-subtle, #faf5ff) 100%)' : '#ffffff',
                            borderRadius: 12,
                            padding: '16px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--purple, #7c3aed)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Question #{idx + 1}
                              </span>
                              <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>
                                {qTopic}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.45, marginBottom: 12 }}>
                              "{q}"
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--purple, #7c3aed)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Sparkles size={12} />
                                {isExpanded ? 'Hide rubric checkpoints' : 'Inspect what interviewers look for'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>

                            {isExpanded && (
                              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border-medium)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                  Key Candidate Checkpoints:
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                  <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>✓</span>
                                  <span>State trade-offs between throughput, latency, and memory footprints clearly.</span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                  <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>✓</span>
                                  <span>Highlight real production examples from your verified projects (e.g., caching, DB transactions).</span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                  <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>✓</span>
                                  <span>Discuss how you monitor failure rates, circuit breakers, and logging in production.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MARKET BENCHMARK ROLES                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'curated' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Banner */}
          <div className="card-solid" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Curated Market Tech Positions
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>
                  Computed using hybrid skill overlap + semantic description alignment across modern engineering roles.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      background: filterCategory === cat ? 'var(--primary)' : 'var(--bg-subtle)',
                      border: `1px solid ${filterCategory === cat ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      color: filterCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                      padding: '4px 12px',
                      borderRadius: 16,
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Match Comparison Bar Chart */}
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <BarChart3 size={15} color="var(--primary)" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Match Fit Comparison Across Roles
                </span>
              </div>
              <JobFitBarChart jobs={matches} />
            </div>
          </div>

          {/* Job Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {filteredJobs.map((job) => {
              const fitScore = Math.round(job.fit_score || 0);
              const isHighFit = fitScore >= 75;
              const isMidFit = fitScore >= 50;

              return (
                <div
                  key={job.id}
                  className="card-solid"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <div>
                        <h4 className="font-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          {job.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                            {job.category}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {job.experience_level}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        background: isHighFit ? 'var(--emerald-subtle)' : isMidFit ? 'var(--primary-subtle)' : 'var(--amber-subtle)',
                        border: `1px solid ${isHighFit ? 'var(--emerald-border)' : isMidFit ? 'var(--border-subtle)' : 'var(--amber-border)'}`,
                        borderRadius: 8,
                        padding: '4px 10px',
                        textAlign: 'center'
                      }}>
                        <span className="font-display" style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: isHighFit ? 'var(--emerald)' : isMidFit ? 'var(--primary)' : 'var(--amber)'
                        }}>
                          {fitScore}%
                        </span>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Match
                        </div>
                      </div>
                    </div>

                    {/* Salary estimate */}
                    <div style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: 600, marginBottom: 10 }}>
                      Est. {job.salary_range}
                    </div>

                    {/* Description snippet */}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 14 }}>
                      {job.description}
                    </p>

                    {/* Matched Skills */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald)', marginBottom: 5, textTransform: 'uppercase' }}>
                        <CheckCircle2 size={12} />
                        <span>Matched Skills ({job.matched_skills?.length || 0})</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(job.matched_skills || []).map((sk, idx) => (
                          <span key={idx} style={{
                            fontSize: '0.7rem',
                            background: 'var(--emerald-subtle)',
                            border: '1px solid var(--emerald-border)',
                            color: 'var(--emerald)',
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontWeight: 500
                          }}>
                            {sk}
                          </span>
                        ))}
                        {(!job.matched_skills || job.matched_skills.length === 0) && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>None matched</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {job.missing_skills && job.missing_skills.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', marginBottom: 5, textTransform: 'uppercase' }}>
                          <XCircle size={12} />
                          <span>Skill Gaps ({job.missing_skills.length})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {job.missing_skills.map((sk, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.7rem',
                              background: 'var(--amber-subtle)',
                              border: '1px solid var(--amber-border)',
                              color: 'var(--amber)',
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontWeight: 500
                            }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Tip */}
                  {job.action_tip && (
                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary)',
                      marginTop: 6
                    }}>
                      <Lightbulb size={13} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{job.action_tip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
