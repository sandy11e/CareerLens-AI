import React from 'react';
import { 
  Layers, FileText, Code2, ShieldCheck, Briefcase, 
  MessageSquare, Compass, Plus, History, ChevronLeft, 
  ChevronRight, Award, Sparkles, CheckCircle2, TrendingUp,
  Target, Terminal, Zap, Shield, ArrowUpRight
} from 'lucide-react';
import { GithubIcon, LeetCodeIcon } from './Icons';

export default function CommandSidebar({
  data,
  activeTab,
  setActiveTab,
  isOpen,
  onToggle,
  onReset,
  onOpenHistory,
  currentUser
}) {
  const candidateName = data?.candidate_info?.name || currentUser?.name || 'Developer Profile';
  const headline = data?.headline || data?.candidate_info?.headline || 'Software Engineer';
  const targetRole = data?.target_role || data?.job_matches?.[0]?.title || 'Target Role';
  
  const overallScore = Math.round(data?.overall_score || data?.scores?.overall_score || 85);
  const atsScore = Math.round(data?.scores?.ats_compatibility || 88);
  const trustScore = Math.round(data?.cross_verification?.trust_score || 92);
  const publicRepos = data?.github_signals?.public_repos || data?.github_signals?.total_repos || 0;
  const leetcodeSolved = data?.leetcode_signals?.total_solved || 0;

  const navItems = [
    {
      id: 'overview',
      label: '360° Overview',
      badge: `${overallScore}/100`,
      icon: Layers,
      desc: 'Readiness radar & high-level stats'
    },
    {
      id: 'roadmap',
      label: 'Career Roadmap',
      badge: 'Milestones',
      icon: Compass,
      desc: 'Step-by-step technical blueprints'
    },
    {
      id: 'resume',
      label: 'Resume & ATS Audit',
      badge: `${atsScore}% ATS`,
      icon: FileText,
      desc: 'ATS score, keywords & Google XYZ'
    },
    {
      id: 'dev',
      label: 'Engineering Signals',
      badge: `${publicRepos} Repos`,
      icon: Code2,
      desc: 'GitHub code signals & LeetCode DSA'
    },
    {
      id: 'verification',
      label: 'Cross-Verification',
      badge: `${trustScore}% Trust`,
      icon: ShieldCheck,
      desc: 'Proof-of-work authenticity check'
    },
    {
      id: 'jobs',
      label: 'Job Matches',
      badge: data?.job_matches?.length ? `${data.job_matches.length} Roles` : 'Match',
      icon: Briefcase,
      desc: 'Role matching & custom JD analysis'
    },
    {
      id: 'copilot',
      label: 'AI Career Advisor',
      badge: 'Live',
      icon: Sparkles,
      desc: 'Context-aware 360° Copilot'
    }
  ];

  return (
    <aside className={`command-sidebar ${isOpen ? '' : 'collapsed'}`}>
      {/* Profile Snapshot Card */}
      <div className="command-profile-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.86rem',
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {candidateName}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {headline}
              </div>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="btn-ghost"
            style={{ padding: 4, flexShrink: 0, borderRadius: 6 }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Target Role & Readiness Score Pill */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 8,
          padding: '8px 10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Target Role
            </div>
            <div style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {targetRole}
            </div>
          </div>

          <div style={{
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: '0.72rem',
            fontWeight: 800,
            border: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}>
            {overallScore} PTS
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="command-nav-list">
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '6px 12px 4px'
        }}>
          Audit Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`command-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem'
                }}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-dim)',
                  flexShrink: 0
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Live Stats Strip */}
      <div style={{
        padding: '10px 14px',
        margin: '8px 12px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }}>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            ATS Match
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
            {atsScore}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Proof Trust
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--emerald)', marginTop: 2 }}>
            {trustScore}%
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        <button
          onClick={onReset}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem', gap: 6 }}
        >
          <Plus size={14} />
          <span>New Evaluation</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', padding: '6px 12px', fontSize: '0.76rem', gap: 6 }}
        >
          <History size={13} />
          <span>Evaluation History</span>
        </button>
      </div>
    </aside>
  );
}
