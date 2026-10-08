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
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
          >
            <div style={{ minWidth: 240 }}>
              <input
                type="text"
                placeholder="Enter role (e.g. AI Engineer, DevOps)..."
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.86rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
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

      {/* Progress Overview Banner */}
      <div className="card-solid" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 650 }}>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
              8-Week Milestone Action Plan
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {roadmap.summary || `Strategic execution roadmap tailored specifically to your resume gaps, verified GitHub footprint, and target role criteria.`}
            </p>
          </div>

          {/* Progress Gauge */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '14px 20px',
            minWidth: 210,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Milestones Completed</span>
              <strong style={{ color: 'var(--primary)' }}>{completedCount} / {totalTasksCount}</strong>
            </div>

            <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'var(--emerald)',
                borderRadius: 3,
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: progressPct === 100 ? 'var(--emerald)' : 'var(--text-main)' }}>
              {progressPct}% Executed
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Portfolio Project Blueprint */}
      {project.title && (
        <div className="card-solid" style={{ padding: '24px 28px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <FolderGit2 size={20} color="var(--primary)" />
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Recommended Proof-of-Work Project
              </span>
              <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {project.title}
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14 }}>
            {project.description}
          </p>

          {/* Tech Stack Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Proposed Stack:</span>
            {(project.tech_stack || []).map((t, idx) => (
              <span key={idx} className="badge badge-blue">
                {t}
              </span>
            ))}
          </div>

          {/* Key Features */}
          {project.key_features && project.key_features.length > 0 && (
            <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', marginBottom: 6 }}>
                Target Measurable Features:
              </div>
              <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {project.key_features.map((feat, fIdx) => (
                  <li key={fIdx}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {project.github_setup_tip && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <Lightbulb size={13} color="var(--amber)" />
              <span><strong>Setup Tip:</strong> {project.github_setup_tip}</span>
            </div>
          )}
        </div>
      )}

      {/* LeetCode Algorithmic Focus */}
      {leetcode.recommended_patterns && (
        <div className="card-solid" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={19} color="var(--amber)" />
              <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                DSA Focus: {leetcode.current_level || 'Targeted'}
              </h4>
            </div>
            <span className="badge badge-amber">
              {leetcode.weekly_goal || '4-5 Mediums per week'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {(leetcode.recommended_patterns || []).map((pat, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--amber)', fontSize: '0.88rem', marginBottom: 3 }}>
                    {pat.pattern}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 8 }}>
                    {pat.why}
                  </div>
                </div>

                {pat.sample_problems && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Practice Focus:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {pat.sample_problems.map((p, pIdx) => (
                        <span key={pIdx} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '1px 6px', borderRadius: 4 }}>
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
        <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Milestone Checklists
        </h4>

        {stages.map((stage) => (
          <div
            key={stage.stage_number}
            className="card-solid"
            style={{ padding: '20px 24px' }}
          >
            {/* Stage Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {stage.stage_number}
                </div>
                <div>
                  <h5 className="font-display" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {stage.title}
                  </h5>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {stage.objective}
                  </div>
                </div>
              </div>

              <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                <Clock size={11} />
                {stage.timeframe}
              </span>
            </div>

            {/* Task Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {(stage.tasks || []).map((task) => {
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
        ))}
      </div>
    </div>
  );
}
