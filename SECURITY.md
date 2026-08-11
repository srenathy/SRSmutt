# Security Baseline

- Never use the development JWT secret in production.
- Never expose PostgreSQL directly to the public internet.
- Use HTTPS.
- Change the seeded administrator password.
- Add role-based restrictions to all master mutation endpoints (already enforced on temple/seva/shashwata-seva admin routes).
- Schedule encrypted database backups.
- Rotate secrets when staff access changes.
- Keep Docker images and npm dependencies patched.
- Review audit logging and retention requirements before go-live.
