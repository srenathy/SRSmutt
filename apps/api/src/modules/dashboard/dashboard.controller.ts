import { FastifyRequest, FastifyReply } from 'fastify';
import { IDashboardService } from './dashboard.service.js';

export class DashboardController {
  constructor(private readonly service: IDashboardService) {}

  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    const summary = await this.service.getSummary();
    return reply.send({ data: summary });
  }
}
