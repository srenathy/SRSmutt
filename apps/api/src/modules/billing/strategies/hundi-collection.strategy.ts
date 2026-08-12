import { ReceiptTypeStrategy, PreparedReceiptData, ValidatedReceiptItem } from './receipt-strategy.interface.js';
import { CreateReceiptInput } from '@temple/shared';
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../../../common/errors.js';

export class HundiCollectionStrategy implements ReceiptTypeStrategy {
  async prepareAndValidate(input: CreateReceiptInput, _prisma: PrismaClient): Promise<PreparedReceiptData> {
    const items: ValidatedReceiptItem[] = [];
    let totalAmount = 0;

    for (const item of input.items) {
      if (!item.description || item.description.trim().length === 0) {
        throw new BadRequestError('Description / Hundi Box Location is required for Hundi Collection entries');
      }

      const itemAmount = item.amount || 0;
      if (itemAmount <= 0) {
        throw new BadRequestError('Hundi Collection amount must be greater than zero');
      }

      const lineTotal = itemAmount * item.quantity;
      totalAmount += lineTotal;

      items.push({
        description: item.description,
        amount: itemAmount,
        quantity: item.quantity,
        devoteeCount: item.devoteeCount || 1
      });
    }

    return { items, totalAmount };
  }
}
