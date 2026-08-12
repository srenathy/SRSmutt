import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerAuthRoutes(fastify: FastifyInstance, controller: AuthController) {
  fastify.post('/login', (req, reply) => controller.login(req, reply));
  fastify.post('/change-password', { preHandler: [authGuard] }, (req, reply) => controller.changePassword(req, reply));
  fastify.post('/first-time-password', { preHandler: [authGuard] }, (req, reply) => controller.changeFirstTimePassword(req, reply));
  fastify.get('/me', { preHandler: [authGuard] }, (req, reply) => controller.me(req, reply));
}
