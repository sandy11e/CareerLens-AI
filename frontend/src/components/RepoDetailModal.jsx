import React from 'react';
import { X, ExternalLink, Star, GitFork, HardDrive, Code2 } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function RepoDetailModal({ repo, username, onClose }) {
  if (!repo) return null;

  const repoUrl = repo.html_url || `https://github.com/${username}/${repo.name}`;
  const updatedDate = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'Recent';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div
        className="card-solid"
        style={{
          maxWidth: 540,
          width: '100%',
          padding: '28px',
          background: '#ffffff',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'var(--primary-subtle)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Code2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Repository Details
            </div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {repo.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
          {repo.description || 'No description provided in repository metadata.'}
        </p>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 16
        }}>
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, color: 'var(--amber)', fontSize: '1.05rem', fontWeight: 700 }}>
              <Star size={14} />
              <span>{repo.stars || 0}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Stars</div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, color: 'var(--primary)', fontSize: '1.05rem', fontWeight: 700 }}>
              <GitFork size={14} />
              <span>{repo.forks || 0}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Forks</div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', padding: '10px', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, color: 'var(--emerald)', fontSize: '1.05rem', fontWeight: 700 }}>
              <HardDrive size={14} />
              <span>{repo.size ? `${Math.round(repo.size / 1024)}MB` : '<1MB'}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Code Size</div>
          </div>
        </div>

        {/* Additional Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
            <span>Language</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{repo.language || 'Multi-language'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
            <span>Open Issues</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{repo.open_issues || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
            <span>Last Activity</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{updatedDate}</span>
          </div>
        </div>

        {/* Action Button: Open on GitHub */}
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ flex: 1, padding: '10px 16px', textDecoration: 'none' }}
          >
            <GithubIcon size={16} />
            <span>Open on GitHub</span>
            <ExternalLink size={14} />
          </a>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '10px 16px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
