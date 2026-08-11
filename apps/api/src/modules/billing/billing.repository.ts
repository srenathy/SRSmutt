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
    sankalpaNote?: string;
    createdByUserId: string;
    prepared: PreparedReceiptData;
  }): Promise<any>;
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
    }
    if (params.paymentMode) {
      where.paymentMode = params.paymentMode;
    }
    if (params.search) {
      where.OR = [
        { receiptNumber: { contains: params.search } },
        { devotee: { name: { contains: params.search } } },
        { devotee: { phone: { contains: params.search } } }
      ];
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
    sankalpaNote?: string;
    createdByUserId: string;
    prepared: PreparedReceiptData;
  }): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.create({
        data: {
          receiptNumber: data.receiptNumber,
          kind: data.kind,
          devoteeId: data.devoteeId,
          paymentMode: data.paymentMode,
          totalAmount: data.prepared.totalAmount,
          sankalpaNote: data.sankalpaNote,
          createdByUserId: data.createdByUserId,
          items: {
            create: data.prepared.items.map((item) => ({
              sevaId: item.sevaId,
              shashwataSevaId: item.shashwataSevaId,
              description: item.description,
              amount: item.amount,
              quantity: item.quantity
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
}
