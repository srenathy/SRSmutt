import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '@temple/shared';
import { Plus, CheckCircle, XCircle, AlertTriangle, Receipt, FileText, Check, X, Trash2 } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchExpenses();
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
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/expenses', {
        ...formData,
        amount: Number(formData.amount)
      });
      alert(
        res.data.data.status === 'PENDING'
          ? 'Expense logged successfully! As it exceeds the threshold limit, it requires Admin Approval.'
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
    if (!confirm('Are you sure you want to delete this expense voucher?')) return;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum">Temple Expenditures</h2>
          <p className="text-xs text-textInk/60 mt-1">
            Record temple operational expenses, vendor vouchers, and admin approval workflows.
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

      {/* Threshold Approval Rule Alert Banner */}
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Admin Approval Threshold Rule: </span>
          Expenses exceeding ₹5,000 will be automatically flagged for Admin Approval before being deducted from temple net earnings.
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
            No temple expenditures recorded yet. Click "Add Temple Expense" to log your first voucher.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-turmeric/20 text-kumkum font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Voucher #</th>
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
                    <td className="p-4 font-mono font-bold text-kumkum">{item.voucherNumber}</td>
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
                            title="Delete Voucher"
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
                <label className="block text-xs font-semibold text-textInk mb-1">Additional Voucher Details</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
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
                  {submitting ? 'Submitting...' : 'Save Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
