import { FastifyRequest, FastifyReply } from 'fastify';
import { announcementSchema } from '@temple/shared';
import { IAnnouncementService } from './announcement.service.js';

export class AnnouncementController {
  constructor(private readonly service: IAnnouncementService) {}

  async getPublicList(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getActiveAnnouncements();
    return reply.send({ data: list });
  }

  async getAllAdmin(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getAllAnnouncements();
    return reply.send({ data: list });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = announcementSchema.parse(request.body);
    const created = await this.service.createAnnouncement(input, userId);
    return reply.status(201).send({ data: created });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = announcementSchema.parse(request.body);
    const updated = await this.service.updateAnnouncement(request.params.id, input, userId);
    return reply.send({ data: updated });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    await this.service.deleteAnnouncement(request.params.id, userId);
    return reply.send({ message: 'Announcement deleted successfully' });
  }
}
