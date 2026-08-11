import { FastifyRequest, FastifyReply } from 'fastify';
import { createReceiptSchema, receiptQuerySchema } from '@temple/shared';
import { IBillingService } from './billing.service.js';

export class BillingController {
  constructor(private readonly billingService: IBillingService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const input = createReceiptSchema.parse(request.body);
    const receipt = await this.billingService.createReceipt(input, userId);
    return reply.status(201).send({ data: receipt });
  }

  async getPaginated(request: FastifyRequest, reply: FastifyReply) {
    const params = receiptQuerySchema.parse(request.query);
    const result = await this.billingService.getReceipts(params);
    return reply.send(result);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const receipt = await this.billingService.getReceiptById(request.params.id);
    return reply.send({ data: receipt });
  }

  async reprint(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const payload = await this.billingService.getReprintPayload(request.params.id);
    return reply.send({ data: payload });
  }
}
