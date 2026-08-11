# Temple Seva Billing System (SRSmutt) — Production Edition

A production-ready, full-stack monorepo application for Sri Raghavendra Swamy Matha & temple seva billing operations.

## Monorepo Architecture

```
SRSmutt/
├── apps/
│   ├── api/            # Fastify + TypeScript + Prisma ORM + Zod Backend API
│   └── web/            # React 18 + TypeScript + Vite + Tailwind POS Frontend
├── packages/
│   └── shared/         # Shared Zod schemas, enums, & TypeScript types (@temple/shared)
├── nginx/
│   └── nginx.conf      # Nginx reverse proxy configuration
├── docker-compose.yml  # Containerized production stack (db, api, web, nginx)
└── package.json        # Monorepo workspace configuration
```

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, TanStack Query, React Hook Form + Zod, Axios, Recharts.
- **Backend:** Fastify, TypeScript, Zod, Prisma ORM, PostgreSQL 16, JWT (`@fastify/jwt`) with bcrypt password hashing, `@fastify/helmet`, `@fastify/cors`, pino logging.
- **Shared:** `@temple/shared` workspace package supplying single-source-of-truth Zod schemas and TypeScript types.
- **Deployment:** Multi-stage Docker Compose orchestration with Nginx reverse proxy.

## Key Features & Workflows

1. **Authentication & RBAC:** JWT login with role-based access control (`ADMIN` vs `STAFF`).
2. **Master Management:** Config-driven generic `<MasterTable>` and `<MasterFormDrawer>` handling Temple Info, Seva Master, Shashwata Seva Master, and Devotee Registry.
3. **High-Speed Counter Billing:** Multi-item billing for Regular Seva, Shashwata Seva, and In-Kind Dravya offerings with single-select Cash, UPI, Card, or Bank payment modes.
4. **Sequential Receipt Generation:** Financial year receipt numbers (e.g. `TS/2026-27/000123`) using transactional strategy pattern (`ReceiptTypeStrategy`).
5. **Print Layouts:**
   - **80mm Thermal Receipt:** POS print layout with itemized breakdown.
   - **A5 Sankalpa Sheet:** Price-free ritual prayer list formatted for temple priests (Devotee Name, Gotra, Nakshatra, Rashi, Sevas).
6. **Financial Reports & Dashboard:** Real-time collection metrics, 14-day Recharts trend visualization, and daily/monthly payment mode breakdowns.
7. **Audit Logging & Disaster Recovery:** Immutable `AuditLog` table for mutation tracking and single-click administrator JSON database backup download.

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

Access the application at `http://localhost`.
Default Admin Login: `admin` / `admin123` (Change immediately upon deployment!).

## Local Development (Node.js 20+ & PostgreSQL 16+)

```bash
# 1. Install dependencies across monorepo
npm install

# 2. Build shared package
npm run build:shared

# 3. Initialize database schema & seed
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Start concurrent development server
npm run dev
```

- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/health
