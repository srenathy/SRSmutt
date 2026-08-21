import { PrismaClient, Receipt } from '@prisma/client';
import { PaymentMode, ReceiptKind, ReceiptQueryParams } from '@temple/shared';
import { PaginatedResult, createPaginatedResponse } from '../../common/pagination.js';
import { PreparedReceiptData } from './strategies/receipt-strategy.interface.js';

export interface IBillingRepository {
  findPaginated(params: ReceiptQueryParams): Promise<PaginatedResult<any>>;
  findById(id: string): Promise<any | null>;
  createReceiptInTransaction(data: {
    receiptNumber: string;
    kind: ReceiptKind;
    devoteeId: string;
    paymentMode: PaymentMode;
    transactionRef?: string;
    sankalpaNote?: string;
    createdAt?: string;
    sevaDate?: string;
    createdByUserId: string;
    prepared: PreparedReceiptData;
  }): Promise<any>;
  findSankalpaList(dateStr: string, sevaId?: string): Promise<any[]>;
}

export class BillingRepository implements IBillingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPaginated(params: ReceiptQueryParams): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (params.startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(params.startDate) };
    }
    if (params.endDate) {
      const endDateObj = new Date(params.endDate);
      if (params.endDate.length <= 10) {
        endDateObj.setHours(23, 59, 59, 999);
      }
      where.createdAt = { ...where.createdAt, lte: endDateObj };
    }
    if (params.devoteeId) {
      where.devoteeId = params.devoteeId;
    }
    if (params.kind) {
      where.kind = params.kind;
    } else {
      // Default filtering for general receipt history browsing (exclude HUNDI_COLLECTION unless explicitly requested)
      where.kind = { not: 'HUNDI_COLLECTION' };
    }
    if (params.paymentMode) {
      where.paymentMode = params.paymentMode;
    }
    if (params.search) {
      where.OR = [
        { receiptNumber: { contains: params.search, mode: 'insensitive' } },
        { devotee: { name: { contains: params.search, mode: 'insensitive' } } },
        { devotee: { phone: { contains: params.search, mode: 'insensitive' } } }
      ] as any;
    }

    const [total, data] = await Promise.all([
      this.prisma.receipt.count({ where }),
      this.prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          devotee: true,
          createdByUser: {
            select: { id: true, username: true, fullName: true, role: true }
          },
          items: {
            include: {
              seva: true,
              shashwataSeva: true
            }
          }
        }
      })
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.receipt.findUnique({
      where: { id },
      include: {
        devotee: true,
        createdByUser: {
          select: { id: true, username: true, fullName: true, role: true }
        },
        items: {
          include: {
            seva: true,
            shashwataSeva: true
          }
        }
      }
    });
  }

  async createReceiptInTransaction(data: {
    receiptNumber: string;
    kind: ReceiptKind;
    devoteeId: string;
    paymentMode: PaymentMode;
    transactionRef?: string;
    sankalpaNote?: string;
    createdAt?: string;
    sevaDate?: string;
    createdByUserId: string;
    prepared: PreparedReceiptData;
  }): Promise<any> {
    const receiptDate = data.createdAt ? new Date(data.createdAt) : new Date();
    const performanceDate = data.sevaDate ? new Date(data.sevaDate) : receiptDate;

    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.create({
        data: {
          receiptNumber: data.receiptNumber,
          kind: data.kind,
          devoteeId: data.devoteeId,
          paymentMode: data.paymentMode,
          transactionRef: data.transactionRef,
          totalAmount: data.prepared.totalAmount,
          sankalpaNote: data.sankalpaNote,
          sevaDate: performanceDate,
          createdAt: receiptDate,
          createdByUserId: data.createdByUserId,
          items: {
            create: data.prepared.items.map((item) => ({
              sevaId: item.sevaId,
              shashwataSevaId: item.shashwataSevaId,
              description: item.description,
              amount: item.amount,
              quantity: item.quantity,
              devoteeCount: item.devoteeCount || 1,
              sevaDate: performanceDate
            }))
          }
        },
        include: {
          devotee: true,
          createdByUser: {
            select: { id: true, username: true, fullName: true, role: true }
          },
          items: {
            include: {
              seva: true,
              shashwataSeva: true
            }
          }
        }
      });

      return receipt;
    });
  }

  async findSankalpaList(dateStr: string, sevaId?: string): Promise<any[]> {
    const parts = dateStr.split('-');
    const targetM = parseInt(parts[1], 10);
    const targetD = parseInt(parts[2], 10);

    // Fetch all active seva receipt items
    const allItems = await this.prisma.receiptItem.findMany({
      where: {
        receipt: {
          cancelledAt: null,
          kind: { not: 'HUNDI_COLLECTION' },
          devotee: {
            phone: { not: '0000000000' },
            NOT: { name: { contains: 'General Temple Income' } }
          }
        },
        ...(sevaId ? { sevaId } : {})
      },
      include: {
        receipt: { include: { devotee: true } },
        seva: true,
        shashwataSeva: true
      },
      orderBy: { receipt: { createdAt: 'asc' } }
    });

    const formatToDateStr = (raw: Date | string | null | undefined): string => {
      if (!raw) return '';
      const d = new Date(raw);
      if (isNaN(d.getTime())) return '';
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const formatToLocalDateStr = (raw: Date | string | null | undefined): string => {
      if (!raw) return '';
      const d = new Date(raw);
      if (isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const matchedItems = allItems.filter((item) => {
      // 1. Annual Shashwata Seva recurrence (same month & day)
      if (item.shashwataSevaId || item.receipt.kind === 'SHASHWATA_SEVA') {
        const rawDate = item.sevaDate || item.receipt.sevaDate || item.receipt.createdAt;
        if (!rawDate) return false;
        const d = new Date(rawDate);
        const itemM_UTC = d.getUTCMonth() + 1;
        const itemD_UTC = d.getUTCDate();
        const itemM_Loc = d.getMonth() + 1;
        const itemD_Loc = d.getDate();
        return (itemM_UTC === targetM && itemD_UTC === targetD) || (itemM_Loc === targetM && itemD_Loc === targetD);
      }

      // 2. Regular Seva: match exact scheduled pooja performance date
      const scheduledDate = item.sevaDate || item.receipt.sevaDate || item.receipt.createdAt;
      const utcStr = formatToDateStr(scheduledDate);
      const locStr = formatToLocalDateStr(scheduledDate);

      return utcStr === dateStr || locStr === dateStr;
    });

    return matchedItems;
  }
}
