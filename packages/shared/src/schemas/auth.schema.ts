import { z } from 'zod';
import { Role } from '../enums.js';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const devoteeRegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gotra: z.string().optional().or(z.literal('')),
  nakshatra: z.string().optional().or(z.literal('')),
  rashi: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal(''))
});

export type DevoteeRegisterInput = z.infer<typeof devoteeRegisterSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  role: z.nativeEnum(Role),
  canAccessBilling: z.boolean().optional(),
  canAccessExpenses: z.boolean().optional(),
  canAccessReports: z.boolean().optional(),
  canAccessMasters: z.boolean().optional(),
  canApproveExpenses: z.boolean().optional(),
  devoteeId: z.string().optional(),
  createdAt: z.string().or(z.date())
});

export type UserResponse = z.infer<typeof userResponseSchema>;
