import { z } from 'zod';

export const galleryImageSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  caption: z.string().optional().or(z.literal('')),
  imageUrl: z.string().min(1, 'Image URL / Upload is required'),
  category: z.string().default('TEMPLE'),
  order: z.number().default(0),
  active: z.boolean().default(true)
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
