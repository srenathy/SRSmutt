import { z } from 'zod';

export const dailyReportQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

export type DailyReportQueryParams = z.infer<typeof dailyReportQuerySchema>;

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12)
});

export type MonthlyReportQueryParams = z.infer<typeof monthlyReportQuerySchema>;
