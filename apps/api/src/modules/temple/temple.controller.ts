import { FastifyRequest, FastifyReply } from 'fastify';
import { templeSchema } from '@temple/shared';
import { ITempleService } from './temple.service.js';

export class TempleController {
  constructor(private readonly templeService: ITempleService) {}

  async getTemple(request: FastifyRequest, reply: FastifyReply) {
    const temple = await this.templeService.getTempleInfo();
    return reply.send({ data: temple });
  }

  async upsertTemple(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = templeSchema.parse(request.body);
    const temple = await this.templeService.upsertTempleInfo(input, userId);
    return reply.send({ data: temple });
  }
}
