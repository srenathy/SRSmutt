import { Devotee } from '@prisma/client';
import { BaseService } from '../../common/service.base.js';
import { IDevoteeRepository } from './devotee.repository.js';
import { IAuditLogger } from '../audit/audit.service.js';
import { DevoteeInput, AuditAction } from '@temple/shared';

export interface IDevoteeService {
  getAllDevotees(): Promise<Devotee[]>;
  getDevoteeById(id: string): Promise<Devotee>;
  searchDevotees(query: string): Promise<Devotee[]>;
  createDevotee(input: DevoteeInput, userId?: string): Promise<Devotee>;
  updateDevotee(id: string, input: DevoteeInput, userId?: string): Promise<Devotee>;
  deleteDevotee(id: string, userId?: string): Promise<Devotee>;
}

export class DevoteeService extends BaseService<Devotee> implements IDevoteeService {
  constructor(
    private readonly devoteeRepo: IDevoteeRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(devoteeRepo, 'Devotee');
  }

  async getAllDevotees(): Promise<Devotee[]> {
    return this.devoteeRepo.findAll();
  }

  async getDevoteeById(id: string): Promise<Devotee> {
    return this.getById(id);
  }

  async searchDevotees(query: string): Promise<Devotee[]> {
    if (!query || query.trim().length === 0) {
      return this.getAllDevotees();
    }
    return this.devoteeRepo.searchByNameOrPhone(query.trim());
  }

  async createDevotee(input: DevoteeInput, userId?: string): Promise<Devotee> {
    const existing = await this.devoteeRepo.findByPhone(input.phone);
    if (existing) {
      const updated = await this.devoteeRepo.update(existing.id, input);
      await this.auditLogger.log(userId, AuditAction.UPDATE, 'Devotee', updated.id, existing, updated);
      return updated;
    }

    const created = await this.devoteeRepo.create(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'Devotee', created.id, undefined, created);
    return created;
  }

  async updateDevotee(id: string, input: DevoteeInput, userId?: string): Promise<Devotee> {
    const existing = await this.getById(id);
    const updated = await this.devoteeRepo.update(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'Devotee', updated.id, existing, updated);
    return updated;
  }

  async deleteDevotee(id: string, userId?: string): Promise<Devotee> {
    const existing = await this.getById(id);
    const deleted = await this.devoteeRepo.delete(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Devotee', id, existing, undefined);
    return deleted;
  }
}
