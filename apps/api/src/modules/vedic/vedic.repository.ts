import { PrismaClient, Gotra, Nakshatra, Rashi } from '@prisma/client';

export interface IVedicRepository {
  // Gotra
  findAllGotras(): Promise<Gotra[]>;
  createGotra(data: { name: string; description?: string; active?: boolean }): Promise<Gotra>;
  updateGotra(id: string, data: any): Promise<Gotra>;
  deleteGotra(id: string): Promise<Gotra>;

  // Nakshatra
  findAllNakshatras(): Promise<Nakshatra[]>;
  createNakshatra(data: { name: string; rulingDeity?: string; active?: boolean }): Promise<Nakshatra>;
  updateNakshatra(id: string, data: any): Promise<Nakshatra>;
  deleteNakshatra(id: string): Promise<Nakshatra>;

  // Rashi
  findAllRashis(): Promise<Rashi[]>;
  createRashi(data: { name: string; englishName?: string; active?: boolean }): Promise<Rashi>;
  updateRashi(id: string, data: any): Promise<Rashi>;
  deleteRashi(id: string): Promise<Rashi>;
}

export class VedicRepository implements IVedicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Gotra
  async findAllGotras(): Promise<Gotra[]> {
    return this.prisma.gotra.findMany({ orderBy: { name: 'asc' } });
  }

  async createGotra(data: { name: string; description?: string; active?: boolean }): Promise<Gotra> {
    return this.prisma.gotra.create({ data });
  }

  async updateGotra(id: string, data: any): Promise<Gotra> {
    return this.prisma.gotra.update({ where: { id }, data });
  }

  async deleteGotra(id: string): Promise<Gotra> {
    return this.prisma.gotra.delete({ where: { id } });
  }

  // Nakshatra
  async findAllNakshatras(): Promise<Nakshatra[]> {
    return this.prisma.nakshatra.findMany({ orderBy: { name: 'asc' } });
  }

  async createNakshatra(data: { name: string; rulingDeity?: string; active?: boolean }): Promise<Nakshatra> {
    return this.prisma.nakshatra.create({ data });
  }

  async updateNakshatra(id: string, data: any): Promise<Nakshatra> {
    return this.prisma.nakshatra.update({ where: { id }, data });
  }

  async deleteNakshatra(id: string): Promise<Nakshatra> {
    return this.prisma.nakshatra.delete({ where: { id } });
  }

  // Rashi
  async findAllRashis(): Promise<Rashi[]> {
    return this.prisma.rashi.findMany({ orderBy: { name: 'asc' } });
  }

  async createRashi(data: { name: string; englishName?: string; active?: boolean }): Promise<Rashi> {
    return this.prisma.rashi.create({ data });
  }

  async updateRashi(id: string, data: any): Promise<Rashi> {
    return this.prisma.rashi.update({ where: { id }, data });
  }

  async deleteRashi(id: string): Promise<Rashi> {
    return this.prisma.rashi.delete({ where: { id } });
  }
}
