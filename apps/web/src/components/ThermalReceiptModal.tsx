import React, { useState } from 'react';
import { X, Printer, FileText, Receipt, MessageCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { shareOrDownloadReceiptPdf } from '../utils/whatsappPdfShare.js';

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
  const [viewMode, setViewMode] = useState<'official' | 'thermal'>('official');
  const [sharingPdf, setSharingPdf] = useState(false);

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

  const handleWhatsappShare = async () => {
    setSharingPdf(true);
    try {
      const itemsList = receipt.items?.map((it: any) => `${it.description} (x${it.quantity})`).join(', ') || 'Seva';
      const receiptLink = `${window.location.origin}/receipt/${receipt.id}`;
      
      const text = `Jay Sri Krishna! 🙏\n\n*Mulabagala Sri Sripadaraja Matha (Rajajinagar Branch)*\n\n*Official Receipt No:* #${receipt.receiptNumber}\n*Devotee:* ${cleanDevoteeName}\n*Sevas:* ${itemsList}\n*Total Paid:* ₹${safeNum(receipt.totalAmount).toFixed(2)}\n*Payment Mode:* ${receipt.paymentMode}\n\n📄 *View & Download Official E-Receipt PDF:*\n${receiptLink}\n\nThank you for your devotion and divine contribution!`;

      await shareOrDownloadReceiptPdf({
        elementId: 'receipt-pdf-printable-container',
        fileName: `Receipt_${receipt.receiptNumber}.pdf`,
        phone: receipt.devotee?.phone,
        messageText: text
      });
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setSharingPdf(false);
    }
  };

  const templeInfo = temple || fetchedTemple || {
    name: 'ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಮಠ',
    secondaryName: 'ಶ್ರೀ ಶ್ರೀಪಾದರಾಜ ಮಠ (ಮುಳಬಾಗಿಲು)',
    address: 'ನಂ.542, 63ನೇ ಕ್ರಾಸ್, 5ನೇ ಬ್ಲಾಕ್, ರಾಜಾಜಿನಗರ, ಭಾಷ್ಯಂ ಸರ್ಕಲ್ ಹತ್ತಿರ, ಬೆಂಗಳೂರು-560010',
    phone1: '98446 87615',
    phone2: '94900 67092',
    bankName: 'Sri Badaraja Mutt',
    bankAccountNo: '41749373012',
    bankBranch: 'State Bank of India',
    bankIfsc: 'SBIN0020348',
    bankLocation: 'Rajajinagar, Bengaluru.'
  };

  const safeNum = (val: any) => {
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const formattedDate = receipt?.createdAt && !isNaN(new Date(receipt.createdAt).getTime())
    ? new Date(receipt.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });

  const isUpi = receipt?.paymentMode === 'UPI' || receipt?.paymentMode === 'CARD';
  const isCash = receipt?.paymentMode === 'CASH';

  // Clean devotee name removing any accidental (Devotee) string
  const cleanDevoteeName = receipt?.devotee?.name
    ? receipt.devotee.name.replace(/\s*\([^)]*devotee[^)]*\)/gi, '').trim()
    : 'Devotee';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 backdrop-blur-xs flex justify-center items-start p-2 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-turmeric/30 flex flex-col my-4">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print p-4 bg-ivory border-b border-ivory-dark flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('official')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'official'
                  ? 'bg-kumkum text-white shadow-sm'
                  : 'bg-white text-textInk/70 border border-turmeric/30 hover:bg-ivory'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Official Matha Voucher (Vertical)
            </button>

            <button
              onClick={() => setViewMode('thermal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'thermal'
                  ? 'bg-kumkum text-white shadow-sm'
                  : 'bg-white text-textInk/70 border border-turmeric/30 hover:bg-ivory'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              80mm Thermal Slip
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {receipt?.devotee?.phone && receipt.devotee.phone !== '0000000000' && (
              <button
                onClick={handleWhatsappShare}
                disabled={sharingPdf}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {sharingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3.5 h-3.5" />
                    Share Receipt PDF via WhatsApp
                  </>
                )}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-textInk/60 hover:bg-ivory-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-amber-50/20 font-serif text-maroon">
          {viewMode === 'official' ? (
            /* OFFICIAL MATHA HANDBILL RECEIPT TEMPLATE (VERTICAL) */
            <div id="receipt-pdf-printable-container" className="official-receipt-print border-2 border-red-900 p-4 bg-white rounded-md text-red-950 font-serif leading-tight shadow-sm max-w-lg mx-auto">
              {/* Header Phone & Invocations Bar */}
              <div className="flex justify-between items-start text-[10px] sm:text-[11px] font-bold border-b border-red-950/20 pb-2 text-red-950">
                <div className="space-y-0.5">
                  <p>Mob. : {templeInfo.phone1 || '98446 87615'}</p>
                  <p className="text-[9px]">|| ಶ್ರೀ ಗೋಪಿನಾಥೋ ವಿಜಯತೇ ||</p>
                  <p className="text-[9px]">ಶ್ರೀ ಮೂಲಗೋಪಾಲಕೃಷ್ಣೋ ವಿಜಯತೇ</p>
                  <p className="text-[9px]">ಶ್ರೀ ಪಾದರಾಜೋ ವಿಜಯತೇ</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p>Mob. : {templeInfo.phone2 || '94900 67092'}</p>
                  <p className="text-[9px]">ಶ್ರೀ ಮೂಲರಾಮೋ ವಿಜಯತೇ</p>
                  <p className="text-[9px]">ಶ್ರೀ ಗುರುರಾಜೋ ವಿಜಯತೇ</p>
                </div>
              </div>

              {/* Main Title Heading */}
              <div className="text-center my-2 space-y-0.5">
                <h1 className="font-bold text-base sm:text-lg text-red-950 tracking-wide">
                  Mulabagala Sri Sripadaraja Matha
                </h1>
                <h2 className="font-bold text-xs sm:text-sm text-red-900">
                  (Rajajinagar Branch)
                </h2>
                <h3 className="font-bold text-xs text-red-950 mt-0.5">
                  {templeInfo.name || 'ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಮಠ'}
                </h3>
                <p className="text-[10px] text-red-950/80 px-2 font-sans font-medium">
                  {templeInfo.address || 'ನಂ.542, 63ನೇ ಕ್ರಾಸ್, 5ನೇ ಬ್ಲಾಕ್, ರಾಜಾಜಿನಗರ, ಭಾಷ್ಯಂ ಸರ್ಕಲ್ ಹತ್ತಿರ, ಬೆಂಗಳೂರು-560010'}
                </p>
              </div>

              {/* RECEIPT Box */}
              <div className="text-center my-2">
                <span className="inline-block border-2 border-red-950 px-4 py-0.5 font-bold text-xs tracking-widest rounded-sm bg-red-50/50 text-red-950 uppercase">
                  RECEIPT
                </span>
              </div>

              {/* Receipt Number & Date */}
              <div className="flex justify-between items-center text-xs font-bold my-2 px-1">
                <div>
                  <span className="text-red-950">No.</span>{' '}
                  <span className="text-red-700 text-sm font-mono tracking-wider ml-2">{receipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-red-950">Date :</span>{' '}
                  <span className="border-b border-dotted border-red-950 font-mono text-red-900 px-2">{formattedDate}</span>
                </div>
              </div>

              {/* Devotee Info Section (Dotted Lines Style) */}
              <div className="space-y-2 text-xs text-red-950 my-3 font-sans">
                <div className="flex items-baseline">
                  <span className="font-bold whitespace-nowrap">Smt / Sri :</span>
                  <span className="flex-1 border-b border-dotted border-red-950 px-2 font-bold text-red-900 text-sm">
                    {cleanDevoteeName}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="font-bold whitespace-nowrap">Address :</span>
                  <span className="flex-1 border-b border-dotted border-red-950 px-2 font-medium">
                    {receipt.devotee?.city || '-'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex-1 flex items-baseline">
                    <span className="font-bold whitespace-nowrap">Phone :</span>
                    <span className="flex-1 border-b border-dotted border-red-950 px-2 font-mono">
                      {receipt.devotee?.phone || '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-baseline">
                    <span className="font-bold whitespace-nowrap">Gothra :</span>
                    <span className="flex-1 border-b border-dotted border-red-950 px-2 font-semibold">
                      {receipt.devotee?.gotra || '-'}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-bold whitespace-nowrap">Nakshtra :</span>
                    <span className="flex-1 border-b border-dotted border-red-950 px-2 font-semibold">
                      {receipt.devotee?.nakshatra || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seva Line Items Table */}
              <div className="border-2 border-red-950 rounded-xs overflow-hidden my-3">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-red-950 bg-red-50/60 text-red-950 font-bold">
                      <th className="p-2 text-left border-r border-red-950 w-2/3">Seva Details</th>
                      <th className="p-2 text-right w-1/3">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-red-950">
                    {receipt.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="min-h-12">
                        <td className="p-2 border-r border-red-950 font-sans">
                          <div className="font-bold text-red-950">{item.description}</div>
                          <div className="text-[10px] text-red-900 font-semibold mt-0.5">
                            (Devotees Count: {item.devoteeCount || 1})
                          </div>
                          {receipt.sankalpaNote && idx === 0 && (
                            <div className="text-[10px] text-red-800 italic mt-0.5">
                              Sankalpa: {receipt.sankalpaNote}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-red-950 align-top">
                          {(safeNum(item.amount) * safeNum(item.quantity || 1)).toFixed(0)}
                        </td>
                      </tr>
                    ))}

                    {/* Payment Mode info row inside table */}
                    {receipt.transactionRef || receipt.paymentMode ? (
                      <tr>
                        <td className="p-2 border-r border-red-950 font-sans text-xs font-bold text-red-900">
                          {receipt.paymentMode} {receipt.transactionRef ? `- ${receipt.transactionRef}` : ''}
                        </td>
                        <td className="p-2 text-right border-red-950"></td>
                      </tr>
                    ) : null}

                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-red-950 bg-red-50/40 font-bold text-sm text-red-950">
                      <td className="p-2 border-r border-red-950 text-right">TOTAL:</td>
                      <td className="p-2 text-right font-mono text-red-950">
                        {safeNum(receipt.totalAmount).toFixed(0)} - 00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Bank Details & Computer Generated Disclaimer Section */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-sans pt-2 border-t border-red-950/20">
                {/* Left: Bank Details Box */}
                <div className="border border-red-950 p-2 rounded-xs space-y-0.5 bg-red-50/20">
                  <p className="font-bold border-b border-red-950/30 pb-0.5 underline">Bank Details</p>
                  <p><span className="font-bold">Name :</span> {templeInfo.bankName || 'Sri Badaraja Mutt'}</p>
                  <p><span className="font-bold">A/c. No. :</span> {templeInfo.bankAccountNo || '41749373012'}</p>
                  <p><span className="font-bold">Bank :</span> {templeInfo.bankBranch || 'State Bank of India'}</p>
                  <p><span className="font-bold">IFSC :</span> {templeInfo.bankIfsc || 'SBIN0020348'}</p>
                  <p><span className="font-bold">Branch :</span> {templeInfo.bankLocation || 'Rajajinagar, Bengaluru.'}</p>
                  <div className="flex gap-4 pt-1 font-bold">
                    <span>PhonePe : [{isUpi ? '✓' : ' '}]</span>
                    <span>Cash : [{isCash ? '✓' : ' '}]</span>
                  </div>
                </div>

                {/* Right: Computer Generated Disclaimer Box */}
                <div className="flex flex-col justify-between text-right p-2 font-serif text-red-950">
                  <p className="text-[9px]">|| Sri Krishnarpanamastu ||</p>
                  <div className="space-y-1 pt-4">
                    <p className="font-bold text-[10px]">For Sri Raghavendra Swamy Math</p>
                    <p className="text-[8px] font-semibold text-red-900 leading-tight">
                      * This is a computer system-generated receipt. No manual signature/authorization required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* THERMAL 80MM SLIP TEMPLATE */
            <div className="p-4 overflow-y-auto font-mono text-xs text-black thermal-receipt-print max-w-xs mx-auto bg-white border border-gray-300 rounded-md">
              <div className="text-center pb-3 border-b border-dashed border-black/40 space-y-1">
                <h1 className="font-bold text-sm uppercase tracking-wide">Mulabagala Sri Sripadaraja Matha</h1>
                <p className="font-bold text-xs">(Rajajinagar Branch)</p>
                <p className="text-[10px]">{templeInfo.address}</p>
              </div>

              <div className="py-3 border-b border-dashed border-black/40 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Receipt #:</span>
                  <span>{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-semibold">{receipt.paymentMode}</span>
                </div>
              </div>

              {receipt.devotee && (
                <div className="py-3 border-b border-dashed border-black/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Devotee:</span>
                    <span>{cleanDevoteeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gotra:</span>
                    <span>{receipt.devotee.gotra || '-'}</span>
                  </div>
                </div>
              )}

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
                    <span className="w-1/4 text-right font-mono font-bold">₹{safeNum(item.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="py-3 text-right space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{safeNum(receipt.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 text-center text-[10px] space-y-1">
                <p className="font-bold">|| Sri Krishnarpanamastu ||</p>
                <p className="text-[8px] text-gray-600 italic">This is a computer-generated receipt. No signature required.</p>
                <p className="text-[8px] text-gray-500">Issued by: {receipt.createdByUser?.fullName || 'Cashier'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
