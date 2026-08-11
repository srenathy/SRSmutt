import { z } from 'zod';

export const gotraSchema = z.object({
  name: z.string().min(2, 'Gotra name is required'),
  description: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true)
});

export type GotraInput = z.infer<typeof gotraSchema>;

export const nakshatraSchema = z.object({
  name: z.string().min(2, 'Nakshatra name is required'),
  rulingDeity: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true)
});

export type NakshatraInput = z.infer<typeof nakshatraSchema>;

export const rashiSchema = z.object({
  name: z.string().min(2, 'Rashi name is required'),
  englishName: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true)
});

export type RashiInput = z.infer<typeof rashiSchema>;
