# Temple Seva Billing System — Production Edition

A production-oriented full-stack rebuild of the Temple Seva Billing System.

## Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Fastify + TypeScript + Zod
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **Deployment:** Docker Compose + Nginx reverse proxy
- **Printing:** Browser print CSS for 80mm/A5 receipts and Sankalpa list

## Included business workflows
- Login with protected API
- Temple information
- Seva Master
- Shashwata Seva Master
- Devotee Master
- New Seva / Shashwata Seva / Kind billing
- Single-select payment mode: Cash, UPI, Card, Bank
- Receipt persistence in PostgreSQL
- Receipt reprint
- Sankalpa receipt list with Devotee Name and print-safe layout
- Dashboard collection summary
- Daily/monthly reports
- Backup export endpoint

## Quick start with Docker
1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
2. Run `docker compose up -d --build`.
3. Open `http://localhost`.
4. Default seed login: `admin` / `admin123` — change it immediately in production.

## Local development
Requirements: Node.js 20+, PostgreSQL 16+.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:4000
Health: http://localhost:4000/health

## Production notes
- Put the application behind HTTPS.
- Use a unique JWT secret stored in a secrets manager/environment variable.
- Change the seeded admin password before go-live.
- Schedule PostgreSQL backups (the `/api/backup/export` endpoint is a logical JSON export, not a replacement for database backups).
- Restrict database access to the application network.
- Configure printer hardware at the browser/counter machine; browser applications cannot silently control arbitrary printers.
