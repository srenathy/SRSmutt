import { CreateReceiptInput, ReceiptQueryParams, AuditAction } from '@temple/shared';
import { IBillingRepository } from './billing.repository.js';
import { IReceiptNumberGenerator } from './receipt-number.generator.js';
import { ReceiptStrategyFactory } from './strategies/receipt-strategy.factory.js';
import { IAuditLogger } from '../audit/audit.service.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../common/errors.js';
import { PaginatedResult } from '../../common/pagination.js';

export interface IBillingService {
  createReceipt(input: CreateReceiptInput, userId: string): Promise<any>;
  getReceipts(params: ReceiptQueryParams): Promise<PaginatedResult<any>>;
  getReceiptById(id: string): Promise<any>;
  getReprintPayload(id: string): Promise<any>;
}

export class BillingService implements IBillingService {
  constructor(
    private readonly billingRepo: IBillingRepository,
    private readonly numberGenerator: IReceiptNumberGenerator,
    private readonly auditLogger: IAuditLogger,
    private readonly prisma: PrismaClient
  ) {}

  async createReceipt(input: CreateReceiptInput, userId: string): Promise<any> {
    const strategy = ReceiptStrategyFactory.getStrategy(input.kind);
    const prepared = await strategy.prepareAndValidate(input, this.prisma);
    const receiptNumber = await this.numberGenerator.generateNextNumber();

    const receipt = await this.billingRepo.createReceiptInTransaction({
      receiptNumber,
      kind: input.kind as any,
      devoteeId: input.devoteeId,
      paymentMode: input.paymentMode as any,
      transactionRef: input.transactionRef,
      sankalpaNote: input.sankalpaNote,
      createdByUserId: userId,
      prepared
    });

    await this.auditLogger.log(userId, AuditAction.CREATE, 'Receipt', receipt.id, undefined, {
      receiptNumber: receipt.receiptNumber,
      totalAmount: receipt.totalAmount,
      kind: receipt.kind,
      paymentMode: receipt.paymentMode
    });

    return receipt;
  }

  async getReceipts(params: ReceiptQueryParams): Promise<PaginatedResult<any>> {
    return this.billingRepo.findPaginated(params);
  }

  async getReceiptById(id: string): Promise<any> {
    const receipt = await this.billingRepo.findById(id);
    if (!receipt) {
      throw new NotFoundError(`Receipt with ID '${id}' not found`);
    }
    return receipt;
  }

  async getReprintPayload(id: string): Promise<any> {
    const receipt = await this.getReceiptById(id);
    const temple = await this.prisma.temple.findFirst();

    return {
      receipt,
      temple: temple || {
        name: 'Sri Raghavendra Swamy Matha',
        deity: 'Sri Guru Raghavendra Swamy',
        address: 'Main Bazaar Road, Mantralayam',
        city: 'Mantralayam',
        phone: '+91 8512 279400'
      },
      reprintedAt: new Date().toISOString()
    };
  }
}
