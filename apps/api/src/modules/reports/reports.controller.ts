import { FastifyRequest, FastifyReply } from 'fastify';
import { dailyReportQuerySchema, monthlyReportQuerySchema } from '@temple/shared';
import { IReportsService } from './reports.service.js';

export class ReportsController {
  constructor(private readonly service: IReportsService) {}

  async getDaily(request: FastifyRequest, reply: FastifyReply) {
    const query = dailyReportQuerySchema.parse(request.query);
    const report = await this.service.getDailyReport(query);
    return reply.send({ data: report });
  }

  async getMonthly(request: FastifyRequest, reply: FastifyReply) {
    const query = monthlyReportQuerySchema.parse(request.query);
    const report = await this.service.getMonthlyReport(query);
    return reply.send({ data: report });
  }

  async getFinancialBalance(request: FastifyRequest, reply: FastifyReply) {
    const report = await this.service.getFinancialBalanceReport();
    return reply.send({ data: report });
  }
}
