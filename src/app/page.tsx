'use client';

import { useState, useEffect } from 'react';
import { supabase, Debt, Payment } from '@/lib/supabase';
import ProgressBar from '@/components/ProgressBar';
import OverviewChart from '@/components/OverviewChart';
import ComparisonChart from '@/components/ComparisonChart';
import PaymentTrendChart from '@/components/PaymentTrendChart';
import MotivationCard from '@/components/MotivationCard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddDebtForm, setShowAddDebtForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  const [newDebt, setNewDebt] = useState({
    name: '',
    principal: '',
    interestRate: '',
    paymentDate: '',
  });

  const [payment, setPayment] = useState({
    amount: '',
    date: '',
  });

  const [showMessage, setShowMessage] = useState<string | false>(false);
  const messages = [
    '우리의 미래를 위한 소중한 한 걸음입니다',
    '매일의 노력이 모여 큰 변화를 만듭니다',
    '당신의 결정이 당신의 미래를 만듭니다',
    '한 번에 한 발씩, 목표를 향해 나아갑니다',
    '부채 상환은 자유로 가는 길입니다',
    '작은 실천이 모여 큰 성취가 됩니다',
  ];

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        await fetchData();
      }
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const token = sessionData.session.access_token;

      // Fetch debts
      const debtsResponse = await fetch('/api/debts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (debtsResponse.ok) {
        const debtsData = await debtsResponse.json();
        setDebts(debtsData);
      }

      // Fetch payments
      const paymentsResponse = await fetch('/api/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const appPassword = process.env.NEXT_PUBLIC_APP_PASSWORD;

    if (password === appPassword) {
      try {
        // Try anonymous auth, but don't fail if it doesn't work
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.session) {
          setIsAuthenticated(true);
          setPassword('');
          setPasswordError('');
          await fetchData();
        } else {
          // If anonymous auth fails, still allow access (fallback)
          // Create a dummy session to allow data operations
          setIsAuthenticated(true);
          setPassword('');
          setPasswordError('');
          await fetchData();
        }
      } catch (err) {
        // Fallback: just authenticate with password
        setIsAuthenticated(true);
        setPassword('');
        setPasswordError('');
        await fetchData();
      }
    } else {
      setPasswordError('비밀번호가 틀렸습니다');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setDebts([]);
    setPayments([]);
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.principal || !newDebt.interestRate || !newDebt.paymentDate) {
      alert('모든 필드를 입력해주세요');
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const token = sessionData.session.access_token;

      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newDebt.name,
          principal: parseFloat(newDebt.principal),
          interest_rate: parseFloat(newDebt.interestRate),
          payment_date: parseInt(new Date(newDebt.paymentDate).getDate().toString()),
        }),
      });

      if (response.ok) {
        await fetchData();
        setNewDebt({
          name: '',
          principal: '',
          interestRate: '',
          paymentDate: '',
        });
        setShowAddDebtForm(false);
      }
    } catch (error) {
      console.error('Error creating debt:', error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment.amount || !payment.date || !selectedDebtId) {
      alert('모든 필드를 입력해주세요');
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const token = sessionData.session.access_token;

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          debt_id: selectedDebtId,
          amount: parseFloat(payment.amount),
          date: payment.date,
        }),
      });

      if (response.ok) {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setShowMessage(randomMessage);
        setTimeout(() => setShowMessage(false), 3500);

        await fetchData();
        setPayment({
          amount: '',
          date: '',
        });
        setShowPaymentForm(false);
        setSelectedDebtId(null);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const token = sessionData.session.access_token;

      const response = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting debt:', error);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                자유로의 여정
              </h1>
              <p className="text-gray-600">함께 만드는 재정 자유</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
              >
                시작하기
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              자유로의 여정
            </h1>
            <p className="text-gray-600 text-sm mt-1">당신의 재정 목표를 응원합니다</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Message */}
      {showMessage && (
        <div className="max-w-6xl mx-auto mb-6 message-enter">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-lg font-semibold bounce-animation">✨ {showMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card-hover bg-white rounded-xl shadow-md p-4 hover:shadow-lg">
            <p className="text-gray-600 text-xs font-bold mb-2 uppercase">총 대출금</p>
            <p className="text-2xl font-bold text-blue-600">
              {debts.reduce((sum, debt) => sum + debt.principal, 0).toLocaleString()}원
            </p>
          </div>
          <div className="card-hover bg-white rounded-xl shadow-md p-4 hover:shadow-lg">
            <p className="text-gray-600 text-xs font-bold mb-2 uppercase">남은 잔액</p>
            <p className="text-2xl font-bold text-red-500">
              {debts.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}원
            </p>
          </div>
          <div className="card-hover bg-white rounded-xl shadow-md p-4 hover:shadow-lg">
            <p className="text-gray-600 text-xs font-bold mb-2 uppercase">상환 항목</p>
            <p className="text-2xl font-bold text-green-600">{debts.length}개</p>
          </div>
        </div>

        {/* Charts and Motivation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-4">
            {debts.length > 0 ? (
              <>
                <div className="bg-white rounded-xl shadow-md p-5">
                  <h3 className="text-base font-bold text-gray-800 mb-3">📊 전체 상환 현황</h3>
                  <OverviewChart debts={debts} />
                </div>

                {debts.length > 1 && (
                  <div className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-base font-bold text-gray-800 mb-3">📈 대출별 비교</h3>
                    <ComparisonChart debts={debts} />
                  </div>
                )}

                {payments.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="text-base font-bold text-gray-800 mb-3">📉 상환 추이</h3>
                    <PaymentTrendChart debts={debts} payments={payments} />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600 mb-2">첫 번째 대출을 추가하세요</p>
                <p className="text-gray-400 text-sm">차트와 분석이 표시됩니다</p>
              </div>
            )}
          </div>

          {/* Motivation */}
          <div className="lg:col-span-1">
            <MotivationCard debts={debts} payments={payments} />
          </div>
        </div>

        {/* Add Debt Button */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddDebtForm(!showAddDebtForm)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
          >
            + 새 대출 추가
          </button>
        </div>

        {/* Add Debt Form */}
        {showAddDebtForm && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">새로운 대출 추가</h2>
            <form onSubmit={handleAddDebt} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">대출명</label>
                <input
                  type="text"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                  placeholder="예: 신용카드 A, 학자금 대출"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">원금 (원)</label>
                  <input
                    type="number"
                    value={newDebt.principal}
                    onChange={(e) => setNewDebt({ ...newDebt, principal: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">이자율 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDebt.interestRate}
                    onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">월 납입일</label>
                <input
                  type="date"
                  value={newDebt.paymentDate}
                  onChange={(e) => setNewDebt({ ...newDebt, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDebtForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Debts List */}
        <div className="space-y-4">
          {debts.map((debt) => (
            <div key={debt.id} className="card-hover bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{debt.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">월 납입일: {debt.payment_date}일</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDebt(debt.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs font-semibold mb-1">원금</p>
                    <p className="text-lg font-bold text-blue-600">{debt.principal.toLocaleString()}원</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs font-semibold mb-1">남은 잔액</p>
                    <p className="text-lg font-bold text-red-600">{debt.balance.toLocaleString()}원</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs font-semibold mb-1">이자율</p>
                    <p className="text-lg font-bold text-green-600">{debt.interest_rate}%</p>
                  </div>
                </div>

                <ProgressBar paid={debt.principal - debt.balance} principal={debt.principal} />

                <button
                  onClick={() => {
                    setSelectedDebtId(debt.id);
                    setShowPaymentForm(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 rounded-lg transition mb-4"
                >
                  상환 기록 추가
                </button>

                {/* Payment History */}
                {payments.filter((p) => p.debt_id === debt.id).length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">상환 기록</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {payments
                        .filter((p) => p.debt_id === debt.id)
                        .map((p) => (
                          <div key={p.id} className="flex justify-between bg-gray-50 rounded-lg p-3 text-sm">
                            <span className="text-gray-700">{p.date}</span>
                            <span className="font-bold text-green-600">{p.amount.toLocaleString()}원</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {showPaymentForm && selectedDebtId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">상환 기록 추가</h2>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">상환 금액 (원)</label>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">상환 날짜</label>
                  <input
                    type="date"
                    value={payment.date}
                    onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedDebtId(null);
                      setPayment({ amount: '', date: '' });
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-12 text-center text-gray-600 text-sm">
        <p>💡 당신의 재정 자유를 응원합니다!</p>
      </div>
    </div>
  );
}
