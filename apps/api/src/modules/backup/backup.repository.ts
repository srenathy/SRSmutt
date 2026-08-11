import { PrismaClient } from '@prisma/client';

export interface IBackupRepository {
  exportAllData(): Promise<any>;
}

export class BackupRepository implements IBackupRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exportAllData() {
    const [users, temples, sevas, shashwataSevas, devotees, receipts, receiptItems, auditLogs] =
      await Promise.all([
        this.prisma.user.findMany({ select: { id: true, username: true, fullName: true, role: true, createdAt: true } }),
        this.prisma.temple.findMany(),
        this.prisma.seva.findMany(),
        this.prisma.shashwataSeva.findMany(),
        this.prisma.devotee.findMany(),
        this.prisma.receipt.findMany(),
        this.prisma.receiptItem.findMany(),
        this.prisma.auditLog.findMany()
      ]);

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        system: 'Temple Seva Billing System (SRSmutt)'
      },
      data: {
        users,
        temples,
        sevas,
        shashwataSevas,
        devotees,
        receipts,
        receiptItems,
        auditLogs
      }
    };
  }
}
