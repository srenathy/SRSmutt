import { PrismaClient, AuditLog } from '@prisma/client';
import { AuditAction } from '@temple/shared';

export interface IAuditRepository {
  createLog(data: {
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    beforeJson?: string;
    afterJson?: string;
  }): Promise<AuditLog>;
}

export class AuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createLog(data: {
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    beforeJson?: string;
    afterJson?: string;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        beforeJson: data.beforeJson,
        afterJson: data.afterJson
      }
    });
  }
}
