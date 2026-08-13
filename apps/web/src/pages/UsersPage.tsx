import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { UserPlus, Search, Shield, UserCheck, Users, Edit, Trash2 } from 'lucide-react';
import { VedicAutocomplete } from '../components/VedicAutocomplete.js';
import { useVedicMasters } from '../hooks/useVedicMasters.js';
import { Pagination } from '../components/Pagination.js';

export const UsersPage: React.FC = () => {
  const { gotras, nakshatras, rashis } = useVedicMasters();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STAFF_ADMIN' | 'DEVOTEE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'STAFF',
    phone: '',
    email: '',
    gotra: '',
    nakshatra: '',
    rashi: '',
    city: '',
    address: '',
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
      const isDev = u.role === 'DEVOTEE' || u.devoteeId;
      setFormData({
        username: u.username || '',
        password: '',
        fullName: u.fullName || u.devotee?.name || '',
        role: u.role || (isDev ? 'DEVOTEE' : 'STAFF'),
        phone: u.devotee?.phone || '',
        email: u.devotee?.email || '',
        gotra: u.devotee?.gotra || '',
        nakshatra: u.devotee?.nakshatra || '',
        rashi: u.devotee?.rashi || '',
        city: u.devotee?.city || '',
        address: u.devotee?.address || '',
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
        phone: '',
        email: '',
        gotra: '',
        nakshatra: '',
        rashi: '',
        city: '',
        address: '',
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

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return roleFilter === 'ALL' || (roleFilter === 'DEVOTEE' && u.role === 'DEVOTEE') || (roleFilter === 'STAFF_ADMIN' && u.role !== 'DEVOTEE');

    const matchesSearch =
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.devotee?.name && u.devotee.name.toLowerCase().includes(q)) ||
      (u.devotee?.phone && u.devotee.phone.toLowerCase().includes(q)) ||
      (u.devotee?.email && u.devotee.email.toLowerCase().includes(q)) ||
      (u.devotee?.gotra && u.devotee.gotra.toLowerCase().includes(q)) ||
      (u.devotee?.nakshatra && u.devotee.nakshatra.toLowerCase().includes(q)) ||
      (u.devotee?.rashi && u.devotee.rashi.toLowerCase().includes(q)) ||
      (u.devotee?.city && u.devotee.city.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (roleFilter === 'DEVOTEE') {
      return u.role === 'DEVOTEE';
    }
    if (roleFilter === 'STAFF_ADMIN') {
      return u.role !== 'DEVOTEE';
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [roleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum">User & Access Control</h2>
          <p className="text-xs text-textInk/60 mt-1">
            Real-time directory of all user accounts created (Admin, Staff, Accountants, and Registered Devotees).
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-kumkum text-ivory rounded-xl font-bold text-xs shadow-md hover:bg-kumkum-dark transition-all flex items-center gap-2 self-start"
        >
          <UserPlus className="w-4 h-4" />
          Create Staff User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-turmeric/20 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              roleFilter === 'ALL' ? 'bg-kumkum text-ivory shadow-xs' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
            }`}
          >
            All Accounts ({users.length})
          </button>

          <button
            onClick={() => setRoleFilter('STAFF_ADMIN')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              roleFilter === 'STAFF_ADMIN' ? 'bg-kumkum text-ivory shadow-xs' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
            }`}
          >
            Staff & Admins ({users.filter((u) => u.role !== 'DEVOTEE').length})
          </button>

          <button
            onClick={() => setRoleFilter('DEVOTEE')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
              roleFilter === 'DEVOTEE' ? 'bg-kumkum text-ivory shadow-xs' : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
            }`}
          >
            Registered Devotees ({users.filter((u) => u.role === 'DEVOTEE').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textInk/40" />
          <input
            type="text"
            placeholder="Search username, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-turmeric/30 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-kumkum font-semibold flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
            Loading user directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-turmeric/20 text-kumkum font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Type / Role</th>
                  <th className="p-4">Billing</th>
                  <th className="p-4">Expenses</th>
                  <th className="p-4">Reports</th>
                  <th className="p-4">Masters</th>
                  <th className="p-4">Approval Rights</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-turmeric/10 font-medium text-textInk">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-textInk/50">
                      No user accounts found matching current filter.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-ivory/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-kumkum">
                        {u.username}
                        {u.devotee && (
                          <div className="text-[10px] text-textInk/50 font-normal font-sans">
                            📱 {u.devotee.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{u.fullName}</td>
                      <td className="p-4">
                        {u.role === 'DEVOTEE' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] inline-flex items-center gap-1">
                            🕉️ DEVOTEE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-turmeric/20 text-textInk font-bold text-[10px] inline-flex items-center gap-1">
                            🛡️ {u.role}
                          </span>
                        )}
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
                      <td className="p-4 text-textInk/60 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
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
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
              totalItems={filteredUsers.length}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="bg-white rounded-2xl border border-turmeric/30 w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-kumkum">
              {editingUser?.role === 'DEVOTEE' || formData.role === 'DEVOTEE'
                ? `Edit Devotee Profile (${editingUser?.fullName || formData.fullName})`
                : editingUser
                ? `Edit Sub-User (${editingUser.username})`
                : 'Create Sub-User Account'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {editingUser?.role === 'DEVOTEE' || formData.role === 'DEVOTEE' ? (
                /* DEVOTEE PROFILE FORM (Fields matching Quick Register flow) */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-textInk mb-1">Username / Login ID *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      placeholder="e.g. 9888877777"
                      className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textInk mb-1">Devotee Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="e.g. Srinivas Rao"
                      className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textInk mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textInk mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. devotee@gmail.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <VedicAutocomplete
                        label="Gotra"
                        placeholder="Type 3+ letters to search Gotra..."
                        value={formData.gotra}
                        onChange={(val) => setFormData({ ...formData, gotra: val })}
                        options={gotras}
                        minChars={3}
                      />
                    </div>

                    <div>
                      <VedicAutocomplete
                        label="Nakshatra"
                        placeholder="Type 3+ letters to search Nakshatra..."
                        value={formData.nakshatra}
                        onChange={(val) => setFormData({ ...formData, nakshatra: val })}
                        options={nakshatras}
                        minChars={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <VedicAutocomplete
                        label="Rashi"
                        placeholder="Type 3+ letters to search Rashi..."
                        value={formData.rashi}
                        onChange={(val) => setFormData({ ...formData, rashi: val })}
                        options={rashis}
                        minChars={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-textInk mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textInk mb-1">Residential Address (Optional)</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, area, pincode..."
                      className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium"
                    />
                  </div>
                </div>
              ) : (
                /* STAFF ACCOUNT FORM */
                <div className="space-y-4">
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
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-turmeric/10">
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
                  {submitting ? 'Saving...' : editingUser?.role === 'DEVOTEE' || formData.role === 'DEVOTEE' ? 'Save Devotee Profile' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
