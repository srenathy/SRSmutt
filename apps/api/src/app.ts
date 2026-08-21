import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';
import prismaPlugin from './plugins/prisma.js';
import authPlugin from './plugins/auth.js';
import { env } from './config/env.js';
import { AppError } from './common/errors.js';
import { buildContainer } from './container.js';
import { registerAuthRoutes } from './modules/auth/auth.routes.js';
import { registerTempleRoutes } from './modules/temple/temple.routes.js';
import { registerSevaRoutes } from './modules/seva/seva.routes.js';
import { registerShashwataSevaRoutes } from './modules/shashwataSeva/shashwataSeva.routes.js';
import { registerDevoteeRoutes } from './modules/devotee/devotee.routes.js';
import { registerBillingRoutes } from './modules/billing/billing.routes.js';
import { registerDashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { registerReportsRoutes } from './modules/reports/reports.routes.js';
import { registerBackupRoutes } from './modules/backup/backup.routes.js';
import { registerAnnouncementRoutes } from './modules/announcement/announcement.routes.js';
import { registerDevoteePortalRoutes } from './modules/devoteePortal/devoteePortal.routes.js';
import { registerVedicRoutes } from './modules/vedic/vedic.routes.js';
import { registerExpenseRoutes } from './modules/expense/expense.routes.js';
import { registerUserRoutes } from './modules/user/user.routes.js';
import { registerDepartmentBudgetRoutes } from './modules/departmentBudget/department-budget.routes.js';
import { registerGalleryRoutes } from './modules/gallery/gallery.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, '../../web/dist');

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info'
    }
  });

  // Plugins
  await app.register(cors, {
    origin: true,
    credentials: true
  });
  await app.register(helmet, {
    contentSecurityPolicy: false
  });
  await app.register(sensible);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  // Serve static UI bundle if web/dist exists (Single Server Execution)
  if (fs.existsSync(webDistPath)) {
    await app.register(fastifyStatic, {
      root: webDistPath,
      prefix: '/',
      wildcard: false
    });
    app.log.info(`Serving static frontend UI from ${webDistPath}`);
  }

  // Build DI Container
  const container = buildContainer(app.prisma);

  // Health Endpoint
  app.get('/health', async (_req, reply) => {
    return reply.send({
      status: 'ok',
      service: 'Temple Seva Billing System (Single Server)',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  await app.register(async (api) => {
    api.register(async (auth) => registerAuthRoutes(auth, container.authController), { prefix: '/auth' });
    api.register(async (temple) => registerTempleRoutes(temple, container.templeController), { prefix: '/temple' });
    api.register(async (seva) => registerSevaRoutes(seva, container.sevaController), { prefix: '/sevas' });
    api.register(async (shashwata) => registerShashwataSevaRoutes(shashwata, container.shashwataSevaController), { prefix: '/shashwata-sevas' });
    api.register(async (devotee) => registerDevoteeRoutes(devotee, container.devoteeController), { prefix: '/devotees' });
    api.register(async (billing) => registerBillingRoutes(billing, container.billingController), { prefix: '/receipts' });
    api.register(async (billing) => registerBillingRoutes(billing, container.billingController), { prefix: '/billing' });
    api.register(async (dash) => registerDashboardRoutes(dash, container.dashboardController), { prefix: '/dashboard' });
    api.register(async (reports) => registerReportsRoutes(reports, container.reportsController), { prefix: '/reports' });
    api.register(async (backup) => registerBackupRoutes(backup, container.backupController), { prefix: '/backup' });
    api.register(async (announcements) => registerAnnouncementRoutes(announcements, container.announcementController), { prefix: '/announcements' });
    api.register(async (devoteePortal) => registerDevoteePortalRoutes(devoteePortal, container.devoteePortalController), { prefix: '/devotee-portal' });
    api.register(async (vedic) => registerVedicRoutes(vedic, container.vedicController), { prefix: '/vedic' });
    // Direct route aliases for gotras, nakshatras, rashis
    api.get('/gotras', (req, reply) => container.vedicController.getGotras(req, reply));
    api.get('/nakshatras', (req, reply) => container.vedicController.getNakshatras(req, reply));
    api.get('/rashis', (req, reply) => container.vedicController.getRashis(req, reply));
    api.register(async (expenses) => registerExpenseRoutes(expenses, container.expenseController), { prefix: '/expenses' });
    api.register(async (users) => registerUserRoutes(users, container.userController), { prefix: '/users' });
    api.register(async (budgets) => registerDepartmentBudgetRoutes(budgets, container.departmentBudgetController), { prefix: '/department-budgets' });
    api.register(async (gallery) => registerGalleryRoutes(gallery, container.galleryController), { prefix: '/gallery' });
  }, { prefix: '/api' });

  // Global Error Handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        issues: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.code,
        message: error.message,
        details: error.details
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected internal error occurred'
    });
  });

  // SPA Fallback Handler for React Router
  app.setNotFoundHandler((request, reply) => {
    if (request.raw.url?.startsWith('/api')) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Route ${request.method}:${request.raw.url} not found`
      });
    }

    if (fs.existsSync(webDistPath)) {
      return reply.sendFile('index.html');
    }

    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Frontend build not found. Run npm run build:web first.'
    });
  });

  return app;
}
