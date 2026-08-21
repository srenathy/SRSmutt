import { z } from 'zod';
import { AnnouncementCategory } from '../enums.js';

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(1, 'Category is required').default('EVENT'),
  content: z.string().min(5, 'Content is required'),
  imageUrl: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().nullable().or(z.literal('')),
  endDate: z.string().optional().nullable().or(z.literal('')),
  active: z.boolean().default(true)
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
