import React from 'react';
import { AlertCircle, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';

export default function ErrorAlert({ error, onRetry }) {
  const isGroqMissing = error?.toLowerCase().includes('groq') || error?.toLowerCase().includes('api_key');

  return (
    <div className="card-solid" style={{
      maxWidth: 680,
      margin: '40px auto',
      padding: '28px 32px',
      borderLeft: '4px solid var(--rose)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: 'var(--rose-subtle)',
          border: '1px solid var(--rose-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--rose)',
          flexShrink: 0
        }}>
          <AlertCircle size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            Processing Encountered an Issue
          </h3>
          <p style={{ color: 'var(--rose)', fontSize: '0.88rem', marginBottom: 16, lineHeight: 1.5 }}>
            {error || 'An unexpected error occurred during processing.'}
          </p>

          {isGroqMissing && (
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 18,
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontWeight: 600, marginBottom: 8 }}>
                <KeyRound size={15} />
                <span>Configuring Groq API Key:</span>
              </div>
              <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>Get a free Groq key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>console.groq.com/keys <ExternalLink size={11} style={{ display: 'inline' }} /></a></li>
                <li>Open <code style={{ color: 'var(--primary)', background: '#ffffff', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>CareerLens AI/backend/.env</code></li>
                <li>Set: <code style={{ color: 'var(--emerald)', fontWeight: 600 }}>GROQ_API_KEY=gsk_your_key_here</code></li>
                <li>Save the file and click <strong>Retry Analysis</strong> below</li>
              </ol>
            </div>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} />
              <span>Retry Evaluation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
