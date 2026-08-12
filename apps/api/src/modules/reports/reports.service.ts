import { IReportsRepository } from './reports.repository.js';
import { DailyReportQueryParams, MonthlyReportQueryParams } from '@temple/shared';

export interface IReportsService {
  getDailyReport(query: any): Promise<any>;
  getMonthlyReport(query: any): Promise<any>;
  getCustomRangeReport(query: any): Promise<any>;
  getFinancialBalanceReport(): Promise<any>;
}

export class ReportsService implements IReportsService {
  constructor(private readonly reportsRepo: IReportsRepository) {}

  async getDailyReport(query: any): Promise<any> {
    return this.reportsRepo.getDailyReport(query.date, query.kind, query.paymentMode);
  }

  async getMonthlyReport(query: any): Promise<any> {
    return this.reportsRepo.getMonthlyReport(query.year, query.month, query.kind, query.paymentMode);
  }

  async getCustomRangeReport(query: any): Promise<any> {
    return this.reportsRepo.getCustomRangeReport(query.startDate, query.endDate, query.kind, query.paymentMode);
  }

  async getFinancialBalanceReport(): Promise<any> {
    return this.reportsRepo.getFinancialBalanceReport();
  }
}
