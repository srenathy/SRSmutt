import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.string().min(2, 'Expense category is required'),
  title: z.string().min(2, 'Title/Purpose is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  payee: z.string().optional().or(z.literal('')),
  paymentMode: z.string().default('CASH'),
  description: z.string().optional().or(z.literal('')),
  attachment: z.string().optional().or(z.literal(''))
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
