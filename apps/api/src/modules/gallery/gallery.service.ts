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

const INITIAL_GALLERY_PHOTOS: GalleryImageInput[] = [
  {
    title: 'Sri Raghavendra Swamy — Alankara Darshana',
    caption: 'Daily morning consecrated Alankara at Rajajinagar Sannidhana',
    imageUrl: '/gallery/brindavana-1.jpg',
    category: 'ALANKARA',
    order: 1,
    active: true
  },
  {
    title: 'Sri Raghavendra Swamy — Pushpa Alankara',
    caption: 'Sacred floral decoration during special festival celebrations',
    imageUrl: '/gallery/brindavana-2.jpg',
    category: 'ALANKARA',
    order: 2,
    active: true
  },
  {
    title: 'Sri Raghavendra Swamy — Vastra Alankara',
    caption: 'Traditional silk vastra offering and golden sanctum view',
    imageUrl: '/gallery/brindavana-3.jpg',
    category: 'ALANKARA',
    order: 3,
    active: true
  },
  {
    title: 'Sri Raghavendra Matha — Rajajinagar Sannidhana',
    caption: 'Consecrated Mrittika Brindavana sanctum sanctorum',
    imageUrl: '/gallery/brindavana-4.jpg',
    category: 'TEMPLE',
    order: 4,
    active: true
  }
];

export class GalleryService extends BaseService<GalleryImage> implements IGalleryService {
  constructor(
    private readonly repo: IGalleryRepository,
    private readonly auditLogger: IAuditLogger
  ) {
    super(repo, 'GalleryImage');
  }

  private async ensureDefaultImages(): Promise<void> {
    const all = await this.repo.findAll();
    if (all.length === 0) {
      for (const photo of INITIAL_GALLERY_PHOTOS) {
        await this.repo.create(photo);
      }
    }
  }

  async getActiveImages(): Promise<GalleryImage[]> {
    await this.ensureDefaultImages();
    return this.repo.findActive();
  }

  async getAllImages(): Promise<GalleryImage[]> {
    await this.ensureDefaultImages();
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
