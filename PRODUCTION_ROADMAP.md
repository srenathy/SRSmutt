# Production Roadmap

Already implemented in this package:
- Separate frontend/backend
- PostgreSQL persistence
- Prisma migrations
- JWT authentication and bcrypt password hashing
- Role guard for administrator operations
- Zod request validation
- Helmet/CORS/security headers
- Health endpoint
- Dockerized deployment
- Nginx reverse proxy
- Print-safe Sankalpa and receipt layouts
- Radio-button payment mode
- Temple and Shashwata Seva masters

Recommended before public internet launch:
- HTTPS certificate and HSTS
- External secret manager
- Scheduled `pg_dump` backups + offsite retention
- Audit log table for create/update/delete actions
- Rate limiting / account lockout for login
- Password reset and user administration UI
- Automated tests (unit + API + browser E2E)
- Centralized logs/metrics and alerting
- Printer integration at each physical counter
