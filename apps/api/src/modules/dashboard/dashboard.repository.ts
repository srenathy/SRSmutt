import { PrismaClient } from '@prisma/client';
import { PaymentMode } from '@temple/shared';

export interface IDashboardRepository {
  getSummaryData(): Promise<{
    todayTotal: number;
    monthTotal: number;
    monthExpenses: number;
    currentMonthOperatingBalance: number;
    previousCarriedDeficit: number;
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
      recentReceipts,
      allReceipts,
      allExpenses
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
      }),
      this.prisma.receipt.findMany({
        where: { cancelledAt: null },
        select: { createdAt: true, totalAmount: true }
      }),
      this.prisma.expense.findMany({
        where: { status: 'APPROVED' },
        select: { createdAt: true, amount: true }
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

    // Historic Cumulative Deficit Carry-Forward Calculation (Excludes Petty Cash)
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyIncomeMap: Record<string, number> = {};
    const monthlyExpenseMap: Record<string, number> = {};

    for (const r of allReceipts) {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyIncomeMap[key] = (monthlyIncomeMap[key] || 0) + Number(r.totalAmount || 0);
    }

    for (const e of allExpenses) {
      const key = `${e.createdAt.getFullYear()}-${String(e.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenseMap[key] = (monthlyExpenseMap[key] || 0) + Number(e.amount || 0);
    }

    const allMonthKeys = Array.from(
      new Set([...Object.keys(monthlyIncomeMap), ...Object.keys(monthlyExpenseMap)])
    ).sort();

    let accumulatedNetBalance = 0;
    for (const key of allMonthKeys) {
      if (key < currentMonthKey) {
        const inc = monthlyIncomeMap[key] || 0;
        const exp = monthlyExpenseMap[key] || 0;
        accumulatedNetBalance += (inc - exp);
      }
    }

    const previousCarriedDeficit = accumulatedNetBalance < 0 ? Math.abs(accumulatedNetBalance) : 0;
    const totalIncome = Number(monthSum._sum.totalAmount || 0);
    const totalExpenses = Number(monthExpensesSum._sum.amount || 0);
    const currentMonthOperatingBalance = totalIncome - totalExpenses;
    const netEarnings = currentMonthOperatingBalance + accumulatedNetBalance;

    return {
      todayTotal: Number(todaySum._sum.totalAmount || 0),
      monthTotal: totalIncome,
      monthExpenses: totalExpenses,
      currentMonthOperatingBalance,
      previousCarriedDeficit,
      netEarnings,
      pendingExpensesCount,
      totalReceiptsCount,
      todayReceiptsCount,
      paymentModeBreakdown: breakdown,
      last14DaysTrend
    };
  }
}
