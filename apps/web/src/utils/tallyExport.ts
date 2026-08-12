/**
 * Tally Prime / Tally ERP 9 Export Utility
 * Generates Tally-compatible XML Vouchers and CSV Spreadsheet files for Temple Receipts & Expenditures.
 */

export interface TallyReceiptItem {
  receiptNumber: string;
  createdAt: string;
  kind: string;
  paymentMode: string;
  totalAmount: number;
  transactionRef?: string;
  sankalpaNote?: string;
  devotee?: {
    name?: string;
    phone?: string;
    gotra?: string;
    nakshatra?: string;
  };
  items?: {
    description: string;
    amount: number;
    quantity: number;
    devoteeCount?: number;
  }[];
}

/**
 * Format Date to Tally Date String (YYYYMMDD)
 */
function toTallyDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Map payment mode to Tally Ledger Name
 */
function getDebitLedger(paymentMode: string): string {
  switch (paymentMode?.toUpperCase()) {
    case 'CASH':
      return 'Cash-in-Hand';
    case 'UPI':
      return 'Bank Account (UPI Direct)';
    case 'CARD':
      return 'Bank Account (POS Card)';
    case 'BANK':
      return 'Bank Account (NEFT/RTGS)';
    default:
      return 'Cash-in-Hand';
  }
}

/**
 * Map receipt kind to Tally Credit Ledger Name
 */
function getCreditLedger(kind: string): string {
  switch (kind?.toUpperCase()) {
    case 'NEW_SEVA':
      return 'Seva Collection Income';
    case 'SHASHWATA_SEVA':
      return 'Shashwata Seva Corpus Fund';
    case 'KIND_DONATION':
      return 'Kanike / In-Kind Donation';
    default:
      return 'Seva Collection Income';
  }
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate Tally XML Vouchers File
 * Compatible with Tally Prime / Tally ERP 9 "Import Data -> Vouchers"
 */
export function generateTallyXML(receipts: TallyReceiptItem[], reportName: string = 'Daily Seva Receipts'): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<ENVELOPE>\n`;
  xml += `  <HEADER>\n`;
  xml += `    <TALLYREQUEST>Import Data</TALLYREQUEST>\n`;
  xml += `  </HEADER>\n`;
  xml += `  <BODY>\n`;
  xml += `    <IMPORTDATA>\n`;
  xml += `      <REQUESTDESC>\n`;
  xml += `        <REPORTNAME>Vouchers</REPORTNAME>\n`;
  xml += `        <STATICVARIABLES>\n`;
  xml += `          <SVCURRENTCOMPANY>Sri Raghavendra Swamy Matha</SVCURRENTCOMPANY>\n`;
  xml += `        </STATICVARIABLES>\n`;
  xml += `      </REQUESTDESC>\n`;
  xml += `      <REQUESTDATA>\n`;

  receipts.forEach((r) => {
    const tDate = toTallyDate(r.createdAt);
    const amount = Number(r.totalAmount || 0).toFixed(2);
    const debitLedger = getDebitLedger(r.paymentMode);
    const creditLedger = getCreditLedger(r.kind);

    const devoteeName = r.devotee?.name || 'Devotee';
    const gotra = r.devotee?.gotra ? ` (Gotra: ${r.devotee.gotra})` : '';
    const sevaNames = r.items?.map((i) => `${i.description} x${i.quantity}`).join(', ') || r.kind;

    const narration = escapeXml(
      `Receipt #${r.receiptNumber} - ${sevaNames} from ${devoteeName}${gotra}. Mode: ${r.paymentMode}${r.transactionRef ? ` Ref: ${r.transactionRef}` : ''}`
    );

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
    xml += `          <VOUCHER VCHTYPE="Receipt" ACTION="Create">\n`;
    xml += `            <DATE>${tDate}</DATE>\n`;
    xml += `            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>\n`;
    xml += `            <VOUCHERNUMBER>${escapeXml(r.receiptNumber)}</VOUCHERNUMBER>\n`;
    xml += `            <PARTYLEDGERNAME>${escapeXml(debitLedger)}</PARTYLEDGERNAME>\n`;
    xml += `            <NARRATION>${narration}</NARRATION>\n`;
    
    // Debit Entry (Cash / Bank)
    xml += `            <ALLLEDGERENTRIES.LIST>\n`;
    xml += `              <LEDGERNAME>${escapeXml(debitLedger)}</LEDGERNAME>\n`;
    xml += `              <ISDEEMEDPOSITIVE>YES</ISDEEMEDPOSITIVE>\n`;
    xml += `              <AMOUNT>-${amount}</AMOUNT>\n`;
    xml += `            </ALLLEDGERENTRIES.LIST>\n`;

    // Credit Entry (Income Account)
    xml += `            <ALLLEDGERENTRIES.LIST>\n`;
    xml += `              <LEDGERNAME>${escapeXml(creditLedger)}</LEDGERNAME>\n`;
    xml += `              <ISDEEMEDPOSITIVE>NO</ISDEEMEDPOSITIVE>\n`;
    xml += `              <AMOUNT>${amount}</AMOUNT>\n`;
    xml += `            </ALLLEDGERENTRIES.LIST>\n`;

    xml += `          </VOUCHER>\n`;
    xml += `        </TALLYMESSAGE>\n`;
  });

  xml += `      </REQUESTDATA>\n`;
  xml += `    </IMPORTDATA>\n`;
  xml += `  </BODY>\n`;
  xml += `</ENVELOPE>`;

  return xml;
}

/**
 * Generate Tally Compatible CSV Vouchers File
 */
export function generateTallyCSV(receipts: TallyReceiptItem[]): string {
  let csv = `Voucher Date,Voucher Type,Voucher No,Debit Ledger (Mode),Credit Ledger (Income),Amount (INR),Devotee Name,Gotra,Nakshatra,Seva Offerings,No of Devotees,Payment Mode,Transaction Ref,Narration\n`;

  receipts.forEach((r) => {
    const vDate = new Date(r.createdAt).toISOString().split('T')[0];
    const amount = Number(r.totalAmount || 0).toFixed(2);
    const debitLedger = getDebitLedger(r.paymentMode);
    const creditLedger = getCreditLedger(r.kind);

    const devoteeName = (r.devotee?.name || 'Devotee').replace(/"/g, '""');
    const gotra = (r.devotee?.gotra || '-').replace(/"/g, '""');
    const nakshatra = (r.devotee?.nakshatra || '-').replace(/"/g, '""');
    const sevaNames = (r.items?.map((i) => `${i.description} (x${i.quantity})`).join('; ') || r.kind).replace(/"/g, '""');
    const totalDevotees = r.items?.reduce((sum, i) => sum + (i.devoteeCount || 1), 0) || 1;

    const narration = `Seva Collection - ${r.receiptNumber} - ${devoteeName}`.replace(/"/g, '""');

    csv += `"${vDate}","Receipt","${r.receiptNumber}","${debitLedger}","${creditLedger}",${amount},"${devoteeName}","${gotra}","${nakshatra}","${sevaNames}",${totalDevotees},"${r.paymentMode}","${r.transactionRef || ''}","${narration}"\n`;
  });

  return csv;
}

/**
 * Download file helper
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
