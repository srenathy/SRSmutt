import { IBackupRepository } from './backup.repository.js';
import { IAuditLogger } from '../audit/audit.service.js';
import { AuditAction } from '@temple/shared';

export interface IBackupService {
  exportDatabase(userId?: string): Promise<any>;
}

export class BackupService implements IBackupService {
  constructor(
    private readonly backupRepo: IBackupRepository,
    private readonly auditLogger: IAuditLogger
  ) {}

  async exportDatabase(userId?: string): Promise<any> {
    const backup = await this.backupRepo.exportAllData();
    await this.auditLogger.log(userId, AuditAction.CREATE, 'BackupExport', 'EXPORT', undefined, {
      exportedAt: backup.metadata.exportedAt
    });
    return backup;
  }
}
