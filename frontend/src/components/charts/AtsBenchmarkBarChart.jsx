import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AtsBenchmarkBarChart({ scores = {} }) {
  const metrics = [
    { label: 'ATS Compatibility', val: scores.ats_compatibility || 75 },
    { label: 'Content Quality', val: scores.content_quality || 70 },
    { label: 'Market Relevance', val: scores.market_relevance || 80 },
    { label: 'Experience Depth', val: scores.experience_depth || 65 },
    { label: 'Education Rating', val: scores.education_rating || 85 },
    { label: 'Formatting', val: scores.formatting_structure || 90 },
  ];

  const chartData = {
    labels: metrics.map(m => m.label),
    datasets: [
      {
        label: 'Candidate Score',
        data: metrics.map(m => m.val),
        backgroundColor: metrics.map(m => m.val >= 75 ? '#059669' : m.val >= 60 ? '#2563eb' : '#d97706'),
        borderRadius: 4,
        barThickness: 12,
      },
      {
        label: 'Benchmark Target (80%)',
        data: [80, 80, 80, 80, 80, 80],
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        barThickness: 12,
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#334155', font: { family: 'Inter', size: 11, weight: '500' } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 11 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 8,
        cornerRadius: 6,
      }
    }
  };

  return (
    <div style={{ height: 260, position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
