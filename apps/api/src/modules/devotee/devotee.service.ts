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

  private deduplicateDevotees(list: Devotee[]): Devotee[] {
    const seen = new Set<string>();
    const result: Devotee[] = [];

    for (const d of list) {
      if (d.phone === '0000000000' || d.name?.toLowerCase().includes('general temple income') || d.name?.toLowerCase().includes('hundi')) {
        continue;
      }
      const cleanPhone = (d.phone || '').replace(/\D/g, '');
      const cleanName = (d.name || '').trim().toLowerCase();
      const cleanGotra = (d.gotra || '').trim().toLowerCase();
      const cleanCity = (d.city || '').trim().toLowerCase();

      let key: string;
      if (cleanPhone.length >= 7) {
        // Last 10 digits or exact phone
        key = `phone:${cleanPhone.slice(-10)}`;
      } else {
        key = `identity:${cleanName}|${cleanGotra}|${cleanCity}`;
      }

      if (!seen.has(key)) {
        seen.add(key);
        result.push(d);
      }
    }
    return result;
  }

  async getAllDevotees(): Promise<Devotee[]> {
    const list = await this.devoteeRepo.findAll();
    return this.deduplicateDevotees(list);
  }

  async getDevoteeById(id: string): Promise<Devotee> {
    return this.getById(id);
  }

  async searchDevotees(query: string): Promise<Devotee[]> {
    let list: Devotee[];
    if (!query || query.trim().length === 0) {
      list = await this.devoteeRepo.findAll();
    } else {
      list = await this.devoteeRepo.searchByNameOrPhone(query.trim());
    }
    return this.deduplicateDevotees(list);
  }

  async createDevotee(input: DevoteeInput, userId?: string): Promise<Devotee> {
    const cleanInputPhone = (input.phone || '').replace(/\D/g, '').slice(-10);
    const existingList = await this.devoteeRepo.findAll();

    const existing = existingList.find(d => {
      const p = (d.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanInputPhone.length >= 7 && p === cleanInputPhone) return true;
      if (d.name.trim().toLowerCase() === input.name.trim().toLowerCase() && p === cleanInputPhone && p.length > 0) return true;
      return false;
    });

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
