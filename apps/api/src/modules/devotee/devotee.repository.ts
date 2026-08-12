import { PrismaClient, Devotee } from '@prisma/client';
import { BaseRepository, IRepository } from '../../common/repository.base.js';

export interface IDevoteeRepository extends IRepository<Devotee> {
  findByPhone(phone: string): Promise<Devotee | null>;
  searchByNameOrPhone(query: string): Promise<Devotee[]>;
}

export class DevoteeRepository extends BaseRepository<Devotee> implements IDevoteeRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'devotee');
  }

  async findByPhone(phone: string): Promise<Devotee | null> {
    return this.prisma.devotee.findFirst({
      where: { phone }
    });
  }

  async searchByNameOrPhone(query: string): Promise<Devotee[]> {
    return this.prisma.devotee.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { gotra: { contains: query } },
          { nakshatra: { contains: query } },
          { rashi: { contains: query } },
          { city: { contains: query } }
        ]
      },
      take: 20,
      orderBy: { name: 'asc' }
    });
  }
}
