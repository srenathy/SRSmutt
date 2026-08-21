import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { apiClient } from '../api/client.js';
import { ThermalReceiptModal } from '../components/ThermalReceiptModal.js';
import { FileText, Printer, LogOut, Home, Sparkles } from 'lucide-react';

export const DevoteeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [templeInfo, setTempleInfo] = useState<any>(null);
  const [selectedThermalReceipt, setSelectedThermalReceipt] = useState<any | null>(null);

  useEffect(() => {
    const fetchDevoteeData = async () => {
      try {
        const [profRes, recRes, templeRes] = await Promise.all([
          apiClient.get('/devotee-portal/my-profile'),
          apiClient.get('/devotee-portal/my-receipts'),
          apiClient.get('/temple/public').catch(() => ({ data: { data: null } }))
        ]);
        setProfile(profRes.data);
        setReceipts(recRes.data.data || []);
        if (templeRes?.data?.data) {
          setTempleInfo(templeRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch devotee data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevoteeData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-textInk font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-turmeric/20 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-kumkum/10 border border-kumkum/30 flex items-center justify-center text-kumkum font-bold text-xl shadow-2xs shrink-0">
              🕉️
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-bold text-kumkum leading-tight">
                Devotee Portal • Sri Raghavendra Swamy Matha
              </h1>
              <p className="text-xs text-textInk/60">Welcome, <strong className="text-textInk font-semibold">{user?.fullName || profile?.devotee?.name || 'Devotee'}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Link
              to="/"
              className="px-3 py-1.5 text-xs text-textInk/70 border border-turmeric/30 rounded-xl hover:bg-ivory hover:text-kumkum transition flex items-center gap-1.5 font-medium"
            >
              <Home className="w-3.5 h-3.5 text-kumkum" /> Public Home
            </Link>
            <Link
              to="/"
              className="px-3.5 py-1.5 text-xs font-bold text-ivory bg-kumkum rounded-xl hover:bg-kumkum-light transition shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Book Seva
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3 py-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition flex items-center gap-1.5 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 flex-1 w-full space-y-6">
        {/* Devotee Profile Header Card */}
        {profile?.devotee && (
          <div className="bg-white border border-turmeric/30 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-[#8C2F22] uppercase bg-[#8C2F22]/10 px-2.5 py-1 rounded-md border border-[#8C2F22]/20">
                REGISTERED DEVOTEE PROFILE
              </span>
              <h2 className="font-display text-2xl font-bold text-textInk pt-1">{profile.devotee.name}</h2>
              <p className="text-xs text-textInk/70 flex items-center gap-2">
                <span>📞 {profile.devotee.phone}</span>
                <span>•</span>
                <span>📍 {profile.devotee.city || 'Bengaluru'}</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-xs">
              <div className="bg-ivory px-3.5 py-2.5 rounded-2xl border border-turmeric/30 text-center">
                <span className="text-textInk/50 block text-[9px] font-bold tracking-wider uppercase">GOTRA</span>
                <span className="font-bold text-kumkum text-xs mt-0.5 block truncate max-w-[110px]">{profile.devotee.gotra || '—'}</span>
              </div>
              <div className="bg-ivory px-3.5 py-2.5 rounded-2xl border border-turmeric/30 text-center">
                <span className="text-textInk/50 block text-[9px] font-bold tracking-wider uppercase">NAKSHATRA</span>
                <span className="font-bold text-kumkum text-xs mt-0.5 block truncate max-w-[110px]">{profile.devotee.nakshatra || '—'}</span>
              </div>
              <div className="bg-ivory px-3.5 py-2.5 rounded-2xl border border-turmeric/30 text-center">
                <span className="text-textInk/50 block text-[9px] font-bold tracking-wider uppercase">RASHI</span>
                <span className="font-bold text-kumkum text-xs mt-0.5 block truncate max-w-[110px]">{profile.devotee.rashi || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Official Matha Bank & UPI Transfer Info Card */}
        {templeInfo && (templeInfo.upiId || templeInfo.bankName || templeInfo.accountNumber) && (
          <div className="bg-white border border-turmeric/30 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-turmeric/20 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#8C2F22] uppercase bg-[#8C2F22]/10 px-2.5 py-1 rounded-md border border-[#8C2F22]/20">
                  SACRED OFFERINGS &amp; SEVA KANIKE TRANSFERS
                </span>
                <h3 className="font-display text-lg font-bold text-[#2C221E] mt-1.5">
                  Official Matha Bank &amp; UPI Account Details
                </h3>
              </div>
              <p className="text-xs text-textInk/60 font-medium">
                For online Seva Kanike, E-Hundi, &amp; Shashwata Seva deposits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Left UPI Box */}
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl border border-amber-300 shadow-xs shrink-0 text-center">
                  <img
                    src={
                      templeInfo?.upiQrCode ||
                      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `upi://pay?pa=${templeInfo?.upiId || 'sripadarajamath@upi'}&pn=${encodeURIComponent(
                          templeInfo?.name || 'Sri Raghavendra Swamy Math'
                        )}&cu=INR`
                      )}`
                    }
                    alt="Temple UPI QR"
                    className="w-28 h-28 object-contain rounded-lg mx-auto"
                  />
                  <span className="text-[9px] font-bold text-amber-900 block mt-1">Scan & Pay (PhonePe / GPay)</span>
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wide">
                    📲 Direct Instant UPI VPA
                  </span>
                  <p className="font-mono text-sm sm:text-base font-bold text-kumkum select-all bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 inline-block shadow-2xs">
                    {templeInfo?.upiId || 'sripadarajamath@upi'}
                  </p>
                  <p className="text-[11px] text-amber-950/70 leading-relaxed">
                    Use Google Pay, PhonePe, Paytm, or any BHIM UPI app to transfer seva amount directly.
                  </p>
                </div>
              </div>

              {/* Right Bank Details Box */}
              {(templeInfo.bankName || templeInfo.accountNumber) && (
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 space-y-2 text-xs text-amber-950 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wide border-b border-amber-200/60 pb-1">
                    🏛️ Official Bank Details (NEFT / RTGS / IMPS)
                  </span>
                  <div className="space-y-1 text-[11px] font-medium pt-0.5">
                    {templeInfo.accountName && <p><strong>Beneficiary:</strong> {templeInfo.accountName}</p>}
                    {templeInfo.bankName && <p><strong>Bank:</strong> {templeInfo.bankName}</p>}
                    {templeInfo.accountNumber && <p><strong>Account No:</strong> <span className="font-mono font-bold text-kumkum select-all">{templeInfo.accountNumber}</span></p>}
                    {templeInfo.ifscCode && <p><strong>IFSC Code:</strong> <span className="font-mono font-bold select-all">{templeInfo.ifscCode}</span></p>}
                    {templeInfo.branchName && <p><strong>Branch:</strong> {templeInfo.branchName}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Seva Receipts Section */}
        <div className="bg-white border border-turmeric/30 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-kumkum">My Historical Seva Receipts</h3>
              <p className="text-xs text-textInk/60 mt-0.5">All sacred sevas and donations issued for your family</p>
            </div>
            <span className="text-xs font-mono font-bold text-turmeric-dark bg-turmeric/10 px-3 py-1 rounded-full border border-turmeric/30 w-fit">
              Total Receipts: {receipts.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-textInk/50">Loading your seva history...</div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-textInk/50 text-xs bg-ivory rounded-2xl border border-turmeric/20">
              No seva receipts recorded yet under your phone number. Visit temple billing counter or book online.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-turmeric/20">
              <table className="w-full text-left text-xs text-textInk">
                <thead className="bg-ivory text-textInk/70 font-semibold border-b border-turmeric/20 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Kind</th>
                    <th className="py-3 px-4">Seva Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-turmeric/10">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-ivory/50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-kumkum">{r.receiptNumber}</td>
                      <td className="py-3 px-4 text-textInk/60">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 font-semibold text-textInk">{r.kind?.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4">
                        {r.items?.map((item: any) => (
                          <div key={item.id} className="text-xs font-medium">
                            {item.description} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-turmeric-dark">
                        ₹{Number(r.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => window.open(`/receipt/${r.id}`, '_blank')}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" /> View PDF E-Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedThermalReceipt(r)}
                          className="px-3 py-1.5 text-xs font-bold bg-kumkum/10 text-kumkum border border-kumkum/30 rounded-xl hover:bg-kumkum/20 transition inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-kumkum" /> Thermal POS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Thermal POS Receipt Modal */}
      {selectedThermalReceipt && (
        <ThermalReceiptModal
          isOpen={true}
          receipt={selectedThermalReceipt}
          temple={templeInfo}
          onClose={() => setSelectedThermalReceipt(null)}
        />
      )}
    </div>
  );
};
