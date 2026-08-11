import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.string().default('STAFF'),
  canAccessBilling: z.boolean().default(true),
  canAccessExpenses: z.boolean().default(true),
  canAccessReports: z.boolean().default(true),
  canAccessMasters: z.boolean().default(false),
  canApproveExpenses: z.boolean().default(false)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().min(1)
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
