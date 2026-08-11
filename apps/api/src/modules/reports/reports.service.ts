import { IReportsRepository } from './reports.repository.js';
import { DailyReportQueryParams, MonthlyReportQueryParams } from '@temple/shared';

export interface IReportsService {
  getDailyReport(query: DailyReportQueryParams): Promise<any>;
  getMonthlyReport(query: MonthlyReportQueryParams): Promise<any>;
}

export class ReportsService implements IReportsService {
  constructor(private readonly reportsRepo: IReportsRepository) {}

  async getDailyReport(query: DailyReportQueryParams): Promise<any> {
    return this.reportsRepo.getDailyReport(query.date);
  }

  async getMonthlyReport(query: MonthlyReportQueryParams): Promise<any> {
    return this.reportsRepo.getMonthlyReport(query.year, query.month);
  }
}
