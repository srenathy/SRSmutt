import { AuditAction } from '@temple/shared';
import { IAuditRepository } from './audit.repository.js';

export interface IAuditLogger {
  log(
    userId: string | undefined,
    action: AuditAction,
    entityType: string,
    entityId: string,
    beforeState?: any,
    afterState?: any
  ): Promise<void>;
}

export class AuditService implements IAuditLogger {
  constructor(private readonly auditRepo: IAuditRepository) {}

  async log(
    userId: string | undefined,
    action: AuditAction,
    entityType: string,
    entityId: string,
    beforeState?: any,
    afterState?: any
  ): Promise<void> {
    try {
      await this.auditRepo.createLog({
        userId,
        action,
        entityType,
        entityId,
        beforeJson: beforeState ? JSON.stringify(beforeState) : undefined,
        afterJson: afterState ? JSON.stringify(afterState) : undefined
      });
    } catch (err) {
      console.error('Failed to record audit log:', err);
    }
  }
}
