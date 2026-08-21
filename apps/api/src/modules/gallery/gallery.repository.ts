import { PrismaClient, GalleryImage } from '@prisma/client';
import { BaseRepository, IRepository } from '../../common/repository.base.js';

export interface IGalleryRepository extends IRepository<GalleryImage> {
  findActive(): Promise<GalleryImage[]>;
}

export class GalleryRepository extends BaseRepository<GalleryImage> implements IGalleryRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'galleryImage');
  }

  async findActive(): Promise<GalleryImage[]> {
    return this.prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }
}
