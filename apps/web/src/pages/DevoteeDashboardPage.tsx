import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [selectedThermalReceipt, setSelectedThermalReceipt] = useState<any | null>(null);
  const [selectedSankalpaReceipt, setSelectedSankalpaReceipt] = useState<any | null>(null);

  useEffect(() => {
    const fetchDevoteeData = async () => {
      try {
        const [profRes, recRes] = await Promise.all([
          apiClient.get('/devotee-portal/my-profile'),
          apiClient.get('/devotee-portal/my-receipts')
        ]);
        setProfile(profRes.data);
        setReceipts(recRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch devotee data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevoteeData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-amber-900/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-bold text-xl">
            🕉️
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-amber-300">
              Devotee Portal • Sri Raghavendra Swamy Matha
            </h1>
            <p className="text-xs text-slate-400">Welcome, {user?.fullName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="px-3.5 py-1.5 text-xs text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/10 transition"
          >
            Public Home
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-3.5 py-1.5 text-xs text-red-300 bg-red-950/40 border border-red-800/40 rounded-lg hover:bg-red-900/40 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6 flex-1 w-full space-y-8">
        {/* Devotee Profile Header */}
        {profile?.devotee && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-950 px-2.5 py-1 rounded border border-amber-800/50">
                REGISTERED DEVOTEE PROFILE
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-100 mt-2">{profile.devotee.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">📞 {profile.devotee.phone} • {profile.devotee.city || 'Mantralayam Kshetra'}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">GOTRA</span>
                <span className="font-bold text-amber-300">{profile.devotee.gotra || 'Not Specified'}</span>
              </div>
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">NAKSHATRA</span>
                <span className="font-bold text-amber-300">{profile.devotee.nakshatra || 'Not Specified'}</span>
              </div>
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">RASHI</span>
                <span className="font-bold text-amber-300">{profile.devotee.rashi || 'Not Specified'}</span>
              </div>
            </div>
          </div>
        )}

        {/* My Seva Receipts Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-amber-300">My Historical Seva Receipts</h3>
              <p className="text-xs text-slate-400 mt-0.5">All sacred sevas and donations issued for your family</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-800/40">
              Total Receipts: {receipts.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading your seva history...</div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
              No seva receipts recorded yet under your phone number. Visit temple billing counter or book online.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Kind</th>
                    <th className="py-3 px-4">Seva Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">{r.receiptNumber}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{r.kind.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        {r.items?.map((item: any) => (
                          <div key={item.id} className="text-xs">
                            {item.description} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        ₹{Number(r.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedThermalReceipt(r)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-500/30 transition"
                        >
                          🖨️ Thermal POS
                        </button>
                        <button
                          onClick={() => setSelectedSankalpaReceipt(r)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700 rounded hover:bg-slate-700 transition"
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
