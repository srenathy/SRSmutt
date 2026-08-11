import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '@temple/shared';
import { Plus, CheckCircle, XCircle, AlertTriangle, Receipt, FileText, Check, X, Trash2, Wallet, TrendingUp, TrendingDown, Paperclip, Download } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [temple, setTemple] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Attachment states
  const [attachment, setAttachment] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const [formData, setFormData] = useState({
    category: 'Puja Materials',
    title: '',
    amount: '',
    payee: '',
    paymentMode: 'CASH',
    description: ''
  });

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
  }, []);

  const handleOpenModal = () => {
    setFormData({
      category: 'Puja Materials',
      title: '',
      amount: '',
      payee: '',
      paymentMode: 'CASH',
      description: ''
    });
    setAttachment(null);
    setModalOpen(true);
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
        attachment: attachment || undefined
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
    'Staff Salary & Honorarium',
    'Electricity & Water Utility',
    'Annadana Provisions & Catering',
    'Temple Maintenance & Repairs',
    'Special Event & Festival',
    'Miscellaneous'
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  const totalSpentThisMonth = expenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return e.status === 'APPROVED' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const walletLimit = Number(temple?.monthlyExpenseBudget) || 5000;
  const remainingBalance = walletLimit - totalSpentThisMonth;
  const thresholdLimit = Number(temple?.expenseApprovalThreshold) || 5000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum">Temple Expenditures</h2>
          <p className="text-xs text-textInk/60 mt-1">
            Record temple operational expenses, bills / requests, and admin approval workflows.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-kumkum text-ivory rounded-xl font-bold text-xs shadow-md hover:bg-kumkum-dark transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Add Temple Expense
        </button>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Wallet Limit */}
        <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Monthly Wallet Limit</p>
            <p className="text-xl font-mono font-bold text-textInk">
              ₹{walletLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-textInk/60">Configured monthly allowance</p>
          </div>
          <div className="p-3.5 rounded-xl bg-ivory text-kumkum">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Spent This Month */}
        <div className="bg-white p-5 rounded-2xl border border-turmeric/30 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Spent in {monthName}</p>
            <p className="text-xl font-mono font-bold text-kumkum">
              ₹{totalSpentThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-textInk/60">Sum of approved monthly expenses</p>
          </div>
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining Wallet Balance */}
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${
          remainingBalance >= 0 
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
            : 'bg-red-50/50 border-red-200 text-red-950'
        }`}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-textInk/50 uppercase tracking-wider">Remaining Balance</p>
            <p className={`text-xl font-mono font-bold ${
              remainingBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}>
              ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-textInk/60">
              {remainingBalance >= 0 ? 'Within budget limit' : 'Budget limit exceeded!'}
            </p>
          </div>
          <div className={`p-3.5 rounded-xl ${
            remainingBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Threshold Approval Rule Alert Banner */}
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Admin Approval Threshold Rule: </span>
          Expenses exceeding ₹{thresholdLimit.toLocaleString('en-IN')} will be automatically flagged for Admin Approval before being deducted from temple net earnings.
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-kumkum font-semibold flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
            Loading expenditures...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-textInk/50 text-xs font-medium">
            No temple expenditures recorded yet. Click "Add Temple Expense" to log your first bill/request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-turmeric/20 text-kumkum font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Bill/Request #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Title / Purpose</th>
                  <th className="p-4">Payee / Vendor</th>
                  <th className="p-4">Amount (₹)</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-turmeric/10 font-medium text-textInk">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-kumkum flex items-center gap-2">
                      {item.voucherNumber}
                      {item.attachment && (
                        <button
                          onClick={() => handlePreviewAttachment(item)}
                          className="p-1 rounded bg-kumkum/10 text-kumkum hover:bg-kumkum hover:text-white transition-colors flex items-center justify-center shrink-0"
                          title="View Receipt Attachment"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                    <td className="p-4">{new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 font-semibold">{item.category}</td>
                    <td className="p-4 max-w-xs truncate">{item.title}</td>
                    <td className="p-4">{item.payee || '-'}</td>
                    <td className="p-4 font-mono font-bold text-kumkum text-sm">
                      ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-semibold uppercase">{item.paymentMode}</td>
                    <td className="p-4">
                      {item.status === 'APPROVED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> APPROVED
                        </span>
                      ) : item.status === 'PENDING' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> PENDING APPROVAL
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" /> REJECTED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'PENDING' && user?.role === Role.ADMIN && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-700 transition-all flex items-center gap-1"
                              title="Approve Expense"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px] hover:bg-red-700 transition-all flex items-center gap-1"
                              title="Reject Expense"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {user?.role === Role.ADMIN && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-textInk/40 hover:text-red-700 transition-colors"
                            title="Delete Bill/Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-kumkum">Log Temple Expenditure</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Expense Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Title / Purpose</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Flowers and Tulasi garlands for Rayara Aradhana"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textInk mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textInk mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 bg-white"
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK">BANK CHEQUE / NEFT</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  value={formData.payee}
                  onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  placeholder="e.g. Sri Lakshmi Flower Merchants"
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Additional Bill / Request Details</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">
                  Upload Receipt / Invoice (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="expense-attachment-upload"
                  />
                  <label
                    htmlFor="expense-attachment-upload"
                    className="px-4 py-2 bg-ivory border border-turmeric/30 rounded-xl font-semibold text-xs text-kumkum cursor-pointer hover:bg-turmeric/10 hover:border-turmeric transition-all flex items-center gap-1.5"
                  >
                    <Paperclip className="w-4 h-4" />
                    {attachment ? 'Change Attachment' : 'Upload Receipt File'}
                  </label>
                  {compressing && (
                    <span className="text-[10px] text-textInk/50 animate-pulse">Compressing file...</span>
                  )}
                  {attachment && !compressing && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        File Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-red-600 hover:text-red-700 font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-textInk/50 mt-1">
                  Supports images (JPG, PNG) and PDFs. Images will be automatically compressed before saving.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-turmeric/30 rounded-xl font-semibold text-xs text-textInk/70 hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-kumkum text-ivory rounded-xl font-bold text-xs shadow-md hover:bg-kumkum-dark transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Save Bill / Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Attachment Preview Modal */}
      {previewOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
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

            {/* Content Body */}
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

            {/* Footer Controls */}
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
