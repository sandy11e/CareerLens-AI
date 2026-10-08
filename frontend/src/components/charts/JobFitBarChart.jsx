import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function JobFitBarChart({ jobs = [] }) {
  if (!jobs || jobs.length === 0) return null;

  const topJobs = jobs.slice(0, 6);

  const chartData = {
    labels: topJobs.map(j => j.title),
    datasets: [
      {
        label: 'Match Fit %',
        data: topJobs.map(j => Math.round(j.fit_score || 0)),
        backgroundColor: topJobs.map(j => {
          const score = j.fit_score || 0;
          return score >= 75 ? '#059669' : score >= 50 ? '#2563eb' : '#d97706';
        }),
        borderRadius: 4,
        barThickness: 14
      }
    ]
  };

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { display: false },
        ticks: { color: isDark ? '#f1f5f9' : '#334155', font: { family: 'Inter', size: 11, weight: '500' } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (context) => ` ${context.parsed.x}% skill alignment`
        }
      }
    }
  };

  return (
    <div style={{ height: 220, position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
