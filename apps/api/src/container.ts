import { PrismaClient } from '@prisma/client';
import { UserRepository } from './modules/auth/auth.repository.js';
import { AuthService } from './modules/auth/auth.service.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { TempleRepository } from './modules/temple/temple.repository.js';
import { TempleService } from './modules/temple/temple.service.js';
import { TempleController } from './modules/temple/temple.controller.js';
import { SevaRepository } from './modules/seva/seva.repository.js';
import { SevaService } from './modules/seva/seva.service.js';
import { SevaController } from './modules/seva/seva.controller.js';
import { ShashwataSevaRepository } from './modules/shashwataSeva/shashwataSeva.repository.js';
import { ShashwataSevaService } from './modules/shashwataSeva/shashwataSeva.service.js';
import { ShashwataSevaController } from './modules/shashwataSeva/shashwataSeva.controller.js';
import { DevoteeRepository } from './modules/devotee/devotee.repository.js';
import { DevoteeService } from './modules/devotee/devotee.service.js';
import { DevoteeController } from './modules/devotee/devotee.controller.js';
import { AuditRepository } from './modules/audit/audit.repository.js';
import { AuditService } from './modules/audit/audit.service.js';
import { BillingRepository } from './modules/billing/billing.repository.js';
import { ReceiptNumberGenerator } from './modules/billing/receipt-number.generator.js';
import { BillingService } from './modules/billing/billing.service.js';
import { BillingController } from './modules/billing/billing.controller.js';
import { DashboardRepository } from './modules/dashboard/dashboard.repository.js';
import { DashboardService } from './modules/dashboard/dashboard.service.js';
import { DashboardController } from './modules/dashboard/dashboard.controller.js';
import { ReportsRepository } from './modules/reports/reports.repository.js';
import { ReportsService } from './modules/reports/reports.service.js';
import { ReportsController } from './modules/reports/reports.controller.js';
import { BackupRepository } from './modules/backup/backup.repository.js';
import { BackupService } from './modules/backup/backup.service.js';
import { BackupController } from './modules/backup/backup.controller.js';
import { AnnouncementRepository } from './modules/announcement/announcement.repository.js';
import { AnnouncementService } from './modules/announcement/announcement.service.js';
import { AnnouncementController } from './modules/announcement/announcement.controller.js';
import { DevoteePortalController } from './modules/devoteePortal/devoteePortal.controller.js';
import { VedicRepository } from './modules/vedic/vedic.repository.js';
import { VedicService } from './modules/vedic/vedic.service.js';
import { VedicController } from './modules/vedic/vedic.controller.js';
import { ExpenseRepository } from './modules/expense/expense.repository.js';
import { ExpenseService } from './modules/expense/expense.service.js';
import { ExpenseController } from './modules/expense/expense.controller.js';
import { UserController } from './modules/user/user.controller.js';

import { DepartmentBudgetRepository } from './modules/departmentBudget/department-budget.repository.js';
import { DepartmentBudgetService } from './modules/departmentBudget/department-budget.service.js';
import { DepartmentBudgetController } from './modules/departmentBudget/department-budget.controller.js';

export function buildContainer(prisma: PrismaClient) {
  const auditRepo = new AuditRepository(prisma);
  const auditLogger = new AuditService(auditRepo);

  const authRepo = new UserRepository(prisma);
  const authService = new AuthService(authRepo);
  const authController = new AuthController(authService);

  const templeRepo = new TempleRepository(prisma);
  const templeService = new TempleService(templeRepo, auditLogger);
  const templeController = new TempleController(templeService);

  const sevaRepo = new SevaRepository(prisma);
  const sevaService = new SevaService(sevaRepo, auditLogger);
  const sevaController = new SevaController(sevaService);

  const shashwataSevaRepo = new ShashwataSevaRepository(prisma);
  const shashwataSevaService = new ShashwataSevaService(shashwataSevaRepo, auditLogger);
  const shashwataSevaController = new ShashwataSevaController(shashwataSevaService);

  const devoteeRepo = new DevoteeRepository(prisma);
  const devoteeService = new DevoteeService(devoteeRepo, auditLogger);
  const devoteeController = new DevoteeController(devoteeService);

  const billingRepo = new BillingRepository(prisma);
  const numberGenerator = new ReceiptNumberGenerator(prisma);
  const billingService = new BillingService(billingRepo, numberGenerator, auditLogger, prisma);
  const billingController = new BillingController(billingService);

  const dashboardRepo = new DashboardRepository(prisma);
  const dashboardService = new DashboardService(dashboardRepo);
  const dashboardController = new DashboardController(dashboardService);

  const reportsRepo = new ReportsRepository(prisma);
  const reportsService = new ReportsService(reportsRepo);
  const reportsController = new ReportsController(reportsService);

  const backupRepo = new BackupRepository(prisma);
  const backupService = new BackupService(backupRepo, auditLogger);
  const backupController = new BackupController(backupService);

  const announcementRepo = new AnnouncementRepository(prisma);
  const announcementService = new AnnouncementService(announcementRepo, auditLogger);
  const announcementController = new AnnouncementController(announcementService);

  const devoteePortalController = new DevoteePortalController(prisma);

  const vedicRepo = new VedicRepository(prisma);
  const vedicService = new VedicService(vedicRepo, auditLogger);
  const vedicController = new VedicController(vedicService);

  const expenseRepo = new ExpenseRepository(prisma);
  const expenseService = new ExpenseService(expenseRepo, auditLogger, prisma);
  const expenseController = new ExpenseController(expenseService);

  const userController = new UserController(prisma, auditLogger);

  const departmentBudgetRepo = new DepartmentBudgetRepository(prisma);
  const departmentBudgetService = new DepartmentBudgetService(departmentBudgetRepo);
  const departmentBudgetController = new DepartmentBudgetController(departmentBudgetService);

  return {
    authController,
    templeController,
    sevaController,
    shashwataSevaController,
    devoteeController,
    billingController,
    dashboardController,
    reportsController,
    backupController,
    announcementController,
    devoteePortalController,
    vedicController,
    expenseController,
    userController,
    departmentBudgetController
  };
}
