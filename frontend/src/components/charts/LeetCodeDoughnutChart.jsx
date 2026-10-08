import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LeetCodeDoughnutChart({ leetcode }) {
  if (!leetcode) return null;

  const easy = leetcode.easy || 0;
  const medium = leetcode.medium || 0;
  const hard = leetcode.hard || 0;
  const total = easy + medium + hard || 1;

  const chartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [easy, medium, hard],
        backgroundColor: [
          '#059669', // Emerald
          '#d97706', // Amber
          '#e11d48'  // Rose
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          font: { family: 'Inter', size: 11, weight: '500' },
          padding: 10,
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
            return ` ${context.label}: ${count} problems (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: 180, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      {/* Center count */}
      <div style={{
        position: 'absolute',
        top: '42%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {total === 1 && !easy && !medium && !hard ? 0 : total}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
          Solved
        </div>
      </div>
    </div>
  );
}
