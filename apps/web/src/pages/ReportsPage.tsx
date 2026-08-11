import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Printer, Calendar } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Daily Query
  const dailyQuery = useQuery({
    queryKey: ['report-daily', selectedDate],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/daily?date=${selectedDate}`);
      return res.data.data;
    },
    enabled: reportType === 'daily'
  });

  // Monthly Query
  const monthlyQuery = useQuery({
    queryKey: ['report-monthly', selectedYear, selectedMonth],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/monthly?year=${selectedYear}&month=${selectedMonth}`);
      return res.data.data;
    },
    enabled: reportType === 'monthly'
  });

  const handlePrintReport = () => {
    window.print();
  };

  const reportData = reportType === 'daily' ? dailyQuery.data : monthlyQuery.data;
  const isLoading = reportType === 'daily' ? dailyQuery.isLoading : monthlyQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum">Collection Reports</h2>
          <p className="text-xs text-textInk/60 mt-1">Audit report breakdowns by payment mode and seva offering kind.</p>
        </div>

        <button
          onClick={handlePrintReport}
          className="no-print bg-kumkum hover:bg-kumkum-light text-ivory font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="no-print bg-white p-4 rounded-2xl border border-turmeric/20 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 border-r border-turmeric/20 pr-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              reportType === 'daily' ? 'bg-kumkum text-ivory shadow-sm' : 'bg-ivory text-textInk/70'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              reportType === 'monthly' ? 'bg-kumkum text-ivory shadow-sm' : 'bg-ivory text-textInk/70'
            }`}
          >
            Monthly Report
          </button>
        </div>

        {reportType === 'daily' ? (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-kumkum" />
            <span className="font-semibold text-textInk">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-kumkum" />
            <span className="font-semibold text-textInk">Year & Month:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Report Summary Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-kumkum font-semibold flex items-center justify-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
          Generating collection report...
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm">
              <p className="text-xs font-semibold text-textInk/60">Total Receipts Issued</p>
              <h3 className="font-mono text-3xl font-bold text-kumkum mt-1">{reportData.totalReceipts}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm">
              <p className="text-xs font-semibold text-textInk/60">Grand Total Collection (₹)</p>
              <h3 className="font-mono text-3xl font-bold text-kumkum mt-1">
                ₹{Number(reportData.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Payment Mode Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6">
            <h3 className="font-display text-base font-bold text-kumkum mb-4">Collection by Payment Mode</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
                <tr>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-center">Receipt Count</th>
                  <th className="p-3 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-dark/60">
                {Object.entries(reportData.byPaymentMode || {}).map(([mode, data]: [string, any]) => (
                  <tr key={mode}>
                    <td className="p-3 font-bold text-textInk">{mode}</td>
                    <td className="p-3 text-center">{data.count}</td>
                    <td className="p-3 text-right font-mono font-bold text-kumkum">
                      ₹{Number(data.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daily Breakdown for Monthly Report */}
          {reportType === 'monthly' && reportData.dailyBreakdown && (
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6">
              <h3 className="font-display text-base font-bold text-kumkum mb-4">Daily Collection Breakdown</h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark sticky top-0">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Total Collection (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark/60">
                    {reportData.dailyBreakdown.map((row: any) => (
                      <tr key={row.date}>
                        <td className="p-3 font-mono font-semibold">{row.date}</td>
                        <td className="p-3 text-right font-mono font-bold text-kumkum">
                          ₹{Number(row.totalAmount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-textInk/50">No report data available.</div>
      )}
    </div>
  );
};
