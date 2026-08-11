import { PrismaClient, Expense } from '@prisma/client';

export interface IExpenseRepository {
  findAll(): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  create(data: any): Promise<Expense>;
  updateStatus(id: string, status: string, approvedByUserId?: string): Promise<Expense>;
  delete(id: string): Promise<Expense>;
}

export class ExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: { select: { id: true, fullName: true, username: true } },
        approvedByUser: { select: { id: true, fullName: true, username: true } }
      }
    });
  }

  async findById(id: string): Promise<Expense | null> {
    return this.prisma.expense.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, fullName: true, username: true } },
        approvedByUser: { select: { id: true, fullName: true, username: true } }
      }
    });
  }

  async create(data: any): Promise<Expense> {
    return this.prisma.expense.create({
      data,
      include: {
        createdByUser: { select: { id: true, fullName: true, username: true } }
      }
    });
  }

  async updateStatus(id: string, status: string, approvedByUserId?: string): Promise<Expense> {
    return this.prisma.expense.update({
      where: { id },
      data: {
        status,
        approvedByUserId,
        approvedAt: status === 'APPROVED' ? new Date() : null
      },
      include: {
        createdByUser: { select: { id: true, fullName: true, username: true } },
        approvedByUser: { select: { id: true, fullName: true, username: true } }
      }
    });
  }

  async delete(id: string): Promise<Expense> {
    return this.prisma.expense.delete({ where: { id } });
  }
}
