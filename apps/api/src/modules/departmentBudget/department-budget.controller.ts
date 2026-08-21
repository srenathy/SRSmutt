import { FastifyRequest, FastifyReply } from 'fastify';
import { IDepartmentBudgetService } from './department-budget.service.js';

export class DepartmentBudgetController {
  constructor(private readonly service: IDepartmentBudgetService) {}

  async getBudgets(request: FastifyRequest<{ Querystring: { month?: string } }>, reply: FastifyReply) {
    const list = await this.service.getBudgets(request.query.month);
    return reply.send({ data: list });
  }

  async saveBudget(
    request: FastifyRequest<{
      Body: { departmentName: string; monthlyCapAmount: number; effectiveMonth?: string };
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
    const body = request.body;
    const effectiveMonth = body.effectiveMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const result = await this.service.saveBudget(
      {
        departmentName: body.departmentName,
        monthlyCapAmount: Number(body.monthlyCapAmount),
        effectiveMonth
      },
      userId
    );
    return reply.status(200).send({ data: result });
  }

  async deleteBudget(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.deleteBudget(request.params.id);
    return reply.send({ success: true });
  }
}
