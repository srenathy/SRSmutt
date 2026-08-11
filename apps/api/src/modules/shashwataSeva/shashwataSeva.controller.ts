import { FastifyRequest, FastifyReply } from 'fastify';
import { shashwataSevaSchema } from '@temple/shared';
import { IShashwataSevaService } from './shashwataSeva.service.js';

export class ShashwataSevaController {
  constructor(private readonly service: IShashwataSevaService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const sevas = await this.service.getAllShashwataSevas();
    return reply.send({ data: sevas });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const seva = await this.service.getShashwataSevaById(request.params.id);
    return reply.send({ data: seva });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = shashwataSevaSchema.parse(request.body);
    const seva = await this.service.createShashwataSeva(input, userId);
    return reply.status(201).send({ data: seva });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = shashwataSevaSchema.parse(request.body);
    const seva = await this.service.updateShashwataSeva(request.params.id, input, userId);
    return reply.send({ data: seva });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    await this.service.deleteShashwataSeva(request.params.id, userId);
    return reply.send({ message: 'Shashwata Seva deleted successfully' });
  }
}
