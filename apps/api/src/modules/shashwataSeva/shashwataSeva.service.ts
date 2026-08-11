import { ShashwataSeva } from '@prisma/client';
import { BaseService } from '../../common/service.base.js';
import { IShashwataSevaRepository } from './shashwataSeva.repository.js';
import { IAuditLogger } from '../audit/audit.service.js';
import { ShashwataSevaInput, AuditAction } from '@temple/shared';
import { ConflictError } from '../../common/errors.js';

export interface IShashwataSevaService {
  getAllShashwataSevas(): Promise<ShashwataSeva[]>;
  getActiveShashwataSevas(): Promise<ShashwataSeva[]>;
  getShashwataSevaById(id: string): Promise<ShashwataSeva>;
  createShashwataSeva(input: ShashwataSevaInput, userId?: string): Promise<ShashwataSeva>;
  updateShashwataSeva(id: string, input: ShashwataSevaInput, userId?: string): Promise<ShashwataSeva>;
  deleteShashwataSeva(id: string, userId?: string): Promise<ShashwataSeva>;
}

export class ShashwataSevaService extends BaseService<ShashwataSeva> implements IShashwataSevaService {
  constructor(
    private readonly repo: IShashwataSevaRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(repo, 'ShashwataSeva');
  }

  async getAllShashwataSevas(): Promise<ShashwataSeva[]> {
    return this.repo.findAll();
  }

  async getActiveShashwataSevas(): Promise<ShashwataSeva[]> {
    return this.repo.findActive();
  }

  async getShashwataSevaById(id: string): Promise<ShashwataSeva> {
    return this.getById(id);
  }

  async createShashwataSeva(input: ShashwataSevaInput, userId?: string): Promise<ShashwataSeva> {
    const existing = await this.repo.findByCode(input.code);
    if (existing) {
      throw new ConflictError(`Shashwata Seva with code '${input.code}' already exists`);
    }

    const item = await this.repo.create(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'ShashwataSeva', item.id, undefined, item);
    return item;
  }

  async updateShashwataSeva(id: string, input: ShashwataSevaInput, userId?: string): Promise<ShashwataSeva> {
    const existing = await this.getById(id);
    if (input.code !== existing.code) {
      const codeConflict = await this.repo.findByCode(input.code);
      if (codeConflict) {
        throw new ConflictError(`Shashwata Seva with code '${input.code}' already exists`);
      }
    }

    const updated = await this.repo.update(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'ShashwataSeva', updated.id, existing, updated);
    return updated;
  }

  async deleteShashwataSeva(id: string, userId?: string): Promise<ShashwataSeva> {
    const existing = await this.getById(id);
    const deleted = await this.repo.delete(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'ShashwataSeva', id, existing, undefined);
    return deleted;
  }
}
