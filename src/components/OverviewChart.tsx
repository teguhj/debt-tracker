'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Debt } from '@/lib/supabase';

interface OverviewChartProps {
  debts: Debt[];
}

export default function OverviewChart({ debts }: OverviewChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (canvasRef.current && debts.length > 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const totalPrincipal = debts.reduce((sum, d) => sum + d.principal, 0);
      const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
      const totalPaid = totalPrincipal - totalBalance;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['상환됨', '남은 잔액'],
            datasets: [
              {
                data: [totalPaid, totalBalance],
                backgroundColor: ['#10b981', '#fca5a5'],
                borderColor: ['#059669', '#dc2626'],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { size: 10, weight: 'bold' },
                  padding: 10,
                  usePointStyle: true,
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

  return <canvas ref={canvasRef} height="40"></canvas>;
}
