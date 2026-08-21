import { PrismaClient } from '@prisma/client';

export interface IDepartmentBudgetRepository {
  getAllBudgets(effectiveMonth?: string): Promise<any[]>;
  getEffectiveCap(departmentName: string, targetMonth: string): Promise<{ departmentName: string; monthlyCapAmount: number; effectiveMonth: string } | null>;
  upsertBudget(data: { departmentName: string; monthlyCapAmount: number; effectiveMonth: string; createdByUserId?: string }): Promise<any>;
  deactivateBudget(id: string): Promise<any>;
}

export class DepartmentBudgetRepository implements IDepartmentBudgetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllBudgets(effectiveMonth?: string): Promise<any[]> {
    const currentMonth = effectiveMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const budgets = await this.prisma.departmentBudget.findMany({
      where: { isActive: true },
      orderBy: [{ departmentName: 'asc' }, { effectiveMonth: 'desc' }]
    });

    const map = new Map<string, any>();
    for (const b of budgets) {
      if (!map.has(b.departmentName)) {
        if (b.effectiveMonth <= currentMonth) {
          map.set(b.departmentName, b);
        }
      }
    }
    for (const b of budgets) {
      if (!map.has(b.departmentName)) {
        map.set(b.departmentName, b);
      }
    }

    return Array.from(map.values()).map(b => ({
      ...b,
      monthlyCapAmount: Number(b.monthlyCapAmount)
    }));
  }

  async getEffectiveCap(departmentName: string, targetMonth: string) {
    const b = await this.prisma.departmentBudget.findFirst({
      where: {
        departmentName,
        effectiveMonth: { lte: targetMonth },
        isActive: true
      },
      orderBy: { effectiveMonth: 'desc' }
    });

    if (!b) return null;
    return {
      departmentName: b.departmentName,
      monthlyCapAmount: Number(b.monthlyCapAmount),
      effectiveMonth: b.effectiveMonth
    };
  }

  async upsertBudget(data: { departmentName: string; monthlyCapAmount: number; effectiveMonth: string; createdByUserId?: string }) {
    return this.prisma.departmentBudget.upsert({
      where: {
        departmentName_effectiveMonth: {
          departmentName: data.departmentName,
          effectiveMonth: data.effectiveMonth
        }
      },
      update: {
        monthlyCapAmount: data.monthlyCapAmount,
        isActive: true
      },
      create: {
        departmentName: data.departmentName,
        monthlyCapAmount: data.monthlyCapAmount,
        effectiveMonth: data.effectiveMonth,
        createdByUserId: data.createdByUserId
      }
    });
  }

  async deactivateBudget(id: string) {
    return this.prisma.departmentBudget.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
