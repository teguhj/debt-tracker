'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Debt } from '@/lib/supabase';

interface ComparisonChartProps {
  debts: Debt[];
}

export default function ComparisonChart({ debts }: ComparisonChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (canvasRef.current && debts.length > 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: debts.map((d) =>
              d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name
            ),
            datasets: [
              {
                label: '원금',
                data: debts.map((d) => d.principal),
                backgroundColor: '#3b82f6',
                borderRadius: 5,
                borderSkipped: false,
              },
              {
                label: '남은 잔액',
                data: debts.map((d) => d.balance),
                backgroundColor: '#ef4444',
                borderRadius: 5,
                borderSkipped: false,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  font: { size: 10, weight: 'bold' },
                  padding: 8,
                },
              },
            },
            scales: {
              x: {
                stacked: false,
                ticks: {
                  font: { size: 9 },
                },
              },
              y: {
                ticks: {
                  font: { size: 9 },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [debts]);

  return (
    <div style={{ height: `${Math.max(150, debts.length * 35)}px` }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
