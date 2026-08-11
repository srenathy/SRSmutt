import { z } from 'zod';

export const templeSchema = z.object({
  name: z.string().min(2, 'Temple name is required'),
  deity: z.string().min(2, 'Deity name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  upiId: z.string().optional().or(z.literal('')),
  defaultPriest: z.string().optional().or(z.literal('')),
  receiptHeader: z.string().optional().or(z.literal('')),
  receiptFooter: z.string().optional().or(z.literal('')),
  expenseApprovalThreshold: z.number().min(0, 'Threshold must be non-negative').default(5000),
  monthlyExpenseBudget: z.number().min(0, 'Budget must be non-negative').default(5000)
});

export type TempleInput = z.infer<typeof templeSchema>;
