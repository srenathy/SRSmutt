import { PrismaClient } from '@prisma/client';
import { PaymentMode, ReceiptKind } from '@temple/shared';

export interface IReportsRepository {
  getDailyReport(dateStr: string, kind?: string, paymentMode?: string): Promise<any>;
  getMonthlyReport(year: number, month: number, kind?: string, paymentMode?: string): Promise<any>;
  getCustomRangeReport(startDateStr: string, endDateStr: string, kind?: string, paymentMode?: string): Promise<any>;
  getFinancialBalanceReport(): Promise<any>;
}

export class ReportsRepository implements IReportsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getDailyReport(dateStr: string, kind?: string, paymentMode?: string) {
    const utcStart = new Date(`${dateStr}T00:00:00.000Z`);
    const utcEnd = new Date(`${dateStr}T23:59:59.999Z`);
    // Adjust boundaries by 6h buffer to encompass IST (UTC+5:30) and local server timestamps
    const startDate = new Date(utcStart.getTime() - 6 * 3600 * 1000);
    const endDate = new Date(utcEnd.getTime() + 6 * 3600 * 1000);

    const whereClause: any = {
      createdAt: { gte: startDate, lte: endDate },
      cancelledAt: null
    };

    if (kind && kind !== 'ALL') {
      whereClause.kind = kind;
    }
    if (paymentMode && paymentMode !== 'ALL') {
      whereClause.paymentMode = paymentMode;
    }

    const [receipts, paymentModeGroups, kindGroups] = await Promise.all([
      this.prisma.receipt.findMany({
        where: whereClause,
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
        where: whereClause
      }),
      this.prisma.receipt.groupBy({
        by: ['kind'],
        _sum: { totalAmount: true },
        _count: true,
        where: whereClause
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

  async getMonthlyReport(year: number, month: number, kind?: string, paymentMode?: string) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const whereClause: any = {
      createdAt: { gte: startDate, lte: endDate },
      cancelledAt: null
    };

    if (kind && kind !== 'ALL') {
      whereClause.kind = kind;
    }
    if (paymentMode && paymentMode !== 'ALL') {
      whereClause.paymentMode = paymentMode;
    }

    const [receipts, paymentModeGroups, kindGroups] = await Promise.all([
      this.prisma.receipt.findMany({
        where: whereClause,
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
        where: whereClause
      }),
      this.prisma.receipt.groupBy({
        by: ['kind'],
        _sum: { totalAmount: true },
        _count: true,
        where: whereClause
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

  async getCustomRangeReport(startDateStr: string, endDateStr: string, kind?: string, paymentMode?: string) {
    const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDate = new Date(`${endDateStr}T23:59:59.999Z`);

    const whereClause: any = {
      createdAt: { gte: startDate, lte: endDate },
      cancelledAt: null
    };

    if (kind && kind !== 'ALL') {
      whereClause.kind = kind;
    }
    if (paymentMode && paymentMode !== 'ALL') {
      whereClause.paymentMode = paymentMode;
    }

    const [receipts, paymentModeGroups, kindGroups] = await Promise.all([
      this.prisma.receipt.findMany({
        where: whereClause,
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
        where: whereClause
      }),
      this.prisma.receipt.groupBy({
        by: ['kind'],
        _sum: { totalAmount: true },
        _count: true,
        where: whereClause
      })
    ]);

    let grandTotal = 0;
    for (const r of receipts) {
      grandTotal += Number(r.totalAmount || 0);
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
      startDate: startDateStr,
      endDate: endDateStr,
      totalReceipts: receipts.length,
      grandTotal,
      byPaymentMode,
      byKind,
      receipts
    };
  }

  async getFinancialBalanceReport() {
    const [receipts, expenses, expenseCategoryGroups, receiptKindGroups] = await Promise.all([
      this.prisma.receipt.findMany({
        where: { cancelledAt: null },
        select: { totalAmount: true, paymentMode: true, kind: true, createdAt: true }
      }),
      this.prisma.expense.findMany({
        include: {
          createdByUser: { select: { id: true, fullName: true, username: true } },
          approvedByUser: { select: { id: true, fullName: true, username: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: true
      }),
      this.prisma.receipt.groupBy({
        by: ['kind'],
        _sum: { totalAmount: true },
        _count: true,
        where: { cancelledAt: null }
      })
    ]);

    let totalCollections = 0;
    for (const r of receipts) {
      totalCollections += Number(r.totalAmount || 0);
    }

    let totalExpenditure = 0;
    for (const e of expenses) {
      const cat = (e.category || '').toLowerCase();
      if (cat.includes('petty cash') || cat.includes('pettycash') || cat.includes('daily allowance')) {
        continue; // EXCLUDE PETTY CASH ALLOWANCES FROM OPERATIONAL EXPENDITURES
      }
      if (e.status === 'APPROVED') {
        totalExpenditure += Number(e.amount || 0);
      }
    }

    const netRemainingBalance = totalCollections - totalExpenditure;

    const byCategory: Record<string, { amount: number; count: number }> = {};
    for (const c of expenseCategoryGroups) {
      byCategory[c.category] = {
        amount: Number(c._sum.amount || 0),
        count: c._count
      };
    }

    const byKind: Record<string, { amount: number; count: number }> = {};
    for (const k of receiptKindGroups) {
      byKind[k.kind] = {
        amount: Number(k._sum.totalAmount || 0),
        count: k._count
      };
    }

    return {
      totalCollections,
      totalExpenditure,
      netRemainingBalance,
      totalReceiptsCount: receipts.length,
      totalExpensesCount: expenses.length,
      byCategory,
      byKind,
      expenses
    };
  }
}
