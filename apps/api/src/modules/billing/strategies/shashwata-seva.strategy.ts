import { ReceiptTypeStrategy, PreparedReceiptData, ValidatedReceiptItem } from './receipt-strategy.interface.js';
import { CreateReceiptInput } from '@temple/shared';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';

export class ShashwataSevaStrategy implements ReceiptTypeStrategy {
  async prepareAndValidate(input: CreateReceiptInput, prisma: PrismaClient): Promise<PreparedReceiptData> {
    const items: ValidatedReceiptItem[] = [];
    let totalAmount = 0;

    for (const item of input.items) {
      if (!item.shashwataSevaId) {
        throw new BadRequestError('Shashwata Seva ID is required for Shashwata Seva receipt items');
      }

      const sSeva = await prisma.shashwataSeva.findUnique({ where: { id: item.shashwataSevaId } });
      if (!sSeva) {
        throw new NotFoundError(`Shashwata Seva with ID '${item.shashwataSevaId}' not found`);
      }

      if (!sSeva.active) {
        throw new BadRequestError(`Shashwata Seva '${sSeva.name}' is currently inactive`);
      }

      const itemAmount = Number(sSeva.amount);
      const lineTotal = itemAmount * item.quantity;
      totalAmount += lineTotal;

      items.push({
        shashwataSevaId: sSeva.id,
        description: item.description || `${sSeva.name} (${sSeva.durationYears} Years)`,
        amount: itemAmount,
        quantity: item.quantity,
        devoteeCount: item.devoteeCount || 1
      });
    }

    return { items, totalAmount };
  }
}
