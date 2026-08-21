import { Announcement } from '@prisma/client';
import { BaseService } from '../../common/service.base.js';
import { IAnnouncementRepository } from './announcement.repository.js';
import { AnnouncementInput, AuditAction } from '@temple/shared';
import { IAuditLogger } from '../audit/audit.service.js';

export interface IAnnouncementService {
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAllAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(input: AnnouncementInput, userId?: string): Promise<Announcement>;
  updateAnnouncement(id: string, input: AnnouncementInput, userId?: string): Promise<Announcement>;
  deleteAnnouncement(id: string, userId?: string): Promise<Announcement>;
}

export class AnnouncementService extends BaseService<Announcement> implements IAnnouncementService {
  constructor(
    private readonly repo: IAnnouncementRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(repo, 'Announcement');
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return this.repo.findActive();
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return this.repo.findAll();
  }

  private formatData(input: AnnouncementInput): any {
    return {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null
    };
  }

  async createAnnouncement(input: AnnouncementInput, userId?: string): Promise<Announcement> {
    const formatted = this.formatData(input);
    const created = await this.repo.create(formatted);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'Announcement', created.id, undefined, created);
    return created;
  }

  async updateAnnouncement(id: string, input: AnnouncementInput, userId?: string): Promise<Announcement> {
    const existing = await this.getById(id);
    const formatted = this.formatData(input);
    const updated = await this.repo.update(id, formatted);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'Announcement', updated.id, existing, updated);
    return updated;
  }

  async deleteAnnouncement(id: string, userId?: string): Promise<Announcement> {
    const existing = await this.getById(id);
    const deleted = await this.repo.delete(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'Announcement', id, existing, undefined);
    return deleted;
  }
}
