import { FastifyInstance } from 'fastify';
import { DevoteePortalController } from './devoteePortal.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerDevoteePortalRoutes(fastify: FastifyInstance, controller: DevoteePortalController) {
  fastify.post('/register', (req, reply) => controller.registerDevotee(req, reply));
  fastify.get('/my-profile', { preHandler: [authGuard] }, (req, reply) => controller.getMyProfile(req, reply));
  fastify.put('/my-profile', { preHandler: [authGuard] }, (req, reply) => controller.updateMyProfile(req, reply));
  fastify.get('/my-receipts', { preHandler: [authGuard] }, (req, reply) => controller.getMyReceipts(req, reply));
}
