import React from 'react';
import { X, Printer } from 'lucide-react';

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
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const templeInfo = temple || {
    name: 'Sri Raghavendra Swamy Matha',
    deity: 'Sri Guru Raghavendra Swamy',
    address: 'Main Bazaar Road, Mantralayam',
    city: 'Mantralayam',
    phone: '+91 8512 279400'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
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
            <h1 className="font-bold text-sm uppercase tracking-wide">{templeInfo.name}</h1>
            <p className="text-[10px]">{templeInfo.deity}</p>
            <p className="text-[10px]">{templeInfo.address}, {templeInfo.city}</p>
            <p className="text-[10px]">Ph: {templeInfo.phone}</p>
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
              <span className="font-semibold">{receipt.paymentMode}</span>
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
              {receipt.devotee.gotra && (
                <div className="flex justify-between">
                  <span>Gotra / Nakshatra:</span>
                  <span>{receipt.devotee.gotra} / {receipt.devotee.nakshatra || '-'}</span>
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
                <span className="w-1/2 truncate">{item.description}</span>
                <span className="w-1/4 text-center">{item.quantity}</span>
                <span className="w-1/4 text-right">₹{Number(item.amount).toFixed(2)}</span>
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
            <p>Thank you for your devotion & offerings.</p>
            <p className="text-[8px] text-gray-500">Issued by: {receipt.createdByUser?.fullName || 'Cashier'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
