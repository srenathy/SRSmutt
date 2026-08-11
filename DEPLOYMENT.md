# Deployment Checklist

## VPS / Linux
- Ubuntu 22.04/24.04 or equivalent
- Docker Engine + Compose plugin
- DNS A record to the server
- HTTPS certificate (put TLS termination in front of Nginx, or extend the Nginx config)

## Go-live
1. `cp .env.example .env`
2. Set a strong `JWT_SECRET` and `POSTGRES_PASSWORD`.
3. Set `CORS_ORIGIN=https://your-domain.example`.
4. Set `VITE_API_URL=/api`.
5. `docker compose up -d --build`
6. Verify `/health`.
7. Login with `admin / admin123` once and change the password implementation/seed before production. For a real deployment, add the password-change endpoint before exposing the system publicly.
8. Configure daily PostgreSQL backups using `pg_dump` and store them outside the server.

## Architecture
Browser → Nginx → React static files / Fastify API → Prisma → PostgreSQL

The application is intentionally containerized so frontend and backend can be deployed independently later without changing the business API.
