# Project Docs

## Product

Next.js starter for apps on Neon PostgreSQL, Better Auth, Prisma, and Cloudflare R2.

## Current decisions

- Locked stack: see `docs/TECHNOLOGY_STACK.md`.
- Feature-based architecture under `features/`. Auth feature is reference shape.
- Firebase Auth, Firestore, and Firebase Storage removed. Do not reintroduce.
- Auth: Better Auth email/password. Sessions via Better Auth cookies.
- Data: Prisma models in `prisma/schema.prisma` against Neon.
- Files: Cloudflare R2 via S3-compatible SDK and short-lived presigned uploads.
  Setup: `docs/CLOUDFLARE_STORAGE_SETUP.md`. Compression:
  `docs/IMAGE_COMPRESSION.md`.

## Local bootstrap

1. Copy `.env.example` → `.env` and `.env.local` (fill real values).
2. `bun install`
3. `bun run db:generate`
4. `bun run db:migrate` (needs real `DATABASE_URL`)
5. `bun dev`
