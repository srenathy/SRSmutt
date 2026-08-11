import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { Building2, CreditCard, UserCheck, FileText, Printer, CheckCircle, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setSuccessMessage('Temple information and billing settings updated successfully!');
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-kumkum">Temple Information & Settings</h2>
        <p className="text-xs text-textInk/60 mt-1">
          Configure official temple name, address, UPI ID, default archaka/priest, and receipt print templates.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TEMPLE INFORMATION CARD */}
        <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-turmeric/20 pb-3">
            <Building2 className="w-5 h-5 text-kumkum" />
            <h3 className="font-display font-bold text-base text-kumkum uppercase tracking-wider">
              TEMPLE INFORMATION
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Temple Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL & PRIEST DETAILS CARD */}
        <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-turmeric/20 pb-3">
            <CreditCard className="w-5 h-5 text-kumkum" />
            <h3 className="font-display font-bold text-base text-kumkum uppercase tracking-wider">
              UPI & PRIEST / ARCHAKA DETAILS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">UPI ID (for Billing QR Code)</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="e.g. raghavendra@upi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-turmeric/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-kumkum/20"
              />
              <p className="text-[10px] text-textInk/50 mt-1">This UPI VPA will be encoded in the QR code on devotee receipts.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Default Priest / Archaka</label>
              <input
                type="text"
                name="defaultPriest"
                value={formData.defaultPriest}
                onChange={handleChange}
                placeholder="e.g. Sri Raghavacharya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
              />
              <p className="text-[10px] text-textInk/50 mt-1">Appears on Sankalpa & Seva receipts as officiating priest.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-turmeric/10 pt-4">
            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Monthly Expenditure Wallet Amount (₹)</label>
              <input
                type="number"
                name="monthlyExpenseBudget"
                value={formData.monthlyExpenseBudget}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-turmeric/40 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-kumkum/20"
              />
              <p className="text-[10px] text-textInk/50 mt-1">Operational budget allocated every month. Expenditures deduct from this balance.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Admin Approval Threshold Limit (₹)</label>
              <input
                type="number"
                name="expenseApprovalThreshold"
                value={formData.expenseApprovalThreshold}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-turmeric/40 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-kumkum/20"
              />
              <p className="text-[10px] text-textInk/50 mt-1">Expenses exceeding this amount will automatically require Admin Approval.</p>
            </div>
          </div>
        </div>

        {/* RECEIPT PRINT TEMPLATE CARD */}
        <div className="bg-white p-6 rounded-2xl border border-turmeric/30 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-turmeric/20 pb-3">
            <Printer className="w-5 h-5 text-kumkum" />
            <h3 className="font-display font-bold text-base text-kumkum uppercase tracking-wider">
              BILLING RECEIPT & THERMAL PRINTER SETTINGS
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Receipt Header Line</label>
              <input
                type="text"
                name="receiptHeader"
                value={formData.receiptHeader}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textInk mb-1">Receipt Footer Note</label>
              <input
                type="text"
                name="receiptFooter"
                value={formData.receiptFooter}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-textInk mb-1">Printer Roll Size</label>
                <select
                  value={printerSettings.paperWidth}
                  onChange={(e) => setPrinterSettings({ ...printerSettings, paperWidth: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-turmeric/40 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-kumkum/20"
                >
                  <option value="80mm">80mm Thermal Paper (Standard)</option>
                  <option value="58mm">58mm Mini Thermal Paper</option>
                  <option value="A4">A4 Full Page Document</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="showLogo"
                  checked={printerSettings.showLogo}
                  onChange={(e) => setPrinterSettings({ ...printerSettings, showLogo: e.target.checked })}
                  className="w-4 h-4 text-kumkum border-turmeric/40 rounded focus:ring-kumkum/20"
                />
                <label htmlFor="showLogo" className="text-xs font-semibold text-textInk">Show Gopuram Header Logo</label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="showSankalpa"
                  checked={printerSettings.showSankalpa}
                  onChange={(e) => setPrinterSettings({ ...printerSettings, showSankalpa: e.target.checked })}
                  className="w-4 h-4 text-kumkum border-turmeric/40 rounded focus:ring-kumkum/20"
                />
                <label htmlFor="showSankalpa" className="text-xs font-semibold text-textInk">Include Sankalpa Text on Bill</label>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-kumkum text-ivory rounded-xl font-bold text-sm shadow-md hover:bg-kumkum-dark transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                Saving Temple Information...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Temple Information
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
