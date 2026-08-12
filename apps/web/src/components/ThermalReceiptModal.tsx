import React from 'react';
import { X, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';

interface ThermalReceiptModalProps {
  receipt: any;
  temple?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
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
    deity: 'Sri Guru Raghavendra Swamy',
    address: 'Main Bazaar Road',
    city: 'Mantralayam',
    phone: '',
    receiptHeader: 'Om Sri Raghavendraya Namaha',
    receiptFooter: 'Thank you for your devotion & offerings.'
  };

  const addressLine = [templeInfo.address, templeInfo.city, templeInfo.state, templeInfo.pincode].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex justify-center items-start p-4 sm:p-10">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-turmeric/30 flex flex-col">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print p-4 bg-ivory border-b border-ivory-dark flex items-center justify-between">
          <h3 className="font-display font-bold text-kumkum text-lg">Thermal Receipt (80mm)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-kumkum hover:bg-kumkum-light text-ivory px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-textInk/60 hover:bg-ivory-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-black thermal-receipt-print">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-black/40 space-y-1">
            {templeInfo.receiptHeader && (
              <p className="text-[10px] font-bold text-center italic">{templeInfo.receiptHeader}</p>
            )}
            <h1 className="font-bold text-sm uppercase tracking-wide">{templeInfo.name}</h1>
            {templeInfo.deity && <p className="text-[10px]">{templeInfo.deity}</p>}
            {addressLine && <p className="text-[10px]">{addressLine}</p>}
            {templeInfo.phone && <p className="text-[10px]">Ph: {templeInfo.phone}</p>}
          </div>

          {/* Receipt Details */}
          <div className="py-3 border-b border-dashed border-black/40 space-y-1">
            <div className="flex justify-between font-bold">
              <span>Receipt #:</span>
              <span>{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(receipt.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-semibold">
                {receipt.paymentMode}
                {receipt.transactionRef ? ` (${receipt.transactionRef})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Receipt Kind:</span>
              <span>{receipt.kind}</span>
            </div>
          </div>

          {/* Devotee Info */}
          {receipt.devotee && (
            <div className="py-3 border-b border-dashed border-black/40 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold">Devotee Name:</span>
                <span>{receipt.devotee.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{receipt.devotee.phone}</span>
              </div>
              {(receipt.devotee.gotra || receipt.devotee.nakshatra) && (
                <div className="flex justify-between">
                  <span>Gotra / Nakshatra:</span>
                  <span>{receipt.devotee.gotra || '-'} / {receipt.devotee.nakshatra || '-'}</span>
                </div>
              )}
            </div>
          )}

          {/* Itemized Table */}
          <div className="py-3 border-b border-dashed border-black/40">
            <div className="flex justify-between font-bold pb-1 border-b border-black/20">
              <span className="w-1/2">Seva Item</span>
              <span className="w-1/4 text-center">Qty</span>
              <span className="w-1/4 text-right">Amount</span>
            </div>
            {receipt.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between py-1 text-[11px]">
                <span className="w-1/2">
                  <div className="font-bold">{item.description}</div>
                  {item.devoteeCount ? (
                    <div className="text-[9px] text-gray-700 font-semibold">Devotees: {item.devoteeCount}</div>
                  ) : null}
                </span>
                <span className="w-1/4 text-center font-bold">{item.quantity}</span>
                <span className="w-1/4 text-right font-mono font-bold">₹{Number(item.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="py-3 text-right space-y-1">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL AMOUNT:</span>
              <span>₹{Number(receipt.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {receipt.sankalpaNote && (
            <div className="py-2 border-t border-dashed border-black/40 text-[10px]">
              <span className="font-bold">Sankalpa Note: </span>
              <span>{receipt.sankalpaNote}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 text-center text-[10px] space-y-1">
            <p className="font-bold">|| Sri Krishnarpanamastu ||</p>
            {templeInfo.receiptFooter && (
              <p className="text-[9px] text-gray-700 font-medium">{templeInfo.receiptFooter}</p>
            )}
            <p className="text-[8px] text-gray-500">Issued by: {receipt.createdByUser?.fullName || 'Cashier'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
