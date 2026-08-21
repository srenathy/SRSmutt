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
    // Start of current day in local/UTC
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    return this.prisma.announcement.findMany({
      where: {
        active: true,
        OR: [
          { endDate: null },
          { endDate: { gte: startOfToday } }
        ]
      },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }
}
