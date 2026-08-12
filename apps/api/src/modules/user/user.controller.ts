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
        devoteeId: true,
        devotee: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            gotra: true,
            nakshatra: true,
            rashi: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const devotees = await this.prisma.devotee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const userDevoteeIds = new Set<string>();
    const userCleanPhones = new Set<string>();

    for (const u of users) {
      if (u.devoteeId) userDevoteeIds.add(u.devoteeId);
      if (u.devotee?.phone) {
        const p = u.devotee.phone.replace(/\D/g, '').slice(-10);
        if (p.length >= 7) userCleanPhones.add(p);
      }
      if (u.username) {
        const p = u.username.replace(/\D/g, '').slice(-10);
        if (p.length >= 7) userCleanPhones.add(p);
      }
    }

    const unlinkedDevoteeUsers = devotees
      .filter((d) => d.phone !== '0000000000' && !d.name?.toLowerCase().includes('general temple income') && !d.name?.toLowerCase().includes('hundi'))
      .filter((d) => {
        if (userDevoteeIds.has(d.id)) return false;
        const p = (d.phone || '').replace(/\D/g, '').slice(-10);
        if (p.length >= 7 && userCleanPhones.has(p)) return false;
        return true;
      })
      .map((d) => ({
        id: `devotee-${d.id}`,
        username: d.phone || `dev_${d.id.slice(0, 6)}`,
        fullName: d.name,
        role: 'DEVOTEE',
        canAccessBilling: false,
        canAccessExpenses: false,
        canAccessReports: false,
        canAccessMasters: false,
        canApproveExpenses: false,
        expenditureLimit: 0,
        devoteeId: d.id,
        devotee: d,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      }));

    return reply.send({ data: [...users, ...unlinkedDevoteeUsers] });
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
    const rawId = request.params.id;
    const body = request.body as any;

    // Check if updating a Devotee user profile
    if (rawId.startsWith('devotee-') || body.role === 'DEVOTEE' || body.devoteeId || body.isDevotee) {
      const devoteeId = body.devoteeId || (rawId.startsWith('devotee-') ? rawId.replace('devotee-', '') : null);

      if (devoteeId) {
        const updatedDevotee = await this.prisma.devotee.update({
          where: { id: devoteeId },
          data: {
            name: body.fullName || body.name,
            phone: body.phone,
            email: body.email || undefined,
            gotra: body.gotra || undefined,
            nakshatra: body.nakshatra || undefined,
            rashi: body.rashi || undefined,
            city: body.city || undefined,
            address: body.address || undefined
          }
        });

        // Also update User record if present
        if (!rawId.startsWith('devotee-')) {
          await this.prisma.user.update({
            where: { id: rawId },
            data: { fullName: updatedDevotee.name }
          });
        }

        await this.auditLogger.log(request.user.id, AuditAction.UPDATE, 'Devotee', devoteeId, undefined, updatedDevotee);
        return reply.send({
          data: {
            id: rawId,
            fullName: updatedDevotee.name,
            role: 'DEVOTEE',
            devoteeId: updatedDevotee.id,
            devotee: updatedDevotee
          }
        });
      }
    }

    const input = updateUserSchema.parse({ ...body, id: rawId });

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
      where: { id: rawId },
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

    if (request.params.id.startsWith('devotee-')) {
      const devId = request.params.id.replace('devotee-', '');
      await this.prisma.devotee.delete({ where: { id: devId } });
      await this.auditLogger.log(request.user.id, AuditAction.DELETE, 'Devotee', devId, undefined, undefined);
      return reply.send({ message: 'Devotee profile deleted successfully' });
    }

    await this.prisma.user.delete({ where: { id: request.params.id } });
    await this.auditLogger.log(request.user.id, AuditAction.DELETE, 'User', request.params.id, undefined, undefined);
    return reply.send({ message: 'User deleted successfully' });
  }
}
