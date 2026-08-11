import { z } from 'zod';

export const devoteeSchema = z.object({
  name: z.string().min(2, 'Devotee name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  gotra: z.string().optional().or(z.literal('')),
  nakshatra: z.string().optional().or(z.literal('')),
  rashi: z.string().optional().or(z.literal(''))
});

export type DevoteeInput = z.infer<typeof devoteeSchema>;
