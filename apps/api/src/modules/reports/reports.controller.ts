import { FastifyRequest, FastifyReply } from 'fastify';
import { IReportsService } from './reports.service.js';

export class ReportsController {
  constructor(private readonly service: IReportsService) {}

  async getDaily(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const report = await this.service.getDailyReport(query);
    return reply.send({ data: report });
  }

  async getMonthly(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const report = await this.service.getMonthlyReport(query);
    return reply.send({ data: report });
  }

  async getCustom(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const report = await this.service.getCustomRangeReport(query);
    return reply.send({ data: report });
  }

  async getFinancialBalance(request: FastifyRequest, reply: FastifyReply) {
    const report = await this.service.getFinancialBalanceReport();
    return reply.send({ data: report });
  }
}
