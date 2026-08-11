import { FastifyInstance } from 'fastify';
import { VedicController } from './vedic.controller.js';
import { authGuard } from '../../guards/auth.guard.js';
import { roleGuard } from '../../guards/role.guard.js';
import { Role } from '@temple/shared';

export function registerVedicRoutes(fastify: FastifyInstance, controller: VedicController) {
  // Public read endpoints for dropdowns
  fastify.get('/gotras', (req, reply) => controller.getGotras(req, reply));
  fastify.get('/nakshatras', (req, reply) => controller.getNakshatras(req, reply));
  fastify.get('/rashis', (req, reply) => controller.getRashis(req, reply));

  // Admin CRUD for Gotras
  fastify.post('/gotras', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.createGotra(req, reply));
  fastify.put('/gotras/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.updateGotra(req as any, reply));
  fastify.delete('/gotras/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.deleteGotra(req as any, reply));

  // Admin CRUD for Nakshatras
  fastify.post('/nakshatras', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.createNakshatra(req, reply));
  fastify.put('/nakshatras/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.updateNakshatra(req as any, reply));
  fastify.delete('/nakshatras/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.deleteNakshatra(req as any, reply));

  // Admin CRUD for Rashis
  fastify.post('/rashis', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.createRashi(req, reply));
  fastify.put('/rashis/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.updateRashi(req as any, reply));
  fastify.delete('/rashis/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.deleteRashi(req as any, reply));
}
