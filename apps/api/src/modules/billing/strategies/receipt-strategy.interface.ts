import { CreateReceiptInput } from '@temple/shared';
import { PrismaClient } from '@prisma/client';

export interface ValidatedReceiptItem {
  sevaId?: string;
  shashwataSevaId?: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface PreparedReceiptData {
  items: ValidatedReceiptItem[];
  totalAmount: number;
}

export interface ReceiptTypeStrategy {
  prepareAndValidate(input: CreateReceiptInput, prisma: PrismaClient): Promise<PreparedReceiptData>;
}
