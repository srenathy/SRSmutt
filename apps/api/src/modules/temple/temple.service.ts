import { Temple } from '@prisma/client';
import { BaseService } from '../../common/service.base.js';
import { ITempleRepository } from './temple.repository.js';
import { IAuditLogger } from '../audit/audit.service.js';
import { TempleInput, AuditAction } from '@temple/shared';

export interface ITempleService {
  getTempleInfo(): Promise<Temple | null>;
  upsertTempleInfo(input: TempleInput, userId?: string): Promise<Temple>;
}

export class TempleService extends BaseService<Temple> implements ITempleService {
  constructor(
    private readonly templeRepo: ITempleRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(templeRepo, 'Temple');
  }

  async getTempleInfo(): Promise<Temple | null> {
    return this.templeRepo.getSingleMaster();
  }

  async upsertTempleInfo(input: TempleInput, userId?: string): Promise<Temple> {
    const existing = await this.templeRepo.getSingleMaster();
    let result: Temple;
    if (existing) {
      result = await this.templeRepo.update(existing.id, input);
      await this.auditLogger.log(userId, AuditAction.UPDATE, 'Temple', result.id, existing, result);
    } else {
      result = await this.templeRepo.create(input);
      await this.auditLogger.log(userId, AuditAction.CREATE, 'Temple', result.id, undefined, result);
    }
    return result;
  }
}
