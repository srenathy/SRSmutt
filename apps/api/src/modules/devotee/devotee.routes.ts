import { FastifyInstance } from 'fastify';
import { DevoteeController } from './devotee.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerDevoteeRoutes(fastify: FastifyInstance, controller: DevoteeController) {
  fastify.get('/', { preHandler: [authGuard] }, (req, reply) => controller.getAll(req as any, reply));
  fastify.get('/:id', { preHandler: [authGuard] }, (req, reply) => controller.getById(req as any, reply));
  fastify.post('/', { preHandler: [authGuard] }, (req, reply) => controller.create(req, reply));
  fastify.put('/:id', { preHandler: [authGuard] }, (req, reply) => controller.update(req as any, reply));
  fastify.delete('/:id', { preHandler: [authGuard] }, (req, reply) => controller.delete(req as any, reply));
}
