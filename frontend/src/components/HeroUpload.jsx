import React, { useState, useRef } from 'react';
import { Upload, FileCheck, Code, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="hero-upload-container">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 14px',
          borderRadius: 20,
          marginBottom: 16
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Candidate Intelligence & Verification
          </span>
        </div>

        <h1 className="font-display" style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.2,
          letterSpacing: '-0.03em',
          marginBottom: 12
        }}>
          Verify skills, optimize ATS score, and plan your career
        </h1>

        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-muted)',
          maxWidth: 620,
          margin: '0 auto',
          lineHeight: 1.55
        }}>
          Upload your resume to audit ATS parsing, cross-verify declared skills against live GitHub repositories and LeetCode, and get an actionable roadmap.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="card-solid" style={{ padding: '28px' }}>
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
              borderRadius: 12,
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              marginBottom: 20
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#ffffff',
                  border: '1px solid var(--emerald-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald)'
                }}>
                  <FileCheck size={24} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB • Ready for extraction
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--rose)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 2,
                    textDecoration: 'underline'
                  }}
                >
                  Change file
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Upload size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 2 }}>
                    Click to browse or drag and drop your Resume PDF
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Standard PDF format up to 10MB • Preserves layout & structure
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Profiles Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 20
          }}>
            {/* GitHub Username - Mandatory */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <GithubIcon size={19} color="#334155" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    GitHub Handle *
                  </span>
                  <span className="badge badge-rose" style={{ fontSize: '0.62rem', padding: '0 5px' }}>
                    Mandatory
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter GitHub username (e.g. sandy11e)"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    marginTop: 1,
                    padding: 0,
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>

            {/* LeetCode Username - Mandatory */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <Code size={19} color="#d97706" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    LeetCode Handle *
                  </span>
                  <span className="badge badge-rose" style={{ fontSize: '0.62rem', padding: '0 5px' }}>
                    Mandatory
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter LeetCode username (e.g. sandy11e)"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    marginTop: 1,
                    padding: 0,
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {validationError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--rose-subtle)',
              border: '1px solid var(--rose-border)',
              color: 'var(--rose)',
              fontSize: '0.84rem',
              marginBottom: 18
            }}>
              <AlertCircle size={15} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-muted)',
              fontSize: '0.78rem'
            }}>
              <CheckCircle2 size={14} color="var(--emerald)" />
              <span>Resume and engineering signals analyzed privately & securely</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.92rem' }}
            >
              <span>{isLoading ? 'Running Pipeline...' : 'Evaluate Developer Profile'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
