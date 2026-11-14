# Next.js Neon starter

Locked stack: Next.js 16.3.1, Bun, SQLite, Prisma, Better Auth, Cloudflare R2, Zod.

See `docs/PROJECT_DOCS.md` and `docs/TECHNOLOGY_STACK.md`.

## Quick start

```bash
bun install
cp .env.example .env
# fill BETTER_AUTH_SECRET, R2_*, etc. DATABASE_URL defaults to file:./prisma/dev.db
bun run db:generate
bun run db:migrate
bun dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `bun dev` | Dev server |
| `bun run build` | Production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run db:generate` | Prisma client |
| `bun run db:migrate` | Prisma migrate |
