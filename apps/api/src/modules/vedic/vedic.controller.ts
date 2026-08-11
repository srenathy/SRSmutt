import { FastifyRequest, FastifyReply } from 'fastify';
import { gotraSchema, nakshatraSchema, rashiSchema } from '@temple/shared';
import { VedicService } from './vedic.service.js';

export class VedicController {
  constructor(private readonly service: VedicService) {}

  // Gotra
  async getGotras(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getGotras();
    return reply.send({ data: list });
  }

  async createGotra(request: FastifyRequest, reply: FastifyReply) {
    const input = gotraSchema.parse(request.body);
    const created = await this.service.createGotra(input, request.user?.id);
    return reply.status(201).send({ data: created });
  }

  async updateGotra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = gotraSchema.parse(request.body);
    const updated = await this.service.updateGotra(request.params.id, input, request.user?.id);
    return reply.send({ data: updated });
  }

  async deleteGotra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.deleteGotra(request.params.id, request.user?.id);
    return reply.send({ message: 'Gotra deleted successfully' });
  }

  // Nakshatra
  async getNakshatras(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getNakshatras();
    return reply.send({ data: list });
  }

  async createNakshatra(request: FastifyRequest, reply: FastifyReply) {
    const input = nakshatraSchema.parse(request.body);
    const created = await this.service.createNakshatra(input, request.user?.id);
    return reply.status(201).send({ data: created });
  }

  async updateNakshatra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = nakshatraSchema.parse(request.body);
    const updated = await this.service.updateNakshatra(request.params.id, input, request.user?.id);
    return reply.send({ data: updated });
  }

  async deleteNakshatra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.deleteNakshatra(request.params.id, request.user?.id);
    return reply.send({ message: 'Nakshatra deleted successfully' });
  }

  // Rashi
  async getRashis(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getRashis();
    return reply.send({ data: list });
  }

  async createRashi(request: FastifyRequest, reply: FastifyReply) {
    const input = rashiSchema.parse(request.body);
    const created = await this.service.createRashi(input, request.user?.id);
    return reply.status(201).send({ data: created });
  }

  async updateRashi(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = rashiSchema.parse(request.body);
    const updated = await this.service.updateRashi(request.params.id, input, request.user?.id);
    return reply.send({ data: updated });
  }

  async deleteRashi(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.deleteRashi(request.params.id, request.user?.id);
    return reply.send({ message: 'Rashi deleted successfully' });
  }
}
