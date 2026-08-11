import { FastifyInstance } from 'fastify';
import { TempleController } from './temple.controller.js';
import { authGuard } from '../../guards/auth.guard.js';
import { roleGuard } from '../../guards/role.guard.js';
import { Role } from '@temple/shared';

export function registerTempleRoutes(fastify: FastifyInstance, controller: TempleController) {
  fastify.get('/', { preHandler: [authGuard] }, (req, reply) => controller.getTemple(req, reply));
  fastify.post('/', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.upsertTemple(req, reply));
  fastify.put('/', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.upsertTemple(req, reply));
}
