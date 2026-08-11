import { FastifyRequest, FastifyReply } from 'fastify';
import { expenseSchema } from '@temple/shared';
import { ExpenseService } from './expense.service.js';

export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  async getAllExpenses(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getAllExpenses();
    return reply.send({ data: list });
  }

  async createExpense(request: FastifyRequest, reply: FastifyReply) {
    const input = expenseSchema.parse(request.body);
    const created = await this.service.createExpense(input, request.user.id);
    return reply.status(201).send({ data: created });
  }

  async approveExpense(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const approved = await this.service.approveExpense(request.params.id, request.user.id);
    return reply.send({ data: approved, message: 'Expense approved successfully' });
  }

  async rejectExpense(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rejected = await this.service.rejectExpense(request.params.id, request.user.id);
    return reply.send({ data: rejected, message: 'Expense rejected' });
  }

  async deleteExpense(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.deleteExpense(request.params.id, request.user.id);
    return reply.send({ message: 'Expense voucher deleted successfully' });
  }
}
