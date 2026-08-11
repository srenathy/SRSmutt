import { PrismaClient } from '@prisma/client';

export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<T>;
}

export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly modelName: keyof PrismaClient
  ) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(): Promise<T[]> {
    return this.model.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id }
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id }
    });
  }
}
