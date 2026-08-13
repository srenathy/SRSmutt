import { FastifyInstance } from 'fastify';
import { BillingController } from './billing.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerBillingRoutes(fastify: FastifyInstance, controller: BillingController) {
  fastify.get('/public/:id', (req, reply) => controller.getById(req as any, reply));
  fastify.post('/', { preHandler: [authGuard] }, (req, reply) => controller.create(req, reply));
  fastify.get('/', { preHandler: [authGuard] }, (req, reply) => controller.getPaginated(req, reply));
  fastify.get('/sankalpa', { preHandler: [authGuard] }, (req, reply) => controller.getSankalpaList(req as any, reply));
  fastify.get('/:id', { preHandler: [authGuard] }, (req, reply) => controller.getById(req as any, reply));
  fastify.get('/:id/reprint', { preHandler: [authGuard] }, (req, reply) => controller.reprint(req as any, reply));
}
