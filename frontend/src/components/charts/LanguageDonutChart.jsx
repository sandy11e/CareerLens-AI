import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777', '#0284c7', '#0d9488', '#ea580c'
];

export default function LanguageDonutChart({ repos = [] }) {
  if (!repos || repos.length === 0) return null;

  // Aggregate language counts
  const langCounts = {};
  repos.forEach((r) => {
    const lang = r.language || 'Other';
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const labels = Object.keys(langCounts);
  const dataValues = Object.values(langCounts);
  const total = dataValues.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: labels.map((_, idx) => PALETTE[idx % PALETTE.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#334155',
          font: { family: 'Inter', size: 11, weight: '500' },
          padding: 8,
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const count = context.parsed;
            const pct = Math.round((count / total) * 100);
            return ` ${context.label}: ${count} repos (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: 210, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
