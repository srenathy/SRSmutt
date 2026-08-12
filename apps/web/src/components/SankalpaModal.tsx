import React from 'react';
import { X, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';

interface SankalpaModalProps {
  receipt: any;
  temple?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SankalpaModal: React.FC<SankalpaModalProps> = ({
  receipt,
  temple,
  isOpen,
  onClose
}) => {
  const { data: fetchedTemple } = useQuery({
    queryKey: ['temple-info-modal'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/temple/public');
        return res.data?.data;
      } catch (e) {
        try {
          const res = await apiClient.get('/temple');
          return res.data?.data;
        } catch (e2) {
          return null;
        }
      }
    },
    enabled: isOpen
  });

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const templeInfo = temple || fetchedTemple || {
    name: 'Sri Raghavendra Swamy Matha',
    deity: 'Sri Guru Raghavendra Swamy'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex justify-center items-start p-4 sm:p-10">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-turmeric/30 flex flex-col">
        {/* Control Header */}
        <div className="no-print p-4 bg-ivory border-b border-ivory-dark flex items-center justify-between">
          <h3 className="font-display font-bold text-kumkum text-lg">Priest Sankalpa Print Sheet (No Prices)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-kumkum hover:bg-kumkum-light text-ivory px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Sankalpa Sheet
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-textInk/60 hover:bg-ivory-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Priest Sankalpa Sheet */}
        <div className="p-8 sankalpa-print bg-ivory-light/30">
          <div className="text-center border-b-2 border-kumkum pb-4 mb-6">
            <h1 className="font-display text-2xl font-bold text-kumkum">{templeInfo.name}</h1>
            <p className="text-sm font-semibold text-turmeric-dark mt-1">SANKALPA RITUAL PRAYER SHEET</p>
            <p className="text-xs text-textInk/60 mt-1">Receipt #: {receipt.receiptNumber} | Date: {receipt?.createdAt && !isNaN(new Date(receipt.createdAt).getTime()) ? new Date(receipt.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</p>
          </div>

          {/* Devotee Vedic Attributes Grid */}
          <div className="bg-white p-6 rounded-xl border border-turmeric/30 mb-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-kumkum mb-4 border-b border-ivory-dark pb-2">
              Kartha (Devotee) Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold text-textInk/60">Devotee Name: </span>
                <span className="font-semibold text-kumkum text-base">{receipt.devotee?.name || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-textInk/60">Gotra: </span>
                <span className="font-semibold">{receipt.devotee?.gotra || 'Kashyapa / Unspecified'}</span>
              </div>
              <div>
                <span className="font-bold text-textInk/60">Nakshatra: </span>
                <span className="font-semibold">{receipt.devotee?.nakshatra || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-textInk/60">Rashi: </span>
                <span className="font-semibold">{receipt.devotee?.rashi || '-'}</span>
              </div>
            </div>
          </div>

          {/* Sevas to Perform (NO PRICES) */}
          <div className="bg-white p-6 rounded-xl border border-turmeric/30 mb-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-kumkum mb-4 border-b border-ivory-dark pb-2">
              Sevas to Perform
            </h2>
            <ul className="space-y-2">
              {receipt.items?.map((item: any, idx: number) => (
                <li key={idx} className="flex items-center gap-3 text-base font-semibold text-textInk">
                  <span className="h-2 w-2 rounded-full bg-turmeric"></span>
                  <span>{item.description}</span>
                  <span className="text-xs text-textInk/60 font-medium">
                    (Qty: {item.quantity}{item.devoteeCount ? ` | ${item.devoteeCount} Devotee${item.devoteeCount > 1 ? 's' : ''}` : ''})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {receipt.sankalpaNote && (
            <div className="bg-ivory p-4 rounded-xl border border-turmeric/20 text-xs">
              <span className="font-bold text-kumkum">Special Prayer Request: </span>
              <span className="italic">{receipt.sankalpaNote}</span>
            </div>
          )}

          <div className="mt-8 text-center text-xs font-bold text-kumkum">
            <p>|| Subhamastu — May the divine blessings be bestowed upon the devotee ||</p>
          </div>
        </div>
      </div>
    </div>
  );
};
