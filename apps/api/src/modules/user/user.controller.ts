import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createUserSchema, updateUserSchema, AuditAction } from '@temple/shared';
import { IAuditLogger } from '../audit/audit.service.js';

export class UserController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditLogger: IAuditLogger
  ) {}

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        canAccessBilling: true,
        canAccessExpenses: true,
        canAccessReports: true,
        canAccessMasters: true,
        canApproveExpenses: true,
        expenditureLimit: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send({ data: users });
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const input = createUserSchema.parse(request.body);
    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await this.prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        canAccessBilling: input.canAccessBilling,
        canAccessExpenses: input.canAccessExpenses,
        canAccessReports: input.canAccessReports,
        canAccessMasters: input.canAccessMasters,
        canApproveExpenses: input.canApproveExpenses,
        expenditureLimit: input.expenditureLimit
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        canAccessBilling: true,
        canAccessExpenses: true,
        canAccessReports: true,
        canAccessMasters: true,
        canApproveExpenses: true,
        expenditureLimit: true,
        createdAt: true
      }
    });

    await this.auditLogger.log(request.user.id, AuditAction.CREATE, 'User', created.id, undefined, created);
    return reply.status(201).send({ data: created });
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateUserSchema.parse({ ...(request.body as any), id: request.params.id });

    const updateData: any = {
      fullName: input.fullName,
      role: input.role,
      canAccessBilling: input.canAccessBilling,
      canAccessExpenses: input.canAccessExpenses,
      canAccessReports: input.canAccessReports,
      canAccessMasters: input.canAccessMasters,
      canApproveExpenses: input.canApproveExpenses,
      expenditureLimit: input.expenditureLimit
    };

    if (input.password && input.password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(input.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: request.params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        canAccessBilling: true,
        canAccessExpenses: true,
        canAccessReports: true,
        canAccessMasters: true,
        canApproveExpenses: true,
        expenditureLimit: true,
        updatedAt: true
      }
    });

    await this.auditLogger.log(request.user.id, AuditAction.UPDATE, 'User', updated.id, undefined, updated);
    return reply.send({ data: updated });
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    if (request.params.id === request.user.id) {
      return reply.status(400).send({ message: 'Cannot delete your own active user account' });
    }

    await this.prisma.user.delete({ where: { id: request.params.id } });
    await this.auditLogger.log(request.user.id, AuditAction.DELETE, 'User', request.params.id, undefined, undefined);
    return reply.send({ message: 'User deleted successfully' });
  }
}
