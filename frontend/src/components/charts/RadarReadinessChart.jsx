import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarReadinessChart({ data }) {
  if (!data) return null;

  const scores = data.scores || {};
  const dev = data.developer_readiness || {};
  const cross = data.cross_verification || {};

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  const chartData = {
    labels: [
      'ATS Compatibility',
      'Code Quality',
      'DSA / Problem Solving',
      'Consistency',
      'Collaboration',
      'Portfolio Trust'
    ],
    datasets: [
      {
        label: 'Candidate Competency',
        data: [
          scores.ats_compatibility || 70,
          dev.engineering_score || 60,
          dev.dsa_score || 50,
          dev.consistency_score || 65,
          dev.collaboration_score || 55,
          cross.trust_score || 75
        ],
        backgroundColor: isDark ? 'rgba(129, 140, 248, 0.25)' : 'rgba(37, 99, 235, 0.15)',
        borderColor: isDark ? '#818cf8' : '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: isDark ? '#818cf8' : '#2563eb',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: isDark ? '#818cf8' : '#2563eb',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Benchmark Target (80%)',
        data: [80, 80, 80, 80, 80, 80],
        backgroundColor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.2)',
        borderColor: isDark ? '#64748b' : '#94a3b8',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: isDark ? '#223048' : '#e2e8f0',
        },
        grid: {
          color: isDark ? '#1a253a' : '#f1f5f9',
        },
        pointLabels: {
          color: isDark ? '#cbd5e1' : '#334155',
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: isDark ? '#64748b' : '#94a3b8',
          stepSize: 20,
          font: { size: 9 }
        },
        suggestedMin: 0,
        suggestedMax: 100,
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: 'Inter', size: 11, weight: '500' },
          padding: 12,
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8,
      }
    }
  };

  return (
    <div style={{ height: 310, position: 'relative' }}>
      <Radar data={chartData} options={options} />
    </div>
  );
}
