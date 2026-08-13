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
    const where: any = {
      kind: { not: 'HUNDI_COLLECTION' },
      devotee: {
        phone: { not: '0000000000' },
        NOT: { name: { contains: 'General Temple Income' } }
      }
    };

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
    const targetDate = new Date(dateStr);
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);

    const targetMonth = targetDate.getMonth() + 1;
    const targetDay = targetDate.getDate();

    // 1. Regular Sevas matching sevaDate or createdAt on dateStr (excluding Hundi / Direct Income)
    const regularItems = await this.prisma.receiptItem.findMany({
      where: {
        receipt: {
          cancelledAt: null,
          kind: { not: 'HUNDI_COLLECTION' },
          devotee: {
            phone: { not: '0000000000' },
            NOT: { name: { contains: 'General Temple Income' } }
          }
        },
        OR: [
          { sevaDate: { gte: start, lte: end } },
          {
            sevaDate: null,
            receipt: { createdAt: { gte: start, lte: end } }
          }
        ],
        ...(sevaId ? { sevaId } : {})
      },
      include: {
        receipt: { include: { devotee: true } },
        seva: true,
        shashwataSeva: true
      },
      orderBy: { receipt: { createdAt: 'asc' } }
    });

    // 2. Annual Shashwata Seva recurrence (same month & day)
    const shashwataItems = await this.prisma.receiptItem.findMany({
      where: {
        receipt: {
          cancelledAt: null,
          kind: { not: 'HUNDI_COLLECTION' },
          devotee: {
            phone: { not: '0000000000' },
            NOT: { name: { contains: 'General Temple Income' } }
          }
        },
        shashwataSevaId: { not: null },
        ...(sevaId ? { sevaId } : {})
      },
      include: {
        receipt: { include: { devotee: true } },
        seva: true,
        shashwataSeva: true
      }
    });

    const annualMatches = shashwataItems.filter((item) => {
      const dateVal = item.sevaDate || item.receipt.createdAt;
      if (!dateVal) return false;
      const d = new Date(dateVal);
      return d.getMonth() + 1 === targetMonth && d.getDate() === targetDay;
    });

    // Combine and deduplicate by item id
    const map = new Map<string, any>();
    for (const item of [...regularItems, ...annualMatches]) {
      map.set(item.id, item);
    }

    return Array.from(map.values());
  }
}
