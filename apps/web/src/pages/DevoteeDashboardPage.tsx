import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { apiClient } from '../api/client.js';
import { ThermalReceiptModal } from '../components/ThermalReceiptModal.js';
import { SankalpaModal } from '../components/SankalpaModal.js';

export const DevoteeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [templeInfo, setTempleInfo] = useState<any>(null);
  const [selectedThermalReceipt, setSelectedThermalReceipt] = useState<any | null>(null);
  const [selectedSankalpaReceipt, setSelectedSankalpaReceipt] = useState<any | null>(null);

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
    <div className="min-h-screen bg-ivory-light text-textInk font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-turmeric/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-kumkum/10 border border-kumkum/30 flex items-center justify-center text-kumkum font-bold text-xl">
            🕉️
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-kumkum">
              Devotee Portal • Sri Raghavendra Swamy Matha
            </h1>
            <p className="text-xs text-textInk/60">Welcome, {user?.fullName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="px-3.5 py-1.5 text-xs text-kumkum border border-kumkum/30 rounded-lg hover:bg-kumkum/5 transition font-medium"
          >
            Public Home
          </Link>
          <Link
            to="/"
            className="px-4 py-1.5 text-xs font-bold text-ivory bg-kumkum rounded-lg hover:bg-kumkum-light transition shadow-sm"
          >
            🕉️ Book New Seva
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-3.5 py-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 flex-1 w-full space-y-8">
        {/* Devotee Profile Header */}
        {profile?.devotee && (
          <div className="bg-white border border-turmeric/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-turmeric uppercase bg-turmeric/10 px-2.5 py-1 rounded border border-turmeric/30">
                REGISTERED DEVOTEE PROFILE
              </span>
              <h2 className="font-display text-2xl font-bold text-ink mt-2">{profile.devotee.name}</h2>
              <p className="text-xs text-textInk/60 mt-0.5">📞 {profile.devotee.phone} • {profile.devotee.city || 'Mantralayam Kshetra'}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <div className="bg-ivory px-4 py-2 rounded-xl border border-turmeric/20">
                <span className="text-textInk/50 block text-[10px]">GOTRA</span>
                <span className="font-bold text-kumkum">{profile.devotee.gotra || 'Not Specified'}</span>
              </div>
              <div className="bg-ivory px-4 py-2 rounded-xl border border-turmeric/20">
                <span className="text-textInk/50 block text-[10px]">NAKSHATRA</span>
                <span className="font-bold text-kumkum">{profile.devotee.nakshatra || 'Not Specified'}</span>
              </div>
              <div className="bg-ivory px-4 py-2 rounded-xl border border-turmeric/20">
                <span className="text-textInk/50 block text-[10px]">RASHI</span>
                <span className="font-bold text-kumkum">{profile.devotee.rashi || 'Not Specified'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Official Matha Bank & UPI Transfer Info Card */}
        {templeInfo && (templeInfo.upiId || templeInfo.bankName || templeInfo.accountNumber) && (
          <div className="bg-white border border-turmeric/30 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-turmeric/20 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#8C2F22] uppercase bg-[#8C2F22]/10 px-2.5 py-1 rounded border border-[#8C2F22]/20">
                  SACRED OFFERINGS &amp; SEVA KANIKE TRANSFERS
                </span>
                <h3 className="font-display text-lg font-bold text-[#2C221E] mt-2">
                  Official Matha Bank &amp; UPI Account Details
                </h3>
              </div>
              <p className="text-xs text-textInk/60 font-medium">
                For online Seva Kanike, E-Hundi, &amp; Shashwata Seva deposits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templeInfo.upiId && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wide">
                      📲 Direct Instant UPI VPA
                    </span>
                    <p className="font-mono text-base font-bold text-kumkum mt-1 select-all">
                      {templeInfo.upiId}
                    </p>
                  </div>
                  <p className="text-[11px] text-amber-950/70">
                    Use Google Pay, PhonePe, Paytm, or any BHIM UPI app to transfer seva amount directly.
                  </p>
                </div>
              )}

              {(templeInfo.bankName || templeInfo.accountNumber) && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-1.5 text-xs text-amber-950">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wide">
                    🏛️ Official Bank Details (NEFT / RTGS / IMPS)
                  </span>
                  <div className="space-y-1 text-[11px] font-medium pt-1">
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
        <div className="bg-white border border-turmeric/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-kumkum">My Historical Seva Receipts</h3>
              <p className="text-xs text-textInk/60 mt-0.5">All sacred sevas and donations issued for your family</p>
            </div>
            <span className="text-xs font-mono font-bold text-turmeric bg-turmeric/10 px-3 py-1 rounded-full border border-turmeric/30">
              Total Receipts: {receipts.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-textInk/50">Loading your seva history...</div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-textInk/50 text-xs bg-ivory rounded-xl border border-turmeric/20">
              No seva receipts recorded yet under your phone number. Visit temple billing counter or book online.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-textInk">
                <thead className="bg-ivory text-textInk/60 font-semibold border-b border-turmeric/20 uppercase tracking-wider text-[10px]">
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
                    <tr key={r.id} className="hover:bg-ivory transition">
                      <td className="py-3 px-4 font-mono font-bold text-kumkum">{r.receiptNumber}</td>
                      <td className="py-3 px-4 text-textInk/60">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 font-semibold text-textInk">{r.kind.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        {r.items?.map((item: any) => (
                          <div key={item.id} className="text-xs">
                            {item.description} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-turmeric-dark">
                        ₹{Number(r.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => window.open(`/receipt/${r.id}`, '_blank')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded hover:bg-emerald-200 transition"
                        >
                          📄 View PDF E-Receipt
                        </button>
                        <button
                          onClick={() => setSelectedThermalReceipt(r)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-kumkum/10 text-kumkum border border-kumkum/30 rounded hover:bg-kumkum/20 transition"
                        >
                          🖨️ Thermal POS
                        </button>
                        <button
                          onClick={() => setSelectedSankalpaReceipt(r)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-turmeric/10 text-turmeric-dark border border-turmeric/30 rounded hover:bg-turmeric/20 transition"
                        >
                          📜 Sankalpa Sheet
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
          onClose={() => setSelectedThermalReceipt(null)}
        />
      )}

      {/* Priest Sankalpa Sheet Modal */}
      {selectedSankalpaReceipt && (
        <SankalpaModal
          isOpen={true}
          receipt={selectedSankalpaReceipt}
          onClose={() => setSelectedSankalpaReceipt(null)}
        />
      )}
    </div>
  );
};
