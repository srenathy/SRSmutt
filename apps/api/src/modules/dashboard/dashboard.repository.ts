import { PrismaClient } from '@prisma/client';
import { PaymentMode } from '@temple/shared';

export interface IDashboardRepository {
  getSummaryData(): Promise<{
    todayTotal: number;
    monthTotal: number;
    monthExpenses: number;
    netEarnings: number;
    pendingExpensesCount: number;
    totalReceiptsCount: number;
    todayReceiptsCount: number;
    paymentModeBreakdown: Record<PaymentMode, number>;
    last14DaysTrend: { date: string; amount: number; count: number }[];
  }>;
}

export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSummaryData() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOf14Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13, 0, 0, 0, 0);

    const [
      todaySum,
      monthSum,
      monthExpensesSum,
      pendingExpensesCount,
      totalReceiptsCount,
      todayReceiptsCount,
      paymentModeGroups,
      recentReceipts
    ] = await Promise.all([
      this.prisma.receipt.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startOfToday }, cancelledAt: null }
      }),
      this.prisma.receipt.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startOfMonth }, cancelledAt: null }
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: startOfMonth }, status: 'APPROVED' }
      }),
      this.prisma.expense.count({
        where: { status: 'PENDING' }
      }),
      this.prisma.receipt.count({
        where: { cancelledAt: null }
      }),
      this.prisma.receipt.count({
        where: { createdAt: { gte: startOfToday }, cancelledAt: null }
      }),
      this.prisma.receipt.groupBy({
        by: ['paymentMode'],
        _sum: { totalAmount: true },
        _count: true,
        where: { createdAt: { gte: startOfMonth }, cancelledAt: null }
      }),
      this.prisma.receipt.findMany({
        where: { createdAt: { gte: startOf14Days }, cancelledAt: null },
        select: { createdAt: true, totalAmount: true }
      })
    ]);

    const breakdown: Record<PaymentMode, number> = {
      [PaymentMode.CASH]: 0,
      [PaymentMode.UPI]: 0,
      [PaymentMode.CARD]: 0,
      [PaymentMode.BANK]: 0
    };

    for (const group of paymentModeGroups) {
      breakdown[group.paymentMode as PaymentMode] = Number(group._sum.totalAmount || 0);
    }

    const trendMap: Record<string, { amount: number; count: number }> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(startOf14Days);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = { amount: 0, count: 0 };
    }

    for (const r of recentReceipts) {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].amount += Number(r.totalAmount);
        trendMap[dateStr].count += 1;
      }
    }

    const last14DaysTrend = Object.keys(trendMap).map((date) => ({
      date,
      amount: trendMap[date].amount,
      count: trendMap[date].count
    }));

    const totalIncome = Number(monthSum._sum.totalAmount || 0);
    const totalExpenses = Number(monthExpensesSum._sum.amount || 0);

    return {
      todayTotal: Number(todaySum._sum.totalAmount || 0),
      monthTotal: totalIncome,
      monthExpenses: totalExpenses,
      netEarnings: totalIncome - totalExpenses,
      pendingExpensesCount,
      totalReceiptsCount,
      todayReceiptsCount,
      paymentModeBreakdown: breakdown,
      last14DaysTrend
    };
  }
}
