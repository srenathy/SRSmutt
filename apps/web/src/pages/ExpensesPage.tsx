import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '@temple/shared';
import {
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt as ReceiptIcon,
  FileText,
  Check,
  X,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Paperclip,
  Download,
  Coins,
  Building,
  Landmark,
  PiggyBank
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'EXPENDITURES' | 'UNBILLED_INCOMES' | 'PETTY_CASH'>('EXPENDITURES');

  // Expense states
  const [expenses, setExpenses] = useState<any[]>([]);
  const [temple, setTemple] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isPettyCashModal, setIsPettyCashModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Unbilled Income states
  const [unbilledIncomes, setUnbilledIncomes] = useState<any[]>([]);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [incomeSubmitting, setIncomeSubmitting] = useState(false);

  const [incomeFormData, setIncomeFormData] = useState({
    title: '',
    category: 'Main Temple Kanike Hundi Box Opening',
    amount: '',
    paymentMode: 'CASH',
    sankalpaNote: ''
  });

  // Attachment states
  const [attachment, setAttachment] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const [formData, setFormData] = useState({
    category: 'Puja Materials & Flowers',
    title: '',
    amount: '',
    payee: '',
    paymentMode: 'CASH',
    description: ''
  });

  const isPettyCashCat = (cat?: string) => {
    if (!cat) return false;
    const lower = cat.toLowerCase();
    return lower.includes('petty cash') || lower.includes('pettycash') || lower.includes('daily allowance');
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/expenses');
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnbilledIncomes = async () => {
    try {
      const res = await apiClient.get('/receipts?limit=100');
      const receipts = res.data.data?.data || res.data.data || [];
      setUnbilledIncomes(receipts.filter((r: any) => r.kind === 'HUNDI_COLLECTION'));
    } catch (err) {
      console.error('Failed to fetch unbilled incomes:', err);
    }
  };

  const fetchTemple = async () => {
    try {
      const res = await apiClient.get('/temple');
      setTemple(res.data.data);
    } catch (err) {
      console.error('Failed to fetch temple info:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchTemple();
    fetchUnbilledIncomes();
  }, []);

  const handleOpenModal = (pettyMode = false) => {
    setIsPettyCashModal(pettyMode);
    setFormData({
      category: pettyMode ? 'Petty Cash & Daily Outlay' : 'Puja Materials & Flowers',
      title: '',
      amount: '',
      payee: '',
      paymentMode: 'CASH',
      description: ''
    });
    setAttachment(null);
    setModalOpen(true);
  };

  const handleOpenIncomeModal = () => {
    setIncomeFormData({
      title: '',
      category: 'Main Temple Kanike Hundi Box Opening',
      amount: '',
      paymentMode: 'CASH',
      sankalpaNote: ''
    });
    setAttachment(null);
    setIncomeModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setCompressing(true);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setAttachment(compressedBase64);
          setCompressing(false);
        };
        img.onerror = () => {
          setAttachment(event.target?.result as string);
          setCompressing(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment(event.target?.result as string);
        setCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewAttachment = (item: any) => {
    setSelectedExpense(item);
    setPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (compressing) {
      alert('Please wait for file compression to finish.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
        attachment: attachment || null
      });
      alert(
        res.data.data.status === 'PENDING'
          ? 'Bill / Request submitted successfully and sent to Admin for review!'
          : 'Expense logged and approved successfully!'
      );
      setModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeFormData.title.trim()) {
      alert('Income Source / Description is required.');
      return;
    }
    if (!incomeFormData.amount || Number(incomeFormData.amount) <= 0) {
      alert('Please enter a valid positive income amount.');
      return;
    }

    setIncomeSubmitting(true);
    try {
      await apiClient.post('/receipts', {
        kind: 'HUNDI_COLLECTION',
        paymentMode: incomeFormData.paymentMode,
        items: [
          {
            description: `[${incomeFormData.category}] ${incomeFormData.title}`,
            amount: Number(incomeFormData.amount),
            quantity: 1,
            devoteeCount: 1
          }
        ],
        sankalpaNote: incomeFormData.sankalpaNote || 'Direct Unbilled Temple Income Entry'
      });

      alert('Direct Temple Income logged successfully! Added to income and financial reports.');
      setIncomeModalOpen(false);
      fetchUnbilledIncomes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log direct income');
    } finally {
      setIncomeSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.put(`/expenses/${id}/approve`);
      fetchExpenses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve expense');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.put(`/expenses/${id}/reject`);
      fetchExpenses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense bill/request?')) return;
    try {
      await apiClient.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const categories = [
    'Puja Materials & Flowers',
    'Cook & Kitchen Staff Salary',
    'Staff Salary & Honorarium',
    'Electricity & Water Utility',
    'Temple Cleaning & Maintenance',
    'Special Event & Festival',
    'Miscellaneous'
  ];

  const incomeCategories = [
    'Main Temple Kanike Hundi Box Opening',
    'Rayaru Sannidhi Kanike Hundi Box',
    'Mula Rama Devara Kanike Box',
    'Annadana Trust Hundi Box',
    'Direct Bank Fixed Deposit Interest',
    'Temple Land / Building Lease Rent',
    'Direct Temple In-Kind / Dravya Donation'
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  // Separate Operational Expenses vs Petty Cash Expenses
  const operationalExpenses = expenses.filter((e) => !isPettyCashCat(e.category));
  const pettyCashExpenses = expenses.filter((e) => isPettyCashCat(e.category));

  const totalSpentOperationalThisMonth = operationalExpenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return e.status === 'APPROVED' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalSpentPettyThisMonth = pettyCashExpenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return e.status === 'APPROVED' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalUnbilledIncomeThisMonth = unbilledIncomes
    .filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + Number(r.totalAmount), 0);

  const walletLimit = Number(temple?.monthlyExpenseBudget) || 5000;
  const remainingPettyBalance = walletLimit - totalSpentPettyThisMonth;
  const thresholdLimit = Number(temple?.expenseApprovalThreshold) || 5000;

  return (
    <div className="space-y-6">
      {/* Header & 3 Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-kumkum">Income & Expenditures</h2>
            <p className="text-xs text-textInk/60 mt-1">
              Manage operational expenditures, direct unbilled income (Hundi, Lease, Bank) & branch petty cash outlays.
            </p>
          </div>

          {activeTab === 'UNBILLED_INCOMES' && (
            <button
              onClick={handleOpenIncomeModal}
              className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md hover:bg-emerald-800 transition-all flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4" />
              + Log Direct / Unbilled Income
            </button>
          )}

          {activeTab === 'EXPENDITURES' && (
            <button
              onClick={() => handleOpenModal(false)}
              className="px-4 py-2.5 bg-kumkum text-ivory rounded-xl font-bold text-xs shadow-md hover:bg-kumkum-dark transition-all flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4" />
              + Add Operational Expense
            </button>
          )}

          {activeTab === 'PETTY_CASH' && (
            <button
              onClick={() => handleOpenModal(true)}
              className="px-4 py-2.5 bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md hover:bg-amber-800 transition-all flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4" />
              + Log Petty Cash Expense
            </button>
          )}
        </div>

        {/* Tab Selection Navigation Bar (3 TABS) */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-turmeric/30 pb-3">
          <button
            onClick={() => setActiveTab('EXPENDITURES')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'EXPENDITURES'
                ? 'bg-kumkum text-white shadow-md'
                : 'bg-white text-textInk/70 hover:bg-ivory border border-turmeric/20'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            💸 Operational Expenditures ({operationalExpenses.length})
          </button>

          <button
            onClick={() => setActiveTab('UNBILLED_INCOMES')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'UNBILLED_INCOMES'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-textInk/70 hover:bg-ivory border border-turmeric/20'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            💰 Direct / Unbilled Income ({unbilledIncomes.length})
          </button>

          <button
            onClick={() => setActiveTab('PETTY_CASH')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'PETTY_CASH'
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-white text-textInk/70 hover:bg-ivory border border-turmeric/20'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            🧺 Petty Cash Management ({pettyCashExpenses.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OPERATIONAL TEMPLE EXPENDITURES */}
      {activeTab === 'EXPENDITURES' && (
        <div className="space-y-6">
          {/* Operational Expenses Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Operational Spent in {monthName}</p>
              <p className="text-2xl font-mono font-bold text-kumkum">
                ₹{totalSpentOperationalThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-textInk/60">Cook Salary, Electricity, Flowers, Maintenance & Provisions (Calculated into Dashboard Net Profit)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-7 h-7" />
            </div>
          </div>

          {/* Operational Expense Table */}
          <div className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden">
            <div className="p-4 bg-ivory/60 border-b border-turmeric/20 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-kumkum">Operational Expenditure Records (Calculated into Dashboard)</h3>
              <span className="text-xs font-semibold text-textInk/60">{operationalExpenses.length} total entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory text-textInk/70 uppercase font-bold text-[10px] border-b border-turmeric/20">
                  <tr>
                    <th className="p-4">Voucher #</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category & Title</th>
                    <th className="p-4">Payee / Vendor</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Bill Copy</th>
                    <th className="p-4 text-right">Amount (₹)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-turmeric/10 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-textInk/50">
                        Loading operational expenses...
                      </td>
                    </tr>
                  ) : operationalExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-textInk/50">
                        No operational expenditure bills logged yet. Click "+ Add Operational Expense" to record cook salaries, utilities, flowers, or maintenance bills.
                      </td>
                    </tr>
                  ) : (
                    operationalExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-ivory/40">
                        <td className="p-4 font-mono font-bold text-kumkum">{expense.voucherNumber}</td>
                        <td className="p-4 text-textInk/70">
                          {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-textInk block">{expense.title}</span>
                          <span className="text-[10px] text-textInk/50">{expense.category}</span>
                        </td>
                        <td className="p-4 text-textInk/80">{expense.payee || '-'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-ivory border border-turmeric/20 font-bold text-[10px] text-kumkum">
                            {expense.paymentMode}
                          </span>
                        </td>
                        <td className="p-4">
                          {expense.attachment ? (
                            <button
                              type="button"
                              onClick={() => handlePreviewAttachment(expense)}
                              className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all font-bold text-[10px] flex items-center gap-1"
                            >
                              <Paperclip className="w-3 h-3" />
                              View Bill
                            </button>
                          ) : (
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-textInk text-sm">
                          ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          {expense.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {expense.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Pending Approval
                            </span>
                          )}
                          {expense.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user?.role === Role.ADMIN && expense.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(expense.id)}
                                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                                  title="Approve Expense"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(expense.id)}
                                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                  title="Reject Expense"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT UNBILLED INCOMES */}
      {activeTab === 'UNBILLED_INCOMES' && (
        <div className="space-y-6">
          {/* Income Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Unbilled Income ({monthName})</p>
                <p className="text-xl font-mono font-bold text-emerald-700">
                  ₹{totalUnbilledIncomeThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-textInk/60">Hundi openings, Bank interest & Lease rent</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-700">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Unbilled Income Entries</p>
                <p className="text-xl font-mono font-bold text-textInk">
                  {unbilledIncomes.length} Entries
                </p>
                <p className="text-[10px] text-textInk/60">Logged unbilled vouchers</p>
              </div>
              <div className="p-3.5 rounded-xl bg-ivory text-kumkum">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Accounting Flow Status</p>
                <p className="text-sm font-bold text-emerald-700">Auto-Synced to Reports</p>
                <p className="text-[10px] text-textInk/60">Included in Temple Net Earnings</p>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 text-blue-700">
                <Building className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Unbilled Income List Table */}
          <div className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden">
            <div className="p-4 bg-ivory/60 border-b border-turmeric/20 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-kumkum">Logged Direct Temple Incomes (Hundi, Lease, Bank)</h3>
              <span className="text-xs font-semibold text-textInk/60">{unbilledIncomes.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory text-textInk/70 uppercase font-bold text-[10px] border-b border-turmeric/20">
                  <tr>
                    <th className="p-4">Receipt #</th>
                    <th className="p-4">Received Date</th>
                    <th className="p-4">Income Description & Category</th>
                    <th className="p-4">Payment Mode</th>
                    <th className="p-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-turmeric/10 font-medium">
                  {unbilledIncomes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-textInk/50">
                        No direct unbilled income entries logged yet. Click "+ Log Direct / Unbilled Income" above to record Hundi box counting, lease rent or bank interest.
                      </td>
                    </tr>
                  ) : (
                    unbilledIncomes.map((inc) => (
                      <tr key={inc.id} className="hover:bg-ivory/40">
                        <td className="p-4 font-mono font-bold text-kumkum">{inc.receiptNumber}</td>
                        <td className="p-4 text-textInk/70">
                          {new Date(inc.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-textInk block">
                            {inc.items?.[0]?.description || 'Direct Temple Income'}
                          </span>
                          <span className="text-[10px] text-textInk/50">{inc.sankalpaNote || 'Unbilled Entry'}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-ivory border border-turmeric/20 font-bold text-[10px] text-kumkum">
                            {inc.paymentMode}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-700 text-sm">
                          ₹{Number(inc.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PETTY CASH MANAGEMENT (KEPT SEPARATE) */}
      {activeTab === 'PETTY_CASH' && (
        <div className="space-y-6">
          {/* Petty Cash Allowance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Petty Cash Monthly Limit</p>
                <p className="text-xl font-mono font-bold text-textInk">
                  ₹{walletLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-textInk/60">Configured branch petty allowance (Kept separate from dashboard)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-100 text-amber-800">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Spent in {monthName}</p>
                <p className="text-xl font-mono font-bold text-amber-800">
                  ₹{totalSpentPettyThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-textInk/60">Sum of approved petty cash outlays</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-700">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${
              remainingPettyBalance >= 0 
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                : 'bg-red-50/50 border-red-200 text-red-950'
            }`}>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Remaining Petty Balance</p>
                <p className={`text-xl font-mono font-bold ${
                  remainingPettyBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  ₹{remainingPettyBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-textInk/60">
                  {remainingPettyBalance >= 0 ? 'Within petty budget' : 'Petty allowance exceeded!'}
                </p>
              </div>
              <div className={`p-3.5 rounded-xl ${
                remainingPettyBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Petty Cash Separation Notice: </span>
              Petty Cash expenses are kept separate from operational temple expenditures and do not deduct from Main Dashboard Net Profit. Single petty cash vouchers exceeding ₹{thresholdLimit.toLocaleString('en-IN')} require Admin Approval.
            </div>
          </div>

          {/* Petty Cash Expense List Table */}
          <div className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden">
            <div className="p-4 bg-ivory/60 border-b border-turmeric/20 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-kumkum">Petty Cash Expense Outlays</h3>
              <span className="text-xs font-semibold text-textInk/60">{pettyCashExpenses.length} entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory text-textInk/70 uppercase font-bold text-[10px] border-b border-turmeric/20">
                  <tr>
                    <th className="p-4">Voucher #</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category & Title</th>
                    <th className="p-4">Payee / Vendor</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Bill Copy</th>
                    <th className="p-4 text-right">Amount (₹)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-turmeric/10 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-textInk/50">
                        Loading petty cash expenses...
                      </td>
                    </tr>
                  ) : pettyCashExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-textInk/50">
                        No petty cash expenses logged yet. Click "+ Log Petty Cash Expense" to log minor daily outlays.
                      </td>
                    </tr>
                  ) : (
                    pettyCashExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-ivory/40">
                        <td className="p-4 font-mono font-bold text-kumkum">{expense.voucherNumber}</td>
                        <td className="p-4 text-textInk/70">
                          {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-textInk block">{expense.title}</span>
                          <span className="text-[10px] text-textInk/50">{expense.category}</span>
                        </td>
                        <td className="p-4 text-textInk/80">{expense.payee || '-'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-ivory border border-turmeric/20 font-bold text-[10px] text-kumkum">
                            {expense.paymentMode}
                          </span>
                        </td>
                        <td className="p-4">
                          {expense.attachment ? (
                            <button
                              type="button"
                              onClick={() => handlePreviewAttachment(expense)}
                              className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all font-bold text-[10px] flex items-center gap-1"
                            >
                              <Paperclip className="w-3 h-3" />
                              View Bill
                            </button>
                          ) : (
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-textInk text-sm">
                          ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          {expense.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {expense.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Pending Approval
                            </span>
                          )}
                          {expense.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px] inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user?.role === Role.ADMIN && expense.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(expense.id)}
                                  className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                                  title="Approve Expense"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(expense.id)}
                                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                  title="Reject Expense"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOG DIRECT UNBILLED INCOME MODAL */}
      {incomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">💰 Log Direct / Unbilled Temple Income</h3>
              <button
                onClick={() => setIncomeModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-textInk block mb-1">Income Category / Head *</label>
                <select
                  value={incomeFormData.category}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-ivory/50 font-semibold text-textInk focus:outline-none focus:border-emerald-700"
                >
                  {incomeCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-textInk block mb-1">Income Description / Source Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Kanike Hundi Box Opening #14 / Sannidhi Box"
                  value={incomeFormData.title}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-medium focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-textInk block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-mono font-bold focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-textInk block mb-1">Payment / Deposit Mode *</label>
                  <select
                    value={incomeFormData.paymentMode}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, paymentMode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-ivory/50 font-semibold focus:outline-none focus:border-emerald-700"
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK">DIRECT BANK TRANSFER</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-textInk block mb-1">Notes / Witness Committee Details</label>
                <textarea
                  rows={2}
                  placeholder="Optional details e.g. Counted in presence of Priest & Manager"
                  value={incomeFormData.sankalpaNote}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, sankalpaNote: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-medium focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-turmeric/20">
                <button
                  type="button"
                  onClick={() => setIncomeModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-textInk/70 hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={incomeSubmitting}
                  className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                  {incomeSubmitting ? 'Recording Income...' : 'Record Direct Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className={`p-4 text-ivory flex items-center justify-between ${
              isPettyCashModal ? 'bg-amber-800' : 'bg-kumkum'
            }`}>
              <h3 className="font-display font-bold text-base">
                {isPettyCashModal ? '🧺 Log Petty Cash Expense Outlay' : 'Add Operational Temple Expense'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-ivory/80 hover:text-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-textInk block mb-1">Expense Category *</label>
                {isPettyCashModal ? (
                  <input
                    type="text"
                    disabled
                    value="Petty Cash & Daily Outlay"
                    className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-ivory text-textInk font-bold cursor-not-allowed"
                  />
                ) : (
                  <div className="space-y-2">
                    <select
                      value={categories.includes(formData.category) ? formData.category : 'CUSTOM'}
                      onChange={(e) => {
                        if (e.target.value !== 'CUSTOM') {
                          setFormData({ ...formData, category: e.target.value });
                        } else {
                          setFormData({ ...formData, category: '' });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-ivory/50 font-semibold text-textInk focus:outline-none focus:border-kumkum"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="CUSTOM">✏️ + Enter Custom Category Manually...</option>
                    </select>

                    {/* Manual input when custom category or typing */}
                    {(!categories.includes(formData.category) || formData.category === '') && (
                      <input
                        type="text"
                        required
                        placeholder="Enter manual category name (e.g. Temple Printing & Flex)"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-kumkum/40 bg-white font-semibold text-kumkum focus:outline-none focus:border-kumkum animate-fadeIn"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-textInk block mb-1">Bill / Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder={isPettyCashModal ? "e.g. Minor Office Tea & Stationery" : "e.g. Purchase of Flowers for Puja"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-medium focus:outline-none focus:border-kumkum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-textInk block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-mono font-bold focus:outline-none focus:border-kumkum"
                  />
                </div>

                <div>
                  <label className="font-bold text-textInk block mb-1">Payment Mode *</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-ivory/50 font-semibold focus:outline-none focus:border-kumkum"
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                    <option value="BANK">BANK TRANSFER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-textInk block mb-1">Payee / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Local Vendor Name"
                  value={formData.payee}
                  onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-medium focus:outline-none focus:border-kumkum"
                />
              </div>

              {/* ATTACHMENT FIELD (OPTIONAL) */}
              <div>
                <label className="font-bold text-textInk block mb-1">
                  Bill Copy / Receipt Voucher Image or PDF (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-turmeric/30 rounded-xl bg-ivory/30 text-xs text-textInk file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-kumkum file:text-ivory hover:file:bg-kumkum-light"
                  />
                  {compressing && (
                    <p className="text-[10px] text-turmeric-dark font-semibold">Compressing bill copy...</p>
                  )}
                  {attachment && !compressing && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        Bill attachment attached successfully
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-red-600 hover:underline text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-textInk block mb-1">Additional Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-turmeric/30 bg-white font-medium focus:outline-none focus:border-kumkum"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-turmeric/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-textInk/70 hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || compressing}
                  className={`px-5 py-2.5 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 ${
                    isPettyCashModal ? 'bg-amber-700 hover:bg-amber-800' : 'bg-kumkum hover:bg-kumkum-light'
                  }`}
                >
                  {submitting ? 'Submitting...' : isPettyCashModal ? 'Log Petty Expense' : 'Submit Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW ATTACHMENT MODAL */}
      {previewOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-ivory border-b border-ivory-dark flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-display font-bold text-kumkum text-sm">
                  Receipt Attachment: {selectedExpense.voucherNumber}
                </h3>
                <p className="text-[9px] text-textInk/60">{selectedExpense.title}</p>
              </div>
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  setSelectedExpense(null);
                }}
                className="p-1.5 rounded-lg text-textInk/60 hover:bg-ivory-dark transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-ivory-light/20 overflow-y-auto max-h-[60vh] flex-grow">
              {selectedExpense.attachment?.startsWith('data:image/') ? (
                <img
                  src={selectedExpense.attachment}
                  alt="Receipt Preview"
                  className="max-w-full max-h-[50vh] object-contain rounded-lg border border-turmeric/10 shadow-sm"
                />
              ) : (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <div className="p-4 rounded-full bg-kumkum/10 text-kumkum">
                    <FileText className="w-12 h-12" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-textInk">PDF Document Receipt</h4>
                    <p className="text-xs text-textInk/60 mt-0.5">Click the button below to download and view the document.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-ivory border-t border-ivory-dark flex items-center justify-end gap-2 flex-shrink-0">
              <a
                href={selectedExpense.attachment}
                download={
                  selectedExpense.attachment?.startsWith('data:image/')
                    ? `${selectedExpense.voucherNumber}.jpg`
                    : `${selectedExpense.voucherNumber}.pdf`
                }
                className="flex items-center gap-1.5 bg-kumkum hover:bg-kumkum-light text-ivory px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download Attachment
              </a>
              <button
                type="button"
                onClick={() => {
                  setPreviewOpen(false);
                  setSelectedExpense(null);
                }}
                className="px-4 py-2 border border-turmeric/30 rounded-xl font-semibold text-xs text-textInk/70 hover:bg-ivory"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
