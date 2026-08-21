import { FastifyInstance } from 'fastify';
import { DepartmentBudgetController } from './department-budget.controller.js';
import { authGuard } from '../../guards/auth.guard.js';

export function registerDepartmentBudgetRoutes(fastify: FastifyInstance, controller: DepartmentBudgetController) {
  fastify.get('/', { preHandler: [authGuard] }, (req, reply) => controller.getBudgets(req as any, reply));
  fastify.post('/', { preHandler: [authGuard] }, (req, reply) => controller.saveBudget(req as any, reply));
  fastify.put('/', { preHandler: [authGuard] }, (req, reply) => controller.saveBudget(req as any, reply));
  fastify.delete('/:id', { preHandler: [authGuard] }, (req, reply) => controller.deleteBudget(req as any, reply));
}
