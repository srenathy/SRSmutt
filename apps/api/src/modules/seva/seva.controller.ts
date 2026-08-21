import { FastifyRequest, FastifyReply } from 'fastify';
import { sevaSchema } from '@temple/shared';
import { ISevaService } from './seva.service.js';

export class SevaController {
  constructor(private readonly sevaService: ISevaService) {}

  async getPublicList(request: FastifyRequest, reply: FastifyReply) {
    const sevas = await this.sevaService.getActiveSevas();
    return reply.send({ data: sevas });
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const sevas = await this.sevaService.getAllSevas();
    return reply.send({ data: sevas });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const seva = await this.sevaService.getSevaById(request.params.id);
    return reply.send({ data: seva });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = sevaSchema.parse(request.body);
    const seva = await this.sevaService.createSeva(input, userId);
    return reply.status(201).send({ data: seva });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = sevaSchema.parse(request.body);
    const seva = await this.sevaService.updateSeva(request.params.id, input, userId);
    return reply.send({ data: seva });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    await this.sevaService.deleteSeva(request.params.id, userId);
    return reply.send({ message: 'Seva deleted successfully' });
  }
}
