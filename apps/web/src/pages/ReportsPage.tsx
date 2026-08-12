import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { generateTallyXML, generateTallyCSV, downloadFile } from '../utils/tallyExport.js';
import { Printer, Calendar, Download, TrendingUp, DollarSign, Award, Layers, FileCode, FileSpreadsheet, Wallet, ArrowDownRight, ArrowUpRight, Paperclip } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || (user as any)?.isCentralAdmin;

  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'expenditures'>('daily');
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

  // Admin Expenditures & Financial Surplus Query
  const financialBalanceQuery = useQuery({
    queryKey: ['report-financial-balance'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/financial-balance');
      return res.data.data;
    },
    enabled: reportType === 'expenditures'
  });

  const handlePrintReport = () => {
    window.print();
  };

  const reportData = reportType === 'daily' ? dailyQuery.data : monthlyQuery.data;
  const isLoading = reportType === 'daily' ? dailyQuery.isLoading : monthlyQuery.isLoading;

  const setPresetDate = (type: 'today' | 'yesterday' | 'thisMonth') => {
    const today = new Date();
    if (type === 'today') {
      setReportType('daily');
      setSelectedDate(today.toISOString().split('T')[0]);
    } else if (type === 'yesterday') {
      setReportType('daily');
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(yesterday.toISOString().split('T')[0]);
    } else if (type === 'thisMonth') {
      setReportType('monthly');
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth() + 1);
    }
  };

  const handleExportTallyXML = () => {
    if (!reportData?.receipts || reportData.receipts.length === 0) {
      alert('No receipt vouchers found in this report period for Tally XML export.');
      return;
    }
    const xmlContent = generateTallyXML(reportData.receipts, `Collection Report (${reportType === 'daily' ? selectedDate : `${selectedYear}-${selectedMonth}`})`);
    downloadFile(xmlContent, `tally_vouchers_${reportType}_${selectedDate || selectedYear}.xml`, 'application/xml');
  };

  const handleExportTallyCSV = () => {
    if (!reportData?.receipts || reportData.receipts.length === 0) {
      alert('No receipt vouchers found in this report period for Tally CSV export.');
      return;
    }
    const csvContent = generateTallyCSV(reportData.receipts);
    downloadFile(csvContent, `tally_vouchers_${reportType}_${selectedDate || selectedYear}.csv`, 'text/csv');
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Collection Report - ${reportType.toUpperCase()}\n`;
    csvContent += `Date/Period,${reportType === 'daily' ? selectedDate : `${selectedYear}-${selectedMonth}`}\n`;
    csvContent += `Total Receipts,${reportData.totalReceipts}\n`;
    csvContent += `Grand Total (INR),${reportData.grandTotal}\n\n`;
    
    csvContent += "Payment Mode,Receipt Count,Total Amount (INR)\n";
    Object.entries(reportData.byPaymentMode || {}).forEach(([mode, d]: [string, any]) => {
      csvContent += `${mode},${d.count},${d.amount}\n`;
    });

    if (reportType === 'monthly' && reportData.dailyBreakdown) {
      csvContent += "\nDaily Breakdown Date,Total Amount (INR)\n";
      reportData.dailyBreakdown.forEach((row: any) => {
        csvContent += `${row.date},${row.totalAmount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `temple_collection_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum">Collection Reports & Financial Insights</h2>
          <p className="text-xs text-textInk/60 mt-1">
            Comprehensive audit report breakdown by payment mode, date period, and Tally Prime XML/CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto no-print">
          <button
            onClick={handleExportTallyXML}
            disabled={!reportData?.receipts || reportData.receipts.length === 0 || isLoading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40"
            title="Export Tally Prime XML Vouchers format for direct import"
          >
            <FileCode className="w-3.5 h-3.5" />
            Tally XML Export
          </button>

          <button
            onClick={handleExportTallyCSV}
            disabled={!reportData?.receipts || reportData.receipts.length === 0 || isLoading}
            className="bg-turmeric-dark hover:bg-kumkum text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40"
            title="Export Tally CSV Spreadsheet Vouchers format"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Tally CSV Export
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!reportData || isLoading}
            className="bg-white border border-turmeric/30 text-kumkum font-semibold px-3 py-2 rounded-xl text-xs hover:bg-kumkum/5 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export Summary CSV
          </button>

          <button
            onClick={handlePrintReport}
            className="bg-kumkum hover:bg-kumkum-light text-ivory font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Selector Tabs & Presets */}
      <div className="no-print bg-white p-4 rounded-2xl border border-turmeric/20 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border-r border-turmeric/20 pr-4">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                reportType === 'daily' ? 'bg-kumkum text-ivory shadow-sm' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                reportType === 'monthly' ? 'bg-kumkum text-ivory shadow-sm' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
              }`}
            >
              Monthly Report
            </button>
            {isAdmin && (
              <button
                onClick={() => setReportType('expenditures')}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  reportType === 'expenditures' ? 'bg-kumkum text-ivory shadow-sm' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
                }`}
              >
                Expenditures & Surplus (Admin)
              </button>
            )}
          </div>

          {/* Quick Filter Presets */}
          <div className="hidden md:flex items-center gap-1.5 pl-2">
            <span className="text-[11px] font-semibold text-textInk/50 mr-1">Quick Presets:</span>
            <button
              onClick={() => setPresetDate('today')}
              className="px-2.5 py-1 rounded-lg border border-turmeric/20 bg-ivory text-textInk/80 hover:bg-kumkum/10 text-[11px] font-semibold transition"
            >
              Today
            </button>
            <button
              onClick={() => setPresetDate('yesterday')}
              className="px-2.5 py-1 rounded-lg border border-turmeric/20 bg-ivory text-textInk/80 hover:bg-kumkum/10 text-[11px] font-semibold transition"
            >
              Yesterday
            </button>
            <button
              onClick={() => setPresetDate('thisMonth')}
              className="px-2.5 py-1 rounded-lg border border-turmeric/20 bg-ivory text-textInk/80 hover:bg-kumkum/10 text-[11px] font-semibold transition"
            >
              This Month
            </button>
          </div>
        </div>

        {reportType === 'daily' ? (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-kumkum" />
            <span className="font-semibold text-textInk">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-kumkum" />
            <span className="font-semibold text-textInk">Year & Month:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none"
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
      {reportType === 'expenditures' ? (
        financialBalanceQuery.isLoading ? (
          <div className="p-12 text-center text-kumkum font-semibold flex items-center justify-center gap-2 bg-white rounded-2xl border border-turmeric/20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
            Loading Admin Expenditure & Net Balance Audit Report...
          </div>
        ) : financialBalanceQuery.data ? (
          <div className="space-y-6">
            {/* Top Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-textInk/60">
                  <span>Total Collection Income</span>
                  <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="font-mono text-3xl font-bold text-emerald-700 mt-1">
                  ₹{Number(financialBalanceQuery.data.totalCollections || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-textInk/50 font-medium">From {financialBalanceQuery.data.totalReceiptsCount || 0} total receipts</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-textInk/60">
                  <span>Total Temple Expenditures</span>
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                </div>
                <p className="font-mono text-3xl font-bold text-red-700 mt-1">
                  ₹{Number(financialBalanceQuery.data.totalExpenditure || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-textInk/50 font-medium">Across {financialBalanceQuery.data.totalExpensesCount || 0} expense vouchers</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-1 bg-gradient-to-br from-white to-ivory">
                <div className="flex items-center justify-between text-xs font-bold text-kumkum">
                  <span>Net Fund Surplus / Remaining Balance</span>
                  <Wallet className="w-5 h-5 text-kumkum" />
                </div>
                <p className={`font-mono text-3xl font-bold mt-1 ${
                  Number(financialBalanceQuery.data.netRemainingBalance || 0) >= 0 ? 'text-kumkum' : 'text-red-600'
                }`}>
                  ₹{Number(financialBalanceQuery.data.netRemainingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-textInk/50 font-medium">Net remaining balance after all expenses</p>
              </div>
            </div>

            {/* Category Expenditure Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-kumkum">Expenditure Category Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                {Object.entries(financialBalanceQuery.data.byCategory || {}).map(([cat, data]: [string, any]) => (
                  <div key={cat} className="p-3 bg-ivory/50 rounded-xl border border-turmeric/20 space-y-0.5">
                    <p className="font-semibold text-textInk/70 capitalize text-[11px]">{cat.toLowerCase().replace(/_/g, ' ')}</p>
                    <p className="font-mono font-bold text-kumkum text-sm">₹{Number(data.amount).toFixed(0)}</p>
                    <p className="text-[10px] text-textInk/50">{data.count} items</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Expenditures Vouchers Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-kumkum">All Expenditure Vouchers & Expense Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
                    <tr>
                      <th className="p-3">Voucher # / Date</th>
                      <th className="p-3">Title / Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                      <th className="p-3">Logged By</th>
                      <th className="p-3 text-center">Attachment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark/60">
                    {financialBalanceQuery.data.expenses?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-textInk/50 italic">No expenditure records found.</td>
                      </tr>
                    ) : (
                      financialBalanceQuery.data.expenses?.map((e: any) => (
                        <tr key={e.id} className="hover:bg-ivory/30">
                          <td className="p-3">
                            <p className="font-mono font-bold text-kumkum">{e.voucherNo || e.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-textInk/50">{new Date(e.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-3 font-semibold text-textInk">{e.title || e.description}</td>
                          <td className="p-3 text-textInk/80 font-medium capitalize">{e.category?.toLowerCase().replace(/_/g, ' ')}</td>
                          <td className="p-3 text-right font-mono font-bold text-red-700">₹{Number(e.amount).toFixed(2)}</td>
                          <td className="p-3 text-textInk/70">{e.createdByUser?.fullName || e.createdByUser?.username || '-'}</td>
                          <td className="p-3 text-center">
                            {e.attachment ? (
                              <a
                                href={e.attachment}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-kumkum hover:underline"
                              >
                                <Paperclip className="w-3.5 h-3.5" /> Bill File
                              </a>
                            ) : (
                              <span className="text-[10px] text-textInk/40">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null
      ) : isLoading ? (
        <div className="p-12 text-center text-kumkum font-semibold flex items-center justify-center gap-2 bg-white rounded-2xl border border-turmeric/20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
          Generating collection audit report...
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-textInk/60">Total Receipts Issued</p>
                <h3 className="font-mono text-3xl font-bold text-kumkum mt-1">{reportData.totalReceipts}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-kumkum/10 border border-kumkum/20 flex items-center justify-center text-kumkum">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-textInk/60">Grand Total Collection (₹)</p>
                <h3 className="font-mono text-3xl font-bold text-kumkum mt-1">
                  ₹{Number(reportData.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-turmeric/10 border border-turmeric/30 flex items-center justify-center text-turmeric-dark">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm sm:col-span-2 lg:col-span-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-textInk/60">Average Receipt Value</p>
                <h3 className="font-mono text-3xl font-bold text-ink mt-1">
                  ₹{reportData.totalReceipts > 0 ? (Number(reportData.grandTotal) / reportData.totalReceipts).toFixed(2) : '0.00'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-ivory border border-turmeric/20 flex items-center justify-center text-textInk/70">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Payment Mode Table & Distribution Bars */}
          <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
              <h3 className="font-display text-base font-bold text-kumkum">Collection Breakdown by Payment Mode</h3>
              <span className="text-xs text-textInk/50 font-mono">
                {reportType === 'daily' ? `Date: ${selectedDate}` : `Period: ${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
                <tr>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-center">Receipt Count</th>
                  <th className="p-3 text-right">Total Amount (₹)</th>
                  <th className="p-3 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-dark/60">
                {Object.entries(reportData.byPaymentMode || {}).map(([mode, data]: [string, any]) => {
                  const sharePct = Number(reportData.grandTotal) > 0 
                    ? ((Number(data.amount) / Number(reportData.grandTotal)) * 100).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={mode} className="hover:bg-ivory/30">
                      <td className="p-3 font-bold text-textInk flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-kumkum" />
                        {mode}
                      </td>
                      <td className="p-3 text-center font-semibold">{data.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-kumkum">
                        ₹{Number(data.amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-textInk/80 font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <span>{sharePct}%</span>
                          <div className="w-16 bg-ivory rounded-full h-2 overflow-hidden border border-turmeric/20">
                            <div className="bg-kumkum h-full rounded-full" style={{ width: `${sharePct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Daily Breakdown for Monthly Report */}
          {reportType === 'monthly' && reportData.dailyBreakdown && (
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
                <h3 className="font-display text-base font-bold text-kumkum flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Daily Collection Breakdown ({new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear})</span>
                </h3>
              </div>

              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark sticky top-0">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Daily Total Collection (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-dark/60">
                    {reportData.dailyBreakdown.map((row: any) => (
                      <tr key={row.date} className="hover:bg-ivory/30">
                        <td className="p-3 font-mono font-semibold text-textInk">{row.date}</td>
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
        <div className="p-8 text-center text-textInk/50 bg-white rounded-2xl border border-turmeric/20">
          No report data available for the selected range.
        </div>
      )}
    </div>
  );
};
