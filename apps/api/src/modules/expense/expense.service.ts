import { Expense, PrismaClient } from '@prisma/client';
import { IExpenseRepository } from './expense.repository.js';
import { ExpenseInput, AuditAction } from '@temple/shared';
import { IAuditLogger } from '../audit/audit.service.js';

export class ExpenseService {
  constructor(
    private readonly repo: IExpenseRepository,
    private readonly auditLogger: IAuditLogger,
    private readonly prisma: PrismaClient
  ) {}

  async getAllExpenses(): Promise<Expense[]> {
    return this.repo.findAll();
  }

  async createExpense(input: ExpenseInput, userId: string): Promise<Expense> {
    // Generate Voucher Number: EXP-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await this.prisma.expense.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const seq = (countToday + 1).toString().padStart(4, '0');
    const voucherNumber = `EXP-${dateStr}-${seq}`;

    // Get Temple Approval Threshold Limit
    const temple = await this.prisma.temple.findFirst();
    const threshold = temple ? Number(temple.expenseApprovalThreshold) : 5000;

    // Auto-Flag for Admin Approval if amount > threshold
    const requiresApproval = input.amount > threshold;
    const status = requiresApproval ? 'PENDING' : 'APPROVED';

    const created = await this.repo.create({
      voucherNumber,
      category: input.category,
      title: input.title,
      amount: input.amount,
      payee: input.payee || null,
      paymentMode: input.paymentMode || 'CASH',
      description: input.description || null,
      status,
      createdByUserId: userId,
      approvedByUserId: requiresApproval ? null : userId,
      approvedAt: requiresApproval ? null : new Date()
    });

    await this.auditLogger.log(userId, AuditAction.CREATE, 'Expense', created.id, undefined, created);
    return created;
  }

  async approveExpense(id: string, adminUserId: string): Promise<Expense> {
    const updated = await this.repo.updateStatus(id, 'APPROVED', adminUserId);
    await this.auditLogger.log(adminUserId, AuditAction.UPDATE, 'Expense', id, undefined, updated);
    return updated;
  }

  async rejectExpense(id: string, adminUserId: string): Promise<Expense> {
    const updated = await this.repo.updateStatus(id, 'REJECTED', adminUserId);
    await this.auditLogger.log(adminUserId, AuditAction.UPDATE, 'Expense', id, undefined, updated);
    return updated;
  }

  async deleteExpense(id: string, userId: string): Promise<Expense> {
    const deleted = await this.repo.delete(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Expense', id, undefined, undefined);
    return deleted;
  }
}
