import { PrismaClient } from '@prisma/client';
import { PaymentMode, ReceiptKind } from '@temple/shared';

export interface IReportsRepository {
  getDailyReport(dateStr: string): Promise<any>;
  getMonthlyReport(year: number, month: number): Promise<any>;
}

export class ReportsRepository implements IReportsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getDailyReport(dateStr: string) {
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    const [receipts, paymentModeGroups, kindGroups] = await Promise.all([
      this.prisma.receipt.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          cancelledAt: null
        },
        include: {
          devotee: true,
          createdByUser: { select: { fullName: true } },
          items: true
        },
        orderBy: { createdAt: 'asc' }
      }),
      this.prisma.receipt.groupBy({
        by: ['paymentMode'],
        _sum: { totalAmount: true },
        _count: true,
        where: {
          createdAt: { gte: startDate, lte: endDate },
          cancelledAt: null
        }
      }),
      this.prisma.receipt.groupBy({
        by: ['kind'],
        _sum: { totalAmount: true },
        _count: true,
        where: {
          createdAt: { gte: startDate, lte: endDate },
          cancelledAt: null
        }
      })
    ]);

    let grandTotal = 0;
    for (const r of receipts) {
      grandTotal += Number(r.totalAmount);
    }

    const byPaymentMode: Record<string, { amount: number; count: number }> = {};
    for (const p of paymentModeGroups) {
      byPaymentMode[p.paymentMode] = {
        amount: Number(p._sum.totalAmount || 0),
        count: p._count
      };
    }

    const byKind: Record<string, { amount: number; count: number }> = {};
    for (const k of kindGroups) {
      byKind[k.kind] = {
        amount: Number(k._sum.totalAmount || 0),
        count: k._count
      };
    }

    return {
      date: dateStr,
      totalReceipts: receipts.length,
      grandTotal,
      byPaymentMode,
      byKind,
      receipts
    };
  }

  async getMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [receipts, paymentModeGroups, kindGroups] = await Promise.all([
      this.prisma.receipt.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          cancelledAt: null
        },
        include: {
          devotee: true,
          createdByUser: { select: { fullName: true } },
          items: true
        },
        orderBy: { createdAt: 'asc' }
      }),
      this.prisma.receipt.groupBy({
        by: ['paymentMode'],
        _sum: { totalAmount: true },
        _count: true,
        where: {
          createdAt: { gte: startDate, lte: endDate },
          cancelledAt: null
        }
      }),
      this.prisma.receipt.groupBy({
        by: ['kind'],
        _sum: { totalAmount: true },
        _count: true,
        where: {
          createdAt: { gte: startDate, lte: endDate },
          cancelledAt: null
        }
      })
    ]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyBreakdown: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dailyBreakdown[dayKey] = 0;
    }

    let grandTotal = 0;
    for (const r of receipts) {
      const dayKey = r.createdAt.toISOString().split('T')[0];
      if (dailyBreakdown[dayKey] !== undefined) {
        dailyBreakdown[dayKey] += Number(r.totalAmount);
      }
      grandTotal += Number(r.totalAmount);
    }

    const byPaymentMode: Record<string, { amount: number; count: number }> = {};
    for (const p of paymentModeGroups) {
      byPaymentMode[p.paymentMode] = {
        amount: Number(p._sum.totalAmount || 0),
        count: p._count
      };
    }

    const byKind: Record<string, { amount: number; count: number }> = {};
    for (const k of kindGroups) {
      byKind[k.kind] = {
        amount: Number(k._sum.totalAmount || 0),
        count: k._count
      };
    }

    return {
      year,
      month,
      daysInMonth,
      totalReceipts: receipts.length,
      grandTotal,
      byPaymentMode,
      byKind,
      dailyBreakdown: Object.keys(dailyBreakdown).map((date) => ({
        date,
        totalAmount: dailyBreakdown[date]
      })),
      receipts
    };
  }
}
