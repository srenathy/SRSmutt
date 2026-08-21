import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Printer, Download, MessageCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { shareOrDownloadReceiptPdf } from '../utils/whatsappPdfShare.js';
import { GopuramHeaderMotif, GopuramDivider } from '../components/GopuramMotif.js';

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

  const { data: templeInfo } = useQuery({
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

  const templeDetails = templeInfo || {
    name: 'ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಮಠ',
    address: 'ನಂ.542, 63ನೇ ಕ್ರಾಸ್, 5ನೇ ಬ್ಲಾಕ್, ರಾಜಾಜಿನಗರ, ಭಾಷ್ಯಂ ಸರ್ಕಲ್ ಹತ್ತಿರ, ಬೆಂಗಳೂರು-560010',
    phone1: '98446 87615',
    phone2: '94900 67092'
  };

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
    <div className="min-h-screen bg-gradient-to-b from-ivory via-ivory-light to-ivory py-8 px-4 flex flex-col items-center">
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

      {/* Main Printable Receipt Card */}
      <div className="max-w-lg w-full">
        <div
          id="public-receipt-printable-container"
          className="official-receipt-print border-2 border-red-900 p-5 sm:p-6 bg-white rounded-2xl text-red-950 font-serif leading-tight shadow-2xl space-y-4"
        >
          {/* Header Invocations */}
          <div className="flex justify-between items-start text-[10px] sm:text-[11px] font-bold border-b border-red-950/20 pb-2.5 text-red-950">
            <div className="space-y-0.5">
              <p>Mob. : {templeDetails.phone1 || '98446 87615'}</p>
              <p className="text-[9px]">|| ಶ್ರೀ ಗೋಪಿನಾಥೋ ವಿಜಯತೇ ||</p>
              <p className="text-[9px]">ಶ್ರೀ ಮೂಲಗೋಪಾಲಕೃಷ್ಣೋ ವಿಜಯತೇ</p>
              <p className="text-[9px]">ಶ್ರೀ ಶ್ರೀಪಾದರಾಜೋ ವಿಜಯತೇ</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p>Mob. : {templeDetails.phone2 || '94900 67092'}</p>
              <p className="text-[9px]">ಶ್ರೀ ಮೂಲರಾಮೋ ವಿಜಯತೇ</p>
              <p className="text-[9px]">ಶ್ರೀ ಗುರುರಾಜೋ ವಿಜಯತೇ</p>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h1 className="font-bold text-lg sm:text-xl text-red-950 tracking-wide">
              Mulabagala Sri Sripadaraja Matha
            </h1>
            <h2 className="font-bold text-xs sm:text-sm text-red-900 uppercase tracking-wider">
              (Rajajinagar Branch)
            </h2>
            <h3 className="font-bold text-xs sm:text-sm text-red-950 mt-0.5">
              {templeDetails.name || 'ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಮಠ'}
            </h3>
            <p className="text-[10px] text-red-950/80 px-2 font-sans font-medium">
              {templeDetails.address}
            </p>
          </div>

          {/* Receipt Badge */}
          <div className="text-center py-1">
            <span className="inline-block border-2 border-red-950 px-5 py-0.5 font-bold text-xs tracking-widest rounded-sm bg-red-50 text-red-950 uppercase">
              OFFICIAL E-RECEIPT
            </span>
          </div>

          {/* Receipt No & Date */}
          <div className="flex justify-between items-center text-xs font-bold px-1 py-1 bg-red-50/40 rounded-lg">
            <div>
              <span className="text-red-950">Receipt No:</span>{' '}
              <span className="text-red-700 text-sm font-mono tracking-wider ml-1">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-red-950">Date:</span>{' '}
              <span className="font-mono text-red-900 px-1">{formattedDate}</span>
            </div>
          </div>

          {/* Devotee Info */}
          <div className="space-y-2.5 text-xs text-red-950 font-sans border-t border-b border-red-950/20 py-3">
            <div className="flex items-baseline">
              <span className="font-bold whitespace-nowrap">Smt / Sri :</span>
              <span className="flex-1 border-b border-dotted border-red-950 px-2 font-bold text-red-900 text-sm">
                {cleanDevoteeName}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="flex-1 flex items-baseline">
                <span className="font-bold whitespace-nowrap">Phone :</span>
                <span className="flex-1 border-b border-dotted border-red-950 px-2 font-mono font-bold text-red-900">
                  {receipt.devotee?.phone || '-'}
                </span>
              </div>
              <div className="flex-1 flex items-baseline">
                <span className="font-bold whitespace-nowrap">City :</span>
                <span className="flex-1 border-b border-dotted border-red-950 px-2 font-medium">
                  {receipt.devotee?.city || '-'}
                </span>
              </div>
            </div>

            {(receipt.devotee?.gotra || receipt.devotee?.nakshatra || receipt.devotee?.rashi) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] bg-red-50/60 p-2 rounded-lg font-bold text-red-900 border border-red-900/10">
                {receipt.devotee?.gotra && <span>Gotra: {receipt.devotee.gotra}</span>}
                {receipt.devotee?.nakshatra && <span>Nakshatra: {receipt.devotee.nakshatra}</span>}
                {receipt.devotee?.rashi && <span>Rashi: {receipt.devotee.rashi}</span>}
              </div>
            )}
          </div>

          {/* Sevas Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-950">Seva Details</h4>
            <table className="w-full text-xs text-left border-collapse border border-red-950/20">
              <thead>
                <tr className="bg-red-950 text-white font-bold text-[11px]">
                  <th className="p-2 border border-red-950/30">Particulars / Seva Name</th>
                  <th className="p-2 border border-red-950/30 text-center">Devotees</th>
                  <th className="p-2 border border-red-950/30 text-center">Qty</th>
                  <th className="p-2 border border-red-950/30 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-950/20 font-sans">
                {receipt.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-red-50/40">
                    <td className="p-2 border border-red-950/20 font-bold text-red-950">
                      {item.description}
                      {item.shashwataSevaId && (
                        <span className="block text-[10px] text-amber-800 font-semibold mt-0.5">
                          ⭐ Shashwata Seva (Annual Recurrence)
                        </span>
                      )}
                    </td>
                    <td className="p-2 border border-red-950/20 text-center font-bold">
                      {item.devoteeCount || 1}
                    </td>
                    <td className="p-2 border border-red-950/20 text-center font-bold">
                      {item.quantity || 1}
                    </td>
                    <td className="p-2 border border-red-950/20 text-right font-mono font-bold text-red-900">
                      {safeNum(item.totalAmount || item.unitPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Amount Footer */}
          <div className="flex justify-between items-center bg-red-950 text-white p-3 rounded-xl font-bold">
            <span className="text-xs uppercase tracking-wider">Total Received</span>
            <span className="text-base sm:text-lg font-mono">
              ₹{safeNum(receipt.totalAmount).toFixed(2)} ({receipt.paymentMode})
            </span>
          </div>

          {/* Verified Badge */}
          <div className="flex items-center justify-between text-[10px] text-red-950/70 font-sans pt-2 border-t border-red-950/20">
            <div className="flex items-center gap-1 font-bold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Signed & Verified
            </div>
            <div>Issued by Sri Sripadaraja Matha Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};
