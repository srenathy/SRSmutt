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
    const now = new Date();

    return this.prisma.announcement.findMany({
      where: {
        active: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }
}
