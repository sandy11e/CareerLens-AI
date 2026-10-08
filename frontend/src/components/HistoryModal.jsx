import React, { useState, useEffect } from 'react';
import { 
  History, X, Search, RefreshCw, Trash2, ArrowRight, 
  ExternalLink, Calendar, Award, Code, CheckCircle2, AlertCircle,
  FileText, Sparkles, User, Layers
} from 'lucide-react';
import api from '../api';

export default function HistoryModal({ isOpen, onClose, onLoadEvaluation, currentEvaluationId }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEvaluationHistory();
      setEvaluations(res.evaluations || []);
    } catch (err) {
      console.error('Failed to load evaluation history:', err);
      setError(err.response?.data?.detail || 'Failed to load audit history from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectEvaluation = async (evaluationId) => {
    setLoadingDetailId(evaluationId);
    try {
      const res = await api.getEvaluationDetail(evaluationId);
      if (res?.analysis) {
        onLoadEvaluation(res.analysis);
        onClose();
      } else {
        setError('Evaluation data structure was empty.');
      }
    } catch (err) {
      console.error('Failed to retrieve full analysis:', err);
      setError(err.response?.data?.detail || 'Could not load complete evaluation report.');
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleDeleteEvaluation = async (e, evaluationId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this evaluation report from your history?')) {
      return;
    }

    setDeletingId(evaluationId);
    try {
      await api.deleteEvaluation(evaluationId);
      setEvaluations(prev => prev.filter(item => item.id !== evaluationId));
    } catch (err) {
      console.error('Failed to delete evaluation:', err);
      alert(err.response?.data?.detail || 'Failed to delete evaluation.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = evaluations.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.candidate_name && item.candidate_name.toLowerCase().includes(q)) ||
      (item.target_role && item.target_role.toLowerCase().includes(q)) ||
      (item.github_username && item.github_username.toLowerCase().includes(q)) ||
      (item.leetcode_username && item.leetcode_username.toLowerCase().includes(q)) ||
      (item.headline && item.headline.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="card-solid"
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--primary-subtle)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <History size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Candidate Audit History
                </h2>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                  {evaluations.length} {evaluations.length === 1 ? 'Audit' : 'Audits'} Saved
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Full 360° candidate intelligence reports stored in MongoDB Atlas
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', height: 36 }}
              title="Refresh audit history"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span className="hide-on-mobile">Refresh</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#fafbfc',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Search by candidate name, target role, GitHub or LeetCode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          minHeight: 280
        }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--rose-subtle)',
              border: '1px solid var(--rose-border)',
              color: 'var(--rose)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && evaluations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{
                width: 44,
                height: 44,
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px'
              }} />
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Retrieving your audit records...</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>Connecting to MongoDB Atlas</div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              border: '1px dashed var(--border-medium)',
              borderRadius: 12,
              background: '#fafbfc'
            }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: 'var(--text-muted)'
              }}>
                <History size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                {searchQuery ? 'No matching audits found' : 'No evaluations saved yet'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 16px' }}>
                {searchQuery 
                  ? 'Try searching with different keywords or clear your search query.'
                  : 'Run your first 360° candidate evaluation with resume and developer IDs. The full analysis, ATS score, and roadmap will be saved here automatically.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Evaluations List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((item) => {
              const isSelected = item.id === currentEvaluationId;
              const isLoadingThis = loadingDetailId === item.id;
              const isDeletingThis = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => !isLoadingThis && handleSelectEvaluation(item.id)}
                  className="card-solid"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    position: 'relative',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                    background: isSelected ? 'var(--primary-subtle)' : '#ffffff',
                    transition: 'all 0.18s ease',
                    opacity: isDeletingThis ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                    {/* Left: Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {item.candidate_name || 'Candidate Evaluation'}
                        </span>
                        {isSelected && (
                          <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                            Currently Active
                          </span>
                        )}
                        <span className="badge badge-slate" style={{ fontSize: '0.68rem' }}>
                          <Calendar size={11} />
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span>Target Role: <strong style={{ color: 'var(--text-main)' }}>{item.target_role || 'General Software Engineer'}</strong></span>
                        {item.headline && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--text-muted)' }}>{item.headline}</span>
                          </>
                        )}
                      </div>

                      {/* Signals & Handles */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {item.github_username && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Code size={12} color="var(--primary)" />
                            GitHub: <strong>@{item.github_username}</strong>
                          </span>
                        )}
                        {item.leetcode_username && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Award size={12} color="var(--amber)" />
                            LeetCode: <strong>@{item.leetcode_username}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Scores & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Holistic Quotient Badge */}
                        <div style={{
                          textAlign: 'center',
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: item.holistic_score >= 80 ? 'var(--emerald-subtle)' : 'var(--sky-subtle)',
                          border: `1px solid ${item.holistic_score >= 80 ? 'var(--emerald-border)' : '#bae6fd'}`,
                        }}>
                          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: item.holistic_score >= 80 ? 'var(--emerald)' : 'var(--sky)' }}>
                            360° Quotient
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: item.holistic_score >= 80 ? 'var(--emerald)' : 'var(--sky)' }}>
                            {item.holistic_score}<span style={{ fontSize: '0.7rem' }}>/100</span>
                          </div>
                        </div>

                        {/* Resume ATS Badge */}
                        <div style={{
                          textAlign: 'center',
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)',
                        }} className="hide-on-mobile">
                          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                            ATS Match
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {item.resume_overall_score}<span style={{ fontSize: '0.7rem' }}>/100</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={(e) => handleDeleteEvaluation(e, item.id)}
                          disabled={isDeletingThis}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--rose)',
                            borderRadius: 6,
                            padding: '5px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'background 0.15s ease'
                          }}
                          title="Delete from history"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rose-subtle)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={13} />
                        </button>

                        <button
                          className="btn-brand"
                          disabled={isLoadingThis}
                          style={{
                            padding: '5px 12px',
                            fontSize: '0.78rem',
                            borderRadius: 6,
                          }}
                        >
                          {isLoadingThis ? (
                            <span>Loading Report...</span>
                          ) : (
                            <>
                              <span>Restore Report</span>
                              <ArrowRight size={13} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#fafbfc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Clicking <strong>Restore Report</strong> loads the full 360° dashboard, action roadmap, ATS insights & copilot context.
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '5px 14px', fontSize: '0.8rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
