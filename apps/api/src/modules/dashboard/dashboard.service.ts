import { IDashboardRepository } from './dashboard.repository.js';

export interface IDashboardService {
  getSummary(): Promise<any>;
}

export class DashboardService implements IDashboardService {
  constructor(private readonly dashboardRepo: IDashboardRepository) {}

  async getSummary(): Promise<any> {
    return this.dashboardRepo.getSummaryData();
  }
}
