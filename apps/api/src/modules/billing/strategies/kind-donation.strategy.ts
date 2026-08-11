import { ReceiptTypeStrategy, PreparedReceiptData, ValidatedReceiptItem } from './receipt-strategy.interface.js';
import { CreateReceiptInput } from '@temple/shared';
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../../../common/errors.js';

export class KindDonationStrategy implements ReceiptTypeStrategy {
  async prepareAndValidate(input: CreateReceiptInput, _prisma: PrismaClient): Promise<PreparedReceiptData> {
    const items: ValidatedReceiptItem[] = [];
    let totalAmount = 0;

    for (const item of input.items) {
      if (!item.description || item.description.trim().length === 0) {
        throw new BadRequestError('Description is required for Kind Donation items');
      }

      const itemAmount = item.amount || 0; // In-kind donations may be zero-value or valued
      const lineTotal = itemAmount * item.quantity;
      totalAmount += lineTotal;

      items.push({
        description: item.description,
        amount: itemAmount,
        quantity: item.quantity
      });
    }

    return { items, totalAmount };
  }
}
