import { Gotra, Nakshatra, Rashi } from '@prisma/client';
import { IVedicRepository } from './vedic.repository.js';
import { GotraInput, NakshatraInput, RashiInput, AuditAction } from '@temple/shared';
import { IAuditLogger } from '../audit/audit.service.js';

export class VedicService {
  constructor(
    private readonly repo: IVedicRepository,
    private readonly auditLogger: IAuditLogger
  ) {}

  // Gotra
  async getGotras(): Promise<Gotra[]> {
    return this.repo.findAllGotras();
  }

  async createGotra(input: GotraInput, userId?: string): Promise<Gotra> {
    const created = await this.repo.createGotra(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'Gotra', created.id, undefined, created);
    return created;
  }

  async updateGotra(id: string, input: GotraInput, userId?: string): Promise<Gotra> {
    const updated = await this.repo.updateGotra(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'Gotra', updated.id, undefined, updated);
    return updated;
  }

  async deleteGotra(id: string, userId?: string): Promise<Gotra> {
    const deleted = await this.repo.deleteGotra(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Gotra', id, undefined, undefined);
    return deleted;
  }

  // Nakshatra
  async getNakshatras(): Promise<Nakshatra[]> {
    return this.repo.findAllNakshatras();
  }

  async createNakshatra(input: NakshatraInput, userId?: string): Promise<Nakshatra> {
    const created = await this.repo.createNakshatra(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'Nakshatra', created.id, undefined, created);
    return created;
  }

  async updateNakshatra(id: string, input: NakshatraInput, userId?: string): Promise<Nakshatra> {
    const updated = await this.repo.updateNakshatra(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'Nakshatra', updated.id, undefined, updated);
    return updated;
  }

  async deleteNakshatra(id: string, userId?: string): Promise<Nakshatra> {
    const deleted = await this.repo.deleteNakshatra(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Nakshatra', id, undefined, undefined);
    return deleted;
  }

  // Rashi
  async getRashis(): Promise<Rashi[]> {
    return this.repo.findAllRashis();
  }

  async createRashi(input: RashiInput, userId?: string): Promise<Rashi> {
    const created = await this.repo.createRashi(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'Rashi', created.id, undefined, created);
    return created;
  }

  async updateRashi(id: string, input: RashiInput, userId?: string): Promise<Rashi> {
    const updated = await this.repo.updateRashi(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'Rashi', updated.id, undefined, updated);
    return updated;
  }

  async deleteRashi(id: string, userId?: string): Promise<Rashi> {
    const deleted = await this.repo.deleteRashi(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Rashi', id, undefined, undefined);
    return deleted;
  }
}
