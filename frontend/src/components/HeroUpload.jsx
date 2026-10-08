import React, { useState, useRef } from 'react';
import { Upload, FileCheck, Code, AlertCircle, ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function HeroUpload({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [githubUser, setGithubUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setValidationError('');
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setValidationError('Please upload a PDF resume.');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    setValidationError('');
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setValidationError('Please upload a PDF resume.');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setValidationError('Please upload your Resume PDF (Mandatory).');
      return;
    }
    if (!githubUser.trim()) {
      setValidationError('GitHub username is mandatory for developer signal verification.');
      return;
    }
    if (!leetcodeUser.trim()) {
      setValidationError('LeetCode username is mandatory for DSA readiness assessment.');
      return;
    }
    setValidationError('');
    onAnalyze({
      file,
      githubUsername: githubUser.trim(),
      leetcodeUsername: leetcodeUser.trim(),
    });
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 780,
      margin: '36px auto 64px',
      padding: '0 20px'
    }}>
      {/* Header & Eyebrow */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--primary-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 14px',
          borderRadius: 20,
          marginBottom: 16
        }}>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Multi-Signal Candidate Intelligence
          </span>
        </div>

        <h1 className="font-display" style={{
          fontSize: 'clamp(1.9rem, 4.2vw, 2.75rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.18,
          letterSpacing: '-0.035em',
          marginBottom: 14
        }}>
          Verify skills, audit ATS score, & build your career roadmap
        </h1>

        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-secondary)',
          maxWidth: 620,
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Upload your resume to audit ATS syntax compliance, cross-verify declared skills against live GitHub & LeetCode telemetry, and unlock personalized action plans.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="card-solid" style={{ padding: '36px 36px 32px' }}>
        <form onSubmit={handleSubmit}>
          {/* PDF Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--primary)' : file ? 'var(--emerald)' : 'var(--border-medium)'}`,
              background: isDragOver ? 'var(--primary-subtle)' : file ? 'var(--emerald-subtle)' : 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: 24
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--emerald-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <FileCheck size={26} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {(file.size / 1024).toFixed(1)} KB • Document parsed & ready
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--rose)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 4,
                    textDecoration: 'underline'
                  }}
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <Upload size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: 4 }}>
                    Drop your Resume PDF here, or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Standard PDF format up to 10MB • Text-layer & single/multi-column compatible
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Profiles Grid (GitHub + LeetCode) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
            marginBottom: 24
          }}>
            {/* GitHub Username */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: 8
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GithubIcon size={15} color="var(--text-secondary)" />
                  <span>GitHub Username</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>*</span>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Public Code Signals</span>
              </label>

              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. octocat"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* LeetCode Username */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: 8
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Code size={15} color="var(--text-secondary)" />
                  <span>LeetCode Username</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>*</span>
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DSA Problem Telemetry</span>
              </label>

              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. leetcoder"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--rose-subtle)',
              border: '1px solid var(--rose-border)',
              color: 'var(--rose)',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: 20
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            paddingTop: 8,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              <Shield size={14} color="var(--emerald)" />
              <span>Private analysis • Your code and resume are never stored</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                height: 46,
                padding: '0 28px',
                fontSize: '0.92rem',
                minWidth: 220
              }}
            >
              <span>{isLoading ? 'Running Audit Pipeline...' : 'Audit Developer Profile'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
