import { PrismaClient, Seva } from '@prisma/client';
import { BaseRepository, IRepository } from '../../common/repository.base.js';

export interface ISevaRepository extends IRepository<Seva> {
  findByCode(code: string): Promise<Seva | null>;
  findActive(): Promise<Seva[]>;
}

export class SevaRepository extends BaseRepository<Seva> implements ISevaRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'seva');
  }

  async findByCode(code: string): Promise<Seva | null> {
    return this.prisma.seva.findUnique({
      where: { code }
    });
  }

  async findActive(): Promise<Seva[]> {
    return this.prisma.seva.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
  }
}
