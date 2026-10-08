import React from 'react';

export default function ScoreGauge({ score = 0, size = 110, strokeWidth = 8, label = "", subtext = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(Number(score) || 0, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = '#2563eb';
  if (clampedScore >= 80) {
    color = '#059669';
  } else if (clampedScore >= 60) {
    color = '#2563eb';
  } else if (clampedScore >= 45) {
    color = '#d97706';
  } else {
    color = '#e11d48';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border-medium, #e2e8f0)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s ease',
            }}
          />
        </svg>

        {/* Center score */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className="font-display" style={{
            fontSize: size > 90 ? '1.8rem' : '1.3rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1
          }}>
            {Math.round(clampedScore)}
          </span>
          {label && (
            <span style={{
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: 2
            }}>
              {label}
            </span>
          )}
        </div>
      </div>
      {subtext && (
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
