import { FastifyInstance } from 'fastify';
import { ReportsController } from './reports.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerReportsRoutes(fastify: FastifyInstance, controller: ReportsController) {
  fastify.get('/daily', { preHandler: [authGuard] }, (req, reply) => controller.getDaily(req, reply));
  fastify.get('/monthly', { preHandler: [authGuard] }, (req, reply) => controller.getMonthly(req, reply));
  fastify.get('/financial-balance', { preHandler: [authGuard] }, (req, reply) => controller.getFinancialBalance(req, reply));
}
