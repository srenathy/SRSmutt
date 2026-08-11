import { z } from 'zod';

export const sevaSchema = z.object({
  name: z.string().min(2, 'Seva name is required'),
  code: z.string().min(2, 'Seva code is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true)
});

export type SevaInput = z.infer<typeof sevaSchema>;

export const shashwataSevaSchema = z.object({
  name: z.string().min(2, 'Shashwata Seva name is required'),
  code: z.string().min(2, 'Shashwata Seva code is required'),
  amount: z.number().positive('Amount must be positive'),
  durationYears: z.number().int().positive('Duration in years must be positive').default(25),
  description: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true)
});

export type ShashwataSevaInput = z.infer<typeof shashwataSevaSchema>;
