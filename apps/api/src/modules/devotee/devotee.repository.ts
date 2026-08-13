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
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { gotra: { contains: query, mode: 'insensitive' } },
          { nakshatra: { contains: query, mode: 'insensitive' } },
          { rashi: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } }
        ] as any
      },
      take: 20,
      orderBy: { name: 'asc' }
    });
  }
}
