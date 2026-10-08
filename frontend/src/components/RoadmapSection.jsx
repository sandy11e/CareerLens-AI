import React, { useState, useEffect } from 'react';
import { Target, Clock, CheckCircle2, Circle, FolderGit2, Code2, RefreshCw, Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import api from '../api';

export default function RoadmapSection({ data, onRoadmapUpdate }) {
  if (!data) return null;

  const roadmap = data.roadmap || {};
  const stages = roadmap.stages || [];
  const project = roadmap.project_blueprint || {};
  const leetcode = roadmap.leetcode_curriculum || {};

  const currentRole = roadmap.target_role || data.target_role || 'Software Engineer';
  const [roleInput, setRoleInput] = useState(currentRole);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Sync role input when parent data updates
  useEffect(() => {
    if (roadmap.target_role) {
      setRoleInput(roadmap.target_role);
    }
  }, [roadmap.target_role]);

  const quickRoles = [
    'AI / ML Engineer',
    'Full Stack Engineer',
    'Backend Engineer',
    'DevOps / Cloud Engineer',
    'Frontend Specialist',
    'Data Scientist',
    'System Architect'
  ];

  const handleRegenerateRoadmap = async (targetToUse) => {
    const role = (targetToUse || roleInput).trim();
    if (!role) {
      setGenerateError('Please enter a target role to generate your custom roadmap.');
      return;
    }
    setGenerateError('');
    setIsGenerating(true);

    try {
      const newRoadmap = await api.generateCustomRoadmap(role, data.evaluation_id || 'latest');
      if (onRoadmapUpdate) {
        onRoadmapUpdate(newRoadmap, role);
      }
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to generate tailored roadmap for this role.';
      setGenerateError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Store checked task IDs in state (and sync to localStorage)
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`roadmap_tasks_${data.evaluation_id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem(`roadmap_tasks_${data.evaluation_id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Calculate total tasks and progress %
  const allTasks = stages.flatMap(s => s.tasks || []);
  const totalTasksCount = allTasks.length || 1;
  const completedCount = allTasks.filter(t => completedTasks[t.id]).length;
  const progressPct = Math.round((completedCount / totalTasksCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Target Role Selector & Live Switcher Bar */}
      <div className="card-solid" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--primary-subtle)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                  Target Role
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Refine or pivot your career goal
                </span>
              </div>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                {currentRole}
              </h3>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleRegenerateRoadmap(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', maxWidth: '100%' }}
          >
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <input
                type="text"
                placeholder="Enter role (e.g. AI Engineer, DevOps)..."
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: '0.86rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary"
              style={{ padding: '9px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="spin-animation" />
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span>Regenerate Roadmap</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Target Role Pill Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Quick switch:
          </span>
          {quickRoles.map((role) => {
            const isCurrent = currentRole.toLowerCase() === role.toLowerCase();
            return (
              <button
                key={role}
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  setRoleInput(role);
                  handleRegenerateRoadmap(role);
                }}
                style={{
                  background: isCurrent ? 'var(--primary)' : '#ffffff',
                  border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  color: isCurrent ? '#ffffff' : 'var(--text-secondary)',
                  padding: '3px 10px',
                  borderRadius: 16,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s ease'
                }}
              >
                {role}
              </button>
            );
          })}
        </div>

        {generateError && (
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--rose-subtle)',
            border: '1px solid var(--rose-border)',
            color: 'var(--rose)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <AlertCircle size={14} />
            <span>{generateError}</span>
          </div>
        )}
      </div>

      {/* Visual 4-Phase Stepper Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            8-Week Career Sprint Execution Track
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600 }}>
            {completedCount} of {totalTasksCount} milestones achieved ({progressPct}%)
          </span>
        </div>

        <div className="roadmap-stepper">
          {stages.map((stg) => {
            const stgTasks = stg.tasks || [];
            const stgDone = stgTasks.filter(t => completedTasks[t.id]).length;
            const stgPct = stgTasks.length > 0 ? Math.round((stgDone / stgTasks.length) * 100) : 0;
            const isCompleted = stgPct === 100 && stgTasks.length > 0;

            return (
              <div
                key={stg.stage_number}
                className="roadmap-step-card"
                onClick={() => {
                  const el = document.getElementById(`roadmap-stage-${stg.stage_number}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className={`badge ${isCompleted ? 'badge-emerald' : 'badge-blue'}`} style={{ fontSize: '0.66rem' }}>
                    {stg.timeframe || `Stage ${stg.stage_number}`}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isCompleted ? 'var(--emerald)' : 'var(--text-muted)' }}>
                    {stgDone}/{stgTasks.length}
                  </span>
                </div>

                <div className="font-display" style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.3 }}>
                  {stg.title}
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${stgPct}%`,
                    height: '100%',
                    background: isCompleted ? 'var(--emerald)' : 'var(--primary)',
                    borderRadius: 2,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Portfolio Project Blueprint (Visual System Architecture Schematic) */}
      {project.title && (
        <div className="card-solid" style={{ padding: '24px 28px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FolderGit2 size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Proof-of-Work Project Blueprint
                </span>
                <h4 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {project.title}
                </h4>
              </div>
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              Production Portfolio Ready
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
            {project.description}
          </p>

          {/* Interactive Visual Full-Stack Architecture Schematic */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                System Architecture Flow Diagram
              </span>
            </div>

            <div className="arch-diagram-flow">
              {/* Tier 1: Client & UX */}
              <div className="arch-block">
                <div className="arch-block-header">
                  <span style={{ fontSize: '1.1rem' }}>🎨</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Client / Frontend</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Presentation Layer</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {(project.tech_stack || []).filter(t => /react|vue|next|tailwind|css|frontend|ui|typescript|html/i.test(t)).map((t, idx) => (
                    <span key={idx} className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{t}</span>
                  ))}
                  {!(project.tech_stack || []).some(t => /react|vue|next|tailwind|css|frontend|ui|typescript|html/i.test(t)) && (
                    <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>React / Modern UI</span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Interactive responsive dashboard with optimistic state updates and modular components.
                </div>
              </div>

              {/* Tier 2: API & Logic */}
              <div className="arch-block">
                <div className="arch-block-header">
                  <span style={{ fontSize: '1.1rem' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>API & Business Logic</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Backend Services</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {(project.tech_stack || []).filter(t => /fastapi|python|node|express|django|go|graphql|rest|api/i.test(t)).map((t, idx) => (
                    <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>{t}</span>
                  ))}
                  {!(project.tech_stack || []).some(t => /fastapi|python|node|express|django|go|graphql|rest|api/i.test(t)) && (
                    <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>REST / Async Endpoints</span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  High-throughput async controllers, JWT session authentication, and data validation pipeline.
                </div>
              </div>

              {/* Tier 3: Data & Storage */}
              <div className="arch-block">
                <div className="arch-block-header">
                  <span style={{ fontSize: '1.1rem' }}>🗄️</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Data & Persistence</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Databases & Cache</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {(project.tech_stack || []).filter(t => /postgres|sql|mongo|redis|database|prisma|prisma/i.test(t)).map((t, idx) => (
                    <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>{t}</span>
                  ))}
                  {!(project.tech_stack || []).some(t => /postgres|sql|mongo|redis|database|prisma|prisma/i.test(t)) && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>PostgreSQL / Redis</span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Relational data modeling with migrations, indexing, and fast in-memory caching.
                </div>
              </div>

              {/* Tier 4: Cloud & Deployment */}
              <div className="arch-block">
                <div className="arch-block-header">
                  <span style={{ fontSize: '1.1rem' }}>☁️</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Cloud & CI/CD</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DevOps Pipeline</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {(project.tech_stack || []).filter(t => /docker|aws|kubernetes|k8s|cloud|ci|actions|github/i.test(t)).map((t, idx) => (
                    <span key={idx} className="badge badge-amber" style={{ fontSize: '0.68rem' }}>{t}</span>
                  ))}
                  {!(project.tech_stack || []).some(t => /docker|aws|kubernetes|k8s|cloud|ci|actions|github/i.test(t)) && (
                    <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>Docker / CI/CD Actions</span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Containerized deployment with automated test suites and production health monitoring.
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Cards */}
          {project.key_features && project.key_features.length > 0 && (
            <div style={{ background: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: 10, border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                Key Technical Deliverables for Recruiters:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                {project.key_features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} color="var(--emerald)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.github_setup_tip && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--amber-subtle)', border: '1px solid var(--amber-border)', padding: '8px 14px', borderRadius: 8 }}>
              <Lightbulb size={15} color="var(--amber)" style={{ flexShrink: 0 }} />
              <span><strong>Portfolio Tip:</strong> {project.github_setup_tip}</span>
            </div>
          )}
        </div>
      )}

      {/* LeetCode Algorithmic Focus (Visual Matrix) */}
      {leetcode.recommended_patterns && (
        <div className="card-solid" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={19} color="var(--amber)" />
              <div>
                <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Algorithmic DSA Focus: {leetcode.current_level || 'Targeted'}
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Tailored pattern breakdown to ace technical phone screens
                </div>
              </div>
            </div>
            <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
              {leetcode.weekly_goal || '4-5 Mediums per week'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {(leetcode.recommended_patterns || []).map((pat, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: 'var(--amber)', fontSize: '0.92rem' }}>
                      {pat.pattern}
                    </span>
                    <span className="badge badge-slate" style={{ fontSize: '0.62rem' }}>
                      High Priority
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 12 }}>
                    {pat.why}
                  </div>
                </div>

                {pat.sample_problems && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
                      Target Problems:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {pat.sample_problems.map((p, pIdx) => (
                        <span key={pIdx} style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 500
                        }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chronological Stages Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Milestone Action Checklists
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click tasks as you execute them to persist progress
          </span>
        </div>

        {stages.map((stage) => {
          const sTasks = stage.tasks || [];
          const sDone = sTasks.filter(t => completedTasks[t.id]).length;
          const sPct = sTasks.length > 0 ? Math.round((sDone / sTasks.length) * 100) : 0;

          return (
            <div
              key={stage.stage_number}
              id={`roadmap-stage-${stage.stage_number}`}
              className="card-solid"
              style={{ padding: '20px 24px', transition: 'border-color 0.2s ease' }}
            >
              {/* Stage Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: sPct === 100 ? 'var(--emerald)' : 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    flexShrink: 0
                  }}>
                    {stage.stage_number}
                  </div>
                  <div>
                    <h5 className="font-display" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {stage.title}
                    </h5>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {stage.objective}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                    <Clock size={11} />
                    {stage.timeframe}
                  </span>
                  <span className={`badge ${sPct === 100 ? 'badge-emerald' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
                    {sDone}/{sTasks.length} Done ({sPct}%)
                  </span>
                </div>
              </div>

              {/* Task Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {sTasks.map((task) => {
                  const isChecked = !!completedTasks[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: isChecked ? 'var(--emerald-subtle)' : '#ffffff',
                        border: `1px solid ${isChecked ? 'var(--emerald-border)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ color: isChecked ? 'var(--emerald)' : 'var(--text-dim)', marginTop: 2, flexShrink: 0 }}>
                        {isChecked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '0.82rem',
                          color: isChecked ? 'var(--text-muted)' : 'var(--text-main)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          lineHeight: 1.45
                        }}>
                          {task.text}
                        </span>
                      </div>

                      {task.category && (
                        <span className={`badge ${
                          task.category === 'Code' ? 'badge-blue' :
                          task.category === 'DSA' ? 'badge-amber' :
                          task.category === 'Resume' ? 'badge-indigo' : 'badge-emerald'
                        }`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          {task.category}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

