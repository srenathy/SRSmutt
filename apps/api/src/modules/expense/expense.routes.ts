import { FastifyInstance } from 'fastify';
import { ExpenseController } from './expense.controller.js';
import { authGuard } from '../../guards/auth.guard.js';
import { roleGuard } from '../../guards/role.guard.js';
import { Role } from '@temple/shared';

export function registerExpenseRoutes(fastify: FastifyInstance, controller: ExpenseController) {
  fastify.get('/', { preHandler: [authGuard] }, (req, reply) => controller.getAllExpenses(req, reply));
  fastify.post('/', { preHandler: [authGuard] }, (req, reply) => controller.createExpense(req, reply));
  fastify.put('/:id/approve', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.approveExpense(req as any, reply));
  fastify.put('/:id/reject', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.rejectExpense(req as any, reply));
  fastify.delete('/:id', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.deleteExpense(req as any, reply));
}
