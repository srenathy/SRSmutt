import { FastifyInstance } from 'fastify';
import { BackupController } from './backup.controller.js';
import { authGuard } from '../../guards/auth.guard.js';
import { roleGuard } from '../../guards/role.guard.js';
import { Role } from '@temple/shared';

export function registerBackupRoutes(fastify: FastifyInstance, controller: BackupController) {
  fastify.get('/export', { preHandler: [authGuard, roleGuard([Role.ADMIN])] }, (req, reply) => controller.export(req, reply));
}
