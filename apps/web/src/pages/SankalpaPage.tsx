import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Search, Printer, Calendar, Filter, RefreshCw, Scroll } from 'lucide-react';

export const SankalpaPage: React.FC = () => {
  // Get today's local date in YYYY-MM-DD format
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [sevaFilter, setSevaFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch active sevas for the filter dropdown
  const { data: sevas } = useQuery({
    queryKey: ['active-sevas'],
    queryFn: async () => {
      const res = await apiClient.get('/sevas');
      return res.data.data?.filter((s: any) => s.active) || [];
    }
  });

  // Fetch sankalpa list from the server
  const { data: listData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sankalpa-list', dateFilter, sevaFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: dateFilter,
        ...(sevaFilter && { sevaId: sevaFilter })
      });
      const res = await apiClient.get(`/receipts/sankalpa?${params.toString()}`);
      return res.data.data || [];
    }
  });

  // Filter the fetched list locally by search term (excluding direct income / hundi entries)
  const filteredList = listData?.filter((item: any) => {
    const devotee = item.receipt?.devotee || {};
    if (
      item.receipt?.kind === 'HUNDI_COLLECTION' ||
      devotee.phone === '0000000000' ||
      devotee.name?.toLowerCase().includes('general temple income') ||
      devotee.name?.toLowerCase().includes('hundi')
    ) {
      return false;
    }

    const name = (devotee.name || '').toLowerCase();
    const phone = (devotee.phone || '').toLowerCase();
    const gotra = (devotee.gotra || '').toLowerCase();
    const nakshatra = (devotee.nakshatra || '').toLowerCase();
    const rashi = (devotee.rashi || '').toLowerCase();
    const sevaName = (item.seva?.name || item.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      phone.includes(search) ||
      gotra.includes(search) ||
      nakshatra.includes(search) ||
      rashi.includes(search) ||
      sevaName.includes(search)
    );
  }) || [];

  const handlePrint = () => {
    window.print();
  };

  // Group items by Seva for stats cards
  const sevaStats = filteredList.reduce((acc: any, curr: any) => {
    const sName = curr.seva?.name || curr.description || 'Other Offering';
    acc[sName] = (acc[sName] || 0) + curr.quantity;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="font-display text-2xl font-bold text-kumkum flex items-center gap-2">
            <Scroll className="w-6 h-6 text-kumkum" />
            Daily Sankalpa List (Pooja)
          </h2>
          <p className="text-xs text-textInk/60 mt-1">
            Generate and print daily sankalpa details of devotees for priests to read during pooja.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white hover:bg-ivory border border-turmeric/30 rounded-xl text-textInk/60 hover:text-kumkum transition-all disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredList.length === 0}
            className="flex items-center gap-1.5 bg-kumkum hover:bg-kumkum-light text-ivory px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print Pooja List
          </button>
        </div>
      </div>

      {/* Filters Bar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-2xl border border-turmeric/20 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 no-print">
        <div className="relative">
          <label className="text-[10px] font-bold text-textInk/50 uppercase tracking-wide block mb-1">Pooja Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textInk/40" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum/40"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-textInk/50 uppercase tracking-wide block mb-1">Filter by Seva</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textInk/40" />
            <select
              value={sevaFilter}
              onChange={(e) => setSevaFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum/40"
            >
              <option value="">All Sevas</option>
              {sevas?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₹{Number(s.amount).toFixed(0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative md:col-span-2">
          <label className="text-[10px] font-bold text-textInk/50 uppercase tracking-wide block mb-1">Search Devotee</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textInk/40" />
            <input
              type="text"
              placeholder="Search by devotee, gotra, nakshatra, rashi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-kumkum/40"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards (Hidden on Print) */}
      {filteredList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 no-print">
          <div className="bg-white p-4 rounded-xl border border-turmeric/20 shadow-sm">
            <p className="text-[10px] font-bold text-textInk/50 uppercase tracking-wider">Total Seva Bookings</p>
            <p className="text-2xl font-bold text-kumkum mt-1">{filteredList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-turmeric/20 shadow-sm md:col-span-3">
            <p className="text-[10px] font-bold text-textInk/50 uppercase tracking-wider mb-2">Bookings Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sevaStats).map(([name, qty]: any) => (
                <span
                  key={name}
                  className="bg-ivory border border-turmeric/30 text-textInk text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                >
                  {name}: <span className="text-kumkum font-bold font-mono">{qty}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shashwata Seva Annual Reminders & Scheduled Performance Notification Banner */}
      {filteredList.some((item: any) => item.shashwataSevaId || item.shashwataSeva) && (
        <div className="no-print p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 font-bold text-lg">
              🔔
            </div>
            <div>
              <p className="font-bold text-xs">Annual Shashwata Seva Reminders & Scheduled Sankalpa List Active!</p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Automatically recurring annual Shashwata Sevas matching this date ({new Date(dateFilter).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}) are highlighted below and included for priest sankalpa recitation.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200/60 rounded-lg text-amber-950 font-bold text-[11px] shrink-0">
            {filteredList.filter((item: any) => item.shashwataSevaId || item.shashwataSeva).length} Annual Recurrences
          </span>
        </div>
      )}

      {/* Printable Area - Header (Only Visible on Print) */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6 space-y-1">
        <h1 className="font-serif text-xl font-bold uppercase tracking-wider">
          SHREE GURU RAGHAVENDRA SWAMY MATHA
        </h1>
        <p className="text-xs font-serif italic">Sri Raghavendra Swamy Brindavana Sannidhana, Mulabagala</p>
        <div className="flex justify-between items-center text-xs font-mono pt-4">
          <span>SANKALPA SEVA LIST</span>
          <span className="font-bold">DATE: {new Date(dateFilter).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-turmeric/20 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-ivory/50 border-b border-turmeric/20 text-left text-xs font-bold text-textInk/80 print:bg-gray-100 print:border-black print:border-b-2">
                <th className="p-4 print:p-2 w-12 text-center">S.No</th>
                <th className="p-4 print:p-2">Devotee Name</th>
                <th className="p-4 print:p-2">Gotra</th>
                <th className="p-4 print:p-2">Nakshatra</th>
                <th className="p-4 print:p-2">Rashi</th>
                <th className="p-4 print:p-2">Seva Name</th>
                <th className="p-4 print:p-2">Sankalpa Note / Special Request</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-dark print:divide-y print:divide-black">
              {isLoading ? (
                <tr className="no-print">
                  <td colSpan={7} className="p-8 text-center text-textInk/50">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-kumkum" />
                      Loading daily sankalpa list...
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-textInk/50 font-medium">
                    No active seva bookings found for {new Date(dateFilter).toLocaleDateString('en-IN', { dateStyle: 'medium' })}.
                  </td>
                </tr>
              ) : (
                filteredList.map((item: any, idx: number) => {
                  const devotee = item.receipt?.devotee || {};
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-ivory/20 text-xs text-textInk print:text-black print:hover:bg-transparent"
                    >
                      <td className="p-4 print:p-2 text-center font-mono font-semibold">{idx + 1}</td>
                      <td className="p-4 print:p-2 font-bold">{devotee.name || '-'}</td>
                      <td className="p-4 print:p-2 font-semibold text-textInk/90 print:text-black">{devotee.gotra || '-'}</td>
                      <td className="p-4 print:p-2 text-textInk/90 print:text-black">{devotee.nakshatra || '-'}</td>
                      <td className="p-4 print:p-2 text-textInk/90 print:text-black">{devotee.rashi || '-'}</td>
                      <td className="p-4 print:p-2 font-bold text-kumkum print:text-black">
                        <div className="flex flex-col">
                          <span>{item.seva?.name || item.shashwataSeva?.name || item.description || 'Seva'}</span>
                          <div className="flex items-center gap-1 mt-0.5 no-print">
                            {item.shashwataSevaId || item.shashwataSeva ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                                ⏳ Annual Shashwata Recurrence
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[9px] font-bold">
                                🌸 Scheduled Performance
                              </span>
                            )}
                            <span className="text-[10px] font-normal text-textInk/60">
                              (Qty: {item.quantity}{item.devoteeCount ? ` | Devotees: ${item.devoteeCount}` : ''})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 print:p-2 text-textInk/70 italic print:text-black">
                        {item.receipt?.sankalpaNote || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Area - Footer (Only Visible on Print) */}
      <div className="hidden print:block pt-12 text-right">
        <div className="inline-block border-t border-black pt-2 text-xs font-bold text-center w-48">
          Temple Priest / Archakar
        </div>
      </div>
    </div>
  );
};
