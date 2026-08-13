import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { generateTallyXML, generateTallyCSV, downloadFile } from '../utils/tallyExport.js';
import {
  Printer,
  Calendar,
  Download,
  TrendingUp,
  Award,
  Layers,
  FileCode,
  FileSpreadsheet,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Paperclip,
  ChevronDown,
  Sparkles,
  DollarSign,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// On-palette colors matching app design system
const PAYMENT_MODE_COLORS: Record<string, string> = {
  CASH: '#8C2F22',   // Kumkum / Maroon
  UPI: '#15803D',    // Emerald Green
  CARD: '#C99A3D',   // Turmeric / Gold
  BANK: '#1E3A8A'    // Deep Navy
};

const OFFERING_KIND_COLORS: Record<string, string> = {
  NEW_SEVA: '#8C2F22',         // Kumkum / Maroon
  SHASHWATA_SEVA: '#C99A3D',   // Turmeric / Gold
  HUNDI_COLLECTION: '#15803D', // Emerald Green
  KIND_DONATION: '#D97706'     // Amber / Ochre
};

const PALETTE_ARRAY = ['#8C2F22', '#15803D', '#C99A3D', '#1E3A8A', '#D97706', '#9E7422', '#7E22CE'];

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || (user as any)?.isCentralAdmin;

  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'custom' | 'expenditures'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filterKind, setFilterKind] = useState<string>('ALL');
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>('ALL');

  const [dateAutoAdjusted, setDateAutoAdjusted] = useState(false);

  const latestReceiptQuery = useQuery({
    queryKey: ['latest-receipt-date'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/receipts?limit=1');
        const list = res.data.data || res.data || [];
        if (Array.isArray(list) && list.length > 0 && list[0].createdAt) {
          return new Date(list[0].createdAt).toISOString().split('T')[0];
        }
      } catch (e) {
        // ignore
      }
      return null;
    }
  });

  // Consolidated Export Dropdown state
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary Period Queries
  const dailyQuery = useQuery({
    queryKey: ['report-daily', selectedDate, filterKind, filterPaymentMode],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/daily?date=${selectedDate}&kind=${filterKind}&paymentMode=${filterPaymentMode}`);
      return res.data.data;
    },
    enabled: reportType === 'daily'
  });

  useEffect(() => {
    if (!dateAutoAdjusted && latestReceiptQuery.data && dailyQuery.isSuccess && dailyQuery.data?.totalReceipts === 0) {
      if (latestReceiptQuery.data !== selectedDate) {
        setSelectedDate(latestReceiptQuery.data);
        setDateAutoAdjusted(true);
      }
    }
  }, [latestReceiptQuery.data, dailyQuery.isSuccess, dailyQuery.data?.totalReceipts, selectedDate, dateAutoAdjusted]);

  const monthlyQuery = useQuery({
    queryKey: ['report-monthly', selectedYear, selectedMonth, filterKind, filterPaymentMode],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/monthly?year=${selectedYear}&month=${selectedMonth}&kind=${filterKind}&paymentMode=${filterPaymentMode}`);
      return res.data.data;
    },
    enabled: reportType === 'monthly'
  });

  const customQuery = useQuery({
    queryKey: ['report-custom', startDate, endDate, filterKind, filterPaymentMode],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/custom?startDate=${startDate}&endDate=${endDate}&kind=${filterKind}&paymentMode=${filterPaymentMode}`);
      return res.data.data;
    },
    enabled: reportType === 'custom'
  });

  const financialBalanceQuery = useQuery({
    queryKey: ['report-financial-balance'],
    queryFn: async () => {
      const res = await apiClient.get('/reports/financial-balance');
      return res.data.data;
    },
    enabled: reportType === 'expenditures'
  });

  // Prior Period Calculation for Trend Deltas
  const priorDate = new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split('T')[0];
  const priorYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const priorMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;

  const diffDays = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  const priorStartDate = new Date(new Date(startDate).getTime() - (diffDays + 1) * 86400000).toISOString().split('T')[0];
  const priorEndDate = new Date(new Date(startDate).getTime() - 86400000).toISOString().split('T')[0];

  const priorDailyQuery = useQuery({
    queryKey: ['report-daily-prior', priorDate, filterKind, filterPaymentMode],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/daily?date=${priorDate}&kind=${filterKind}&paymentMode=${filterPaymentMode}`);
      return res.data.data;
    },
    enabled: reportType === 'daily' && !!dailyQuery.data
  });

  const priorMonthlyQuery = useQuery({
    queryKey: ['report-monthly-prior', priorYear, priorMonth, filterKind, filterPaymentMode],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/monthly?year=${priorYear}&month=${priorMonth}&kind=${filterKind}&paymentMode=${filterPaymentMode}`);
      return res.data.data;
    },
    enabled: reportType === 'monthly' && !!monthlyQuery.data
  });

  const priorCustomQuery = useQuery({
    queryKey: ['report-custom-prior', priorStartDate, priorEndDate, filterKind, filterPaymentMode],
    queryFn: async () => {
      const res = await apiClient.get(`/reports/custom?startDate=${priorStartDate}&endDate=${priorEndDate}&kind=${filterKind}&paymentMode=${filterPaymentMode}`);
      return res.data.data;
    },
    enabled: reportType === 'custom' && !!customQuery.data
  });

  const reportData = reportType === 'daily' ? dailyQuery.data : reportType === 'monthly' ? monthlyQuery.data : reportType === 'custom' ? customQuery.data : null;
  const priorData = reportType === 'daily' ? priorDailyQuery.data : reportType === 'monthly' ? priorMonthlyQuery.data : reportType === 'custom' ? priorCustomQuery.data : null;
  const isLoading = reportType === 'daily' ? dailyQuery.isLoading : reportType === 'monthly' ? monthlyQuery.isLoading : reportType === 'custom' ? customQuery.isLoading : false;

  const handlePrintReport = () => {
    window.print();
  };

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

  // Exports
  const handleExportTallyXML = () => {
    setExportOpen(false);
    if (!reportData?.receipts || reportData.receipts.length === 0) {
      alert('No receipt vouchers found in this report period for Tally XML export.');
      return;
    }
    const xmlContent = generateTallyXML(reportData.receipts, `Collection Report (${reportType === 'daily' ? selectedDate : `${selectedYear}-${selectedMonth}`})`);
    downloadFile(xmlContent, `tally_vouchers_${reportType}_${selectedDate || selectedYear}.xml`, 'application/xml');
  };

  const handleExportTallyCSV = () => {
    setExportOpen(false);
    if (!reportData?.receipts || reportData.receipts.length === 0) {
      alert('No receipt vouchers found in this report period for Tally CSV export.');
      return;
    }
    const csvContent = generateTallyCSV(reportData.receipts);
    downloadFile(csvContent, `tally_vouchers_${reportType}_${selectedDate || selectedYear}.csv`, 'text/csv');
  };

  const handleExportCSV = () => {
    setExportOpen(false);
    if (!reportData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Collection Report - ${reportType.toUpperCase()}\n`;
    csvContent += `Date/Period,${reportType === 'daily' ? selectedDate : `${selectedYear}-${selectedMonth}`}\n`;
    csvContent += `Total Receipts,${reportData.totalReceipts}\n`;
    csvContent += `Grand Total (INR),${reportData.grandTotal}\n\n`;

    csvContent += 'Payment Mode,Receipt Count,Total Amount (INR)\n';
    Object.entries(reportData.byPaymentMode || {}).forEach(([mode, d]: [string, any]) => {
      csvContent += `${mode},${d.count},${d.amount}\n`;
    });

    if (reportType === 'monthly' && reportData.dailyBreakdown) {
      csvContent += '\nDaily Breakdown Date,Total Amount (INR)\n';
      reportData.dailyBreakdown.forEach((row: any) => {
        csvContent += `${row.date},${row.totalAmount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `temple_collection_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scope Pill Text Formatting
  const getScopePillText = () => {
    if (reportType === 'daily') {
      const d = new Date(selectedDate);
      const formatted = isNaN(d.getTime()) ? selectedDate : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Daily Report · ${formatted}`;
    } else if (reportType === 'monthly') {
      const m = new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      return `Monthly Report · ${m}`;
    } else if (reportType === 'custom') {
      const s = new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const e = new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Custom Period · ${s} – ${e}`;
    }
    return `Admin Financial Audit & Surplus`;
  };

  // Trend Delta Calculator
  const getTrendDelta = (currentVal: number, priorVal: number | undefined) => {
    if (priorVal === undefined || priorVal === null || priorVal <= 0) return null;
    const diff = currentVal - priorVal;
    const pct = (diff / priorVal) * 100;
    if (isNaN(pct) || !isFinite(pct)) return null;

    const periodLabel = reportType === 'daily' ? 'yesterday' : reportType === 'monthly' ? 'last month' : 'prior period';
    const isUp = pct >= 0;

    return {
      isUp,
      text: `${isUp ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}% vs ${periodLabel}`
    };
  };

  // Seva-Level Drilldown & Highlights Aggregation
  const getSevaLevelBreakdown = () => {
    if (!reportData?.receipts) return [];
    const sevaMap = new Map<string, { name: string; kind: string; count: number; amount: number }>();

    for (const receipt of reportData.receipts) {
      if (!receipt.items || receipt.items.length === 0) {
        const key = receipt.kind === 'HUNDI_COLLECTION' ? 'Direct Hundi Collection' : 'General Temple Kanike';
        const existing = sevaMap.get(key) || { name: key, kind: receipt.kind, count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += Number(receipt.totalAmount || 0);
        sevaMap.set(key, existing);
      } else {
        for (const item of receipt.items) {
          const key = item.description || 'General Offering';
          const existing = sevaMap.get(key) || { name: key, kind: receipt.kind, count: 0, amount: 0 };
          existing.count += Number(item.quantity || 1);
          existing.amount += Number(item.amount || 0) * Number(item.quantity || 1);
          sevaMap.set(key, existing);
        }
      }
    }

    return Array.from(sevaMap.values()).sort((a, b) => b.amount - a.amount);
  };

  const sevaBreakdown = getSevaLevelBreakdown();

  // Highlights Card Data
  const getHighlightsData = () => {
    if (!reportData?.receipts || reportData.receipts.length === 0) return null;

    let largestReceipt = reportData.receipts[0];
    for (const r of reportData.receipts) {
      if (Number(r.totalAmount) > Number(largestReceipt.totalAmount)) {
        largestReceipt = r;
      }
    }

    const mostBookedSeva = sevaBreakdown.length > 0
      ? [...sevaBreakdown].sort((a, b) => b.count - a.count)[0]
      : null;

    return {
      largestReceipt,
      mostBookedSeva
    };
  };

  const highlights = getHighlightsData();

  // Payment Mode Donut Chart Data
  const paymentModeChartData = Object.entries(reportData?.byPaymentMode || {}).map(([mode, d]: [string, any]) => ({
    name: mode,
    value: Number(d.amount),
    count: d.count,
    color: PAYMENT_MODE_COLORS[mode] || '#9E7422'
  }));

  return (
    <div className="space-y-6">
      {/* Title, Scope Indicator & Consolidated Export Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-2xl font-bold text-kumkum">Collection Reports & Financial Insights</h2>
            {/* Persistent Report Scope Indicator Pill */}
            <span className="inline-flex items-center gap-1.5 bg-ivory border border-turmeric/30 text-kumkum px-3 py-1 rounded-full font-bold text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-kumkum" />
              {getScopePillText()}
            </span>
          </div>
          <p className="text-xs text-textInk/60 mt-1">
            Comprehensive audit report breakdown by payment mode, date period, and Tally Prime XML/CSV exports.
          </p>
        </div>

        {/* Consolidated Export Controls (Only 2 buttons: Export Dropdown + Print Report) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto no-print">
          {/* Export Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              disabled={!reportData || isLoading}
              className="bg-kumkum hover:bg-kumkum-light text-ivory font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-md disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-turmeric/30 shadow-xl z-50 py-1.5 text-xs animate-fadeIn">
                <button
                  onClick={handleExportTallyXML}
                  disabled={!reportData?.receipts || reportData.receipts.length === 0}
                  className="w-full px-4 py-2.5 text-left font-semibold text-textInk hover:bg-ivory flex items-center gap-2 disabled:opacity-40"
                >
                  <FileCode className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-bold block">Tally XML Export</span>
                    <span className="text-[10px] text-textInk/50">Vouchers format (.xml)</span>
                  </div>
                </button>

                <button
                  onClick={handleExportTallyCSV}
                  disabled={!reportData?.receipts || reportData.receipts.length === 0}
                  className="w-full px-4 py-2.5 text-left font-semibold text-textInk hover:bg-ivory flex items-center gap-2 border-t border-turmeric/10 disabled:opacity-40"
                >
                  <FileSpreadsheet className="w-4 h-4 text-turmeric-dark" />
                  <div>
                    <span className="font-bold block">Tally CSV Export</span>
                    <span className="text-[10px] text-textInk/50">Spreadsheet format (.csv)</span>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={!reportData}
                  className="w-full px-4 py-2.5 text-left font-semibold text-textInk hover:bg-ivory flex items-center gap-2 border-t border-turmeric/10 disabled:opacity-40"
                >
                  <Download className="w-4 h-4 text-kumkum" />
                  <div>
                    <span className="font-bold block">Export Summary CSV</span>
                    <span className="text-[10px] text-textInk/50">Audit summary (.csv)</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Secondary Outlined Print Button */}
          <button
            onClick={handlePrintReport}
            className="bg-white border border-turmeric/40 text-kumkum font-bold px-4 py-2 rounded-xl text-xs hover:bg-ivory transition-colors flex items-center gap-1.5 shadow-xs"
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
            <button
              onClick={() => setReportType('custom')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                reportType === 'custom' ? 'bg-kumkum text-ivory shadow-sm' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
              }`}
            >
              📅 Custom Date Range
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

        {reportType === 'daily' && (
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
        )}

        {reportType === 'monthly' && (
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

        {reportType === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-4 h-4 text-kumkum" />
            <span className="font-semibold text-textInk">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
            />
            <span className="font-semibold text-textInk">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
            />
          </div>
        )}

        {reportType !== 'expenditures' && (
          <div className="flex flex-wrap items-center gap-3 border-t border-turmeric/10 pt-3 mt-1 w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-kumkum">Offering Type:</span>
              <select
                value={filterKind}
                onChange={(e) => setFilterKind(e.target.value)}
                className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none font-semibold text-textInk"
              >
                <option value="ALL">All Offering Kinds (Seva, Hundi, Dravya)</option>
                <option value="NEW_SEVA">Regular Seva Only</option>
                <option value="SHASHWATA_SEVA">Shashwata Seva Only</option>
                <option value="HUNDI_COLLECTION">Hundi & Direct Income Only</option>
                <option value="KIND_DONATION">In-Kind (Dravya) Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-kumkum">Payment Mode:</span>
              <select
                value={filterPaymentMode}
                onChange={(e) => setFilterPaymentMode(e.target.value)}
                className="px-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none font-semibold text-textInk"
              >
                <option value="ALL">All Modes (Cash, UPI, Card, Bank)</option>
                <option value="CASH">Cash Only</option>
                <option value="UPI">UPI / Dynamic QR Only</option>
                <option value="CARD">Card Only</option>
                <option value="BANK">Direct Bank Transfer Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Report Body */}
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
                  <span>Total Operational Expenditures (Excl. Petty Cash)</span>
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                </div>
                <p className="font-mono text-3xl font-bold text-red-700 mt-1">
                  ₹{Number(financialBalanceQuery.data.totalExpenditure || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-textInk/50 font-medium">Operational expenses only (Petty Cash excluded)</p>
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

            {/* Income Head Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-kumkum">Income Head & Offering Stream Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {Object.entries(financialBalanceQuery.data.byKind || {}).map(([k, data]: [string, any]) => {
                  const label = k === 'NEW_SEVA' ? 'Regular Seva Income'
                    : k === 'SHASHWATA_SEVA' ? 'Shashwata Seva Corpus'
                    : k === 'HUNDI_COLLECTION' ? '💰 Hundi & Direct Income'
                    : 'In-Kind / Dravya';
                  return (
                    <div key={k} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-1">
                      <p className="font-bold text-emerald-950 text-xs">{label}</p>
                      <p className="font-mono font-bold text-emerald-700 text-lg">₹{Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[11px] text-emerald-800/70 font-semibold">{data.count} receipts</p>
                    </div>
                  );
                })}
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
          {/* Stat Cards with Trend Deltas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Total Receipts Issued */}
            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-textInk/60">Total Receipts Issued</p>
                <h3 className="font-mono text-3xl font-bold text-kumkum mt-1">{reportData.totalReceipts}</h3>
                {/* Trend Delta Line */}
                {(() => {
                  const delta = getTrendDelta(reportData.totalReceipts, priorData?.totalReceipts);
                  if (!delta) return null;
                  return (
                    <p className={`text-[11px] font-bold mt-1 ${delta.isUp ? 'text-emerald-700' : 'text-red-700'}`}>
                      {delta.text}
                    </p>
                  );
                })()}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-kumkum/10 border border-kumkum/20 flex items-center justify-center text-kumkum shrink-0">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Grand Total Collection */}
            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-textInk/60">Grand Total Collection (₹)</p>
                <h3 className="font-mono text-3xl font-bold text-kumkum mt-1">
                  ₹{Number(reportData.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                {/* Trend Delta Line */}
                {(() => {
                  const delta = getTrendDelta(Number(reportData.grandTotal), priorData ? Number(priorData.grandTotal) : undefined);
                  if (!delta) return null;
                  return (
                    <p className={`text-[11px] font-bold mt-1 ${delta.isUp ? 'text-emerald-700' : 'text-red-700'}`}>
                      {delta.text}
                    </p>
                  );
                })()}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-turmeric/10 border border-turmeric/30 flex items-center justify-center text-turmeric-dark shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Average Receipt Value */}
            <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm sm:col-span-2 lg:col-span-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-textInk/60">Average Receipt Value</p>
                <h3 className="font-mono text-3xl font-bold text-ink mt-1">
                  ₹{reportData.totalReceipts > 0 ? (Number(reportData.grandTotal) / reportData.totalReceipts).toFixed(2) : '0.00'}
                </h3>
                {/* Trend Delta Line */}
                {(() => {
                  const currentAvg = reportData.totalReceipts > 0 ? Number(reportData.grandTotal) / reportData.totalReceipts : 0;
                  const priorAvg = priorData && priorData.totalReceipts > 0 ? Number(priorData.grandTotal) / priorData.totalReceipts : undefined;
                  const delta = getTrendDelta(currentAvg, priorAvg);
                  if (!delta) return null;
                  return (
                    <p className={`text-[11px] font-bold mt-1 ${delta.isUp ? 'text-emerald-700' : 'text-red-700'}`}>
                      {delta.text}
                    </p>
                  );
                })()}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-ivory border border-turmeric/20 flex items-center justify-center text-textInk/70 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Highlights Card (Feature 7) */}
          {highlights && (
            <div className="bg-gradient-to-r from-ivory to-white p-5 rounded-2xl border border-turmeric/30 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-turmeric/20">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">LARGEST SINGLE RECEIPT</span>
                  <p className="font-mono text-lg font-bold text-kumkum mt-0.5">
                    ₹{Number(highlights.largestReceipt.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-textInk font-semibold mt-0.5">
                    {highlights.largestReceipt.devotee?.name || 'Anonymous Devotee'}
                    {highlights.largestReceipt.items?.[0]?.description ? ` (${highlights.largestReceipt.items[0].description})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-turmeric/20">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">MOST BOOKED SEVA</span>
                  <p className="font-display text-base font-bold text-emerald-950 mt-0.5">
                    {highlights.mostBookedSeva?.name || 'Regular Seva'}
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                    {highlights.mostBookedSeva?.count || 0} bookings · ₹{Number(highlights.mostBookedSeva?.amount || 0).toLocaleString('en-IN')} total collection
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Mode Breakdown: Donut Chart + Table (Feature 4 & 5) */}
          <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
              <h3 className="font-display text-base font-bold text-kumkum flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-kumkum" />
                <span>Collection Breakdown by Payment Mode</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-5 flex flex-col items-center">
                {paymentModeChartData.length > 0 ? (
                  <div className="w-full h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentModeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {paymentModeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-bold text-textInk/50 uppercase">TOTAL</span>
                      <span className="font-mono text-sm font-bold text-kumkum">
                        ₹{Number(reportData.grandTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-textInk/50">No data available for chart</p>
                )}

                {/* Custom HTML Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
                  {paymentModeChartData.map((d) => {
                    const sharePct = Number(reportData.grandTotal) > 0
                      ? ((d.value / Number(reportData.grandTotal)) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div key={d.name} className="flex items-center gap-1.5 font-medium text-textInk">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="font-bold">{d.name}:</span>
                        <span className="text-textInk/70">{sharePct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="lg:col-span-7 overflow-x-auto">
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
                      const rowColor = PAYMENT_MODE_COLORS[mode] || '#9E7422';
                      return (
                        <tr key={mode} className="hover:bg-ivory/30">
                          <td className="p-3 font-bold text-textInk flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rowColor }} />
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
                                <div className="h-full rounded-full" style={{ width: `${sharePct}%`, backgroundColor: rowColor }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Offering Head Breakdown Table (Feature 5) */}
          <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
              <h3 className="font-display text-base font-bold text-kumkum">Collection Breakdown by Offering Head</h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
                <tr>
                  <th className="p-3">Offering Kind / Head</th>
                  <th className="p-3 text-center">Receipt Count</th>
                  <th className="p-3 text-right">Total Amount (₹)</th>
                  <th className="p-3 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-dark/60">
                {Object.entries(reportData.byKind || {}).map(([k, data]: [string, any]) => {
                  const label = k === 'NEW_SEVA' ? 'Regular Seva Income'
                    : k === 'SHASHWATA_SEVA' ? 'Shashwata Seva Corpus Fund'
                    : k === 'HUNDI_COLLECTION' ? '💰 Hundi & Direct Temple Income'
                    : 'In-Kind / Dravya Offering';
                  const sharePct = Number(reportData.grandTotal) > 0
                    ? ((Number(data.amount) / Number(reportData.grandTotal)) * 100).toFixed(1)
                    : '0.0';
                  const rowColor = OFFERING_KIND_COLORS[k] || '#8C2F22';
                  return (
                    <tr key={k} className="hover:bg-ivory/30">
                      <td className="p-3 font-bold text-textInk flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rowColor }} />
                        {label}
                      </td>
                      <td className="p-3 text-center font-semibold">{data.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-kumkum">
                        ₹{Number(data.amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-textInk/80 font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <span>{sharePct}%</span>
                          <div className="w-16 bg-ivory rounded-full h-2 overflow-hidden border border-turmeric/20">
                            <div className="h-full rounded-full" style={{ width: `${sharePct}%`, backgroundColor: rowColor }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Seva-Level Drilldown Table (Feature 6) */}
          <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
              <h3 className="font-display text-base font-bold text-kumkum flex items-center gap-2">
                <Layers className="w-4 h-4 text-kumkum" />
                <span>Seva-Level & Offering Line Item Drilldown</span>
              </h3>
              <span className="text-xs text-textInk/50 font-mono font-semibold">{sevaBreakdown.length} unique offerings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
                  <tr>
                    <th className="p-3">Seva Name / Item Description</th>
                    <th className="p-3">Offering Kind</th>
                    <th className="p-3 text-center">Bookings / Qty</th>
                    <th className="p-3 text-right">Total Amount (₹)</th>
                    <th className="p-3 text-right">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-dark/60">
                  {sevaBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-textInk/50 italic">No line items found for this period.</td>
                    </tr>
                  ) : (
                    sevaBreakdown.map((seva, idx) => {
                      const sharePct = Number(reportData.grandTotal) > 0
                        ? ((seva.amount / Number(reportData.grandTotal)) * 100).toFixed(1)
                        : '0.0';
                      const rowColor = PALETTE_ARRAY[idx % PALETTE_ARRAY.length];
                      return (
                        <tr key={seva.name} className="hover:bg-ivory/30">
                          <td className="p-3 font-bold text-textInk flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: rowColor }} />
                            {seva.name}
                          </td>
                          <td className="p-3 text-textInk/70 font-semibold uppercase text-[10px]">
                            {seva.kind.replace(/_/g, ' ')}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-textInk">{seva.count}</td>
                          <td className="p-3 text-right font-mono font-bold text-kumkum">
                            ₹{seva.amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-mono text-textInk/80 font-bold">
                            <div className="flex items-center justify-end gap-2">
                              <span>{sharePct}%</span>
                              <div className="w-16 bg-ivory rounded-full h-2 overflow-hidden border border-turmeric/20">
                                <div className="h-full rounded-full" style={{ width: `${sharePct}%`, backgroundColor: rowColor }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
