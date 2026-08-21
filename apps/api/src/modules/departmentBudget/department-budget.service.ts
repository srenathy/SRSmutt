import { IDepartmentBudgetRepository } from './department-budget.repository.js';

export interface IDepartmentBudgetService {
  getBudgets(effectiveMonth?: string): Promise<any[]>;
  getEffectiveCap(departmentName: string, targetMonth: string): Promise<any>;
  saveBudget(data: { departmentName: string; monthlyCapAmount: number; effectiveMonth: string }, userId: string): Promise<any>;
  deleteBudget(id: string): Promise<any>;
}

export class DepartmentBudgetService implements IDepartmentBudgetService {
  constructor(private readonly repo: IDepartmentBudgetRepository) {}

  async getBudgets(effectiveMonth?: string) {
    return this.repo.getAllBudgets(effectiveMonth);
  }

  async getEffectiveCap(departmentName: string, targetMonth: string) {
    return this.repo.getEffectiveCap(departmentName, targetMonth);
  }

  async saveBudget(data: { departmentName: string; monthlyCapAmount: number; effectiveMonth: string }, userId: string) {
    return this.repo.upsertBudget({
      ...data,
      createdByUserId: userId
    });
  }

  async deleteBudget(id: string) {
    return this.repo.deactivateBudget(id);
  }
}
