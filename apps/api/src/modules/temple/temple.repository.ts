import { PrismaClient, Temple } from '@prisma/client';
import { BaseRepository, IRepository } from '../../common/repository.base.js';

export interface ITempleRepository extends IRepository<Temple> {
  getSingleMaster(): Promise<Temple | null>;
}

export class TempleRepository extends BaseRepository<Temple> implements ITempleRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'temple');
  }

  async getSingleMaster(): Promise<Temple | null> {
    return this.prisma.temple.findFirst();
  }
}
