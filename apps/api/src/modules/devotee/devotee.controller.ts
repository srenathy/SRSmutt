import { FastifyRequest, FastifyReply } from 'fastify';
import { devoteeSchema } from '@temple/shared';
import { IDevoteeService } from './devotee.service.js';

export class DevoteeController {
  constructor(private readonly devoteeService: IDevoteeService) {}

  async getAll(request: FastifyRequest<{ Querystring: { search?: string } }>, reply: FastifyReply) {
    const search = request.query.search;
    if (search) {
      const devotees = await this.devoteeService.searchDevotees(search);
      return reply.send({ data: devotees });
    }
    const devotees = await this.devoteeService.getAllDevotees();
    return reply.send({ data: devotees });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const devotee = await this.devoteeService.getDevoteeById(request.params.id);
    return reply.send({ data: devotee });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = devoteeSchema.parse(request.body);
    const devotee = await this.devoteeService.createDevotee(input, userId);
    return reply.status(201).send({ data: devotee });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = devoteeSchema.parse(request.body);
    const devotee = await this.devoteeService.updateDevotee(request.params.id, input, userId);
    return reply.send({ data: devotee });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    await this.devoteeService.deleteDevotee(request.params.id, userId);
    return reply.send({ message: 'Devotee deleted successfully' });
  }
}
