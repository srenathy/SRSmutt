import { PrismaClient, ShashwataSeva } from '@prisma/client';
import { BaseRepository, IRepository } from '../../common/repository.base.js';

export interface IShashwataSevaRepository extends IRepository<ShashwataSeva> {
  findByCode(code: string): Promise<ShashwataSeva | null>;
  findActive(): Promise<ShashwataSeva[]>;
}

export class ShashwataSevaRepository extends BaseRepository<ShashwataSeva> implements IShashwataSevaRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'shashwataSeva');
  }

  async findByCode(code: string): Promise<ShashwataSeva | null> {
    return this.prisma.shashwataSeva.findUnique({
      where: { code }
    });
  }

  async findActive(): Promise<ShashwataSeva[]> {
    return this.prisma.shashwataSeva.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
  }
}
