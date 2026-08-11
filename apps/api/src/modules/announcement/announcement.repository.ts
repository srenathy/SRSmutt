import { PrismaClient, Announcement } from '@prisma/client';
import { BaseRepository, IRepository } from '../../common/repository.base.js';

export interface IAnnouncementRepository extends IRepository<Announcement> {
  findActive(): Promise<Announcement[]>;
}

export class AnnouncementRepository extends BaseRepository<Announcement> implements IAnnouncementRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'announcement');
  }

  async findActive(): Promise<Announcement[]> {
    return this.prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
