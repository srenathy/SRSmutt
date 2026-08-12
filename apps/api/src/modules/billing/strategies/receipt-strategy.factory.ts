import { ReceiptKind } from '@temple/shared';
import { ReceiptTypeStrategy } from './receipt-strategy.interface.js';
import { NewSevaStrategy } from './new-seva.strategy.js';
import { ShashwataSevaStrategy } from './shashwata-seva.strategy.js';
import { KindDonationStrategy } from './kind-donation.strategy.js';
import { HundiCollectionStrategy } from './hundi-collection.strategy.js';
import { BadRequestError } from '../../../common/errors.js';

export class ReceiptStrategyFactory {
  private static strategies: Record<ReceiptKind, ReceiptTypeStrategy> = {
    [ReceiptKind.NEW_SEVA]: new NewSevaStrategy(),
    [ReceiptKind.SHASHWATA_SEVA]: new ShashwataSevaStrategy(),
    [ReceiptKind.KIND_DONATION]: new KindDonationStrategy(),
    [ReceiptKind.HUNDI_COLLECTION]: new HundiCollectionStrategy()
  };

  static getStrategy(kind: ReceiptKind): ReceiptTypeStrategy {
    const strategy = this.strategies[kind];
    if (!strategy) {
      throw new BadRequestError(`Unsupported receipt kind: ${kind}`);
    }
    return strategy;
  }
}
