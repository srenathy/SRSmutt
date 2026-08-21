import { z } from 'zod';
import { PaymentMode, ReceiptKind } from '../enums.js';

export const receiptItemInputSchema = z.object({
  sevaId: z.string().optional(),
  shashwataSevaId: z.string().optional(),
  description: z.string().min(1, 'Item description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  devoteeCount: z.number().int().min(1, 'Devotee count must be at least 1').default(1).optional()
});

export type ReceiptItemInput = z.infer<typeof receiptItemInputSchema>;

export const baseReceiptSchema = z.object({
  devoteeId: z.string().optional().or(z.literal('')),
  paymentMode: z.nativeEnum(PaymentMode),
  transactionRef: z.string().optional().or(z.literal('')),
  sankalpaNote: z.string().optional().or(z.literal('')),
  createdAt: z.string().optional(),
  sevaDate: z.string().optional(),
  items: z.array(receiptItemInputSchema).min(1, 'At least one item is required')
});

export const newSevaReceiptSchema = baseReceiptSchema.extend({
  kind: z.literal(ReceiptKind.NEW_SEVA)
});

export const shashwataSevaReceiptSchema = baseReceiptSchema.extend({
  kind: z.literal(ReceiptKind.SHASHWATA_SEVA)
});

export const kindDonationReceiptSchema = baseReceiptSchema.extend({
  kind: z.literal(ReceiptKind.KIND_DONATION)
});

export const hundiCollectionReceiptSchema = baseReceiptSchema.extend({
  kind: z.literal(ReceiptKind.HUNDI_COLLECTION)
});

export const createReceiptSchema = z.discriminatedUnion('kind', [
  newSevaReceiptSchema,
  shashwataSevaReceiptSchema,
  kindDonationReceiptSchema,
  hundiCollectionReceiptSchema
]);

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;

export const receiptQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  devoteeId: z.string().optional(),
  kind: z.nativeEnum(ReceiptKind).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  search: z.string().optional()
});

export type ReceiptQueryParams = z.infer<typeof receiptQuerySchema>;
