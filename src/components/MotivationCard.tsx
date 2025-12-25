'use client';

import { Debt, Payment } from '@/lib/supabase';

interface MotivationCardProps {
  debts: Debt[];
  payments: Payment[];
}

export default function MotivationCard({
  debts,
  payments,
}: MotivationCardProps) {
  const quotes = [
    { text: '작은 시작이 큰 변화를 만듭니다', emoji: '⭐' },
    { text: '당신의 노력은 반드시 보상받을 것입니다', emoji: '💪' },
    { text: '오늘의 결정이 내일의 자유를 만듭니다', emoji: '🌈' },
    { text: '매일 한 발씩 목표에 가까워지고 있습니다', emoji: '🎯' },
    { text: '부채 상환은 당신의 가장 현명한 투자입니다', emoji: '✨' },
    { text: '함께라면 불가능은 없습니다', emoji: '🌟' },
    { text: '당신은 충분히 잘하고 있습니다', emoji: '💝' },
    { text: '금전 자유는 당신의 손에 있습니다', emoji: '🔓' },
  ];

  const today = new Date();
  const quoteIndex = today.getDate() % quotes.length;
  const todayQuote = quotes[quoteIndex];

  // 다음 납입일 계산
  const getUpcomingPayments = () => {
    const upcomingPayments: Array<{
      name: string;
      date: Date;
      daysUntil: number;
      balance: number;
    }> = [];
    debts.forEach((debt) => {
      const paymentDay = debt.payment_date;
      const nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);
      if (nextPayment < today) {
        nextPayment.setMonth(nextPayment.getMonth() + 1);
      }
      const daysUntil = Math.ceil(
        (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      upcomingPayments.push({
        name: debt.name,
        date: nextPayment,
        daysUntil,
        balance: debt.balance,
      });
    });
    return upcomingPayments.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 2);
  };

  // 이번 달 상환액
  const getThisMonthPayments = () => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let total = 0;
    payments.forEach((payment) => {
      const paymentDate = new Date(payment.date);
      if (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      ) {
        total += payment.amount;
      }
    });
    return total;
  };

  const upcomingPayments = getUpcomingPayments();
  const monthlyTotal = getThisMonthPayments();

  return (
    <div className="space-y-4 fade-in">
      {/* 오늘의 명언 */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-sm text-blue-100 mb-2">오늘의 응원</p>
        <p className="text-2xl font-bold mb-3">{todayQuote.emoji}</p>
        <p className="text-lg font-semibold leading-relaxed">{todayQuote.text}</p>
      </div>

      {/* 다음 납입 예정 */}
      {upcomingPayments.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md p-5 border-l-4 border-orange-500">
          <p className="text-sm font-bold text-orange-700 mb-3">📅 다음 납입 예정</p>
          <div className="space-y-2">
            {upcomingPayments.map((payment, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white rounded-lg p-3"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{payment.name}</p>
                  <p className="text-xs text-gray-600">
                    {payment.date.toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{payment.daysUntil}일</p>
                  <p className="text-xs text-gray-600">{payment.balance.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이번 달 상환액 */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-5 border-l-4 border-green-500">
        <p className="text-sm font-bold text-green-700 mb-3">💚 이번 달 상환액</p>
        <p className="text-3xl font-bold text-green-600">{monthlyTotal.toLocaleString()}원</p>
        <p className="text-xs text-gray-600 mt-2">당신의 노력이 모이고 있습니다</p>
      </div>
    </div>
  );
}
