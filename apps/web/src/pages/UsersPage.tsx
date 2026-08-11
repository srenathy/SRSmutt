import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { UserPlus, Shield, Key, CheckCircle, Edit, Trash2 } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'STAFF',
    canAccessBilling: true,
    canAccessExpenses: true,
    canAccessReports: true,
    canAccessMasters: false,
    canApproveExpenses: false,
    expenditureLimit: 2000
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (u?: any) => {
    if (u) {
      setEditingUser(u);
      setFormData({
        username: u.username,
        password: '',
        fullName: u.fullName,
        role: u.role,
        canAccessBilling: u.canAccessBilling ?? true,
        canAccessExpenses: u.canAccessExpenses ?? true,
        canAccessReports: u.canAccessReports ?? true,
        canAccessMasters: u.canAccessMasters ?? false,
        canApproveExpenses: u.canApproveExpenses ?? false,
        expenditureLimit: u.expenditureLimit ?? 2000
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        role: 'STAFF',
        canAccessBilling: true,
        canAccessExpenses: true,
        canAccessReports: true,
        canAccessMasters: false,
        canApproveExpenses: false,
        expenditureLimit: 2000
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, formData);
      } else {
        await apiClient.post('/users', formData);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) return;
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum">User Management & Access Control</h2>
          <p className="text-xs text-textInk/60 mt-1">
            Create sub-users (Counter Staff, Accountant, Priest, Admin) and set modular permissions.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-kumkum text-ivory rounded-xl font-bold text-xs shadow-md hover:bg-kumkum-dark transition-all flex items-center gap-2 self-start"
        >
          <UserPlus className="w-4 h-4" />
          Create Sub-User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-kumkum font-semibold flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
            Loading user accounts...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-turmeric/20 text-kumkum font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Billing</th>
                  <th className="p-4">Expenses</th>
                  <th className="p-4">Reports</th>
                  <th className="p-4">Masters</th>
                  <th className="p-4">Approval Rights</th>
                  <th className="p-4">Expense Limit</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-turmeric/10 font-medium text-textInk">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-kumkum">{u.username}</td>
                    <td className="p-4 font-semibold">{u.fullName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-turmeric/20 text-textInk font-bold text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">{u.canAccessBilling ? '✅' : '❌'}</td>
                    <td className="p-4">{u.canAccessExpenses ? '✅' : '❌'}</td>
                    <td className="p-4">{u.canAccessReports ? '✅' : '❌'}</td>
                    <td className="p-4">{u.canAccessMasters ? '✅' : '❌'}</td>
                    <td className="p-4">
                      {u.canApproveExpenses ? (
                        <span className="text-emerald-700 font-bold">YES</span>
                      ) : (
                        <span className="text-textInk/40">NO</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      ₹{Number(u.expenditureLimit ?? 2000).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 text-textInk/60 hover:text-kumkum transition-colors"
                          title="Edit User Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="p-1.5 text-textInk/40 hover:text-red-700 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-kumkum">
              {editingUser ? `Edit Sub-User (${editingUser.username})` : 'Create Sub-User Account'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingUser}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 disabled:bg-ivory"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Role Designation</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 bg-white"
                >
                  <option value="STAFF">COUNTER STAFF</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                  <option value="MANAGER">TEMPLE MANAGER</option>
                  <option value="ADMIN">SYSTEM ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">
                  Auto-Approval Expenditure Limit (₹)
                </label>
                <input
                  type="number"
                  value={formData.expenditureLimit}
                  onChange={(e) => setFormData({ ...formData, expenditureLimit: Number(e.target.value) })}
                  required
                  min={0}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-mono font-bold"
                />
                <p className="text-[10px] text-textInk/50 mt-1">
                  Expenditure vouchers logged by this user up to this amount will be auto-approved. Greater amounts will go to Admin review.
                </p>
              </div>

              {/* Module Access Rights Checkboxes */}
              <div className="border-t border-turmeric/20 pt-3 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-kumkum">
                  Module Access Permissions
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-textInk">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canAccessBilling}
                      onChange={(e) => setFormData({ ...formData, canAccessBilling: e.target.checked })}
                    />
                    Billing Counter Access
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canAccessExpenses}
                      onChange={(e) => setFormData({ ...formData, canAccessExpenses: e.target.checked })}
                    />
                    Expenditures Access
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canAccessReports}
                      onChange={(e) => setFormData({ ...formData, canAccessReports: e.target.checked })}
                    />
                    Reports Access
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canAccessMasters}
                      onChange={(e) => setFormData({ ...formData, canAccessMasters: e.target.checked })}
                    />
                    Masters Editing
                  </label>

                  <label className="flex items-center gap-2 col-span-2 text-kumkum font-bold pt-1">
                    <input
                      type="checkbox"
                      checked={formData.canApproveExpenses}
                      onChange={(e) => setFormData({ ...formData, canApproveExpenses: e.target.checked })}
                    />
                    Can Approve High-Threshold Expenses
                  </label>
                </div>
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
                  {submitting ? 'Saving...' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
