import { GalleryImage } from '@prisma/client';
import { BaseService } from '../../common/service.base.js';
import { IGalleryRepository } from './gallery.repository.js';
import { GalleryImageInput, AuditAction } from '@temple/shared';
import { IAuditLogger } from '../audit/audit.service.js';

export interface IGalleryService {
  getActiveImages(): Promise<GalleryImage[]>;
  getAllImages(): Promise<GalleryImage[]>;
  createImage(input: GalleryImageInput, userId?: string): Promise<GalleryImage>;
  updateImage(id: string, input: GalleryImageInput, userId?: string): Promise<GalleryImage>;
  deleteImage(id: string, userId?: string): Promise<GalleryImage>;
}

export class GalleryService extends BaseService<GalleryImage> implements IGalleryService {
  constructor(
    private readonly repo: IGalleryRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(repo, 'GalleryImage');
  }

  async getActiveImages(): Promise<GalleryImage[]> {
    return this.repo.findActive();
  }

  async getAllImages(): Promise<GalleryImage[]> {
    return this.repo.findAll();
  }

  async createImage(input: GalleryImageInput, userId?: string): Promise<GalleryImage> {
    const created = await this.repo.create(input);
    await this.auditLogger.log(userId, AuditAction.CREATE, 'GalleryImage', created.id, undefined, created);
    return created;
  }

  async updateImage(id: string, input: GalleryImageInput, userId?: string): Promise<GalleryImage> {
    const existing = await this.getById(id);
    const updated = await this.repo.update(id, input);
    await this.auditLogger.log(userId, AuditAction.UPDATE, 'GalleryImage', updated.id, existing, updated);
    return updated;
  }

  async deleteImage(id: string, userId?: string): Promise<GalleryImage> {
    const existing = await this.getById(id);
    const deleted = await this.repo.delete(id);
    await this.auditLogger.log(userId, AuditAction.DELETE, 'GalleryImage', id, existing, undefined);
    return deleted;
  }
}
