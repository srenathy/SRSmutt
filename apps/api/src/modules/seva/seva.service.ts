import { Seva } from '@prisma/client';
import { BaseService } from '../../common/service.base.js';
import { ISevaRepository } from './seva.repository.js';
import { IAuditLogger } from '../audit/audit.service.js';
import { SevaInput, AuditAction } from '@temple/shared';
import { ConflictError } from '../../common/errors.js';

export interface ISevaService {
  getAllSevas(): Promise<Seva[]>;
  getActiveSevas(): Promise<Seva[]>;
  getSevaById(id: string): Promise<Seva>;
  createSeva(input: SevaInput, userId?: string): Promise<Seva>;
  updateSeva(id: string, input: SevaInput, userId?: string): Promise<Seva>;
  deleteSeva(id: string, userId?: string): Promise<Seva>;
}

export class SevaService extends BaseService<Seva> implements ISevaService {
  constructor(
    private readonly sevaRepo: ISevaRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(sevaRepo, 'Seva');
  }

  async getAllSevas(): Promise<Seva[]> {
    return this.sevaRepo.findAll();
  }

  async getActiveSevas(): Promise<Seva[]> {
    return this.sevaRepo.findActive();
  }

  async getSevaById(id: string): Promise<Seva> {
    return this.getById(id);
  }

  async createSeva(input: SevaInput, userId?: string): Promise<Seva> {
    const existing = await this.sevaRepo.findByCode(input.code);
    if (existing) {
      throw new ConflictError(`Seva with code '${input.code}' already exists`);
    }

    const seva = await this.sevaRepo.create(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'Seva', seva.id, undefined, seva);
    return seva;
  }

  async updateSeva(id: string, input: SevaInput, userId?: string): Promise<Seva> {
    const existing = await this.getById(id);
    if (input.code !== existing.code) {
      const codeConflict = await this.sevaRepo.findByCode(input.code);
      if (codeConflict) {
        throw new ConflictError(`Seva with code '${input.code}' already exists`);
      }
    }

    const updated = await this.sevaRepo.update(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'Seva', updated.id, existing, updated);
    return updated;
  }

  async deleteSeva(id: string, userId?: string): Promise<Seva> {
    const existing = await this.getById(id);
    const deleted = await this.sevaRepo.delete(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Seva', id, existing, undefined);
    return deleted;
  }
}
