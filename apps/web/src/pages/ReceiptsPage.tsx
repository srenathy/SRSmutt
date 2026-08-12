import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ThermalReceiptModal } from '../components/ThermalReceiptModal';
import { Search, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentMode, ReceiptKind } from '@temple/shared';

export const ReceiptsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showThermalModal, setShowThermalModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', page, search, startDate, endDate, kindFilter, paymentFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(kindFilter && { kind: kindFilter }),
        ...(paymentFilter && { paymentMode: paymentFilter })
      });
      const res = await apiClient.get(`/receipts?${params.toString()}`);
      return res.data;
    }
  });

  const handleReprintThermal = async (id: string) => {
    try {
      const res = await apiClient.get(`/receipts/${id}/reprint`);
      setSelectedReceipt(res.data.data.receipt);
      setShowThermalModal(true);
    } catch (err) {
      console.error('Failed to load reprint payload:', err);
    }
  };

  const handleReprintSankalpa = async (id: string) => {
    try {
      const res = await apiClient.get(`/receipts/${id}/reprint`);
      setSelectedReceipt(res.data.data.receipt);
      setShowSankalpaModal(true);
    } catch (err) {
      console.error('Failed to load reprint payload:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-kumkum">Receipt History & Reprints</h2>
        <p className="text-xs text-textInk/60 mt-1">Audit log of issued receipts, search, and reprint triggers.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-turmeric/20 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textInk/40" />
          <input
            type="text"
            placeholder="Search by receipt # or devotee name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs focus:outline-none"
          />
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs"
          />
        </div>

        <div>
          <select
            value={kindFilter}
            onChange={(e) => {
              setKindFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs"
          >
            <option value="">All Kinds</option>
            <option value={ReceiptKind.NEW_SEVA}>Regular Seva</option>
            <option value={ReceiptKind.SHASHWATA_SEVA}>Shashwata Seva</option>
            <option value={ReceiptKind.KIND_DONATION}>In-Kind Donation</option>
          </select>
        </div>

        <div>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-turmeric/30 rounded-xl text-xs"
          >
            <option value="">All Payment Modes</option>
            <option value={PaymentMode.CASH}>Cash</option>
            <option value={PaymentMode.UPI}>UPI</option>
            <option value={PaymentMode.CARD}>Card</option>
            <option value={PaymentMode.BANK}>Bank</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-turmeric/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory text-textInk/70 font-semibold border-b border-ivory-dark">
              <tr>
                <th className="p-4">Receipt Number</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Devotee Name</th>
                <th className="p-4">Kind</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Total (₹)</th>
                <th className="p-4 text-right">Actions / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-dark/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-textInk/50">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-turmeric border-t-transparent" />
                      Loading receipts...
                    </div>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-textInk/50">
                    No receipts found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                data?.data?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-ivory/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-kumkum">{r.receiptNumber}</td>
                    <td className="p-4 text-textInk/70">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-textInk">
                      {r.devotee?.name || 'Walk-in Devotee'} <span className="text-[10px] text-textInk/50 font-normal">({r.devotee?.phone || 'No phone'})</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-ivory px-2 py-1 rounded border border-turmeric/30 text-[10px] font-semibold">
                        {r.kind?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-textInk">
                      {r.paymentMode}
                      {r.transactionRef && (
                        <div className="text-[10px] text-textInk/50 font-mono font-normal">Ref: {r.transactionRef}</div>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-kumkum">
                      ₹{Number(r.totalAmount).toFixed(2)}
                    </td>
                    <td className="p-4 text-right shrink-0 whitespace-nowrap">
                      <button
                        onClick={() => handleReprintThermal(r.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-kumkum/10 text-kumkum border border-kumkum/30 rounded-lg hover:bg-kumkum hover:text-ivory transition-all inline-flex items-center gap-1.5 shadow-xs"
                        title="Print 80mm Thermal Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Reprint POS
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data?.meta && (
          <div className="p-4 bg-ivory-light/40 border-t border-ivory-dark flex items-center justify-between text-xs text-textInk/70">
            <span>
              Page <strong className="text-kumkum">{data.meta.page}</strong> of{' '}
              <strong className="text-kumkum">{data.meta.totalPages}</strong> ({data.meta.total} receipts total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={!data.meta.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-turmeric/30 disabled:opacity-40 hover:bg-ivory"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-turmeric/30 disabled:opacity-40 hover:bg-ivory"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reprints Thermal Modal */}
      <ThermalReceiptModal
        receipt={selectedReceipt}
        isOpen={showThermalModal}
        onClose={() => setShowThermalModal(false)}
      />
    </div>
  );
};
