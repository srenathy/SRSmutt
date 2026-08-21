import { FastifyRequest, FastifyReply } from 'fastify';
import { galleryImageSchema } from '@temple/shared';
import { IGalleryService } from './gallery.service.js';

export class GalleryController {
  constructor(private readonly service: IGalleryService) {}

  async getPublicList(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getActiveImages();
    return reply.send({ data: list });
  }

  async getAllAdmin(request: FastifyRequest, reply: FastifyReply) {
    const list = await this.service.getAllImages();
    return reply.send({ data: list });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = galleryImageSchema.parse(request.body);
    const created = await this.service.createImage(input, userId);
    return reply.status(201).send({ data: created });
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    const input = galleryImageSchema.parse(request.body);
    const updated = await this.service.updateImage(request.params.id, input, userId);
    return reply.send({ data: updated });
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user?.id;
    await this.service.deleteImage(request.params.id, userId);
    return reply.send({ message: 'Gallery image deleted successfully' });
  }
}
