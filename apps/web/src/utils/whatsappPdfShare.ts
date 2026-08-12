import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ShareReceiptPdfOptions {
  elementId?: string;
  elementRef?: HTMLElement | null;
  fileName?: string;
  phone?: string;
  messageText: string;
}

export async function shareOrDownloadReceiptPdf({
  elementId,
  elementRef,
  fileName = 'Receipt.pdf',
  phone,
  messageText
}: ShareReceiptPdfOptions): Promise<void> {
  const targetEl = elementRef || (elementId ? document.getElementById(elementId) : null);
  let pdfFile: File | null = null;

  if (targetEl) {
    try {
      // 1. Capture HTML element as high-res canvas
      const canvas = await html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      const pdfBlob = pdf.output('blob');
      pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    } catch (err) {
      console.error('Failed to generate PDF for WhatsApp share:', err);
    }
  }

  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // 2. Mobile/Supported browsers: Web Share API directly attaches PDF file to WhatsApp!
  if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: fileName,
        text: messageText
      });
      return;
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') return;
      console.warn('Web Share failed, falling back to download + URL:', shareErr);
    }
  }

  // 3. Fallback for Desktop WhatsApp Web: Download PDF file & open WhatsApp chat
  if (pdfFile) {
    const blobUrl = URL.createObjectURL(pdfFile);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }

  const noteText = pdfFile
    ? `📄 *[Receipt PDF attached / downloaded: ${fileName}]*\n\n${messageText}`
    : messageText;

  const waUrl = targetPhone
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(noteText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(noteText)}`;

  window.open(waUrl, '_blank');
}
