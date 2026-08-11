import { ReceiptTypeStrategy, PreparedReceiptData, ValidatedReceiptItem } from './receipt-strategy.interface.js';
import { CreateReceiptInput } from '@temple/shared';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';

export class NewSevaStrategy implements ReceiptTypeStrategy {
  async prepareAndValidate(input: CreateReceiptInput, prisma: PrismaClient): Promise<PreparedReceiptData> {
    const items: ValidatedReceiptItem[] = [];
    let totalAmount = 0;

    for (const item of input.items) {
      if (!item.sevaId) {
        throw new BadRequestError('Seva ID is required for New Seva receipt items');
      }

      const seva = await prisma.seva.findUnique({ where: { id: item.sevaId } });
      if (!seva) {
        throw new NotFoundError(`Seva with ID '${item.sevaId}' not found`);
      }

      if (!seva.active) {
        throw new BadRequestError(`Seva '${seva.name}' is currently inactive`);
      }

      const itemAmount = Number(seva.amount);
      const lineTotal = itemAmount * item.quantity;
      totalAmount += lineTotal;

      items.push({
        sevaId: seva.id,
        description: item.description || seva.name,
        amount: itemAmount,
        quantity: item.quantity
      });
    }

    return { items, totalAmount };
  }
}
