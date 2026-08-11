import { PrismaClient } from '@prisma/client';

export interface IReceiptNumberGenerator {
  generateNextNumber(): Promise<string>;
}

export class ReceiptNumberGenerator implements IReceiptNumberGenerator {
  constructor(private readonly prisma: PrismaClient) {}

  async generateNextNumber(): Promise<string> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    // Indian Financial Year starts on April 1st
    let fyStart = currentYear;
    let fyEnd = currentYear + 1;
    if (currentMonth < 4) {
      fyStart = currentYear - 1;
      fyEnd = currentYear;
    }

    const fyString = `${fyStart}-${String(fyEnd).slice(2)}`; // e.g. 2026-27
    const prefix = `TS/${fyString}/`;

    // Find latest receipt with this prefix
    const latestReceipt = await this.prisma.receipt.findFirst({
      where: {
        receiptNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let nextSequence = 1;
    if (latestReceipt) {
      const parts = latestReceipt.receiptNumber.split('/');
      const lastSeqStr = parts[parts.length - 1];
      const parsed = parseInt(lastSeqStr, 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }

    const paddedSequence = String(nextSequence).padStart(6, '0');
    return `${prefix}${paddedSequence}`;
  }
}
