# Production Deployment Guide

## Prerequisites
- Linux Server (Ubuntu 22.04 / 24.04 LTS recommended)
- Docker Engine & Docker Compose Plugin installed
- Domain DNS A Record pointing to server IP

## Go-Live Steps

1. Clone repository & configure environment:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` to set strong, secret values:
   ```env
   POSTGRES_PASSWORD=your-ultra-secure-db-password
   JWT_SECRET=your-32-character-random-jwt-secret
   CORS_ORIGIN=https://your-temple-domain.org
   VITE_API_URL=/api
   ```
3. Build and launch container stack:
   ```bash
   docker compose up -d --build
   ```
4. Verify service health:
   ```bash
   curl http://localhost/health
   ```
5. Log in with `admin` / `admin123` and execute password update.
6. Configure automated daily `pg_dump` cron job for PostgreSQL container backup.
