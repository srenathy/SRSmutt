import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Printer, Download, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { shareOrDownloadReceiptPdf } from '../utils/whatsappPdfShare.js';

export const PublicReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [downloading, setDownloading] = useState(false);

  const { data: receipt, isLoading, error } = useQuery({
    queryKey: ['public-receipt', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/receipts/public/${id}`);
        if (res.data?.data) return res.data.data;
      } catch {
        // Fallback to /billing/public
      }
      const res = await apiClient.get(`/billing/public/${id}`);
      return res.data?.data;
    },
    enabled: !!id
  });

  const { data: templeData } = useQuery({
    queryKey: ['public-temple-info'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/temple/public');
        return res.data?.data;
      } catch {
        return null;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-kumkum animate-spin mb-4" />
        <h2 className="font-display text-lg font-bold text-kumkum">Loading Official Seva Receipt...</h2>
        <p className="text-xs text-textInk/60 mt-1">Sri Raghavendra Swamy Brindavana Sannidhana</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-xl max-w-md w-full space-y-4">
          <h2 className="font-display text-xl font-bold text-kumkum">Receipt Not Found</h2>
          <p className="text-xs text-textInk/70">
            The requested receipt link is invalid or may have been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kumkum text-white font-bold text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Matha Home
          </Link>
        </div>
      </div>
    );
  }

  const safeNum = (val: any) => {
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const formattedDate = receipt.createdAt && !isNaN(new Date(receipt.createdAt).getTime())
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

  const cleanDevoteeName = receipt.devotee?.name
    ? receipt.devotee.name.replace(/\s*\([^)]*devotee[^)]*\)/gi, '').trim()
    : 'Devotee';

  const templeInfo = {
    name: templeData?.name || 'ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಮಠ',
    secondaryName: 'ಶ್ರೀ ಶ್ರೀಪಾದರಾಜ ಮಠ (ಮುಳಬಾಗಿಲು)',
    address: templeData?.address ? `${templeData.address}${templeData.city ? `, ${templeData.city}` : ''}${templeData.pincode ? ` - ${templeData.pincode}` : ''}` : 'ನಂ.542, 63ನೇ ಕ್ರಾಸ್, 5ನೇ ಬ್ಲಾಕ್, ರಾಜಾಜಿನಗರ, ಭಾಷ್ಯಂ ಸರ್ಕಲ್ ಹತ್ತಿರ, ಬೆಂಗಳೂರು-560010',
    phone1: templeData?.phone || '98446 87615',
    phone2: '94900 67092',
    accountName: templeData?.accountName || 'Sri Badaraja Mutt',
    accountNumber: templeData?.accountNumber || '41749373012',
    bankName: templeData?.bankName || 'State Bank of India',
    ifscCode: templeData?.ifscCode || 'SBIN0020348',
    branchName: templeData?.branchName || 'Rajajinagar, Bengaluru.',
    upiId: templeData?.upiId || 'raghavendra@upi',
    upiQrCode: templeData?.upiQrCode || null
  };

  const isUpi = receipt.paymentMode === 'UPI' || receipt.paymentMode === 'CARD';
  const isCash = receipt.paymentMode === 'CASH';

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const itemsList = receipt.items?.map((it: any) => `${it.description} (x${it.quantity})`).join(', ') || 'Seva';
      const text = `Jay Sri Krishna! 🙏\n\n*Mulabagala Sri Sripadaraja Matha (Rajajinagar Branch)*\n\n*Official Receipt No:* #${receipt.receiptNumber}\n*Devotee:* ${cleanDevoteeName}\n*Sevas:* ${itemsList}\n*Total Paid:* ₹${safeNum(receipt.totalAmount).toFixed(2)}\n\n📄 *Official E-Receipt Link:* ${window.location.href}`;

      await shareOrDownloadReceiptPdf({
        elementId: 'public-receipt-printable-container',
        fileName: `Receipt_${receipt.receiptNumber}.pdf`,
        phone: receipt.devotee?.phone,
        messageText: text
      });
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] py-8 px-4 flex flex-col items-center">
      {/* Top Controls */}
      <div className="no-print max-w-lg w-full mb-6 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-turmeric/30 text-xs font-bold text-textInk hover:bg-ivory shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-kumkum" /> Matha Portal
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-kumkum text-white text-xs font-bold shadow-md hover:bg-kumkum-light disabled:opacity-50 transition-all"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download PDF
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-md hover:bg-emerald-800 transition-all"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Main Printable Receipt Card (Official Handbill Format matching Billing) */}
      <div className="max-w-lg w-full">
        <div
          id="public-receipt-printable-container"
          className="official-receipt-print border-2 border-red-900 p-4 sm:p-5 bg-white rounded-md text-red-950 font-serif leading-tight shadow-xl space-y-2.5 mx-auto"
        >
          {/* Header Phone & Invocations Bar */}
          <div className="flex justify-between items-start text-[10px] sm:text-[11px] font-bold border-b border-red-950/20 pb-2 text-red-950">
            <div className="space-y-0.5">
              <p>Mob. : {templeInfo.phone1}</p>
              <p className="text-[9px]">|| ಶ್ರೀ ಗೋಪಿನಾಥೋ ವಿಜಯತೇ ||</p>
              <p className="text-[9px]">ಶ್ರೀ ಮೂಲಗೋಪಾಲಕೃಷ್ಣೋ ವಿಜಯತೇ</p>
              <p className="text-[9px]">ಶ್ರೀ ಶ್ರೀಪಾದರಾಜೋ ವಿಜಯತೇ</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p>Mob. : {templeInfo.phone2}</p>
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
              {templeInfo.name}
            </h3>
            <p className="text-[10px] text-red-950/80 px-2 font-sans font-medium">
              {templeInfo.address}
            </p>
          </div>

          {/* RECEIPT Box */}
          <div className="text-center my-1.5">
            <span className="inline-block border-2 border-red-950 px-4 py-0.5 font-bold text-xs tracking-widest rounded-sm bg-red-50/50 text-red-950 uppercase">
              RECEIPT
            </span>
          </div>

          {/* Receipt Number & Date */}
          <div className="flex justify-between items-center text-xs font-bold my-1.5 px-1">
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
          <div className="space-y-2 text-xs text-red-950 my-2.5 font-sans">
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
          <div className="border-2 border-red-950 rounded-xs overflow-hidden my-2.5">
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
              <p><span className="font-bold">Name :</span> {templeInfo.accountName}</p>
              <p><span className="font-bold">A/c. No. :</span> {templeInfo.accountNumber}</p>
              <p><span className="font-bold">Bank :</span> {templeInfo.bankName}</p>
              <p><span className="font-bold">IFSC :</span> {templeInfo.ifscCode}</p>
              <p><span className="font-bold">Branch :</span> {templeInfo.branchName}</p>
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
      </div>
    </div>
  );
};
