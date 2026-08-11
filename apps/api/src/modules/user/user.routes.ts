import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller.js';
import { authGuard } from '../../guards/auth.guard.js';
import { roleGuard } from '../../guards/role.guard.js';
import { Role } from '@temple/shared';

export function registerUserRoutes(fastify: FastifyInstance, controller: UserController) {
  fastify.get('/', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.getAllUsers(req, reply));
  fastify.post('/', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.createUser(req, reply));
  fastify.put('/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.updateUser(req as any, reply));
  fastify.delete('/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.deleteUser(req as any, reply));
}
