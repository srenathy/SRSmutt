import { FastifyInstance } from 'fastify';
import { AnnouncementController } from './announcement.controller.js';
import { authGuard } from '../../guards/auth.guard.js';
import { roleGuard } from '../../guards/role.guard.js';
import { Role } from '@temple/shared';

export function registerAnnouncementRoutes(fastify: FastifyInstance, controller: AnnouncementController) {
  fastify.get('/public', (req, reply) => controller.getPublicList(req, reply));
  fastify.get('/', { preHandler: [authGuard] }, (req, reply) => controller.getAllAdmin(req, reply));
  fastify.post('/', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.create(req, reply));
  fastify.put('/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.update(req as any, reply));
  fastify.delete('/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.delete(req as any, reply));
}
