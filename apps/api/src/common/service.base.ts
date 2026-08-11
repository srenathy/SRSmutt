import { IRepository } from './repository.base.js';
import { NotFoundError } from './errors.js';

export interface IService<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: any, userId?: string): Promise<T>;
  update(id: string, data: any, userId?: string): Promise<T>;
  delete(id: string, userId?: string): Promise<T>;
}

export abstract class BaseService<T> implements IService<T> {
  constructor(
    protected readonly repository: IRepository<T>,
    protected readonly entityName: string
  ) {}

  async getAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<T> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundError(`${this.entityName} with ID '${id}' not found`);
    }
    return item;
  }

  async create(data: any, userId?: string): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: any, userId?: string): Promise<T> {
    await this.getById(id); // Ensure entity exists
    return this.repository.update(id, data);
  }

  async delete(id: string, userId?: string): Promise<T> {
    await this.getById(id); // Ensure entity exists
    return this.repository.delete(id);
  }
}
