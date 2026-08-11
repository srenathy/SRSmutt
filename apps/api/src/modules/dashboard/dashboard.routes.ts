import { FastifyInstance } from 'fastify';
import { DashboardController } from './dashboard.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerDashboardRoutes(fastify: FastifyInstance, controller: DashboardController) {
  fastify.get('/summary', { preHandler: [authGuard] }, (req, reply) => controller.getSummary(req, reply));
}
