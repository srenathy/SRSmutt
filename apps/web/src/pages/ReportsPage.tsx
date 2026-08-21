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
  PieChart as PieChartIcon,
  Utensils,
  Flower2,
  Zap,
  Wrench,
  AlertTriangle,
  Coins,
  Landmark,
  Building,
  Users,
  CheckCircle2,
  HelpCircle,
  FileText,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid
} from 'recharts';

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

const getCategoryIcon = (categoryName: string) => {
  const cat = categoryName.toLowerCase();
  if (cat.includes('cook') || cat.includes('kitchen')) return <Utensils className="w-5 h-5 text-kumkum" />;
  if (cat.includes('flower') || cat.includes('puja')) return <Flower2 className="w-5 h-5 text-amber-700" />;
  if (cat.includes('staff') || cat.includes('salary') || cat.includes('honorarium')) return <Users className="w-5 h-5 text-blue-700" />;
  if (cat.includes('utility') || cat.includes('electricity') || cat.includes('water') || cat.includes('office')) return <Zap className="w-5 h-5 text-amber-600" />;
  if (cat.includes('clean') || cat.includes('maintain') || cat.includes('temple')) return <Wrench className="w-5 h-5 text-emerald-700" />;
  if (cat.includes('event') || cat.includes('festival')) return <Award className="w-5 h-5 text-purple-700" />;
  return <Layers className="w-5 h-5 text-kumkum" />;
};

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || (user as any)?.isCentralAdmin;

  // Level 1 Primary Category Tabs: 'collection' | 'department-budget' | 'expenditures'
  const [activePrimaryTab, setActivePrimaryTab] = useState<'collection' | 'department-budget' | 'expenditures'>('collection');
  // Level 2 Sub-Selector (active when activePrimaryTab === 'collection'): 'daily' | 'monthly' | 'custom'
  const [collectionSubTab, setCollectionSubTab] = useState<'daily' | 'monthly' | 'custom'>('daily');
  const [expandedTileId, setExpandedTileId] = useState<string | null>(null);

  const reportType = activePrimaryTab === 'department-budget'
    ? 'department-budget'
    : activePrimaryTab === 'expenditures'
    ? 'expenditures'
    : collectionSubTab;

  const [expandedDept, setExpandedDept] = useState<string | null>(null);
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

  const departmentBudgetsQuery = useQuery({
    queryKey: ['department-budgets-report'],
    queryFn: async () => {
      const res = await apiClient.get('/department-budgets');
      return res.data.data || [];
    },
    enabled: reportType === 'department-budget'
  });

  const allExpensesQuery = useQuery({
    queryKey: ['all-expenses-report'],
    queryFn: async () => {
      const res = await apiClient.get('/expenses');
      return res.data.data || [];
    },
    enabled: reportType === 'department-budget'
  });

  const reportData = reportType === 'daily' ? dailyQuery.data : reportType === 'monthly' ? monthlyQuery.data : reportType === 'custom' ? customQuery.data : null;
  const priorData = reportType === 'daily' ? priorDailyQuery.data : reportType === 'monthly' ? priorMonthlyQuery.data : reportType === 'custom' ? priorCustomQuery.data : null;
  const isLoading = reportType === 'daily' ? dailyQuery.isLoading : reportType === 'monthly' ? monthlyQuery.isLoading : reportType === 'custom' ? customQuery.isLoading : reportType === 'department-budget' ? (departmentBudgetsQuery.isLoading || allExpensesQuery.isLoading) : false;

  const getDeptReportData = () => {
    const rawBudgets: any[] = departmentBudgetsQuery.data || [];
    const rawExpenses: any[] = allExpensesQuery.data || [];

    const currentMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    const defaultDepts = [
      { departmentName: 'Cooking', monthlyCapAmount: 40000 },
      { departmentName: 'Flowers', monthlyCapAmount: 16000 },
      { departmentName: 'Leaves & Garland', monthlyCapAmount: 10000 },
      { departmentName: 'Temple Maintenance', monthlyCapAmount: 25000 },
      { departmentName: 'Festival & Special Events', monthlyCapAmount: 30000 },
      { departmentName: 'Utilities & Office', monthlyCapAmount: 15000 },
      { departmentName: 'Staff Allowance & Honorarium', monthlyCapAmount: 35000 },
      { departmentName: 'Miscellaneous', monthlyCapAmount: 10000 }
    ];

    const deptMap = new Map<string, { departmentName: string; monthlyCapAmount: number; effectiveMonth: string }>();
    for (const d of defaultDepts) {
      deptMap.set(d.departmentName, { ...d, effectiveMonth: currentMonthKey });
    }
    for (const b of rawBudgets) {
      deptMap.set(b.departmentName, {
        departmentName: b.departmentName,
        monthlyCapAmount: Number(b.monthlyCapAmount),
        effectiveMonth: b.effectiveMonth
      });
    }

    const deptRows = Array.from(deptMap.values()).map((d) => {
      const vouchers = rawExpenses.filter((e) => {
        const isApp = e.status === 'APPROVED';
        const isDept = e.departmentName === d.departmentName || e.category === d.departmentName;
        const eMonth = e.createdAt ? new Date(e.createdAt).toISOString().slice(0, 7) : currentMonthKey;
        return isApp && isDept && eMonth === currentMonthKey;
      });

      const spent = vouchers.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const cap = d.monthlyCapAmount;
      const remaining = cap - spent;
      const utilPct = cap > 0 ? (spent / cap) * 100 : 0;
      const isOver = spent > cap;
      const overAmt = isOver ? spent - cap : 0;

      let status = 'Within Budget';
      if (isOver) status = 'Over Budget';
      else if (utilPct >= 80 || spent === cap) status = 'At Limit';

      return {
        ...d,
        spent,
        remaining,
        utilPct,
        isOver,
        overAmt,
        status,
        vouchers
      };
    });

    deptRows.sort((a, b) => b.utilPct - a.utilPct);

    const totalBudgeted = deptRows.reduce((sum, r) => sum + r.monthlyCapAmount, 0);
    const totalSpent = deptRows.reduce((sum, r) => sum + r.spent, 0);
    const overBudgetCount = deptRows.filter((r) => r.isOver).length;
    const overallUtilPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      deptRows,
      totalBudgeted,
      totalSpent,
      overBudgetCount,
      overallUtilPct
    };
  };

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

    if (activePrimaryTab === 'department-budget') {
      const { deptRows, totalBudgeted, totalSpent, overBudgetCount } = getDeptReportData();
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Department Budget Caps & Expense Audit Report (${selectedYear}-${String(selectedMonth).padStart(2, '0')})\n`;
      csvContent += `Total Monthly Budgeted (INR),${totalBudgeted}\n`;
      csvContent += `Total Spent This Month (INR),${totalSpent}\n`;
      csvContent += `Departments Over Budget,${overBudgetCount}\n\n`;
      csvContent += 'Department Name,Monthly Cap (INR),Spent (INR),Remaining (INR),Utilization %,Status,Vouchers Count,Over Budget Reasons\n';

      deptRows.forEach((r) => {
        const reasons = r.vouchers.filter((v: any) => v.overBudgetReason).map((v: any) => v.overBudgetReason).join(' | ');
        csvContent += `"${r.departmentName}",${r.monthlyCapAmount},${r.spent},${r.remaining},${r.utilPct.toFixed(1)}%,${r.status},${r.vouchers.length},"${reasons}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      downloadFile(csvContent, `department_budgets_${selectedYear}_${selectedMonth}.csv`, 'text/csv');
      return;
    }

    if (activePrimaryTab === 'expenditures') {
      if (!financialBalanceQuery.data) {
        alert('Financial balance data loading...');
        return;
      }
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Temple Financial Balance & Expenditures Audit Report\n`;
      csvContent += `Total Collections (INR),${financialBalanceQuery.data.totalCollections}\n`;
      csvContent += `Total Temple Expenditure (INR - Incl. Petty Cash),${financialBalanceQuery.data.totalExpenditure}\n`;
      csvContent += `Net Fund Surplus (INR),${financialBalanceQuery.data.netRemainingBalance}\n\n`;
      csvContent += 'Voucher Number,Date,Category,Title,Payee,Payment Mode,Amount (INR),Logged By\n';

      (financialBalanceQuery.data.expenses || []).forEach((e: any) => {
        csvContent += `"${e.voucherNo || e.id}",${new Date(e.createdAt).toLocaleDateString()},"${e.category}","${e.title || e.description}","${e.payee || ''}",${e.paymentMode},${e.amount},"${e.createdByUser?.fullName || e.createdByUser?.username || ''}"\n`;
      });

      downloadFile(csvContent, `temple_expenditures_audit_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      return;
    }

    if (!reportData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Collection Report - ${collectionSubTab.toUpperCase()}\n`;
    csvContent += `Date/Period,${collectionSubTab === 'daily' ? selectedDate : `${selectedYear}-${selectedMonth}`}\n`;
    csvContent += `Total Receipts,${reportData.totalReceipts}\n`;
    csvContent += `Grand Total (INR),${reportData.grandTotal}\n\n`;

    csvContent += 'Payment Mode,Receipt Count,Total Amount (INR)\n';
    Object.entries(reportData.byPaymentMode || {}).forEach(([mode, d]: [string, any]) => {
      csvContent += `${mode},${d.count},${d.amount}\n`;
    });

    if (collectionSubTab === 'monthly' && reportData.dailyBreakdown) {
      csvContent += '\nDaily Breakdown Date,Total Amount (INR)\n';
      reportData.dailyBreakdown.forEach((row: any) => {
        csvContent += `${row.date},${row.totalAmount}\n`;
      });
    }

    downloadFile(csvContent, `temple_collection_report_${collectionSubTab}_${Date.now()}.csv`, 'text/csv');
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
              disabled={isLoading}
              className="bg-kumkum hover:bg-kumkum-light text-ivory font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-md disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-turmeric/30 shadow-xl z-50 py-1.5 text-xs animate-fadeIn">
                <button
                  onClick={handleExportCSV}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-left font-semibold text-textInk hover:bg-ivory flex items-center gap-2 disabled:opacity-40"
                >
                  <Download className="w-4 h-4 text-kumkum" />
                  <div>
                    <span className="font-bold block">Export Summary CSV</span>
                    <span className="text-[10px] text-textInk/50">CSV Audit Spreadsheet (.csv)</span>
                  </div>
                </button>

                {activePrimaryTab === 'collection' && (
                  <>
                    <button
                      onClick={handleExportTallyXML}
                      disabled={!reportData?.receipts || reportData.receipts.length === 0}
                      className="w-full px-4 py-2.5 text-left font-semibold text-textInk hover:bg-ivory flex items-center gap-2 border-t border-turmeric/10 disabled:opacity-40"
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
                  </>
                )}
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
      {/* 2-Level Navigation Hierarchy */}
      <div className="no-print space-y-3">
        {/* Level 1: Primary Category Tabs */}
        <div className="bg-white px-4 pt-3 border-b border-turmeric/20 rounded-t-2xl shadow-xs flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => setActivePrimaryTab('collection')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
                activePrimaryTab === 'collection'
                  ? 'text-kumkum border-b-2 border-turmeric font-extrabold'
                  : 'text-textInk/60 hover:text-kumkum border-b-2 border-transparent'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-kumkum" />
              <span>Collection Reports</span>
            </button>

            <button
              onClick={() => setActivePrimaryTab('department-budget')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
                activePrimaryTab === 'department-budget'
                  ? 'text-kumkum border-b-2 border-turmeric font-extrabold'
                  : 'text-textInk/60 hover:text-kumkum border-b-2 border-transparent'
              }`}
            >
              <Layers className="w-4 h-4 text-kumkum" />
              <span>Department Budgets</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActivePrimaryTab('expenditures')}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-2 ${
                  activePrimaryTab === 'expenditures'
                    ? 'text-kumkum border-b-2 border-turmeric font-extrabold'
                    : 'text-textInk/60 hover:text-kumkum border-b-2 border-transparent'
                }`}
              >
                <Wallet className="w-4 h-4 text-kumkum" />
                <span>Expenditures & Surplus Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* Level 2 Sub-Selector (Appears ONLY when Collection Reports is active) */}
        {activePrimaryTab === 'collection' && (
          <div className="bg-white p-4 rounded-b-2xl border border-turmeric/20 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border-r border-turmeric/20 pr-4">
                <button
                  onClick={() => setCollectionSubTab('daily')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    collectionSubTab === 'daily'
                      ? 'bg-kumkum text-ivory shadow-xs'
                      : 'bg-ivory text-textInk/70 hover:bg-turmeric/10 border border-turmeric/20'
                  }`}
                >
                  Daily Report
                </button>
                <button
                  onClick={() => setCollectionSubTab('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    collectionSubTab === 'monthly'
                      ? 'bg-kumkum text-ivory shadow-xs'
                      : 'bg-ivory text-textInk/70 hover:bg-turmeric/10 border border-turmeric/20'
                  }`}
                >
                  Monthly Report
                </button>
                <button
                  onClick={() => setCollectionSubTab('custom')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    collectionSubTab === 'custom'
                      ? 'bg-kumkum text-ivory shadow-xs'
                      : 'bg-ivory text-textInk/70 hover:bg-turmeric/10 border border-turmeric/20'
                  }`}
                >
                  📅 Custom Range
                </button>
              </div>

              {/* Quick Filter Presets */}
              <div className="hidden lg:flex items-center gap-1.5 pl-2">
                <span className="text-[11px] font-semibold text-textInk/50 mr-1">Presets:</span>
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

            {/* Date Pickers */}
            {collectionSubTab === 'daily' && (
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

            {collectionSubTab === 'monthly' && (
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

            {collectionSubTab === 'custom' && (
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
          </div>
        )}
      </div>

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

      {/* Main Report Body */}
      {reportType === 'department-budget' ? (
        (() => {
          const { deptRows, totalBudgeted, totalSpent, overBudgetCount, overallUtilPct } = getDeptReportData();
          return (
            <div className="space-y-6">
              {/* Sticky Zone Sub-Nav */}
              <div className="sticky top-0 z-20 bg-ivory-light/95 backdrop-blur-sm p-3 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between no-print">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-kumkum uppercase tracking-wider">Report Zones:</span>
                  <a href="#dept-summary-strip" className="text-xs font-bold text-textInk hover:text-kumkum bg-white px-3 py-1.5 rounded-xl border border-turmeric/20 shadow-2xs">
                    1. Summary Strip
                  </a>
                  <a href="#dept-budget-table" className="text-xs font-bold text-textInk hover:text-kumkum bg-white px-3 py-1.5 rounded-xl border border-turmeric/20 shadow-2xs">
                    2. Department Budget Table
                  </a>
                  <a href="#dept-comparison-chart" className="text-xs font-bold text-textInk hover:text-kumkum bg-white px-3 py-1.5 rounded-xl border border-turmeric/20 shadow-2xs">
                    3. Cap vs Actual Comparison
                  </a>
                </div>
                <span className="text-xs font-bold text-textInk/60 font-mono">
                  {selectedYear}-{String(selectedMonth).padStart(2, '0')}
                </span>
              </div>

              {/* 1. Summary Strip (4 Cards) */}
              <div id="dept-summary-strip" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card 1: Total Budgeted */}
                <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-textInk/60">Total Monthly Budgeted</p>
                  <h3 className="font-mono text-2xl font-bold text-kumkum">
                    ₹{totalBudgeted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-textInk/50 font-medium">Combined caps for active departments</p>
                </div>

                {/* Card 2: Total Spent */}
                <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-textInk/60">Total Spent (This Month)</p>
                  <h3 className="font-mono text-2xl font-bold text-red-600">
                    ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[10px] text-textInk/50 font-medium">Sum of approved department expenditures</p>
                </div>

                {/* Card 3: Departments Over Budget */}
                <div className={`p-5 rounded-2xl border shadow-sm space-y-1 ${
                  overBudgetCount > 0 ? 'bg-red-50/70 border-red-200 text-red-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Departments Over Budget</p>
                  <h3 className={`font-mono text-2xl font-bold ${overBudgetCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {overBudgetCount} {overBudgetCount === 1 ? 'Department' : 'Departments'}
                  </h3>
                  <p className="text-[10px] opacity-70 font-medium">
                    {overBudgetCount > 0 ? 'Requires reason note audit review' : 'All departments within allocated caps'}
                  </p>
                </div>

                {/* Card 4: Overall Utilization % */}
                <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-textInk/60">Overall Utilization</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      overallUtilPct >= 100 ? 'bg-red-100 text-red-800' : overallUtilPct >= 80 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {overallUtilPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-ivory rounded-full h-2.5 overflow-hidden border border-turmeric/20">
                    <div
                      className={`h-full rounded-full transition-all ${
                        overallUtilPct >= 100 ? 'bg-red-600' : overallUtilPct >= 80 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, overallUtilPct)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-textInk/50 font-medium">Overall budget consumed</p>
                </div>
              </div>

              {/* 2. Department Budget Table */}
              <div id="dept-budget-table" className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden space-y-0">
                <div className="p-4 bg-ivory/60 border-b border-turmeric/20 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-kumkum flex items-center gap-2">
                    <Layers className="w-4 h-4 text-kumkum" />
                    <span>Department Budget Caps & Expense Tracking</span>
                  </h3>
                  <span className="text-xs font-semibold text-textInk/60">{deptRows.length} active departments</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ivory text-textInk/70 font-semibold border-b border-turmeric/20 text-[10px] uppercase">
                      <tr>
                        <th className="p-4">Department Name</th>
                        <th className="p-4 text-right">Monthly Cap (₹)</th>
                        <th className="p-4 text-right">Spent (₹)</th>
                        <th className="p-4 text-right">Remaining (₹)</th>
                        <th className="p-4">Utilization %</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Vouchers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-turmeric/10 font-medium">
                      {deptRows.map((row) => (
                        <React.Fragment key={row.departmentName}>
                          <tr className={`hover:bg-ivory/40 transition-colors ${row.isOver ? 'bg-red-50/30' : ''}`}>
                            <td className="p-4 font-bold text-textInk flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                row.status === 'Over Budget' ? 'bg-red-600' : row.status === 'At Limit' ? 'bg-amber-500' : 'bg-emerald-600'
                              }`} />
                              {row.departmentName}
                            </td>
                            <td className="p-4 text-right font-mono font-semibold text-textInk/80">
                              ₹{row.monthlyCapAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-kumkum">
                              ₹{row.spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${row.remaining < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {row.remaining < 0 ? `-₹${Math.abs(row.remaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `₹${row.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[11px] w-12 text-right">{row.utilPct.toFixed(1)}%</span>
                                <div className="w-24 bg-ivory rounded-full h-2 overflow-hidden border border-turmeric/20 shrink-0">
                                  <div
                                    className={`h-full rounded-full ${
                                      row.utilPct >= 100 ? 'bg-red-600' : row.utilPct >= 80 ? 'bg-amber-500' : 'bg-emerald-600'
                                    }`}
                                    style={{ width: `${Math.min(100, row.utilPct)}%` }}
                                  />
                                </div>
                                {row.isOver && (
                                  <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                                    +₹{row.overAmt.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                row.status === 'Over Budget'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : row.status === 'At Limit'
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {row.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => setExpandedDept(expandedDept === row.departmentName ? null : row.departmentName)}
                                className="px-3 py-1 bg-ivory hover:bg-turmeric/20 border border-turmeric/30 rounded-lg text-[11px] font-bold text-kumkum transition-colors inline-flex items-center gap-1"
                              >
                                <span>Vouchers ({row.vouchers.length})</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${expandedDept === row.departmentName ? 'rotate-180' : ''}`} />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Voucher Drilldown Row */}
                          {expandedDept === row.departmentName && (
                            <tr>
                              <td colSpan={7} className="p-4 bg-ivory/50 border-y border-turmeric/20">
                                <div className="space-y-3">
                                  <h4 className="font-bold text-xs text-kumkum flex items-center gap-1.5">
                                    <span>Vouchers Logged Under {row.departmentName}</span>
                                    <span className="text-[10px] text-textInk/60 font-mono font-normal">({row.vouchers.length} records)</span>
                                  </h4>

                                  {row.vouchers.length === 0 ? (
                                    <p className="text-xs text-textInk/50 italic p-2">No expenditure vouchers recorded for this department in current month.</p>
                                  ) : (
                                    <table className="w-full text-left text-xs bg-white rounded-xl border border-turmeric/20 overflow-hidden">
                                      <thead className="bg-ivory text-textInk/70 font-semibold border-b border-turmeric/20 text-[10px] uppercase">
                                        <tr>
                                          <th className="p-2.5">Voucher #</th>
                                          <th className="p-2.5">Date</th>
                                          <th className="p-2.5">Expense Title</th>
                                          <th className="p-2.5">Payee / Vendor</th>
                                          <th className="p-2.5">Mode</th>
                                          <th className="p-2.5 text-right">Amount (₹)</th>
                                          <th className="p-2.5">Over-Budget Reason / Notes</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-turmeric/10">
                                        {row.vouchers.map((v: any) => (
                                          <tr key={v.id} className="hover:bg-ivory/30">
                                            <td className="p-2.5 font-mono font-bold text-kumkum">{v.voucherNumber}</td>
                                            <td className="p-2.5 text-textInk/70">
                                              {new Date(v.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="p-2.5 font-bold text-textInk">{v.title}</td>
                                            <td className="p-2.5 text-textInk/80">{v.payee || '-'}</td>
                                            <td className="p-2.5">
                                              <span className="px-2 py-0.5 rounded bg-ivory border border-turmeric/20 font-bold text-[10px]">
                                                {v.paymentMode}
                                              </span>
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-red-600">
                                              ₹{Number(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-2.5 text-[11px] text-textInk/80">
                                              {v.isOverBudget ? (
                                                <span className="text-red-700 font-medium bg-red-50 p-1.5 rounded border border-red-200 block">
                                                  ⚠️ {v.overBudgetReason || 'Cap Exceeded'}
                                                </span>
                                              ) : (
                                                v.description || '-'
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Cap vs Actual Visual Comparison Chart (Recharts Proportional Scaling) */}
              <div id="dept-comparison-chart" className="bg-white rounded-2xl border border-turmeric/30 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-turmeric/20 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-kumkum flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-kumkum" />
                      <span>Department Monthly Cap vs Actual Spend Chart</span>
                    </h3>
                    <p className="text-xs text-textInk/60 mt-0.5">
                      Proportions mathematically scaled against allocated monthly caps. Label text renders outside bars to prevent clipping.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500" /> Allocated Cap
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-kumkum" /> Actual Spent
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedTileId('dept-comparison-chart')}
                      className="p-1.5 rounded-lg border border-turmeric/30 bg-ivory text-kumkum hover:bg-turmeric/20 transition-colors shadow-2xs"
                      title="Enlarge Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Proportional Recharts Bar Chart */}
                <div className="w-full h-[420px] pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptRows.map((d) => ({
                        departmentName: d.departmentName.length > 18 ? d.departmentName.slice(0, 16) + '…' : d.departmentName,
                        fullDeptName: d.departmentName,
                        'Allocated Cap': d.monthlyCapAmount,
                        'Actual Spent': d.spent,
                        isOver: d.isOver
                      }))}
                      layout="vertical"
                      margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                      barGap={4}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e6dcc4" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        stroke="#6b1616"
                        fontSize={11}
                      />
                      <YAxis
                        type="category"
                        dataKey="departmentName"
                        width={130}
                        tick={{ fontSize: 11, fontWeight: 'bold', fill: '#4A3B32' }}
                      />
                      <Tooltip
                        formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                        labelFormatter={(label, items) => items?.[0]?.payload?.fullDeptName || label}
                        contentStyle={{ backgroundColor: '#fdfaf3', borderColor: '#e6dcc4', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}
                      />
                      <Bar dataKey="Allocated Cap" fill="#FCD34D" radius={[0, 4, 4, 0]} barSize={14} />
                      <Bar dataKey="Actual Spent" fill="#8C2F22" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Department Details Cards (with Over-Budget Reason Notes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-turmeric/20">
                  {deptRows.map((d) => (
                    <div key={d.departmentName} className={`p-4 rounded-xl border transition-all ${
                      d.isOver ? 'bg-red-50/60 border-red-200' : 'bg-ivory/30 border-turmeric/20'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="font-bold text-textInk">{d.departmentName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          d.isOver ? 'bg-red-100 text-red-800 border-red-200' : d.status === 'At Limit' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {d.isOver ? `OVER BUDGET (+₹${d.overAmt.toLocaleString('en-IN')})` : d.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-textInk/70 flex items-center justify-between font-mono">
                        <span>Spent: <strong className={d.isOver ? 'text-red-600' : 'text-kumkum'}>₹{d.spent.toLocaleString('en-IN')}</strong></span>
                        <span>Cap: <strong>₹{d.monthlyCapAmount.toLocaleString('en-IN')}</strong></span>
                        <span>Util: <strong className={d.isOver ? 'text-red-600' : 'text-emerald-700'}>{d.utilPct.toFixed(1)}%</strong></span>
                      </div>

                      {d.isOver && d.vouchers.some((v: any) => v.overBudgetReason) && (
                        <div className="mt-2.5 text-[11px] bg-red-100/70 p-2 rounded-lg border border-red-200 text-red-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Over-Budget Reason:</span>
                            <span className="ml-1 font-medium">{d.vouchers.find((v: any) => v.overBudgetReason)?.overBudgetReason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      ) : reportType === 'expenditures' ? (
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
                  <span>Total Temple Expenditure (Incl. Petty Cash)</span>
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                </div>
                <p className="font-mono text-3xl font-bold text-red-700 mt-1">
                  ₹{Number(financialBalanceQuery.data.totalExpenditure || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-textInk/50 font-medium">Operational expenses + Petty Cash outlays combined</p>
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

            {/* Expenditure Category Breakdown (Sorted Descending with Icons & Progress Bars) */}
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
                <h3 className="font-display text-base font-bold text-kumkum">Expenditure Category Breakdown</h3>
                <span className="text-xs text-textInk/50 font-semibold">Sorted by amount (largest first)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                {Object.entries(financialBalanceQuery.data.byCategory || {})
                  .sort((a: any, b: any) => Number(b[1].amount) - Number(a[1].amount))
                  .map(([cat, data]: [string, any]) => {
                    const totalExp = Number(financialBalanceQuery.data.totalExpenditure || 1);
                    const pct = totalExp > 0 ? ((Number(data.amount) / totalExp) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={cat} className="p-4 bg-gradient-to-br from-ivory/60 to-white rounded-2xl border border-turmeric/30 shadow-2xs space-y-2 hover:shadow-xs transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="p-2 rounded-xl bg-ivory text-kumkum border border-turmeric/20">
                            {getCategoryIcon(cat)}
                          </span>
                          <span className="text-[10px] font-bold text-kumkum bg-kumkum/10 px-2 py-0.5 rounded-md font-mono">
                            {pct}%
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-textInk capitalize text-xs">{cat.toLowerCase().replace(/_/g, ' ')}</p>
                          <p className="font-mono font-bold text-kumkum text-lg mt-0.5">₹{Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          <p className="text-[10px] text-textInk/50 font-medium">{data.count} expense vouchers</p>
                        </div>
                        {/* Progress proportion bar */}
                        <div className="w-full bg-ivory rounded-full h-1.5 overflow-hidden border border-turmeric/20">
                          <div className="h-full bg-kumkum rounded-full transition-all" style={{ width: `${Math.min(100, Number(pct))}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Income Head Breakdown (Sorted Descending with Icons & Progress Bars) */}
            <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-turmeric/20 pb-3">
                <h3 className="font-display text-base font-bold text-kumkum">Income Head & Offering Stream Breakdown</h3>
                <span className="text-xs text-textInk/50 font-semibold">Sorted by amount (largest first)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {Object.entries(financialBalanceQuery.data.byKind || {})
                  .sort((a: any, b: any) => Number(b[1].amount) - Number(a[1].amount))
                  .map(([k, data]: [string, any]) => {
                    const label = k === 'NEW_SEVA' ? 'Regular Seva Income'
                      : k === 'SHASHWATA_SEVA' ? 'Shashwata Seva Corpus'
                      : k === 'HUNDI_COLLECTION' ? '💰 Hundi & Direct Income'
                      : 'In-Kind / Dravya';
                    const totalInc = Number(financialBalanceQuery.data.totalCollections || 1);
                    const pct = totalInc > 0 ? ((Number(data.amount) / totalInc) * 100).toFixed(1) : '0.0';
                    const cardColor = OFFERING_KIND_COLORS[k] || '#8C2F22';

                    return (
                      <div key={k} className="p-4 bg-gradient-to-br from-emerald-50/40 to-white rounded-2xl border border-emerald-200/60 shadow-2xs space-y-2 hover:shadow-xs transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="p-2 rounded-xl bg-emerald-100/60 text-emerald-800 border border-emerald-200">
                            {k === 'NEW_SEVA' ? <Award className="w-5 h-5" /> : k === 'SHASHWATA_SEVA' ? <Landmark className="w-5 h-5" /> : k === 'HUNDI_COLLECTION' ? <Coins className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                            {pct}% share
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 text-xs">{label}</p>
                          <p className="font-mono font-bold text-emerald-700 text-lg mt-0.5">₹{Number(data.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                          <p className="text-[10px] text-emerald-800/60 font-medium">{data.count} official receipts</p>
                        </div>
                        {/* Progress proportion bar */}
                        <div className="w-full bg-emerald-100/60 rounded-full h-1.5 overflow-hidden border border-emerald-200/40">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Number(pct))}%`, backgroundColor: cardColor }} />
                        </div>
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

      {/* Fullscreen Tile Enlargement Modal */}
      {expandedTileId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center no-print">
          <div className="bg-white w-full max-w-6xl rounded-3xl border border-turmeric/30 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto relative animate-fadeIn">
            <div className="flex items-center justify-between border-b border-turmeric/20 pb-4 sticky top-0 bg-white z-10">
              <h3 className="font-display text-lg font-bold text-kumkum flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-kumkum" />
                <span>Enlarged Fullscreen Report Inspection</span>
              </h3>
              <button
                type="button"
                onClick={() => setExpandedTileId(null)}
                className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-kumkum/10 text-kumkum font-bold transition-colors border border-turmeric/30 flex items-center gap-1.5 text-xs shadow-xs"
              >
                <Minimize2 className="w-4 h-4" /> Close Fullscreen
              </button>
            </div>

            <div className="pt-2">
              {expandedTileId === 'dept-comparison-chart' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-kumkum">Department Monthly Cap vs Actual Spend Chart (Enlarged)</h4>
                  <div className="w-full h-[520px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getDeptReportData().deptRows.map((d) => ({
                          departmentName: d.departmentName,
                          'Allocated Cap': d.monthlyCapAmount,
                          'Actual Spent': d.spent
                        }))}
                        layout="vertical"
                        margin={{ top: 10, right: 60, left: 20, bottom: 10 }}
                        barGap={6}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e6dcc4" />
                        <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#6b1616" fontSize={12} />
                        <YAxis type="category" dataKey="departmentName" width={180} tick={{ fontSize: 13, fontWeight: 'bold', fill: '#4A3B32' }} />
                        <Tooltip formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name]} contentStyle={{ backgroundColor: '#fdfaf3', borderColor: '#e6dcc4', borderRadius: '12px' }} />
                        <Bar dataKey="Allocated Cap" fill="#FCD34D" radius={[0, 4, 4, 0]} barSize={18} />
                        <Bar dataKey="Actual Spent" fill="#8C2F22" radius={[0, 4, 4, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
