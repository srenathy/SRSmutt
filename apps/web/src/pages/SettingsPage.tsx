import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { Building2, CreditCard, Printer, CheckCircle, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temple' | 'finance' | 'printer'>('temple');

  const [formData, setFormData] = useState({
    name: '',
    deity: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    registrationNumber: '',
    upiId: '',
    defaultPriest: '',
    receiptHeader: '',
    receiptFooter: '',
    expenseApprovalThreshold: 5000,
    monthlyExpenseBudget: 5000
  });

  const [printerSettings, setPrinterSettings] = useState({
    paperWidth: '80mm',
    showLogo: true,
    showSankalpa: true
  });

  useEffect(() => {
    const fetchTempleInfo = async () => {
      try {
        const res = await apiClient.get('/temple');
        if (res.data.data) {
          setFormData({
            name: res.data.data.name || '',
            deity: res.data.data.deity || '',
            address: res.data.data.address || '',
            city: res.data.data.city || '',
            state: res.data.data.state || '',
            pincode: res.data.data.pincode || '',
            phone: res.data.data.phone || '',
            email: res.data.data.email || '',
            registrationNumber: res.data.data.registrationNumber || '',
            upiId: res.data.data.upiId || 'raghavendra@upi',
            defaultPriest: res.data.data.defaultPriest || 'Sri Raghavacharya',
            receiptHeader: res.data.data.receiptHeader || 'Om Sri Raghavendraya Namaha',
            receiptFooter: res.data.data.receiptFooter || 'Sri Sripadaraja Arpanamastu. Computer generated receipt.',
            expenseApprovalThreshold: Number(res.data.data.expenseApprovalThreshold) || 5000,
            monthlyExpenseBudget: Number(res.data.data.monthlyExpenseBudget) || 5000
          });
        }
      } catch (err) {
        console.error('Failed to fetch temple settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTempleInfo();

    const savedPrinter = localStorage.getItem('temple_printer_settings');
    if (savedPrinter) {
      try {
        setPrinterSettings(JSON.parse(savedPrinter));
      } catch (e) {}
    }

    const savedCategoryBudgets = localStorage.getItem('temple_category_budgets');
    if (savedCategoryBudgets) {
      try {
        setCategoryBudgets(JSON.parse(savedCategoryBudgets));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const payload = {
        ...formData,
        expenseApprovalThreshold: Number(formData.expenseApprovalThreshold),
        monthlyExpenseBudget: Number(formData.monthlyExpenseBudget)
      };
      await apiClient.put('/temple', payload);
      localStorage.setItem('temple_printer_settings', JSON.stringify(printerSettings));
      localStorage.setItem('temple_category_budgets', JSON.stringify(categoryBudgets));
      setSuccessMessage('Temple information, petty cash limits, and category budgets updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update temple settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-kumkum font-semibold">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
          Loading temple settings...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-kumkum">Temple & Billing Settings</h2>
          <p className="text-[11px] text-textInk/60">
            Configure temple profile, UPI payments, archaka details, and print receipt templates.
          </p>
        </div>
      </div>

      {/* Main Options Row (Horizontal Navigation Tabs) */}
      <div className="bg-white p-1.5 rounded-xl border border-turmeric/20 shadow-xs grid grid-cols-3 gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('temple')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'temple'
              ? 'bg-kumkum text-ivory shadow-xs'
              : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Temple Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'finance'
              ? 'bg-kumkum text-ivory shadow-xs'
              : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>UPI & Archaka Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('printer')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'printer'
              ? 'bg-kumkum text-ivory shadow-xs'
              : 'bg-ivory text-textInk/70 hover:bg-ivory-dark'
          }`}
        >
          <Printer className="w-4 h-4 shrink-0" />
          <span>Receipt Print Setup</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Wide, Compact Centered Form Editing Card */}
      <form onSubmit={handleSubmit} className="bg-white p-5 md:p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-4">
        {/* OPTION 1: TEMPLE PROFILE */}
        {activeTab === 'temple' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-turmeric/20 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-kumkum" />
              <h3 className="font-display font-bold text-xs md:text-sm text-kumkum uppercase tracking-wider">
                TEMPLE INFORMATION & LOCATION
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-textInk mb-1">Temple Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-textInk mb-1">Primary Deity / Sannidhana</label>
                <input
                  type="text"
                  name="deity"
                  value={formData.deity}
                  onChange={handleChange}
                  placeholder="e.g. Shri Raghavendra Swamy Brindavana Sannidhana"
                  className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-textInk mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-textInk mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-textInk mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-textInk mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-textInk mb-1">Phone Number(s)</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-textInk mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OPTION 2: FINANCIAL & PETTY CASH DETAILS */}
        {activeTab === 'finance' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-turmeric/20 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-kumkum" />
              <h3 className="font-display font-bold text-xs md:text-sm text-kumkum uppercase tracking-wider">
                UPI & PETTY CASH DETAILS
              </h3>
            </div>

            {/* UPI Payment Configuration Card */}
            <div className="bg-white p-5 rounded-2xl border border-turmeric/30 space-y-2 shadow-xs">
              <h4 className="font-display font-bold text-xs text-kumkum uppercase">💳 COUNTER PAYMENT SETUP</h4>
              <div>
                <label className="block text-[11px] font-bold text-textInk mb-1">UPI VPA ID (for Counter Billing QR Code)</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder="e.g. raghavendra@upi"
                  className="w-full max-w-md px-3 py-2 rounded-xl border border-turmeric/40 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-kumkum bg-ivory/20"
                />
                <p className="text-[10px] text-textInk/50 mt-1">Encoded into dynamic payment QR codes on counter receipt printouts for instant UPI payments.</p>
              </div>
            </div>

            {/* Petty Cash Controls — COMPLETELY EXCLUDED from Dashboard & Reports */}
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-300/50 space-y-4 shadow-xs">
              <div>
                <h4 className="font-display font-bold text-xs text-amber-900 uppercase flex items-center gap-1.5">
                  🧺 PETTY CASH ALLOWANCE & THRESHOLDS
                </h4>
                <p className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 mt-2">
                  ⚠️ Petty Cash is completely separate — it is NOT included in the Dashboard, NOT counted in monthly expenditures, and NOT shown in financial reports. Managed exclusively under the Petty Cash tab in Income & Expenditures.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-turmeric/20">
                  <label className="block text-[11px] font-bold text-textInk mb-1">Petty Cash Monthly Allowance Limit (₹)</label>
                  <input
                    type="number"
                    name="monthlyExpenseBudget"
                    value={formData.monthlyExpenseBudget}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-kumkum bg-ivory/20"
                  />
                  <p className="text-[10px] text-textInk/60 mt-1 font-medium">Minor daily branch cash outlays limit.</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-turmeric/20">
                  <label className="block text-[11px] font-bold text-textInk mb-1">Petty Cash Per-Voucher Admin Approval Cap (₹)</label>
                  <input
                    type="number"
                    name="expenseApprovalThreshold"
                    value={formData.expenseApprovalThreshold}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-kumkum bg-ivory/20"
                  />
                  <p className="text-[10px] text-textInk/60 mt-1 font-medium">Single petty cash voucher limit. Any petty expense above this requires Admin approval.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OPTION 3: BILLING RECEIPT & THERMAL PRINTER */}
        {activeTab === 'printer' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-turmeric/20 pb-2 flex items-center gap-2">
              <Printer className="w-4 h-4 text-kumkum" />
              <h3 className="font-display font-bold text-xs md:text-sm text-kumkum uppercase tracking-wider">
                BILLING RECEIPT & THERMAL PRINTER SETTINGS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-textInk mb-1">Receipt Top Header Line</label>
                <input
                  type="text"
                  name="receiptHeader"
                  value={formData.receiptHeader}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                />
                <p className="text-[10px] text-textInk/50 mt-0.5">Header line printed at top of thermal POS slip.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-textInk mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  name="receiptFooter"
                  value={formData.receiptFooter}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs focus:outline-none focus:ring-1 focus:ring-kumkum"
                />
                <p className="text-[10px] text-textInk/50 mt-0.5">Blessing line printed at bottom of thermal POS slip.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-textInk mb-1">Printer Roll Size</label>
                <select
                  value={printerSettings.paperWidth}
                  onChange={(e) => setPrinterSettings({ ...printerSettings, paperWidth: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-turmeric/40 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-kumkum"
                >
                  <option value="80mm">80mm Thermal Paper (Standard POS)</option>
                  <option value="58mm">58mm Mini Thermal Paper</option>
                  <option value="A4">A4 Full Page Document</option>
                </select>
              </div>

              <div className="flex items-center gap-6 pt-3">
                <label className="flex items-center gap-2 text-xs font-bold text-textInk cursor-pointer">
                  <input
                    type="checkbox"
                    id="showLogo"
                    checked={printerSettings.showLogo}
                    onChange={(e) => setPrinterSettings({ ...printerSettings, showLogo: e.target.checked })}
                    className="w-4 h-4 text-kumkum border-turmeric/40 rounded focus:ring-kumkum/20"
                  />
                  Show Gopuram Logo
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-textInk cursor-pointer">
                  <input
                    type="checkbox"
                    id="showSankalpa"
                    checked={printerSettings.showSankalpa}
                    onChange={(e) => setPrinterSettings({ ...printerSettings, showSankalpa: e.target.checked })}
                    className="w-4 h-4 text-kumkum border-turmeric/40 rounded focus:ring-kumkum/20"
                  />
                  Include Sankalpa Text
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Centered Save Button at Bottom */}
        <div className="pt-2 border-t border-turmeric/20 flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 bg-kumkum text-ivory rounded-xl font-bold text-xs shadow-md hover:bg-kumkum-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[200px]"
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Temple Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
