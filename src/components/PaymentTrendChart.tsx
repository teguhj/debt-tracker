'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Debt, Payment } from '@/lib/supabase';

interface PaymentTrendChartProps {
  debts: Debt[];
  payments: Payment[];
}

export default function PaymentTrendChart({ debts, payments }: PaymentTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (
      canvasRef.current &&
      debts.length > 0 &&
      payments.length > 0
    ) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const sortedPayments = [...payments].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const paymentsByDate: Record<string, number> = {};

      sortedPayments.forEach((p) => {
        if (!paymentsByDate[p.date]) {
          paymentsByDate[p.date] = 0;
        }
        paymentsByDate[p.date] += p.amount;
      });

      const dates = Object.keys(paymentsByDate).slice(-8);
      const amounts = dates.map((d) => paymentsByDate[d]);

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates.map((d) => d.substring(5)),
            datasets: [
              {
                label: '상환액',
                data: amounts,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                labels: {
                  font: { size: 10, weight: 'bold' },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  font: { size: 9 },
                },
              },
              x: {
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
  }, [debts, payments]);

  if (payments.length === 0) {
    return null;
  }

  return <canvas ref={canvasRef} height="40"></canvas>;
}
