import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { IndianRupee, Banknote, Smartphone, CreditCard, HeartHandshake, TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/summary');
      return res.data.data;
    },
    refetchInterval: 30000
  });

  const formattedDateString = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const dayOfWeekString = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-kumkum font-semibold">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
          Loading dashboard metrics...
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
        Failed to load collection metrics. Please verify API server connection.
      </div>
    );
  }

  const todayTotal = Number(summary.todayTotal || 0);
  const monthTotal = Number(summary.monthTotal || 0);
  const monthExpenses = Number(summary.monthExpenses || 0);
  const currentMonthOperatingBalance = Number(summary.currentMonthOperatingBalance || 0);
  const previousCarriedDeficit = Number(summary.previousCarriedDeficit || 0);
  const netEarnings = Number(summary.netEarnings || 0);
  const pendingExpensesCount = Number(summary.pendingExpensesCount || 0);

  const cashTotal = Number(summary.paymentModeBreakdown?.CASH || 0);
  const upiTotal = Number(summary.paymentModeBreakdown?.UPI || 0);
  const cardTotal = Number(summary.paymentModeBreakdown?.CARD || 0);
  const bankTotal = Number(summary.paymentModeBreakdown?.BANK || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. DASHBOARD HEADER BANNER */}
      <div className="no-print space-y-0">
        {/* a) Shloka band */}
        <div className="bg-[#6b1616] rounded-t-[10px] px-[20px] py-[8px] text-left">
          <span className="text-[13px] font-semibold text-[#e8c98a] tracking-wider">
            || ಶ್ರೀ ಗೋಪಿನಾಥಾಯ ವಿಜಯತೇ ||
          </span>
        </div>

        {/* b) Title panel */}
        <div className="bg-[#fbf6ec] border border-[#e6dcc4] border-t-0 rounded-b-[10px] p-[20px] text-left space-y-0.5">
          <h1 className="font-display font-medium text-[22px] text-[#4a1010] leading-tight">
            Dashboard overview
          </h1>
          <p className="text-[13px] text-[#8a7a5c]">
            Real-time seva income, expenditures and net earnings
          </p>
        </div>
      </div>

      {/* PENDING EXPENSE APPROVAL ALERT BANNER */}
      {pendingExpensesCount > 0 && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Action Required: There are <strong className="font-bold">{pendingExpensesCount}</strong> high-value expenditure voucher(s) exceeding approval threshold awaiting Admin Approval!
            </span>
          </div>
          <a
            href="/dashboard/expenses"
            className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition-all shrink-0"
          >
            Review Expenditures
          </a>
        </div>
      )}

      {/* 2. FINANCIAL CALCULATION SUMMARY (INCOME, EXPENDITURES, DEFICIT CARRY-FORWARD & NET PROFIT) */}
      {user?.role === 'ADMIN' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income Card */}
            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-textInk/60">Total Income (This Month)</p>
                <h3 className="font-mono text-2xl font-bold text-emerald-700 mt-1">
                  ₹{monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] font-semibold text-textInk/50 mt-1">Sevas, Hundi, Dravya, Shashwata</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Total Expenditure Card (Excludes Petty Cash) */}
            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-textInk/60">Operational Expenditure (Excl. Petty Cash)</p>
                <h3 className="font-mono text-2xl font-bold text-red-600 mt-1">
                  ₹{monthExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] font-semibold text-textInk/50 mt-1">Cook Salary, Flowers, Maintenance etc. (Petty Cash NOT included)</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            {/* Carried Deficit Card */}
            <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm flex items-center justify-between bg-amber-50/40">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Carried Deficit (Prior Months)</p>
                <h3 className="font-mono text-2xl font-bold text-amber-800 mt-1">
                  ₹{previousCarriedDeficit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] font-semibold text-amber-900/60 mt-1">Deficit brought forward to clear</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Net Profit / Surplus Card */}
            <div className="bg-gradient-to-br from-kumkum to-kumkum-dark text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ivory/80">
                  {netEarnings >= 0 ? 'Net Temple Profit / Surplus' : 'Net Temple Deficit'}
                </p>
                <h3 className="font-mono text-2xl font-bold text-ivory mt-1">
                  ₹{netEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] font-semibold text-turmeric mt-1">
                  {previousCarriedDeficit > 0
                    ? `(Monthly Balance ₹${currentMonthOperatingBalance.toLocaleString('en-IN')}) - (Carried Deficit ₹${previousCarriedDeficit.toLocaleString('en-IN')})`
                    : 'Monthly Surplus after expenses'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-ivory/20 text-ivory flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TODAY'S COLLECTION & PAYMENT MODE BREAKDOWN */}
      <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-kumkum">Payment Mode Breakdown (This Month)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-ivory/50 p-4 rounded-xl border border-turmeric/20">
            <div className="flex justify-center text-kumkum mb-1"><Banknote className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-textInk/60">CASH</p>
            <p className="font-mono font-bold text-base text-textInk mt-1">
              ₹{cashTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-ivory/50 p-4 rounded-xl border border-turmeric/20">
            <div className="flex justify-center text-purple-600 mb-1"><Smartphone className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-textInk/60">UPI</p>
            <p className="font-mono font-bold text-base text-textInk mt-1">
              ₹{upiTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-ivory/50 p-4 rounded-xl border border-turmeric/20">
            <div className="flex justify-center text-orange-600 mb-1"><CreditCard className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-textInk/60">CARD</p>
            <p className="font-mono font-bold text-base text-textInk mt-1">
              ₹{cardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-ivory/50 p-4 rounded-xl border border-turmeric/20">
            <div className="flex justify-center text-emerald-600 mb-1"><IndianRupee className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-textInk/60">BANK TRANSFER</p>
            <p className="font-mono font-bold text-base text-textInk mt-1">
              ₹{bankTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* 4. 14-DAY COLLECTION TREND CHART */}
      <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm">
        <h3 className="font-display font-bold text-base text-kumkum mb-6">
          14-Day Collection Trend (₹)
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.last14DaysTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFE3CE" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#241811' }} />
              <YAxis tick={{ fontSize: 11, fill: '#241811' }} />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Collection']}
                contentStyle={{ backgroundColor: '#1C120C', color: '#EFE3CE', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="amount" fill="#8C2F22" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
