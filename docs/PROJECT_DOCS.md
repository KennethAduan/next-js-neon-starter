# Project Docs

## Product

Team todo list MVP on this Next.js Neon starter.

Signed-in teammates share one list. Any authenticated user can create, read,
update (title + completed), and delete todos. Solo builder. Priority is
simplicity.

## Scope

### In scope (MVP)

- Better Auth email/password (existing).
- Shared `Todo` model in Prisma / Neon.
- Feature under `features/todos/` (auth feature is the shape reference).
- Protected page: list + create + edit title + toggle completed + delete.
- Mutations via `authActionClient` + Zod. List read via Server Component /
  Prisma.

### Out of scope (for now)

- Per-user private todos or ownership-gated reads/writes.
- Orgs, roles, assignees, due dates, comments, attachments.
- Cloudflare R2 for todos.
- Server-paginated data-table / `app/api` list endpoints (add only when the
  list needs server filter, sort, or pagination).

## Current decisions

- Locked stack: see `docs/TECHNOLOGY_STACK.md`.
- Feature-based architecture under `features/`. Auth feature is reference
  shape.
- Firebase Auth, Firestore, and Firebase Storage removed. Do not reintroduce.
- Auth: Better Auth email/password. Sessions via Better Auth cookies.
- Data: Prisma models in `prisma/schema.prisma` against local SQLite
  (`DATABASE_URL=file:./prisma/dev.db`). Neon PostgreSQL is not used for the
  todo MVP.
- Files: Cloudflare R2 remains available in the starter for other features.
  Setup: `docs/CLOUDFLARE_STORAGE_SETUP.md`. Compression:
  `docs/IMAGE_COMPRESSION.md`. Not required for the todo MVP.
- Shared-list authz: session required; no per-row ownership checks until the
  product needs private todos.

## Local bootstrap

1. Copy `.env.example` → `.env` and `.env.local` (fill real values).
2. `bun install`
3. `bun run db:generate`
4. `bun run db:migrate` (needs real `DATABASE_URL`)
5. `bun dev`

## First vertical slice

Implementation plan (phased checklist):
`docs/superpowers/plans/2026-11-14-todos-mvp.md`

1. Add `Todo` to Prisma and migrate (SQLite `file:./prisma/dev.db`).
2. Ship `features/todos/` CRUD behind auth on `/` (`TodosPage`).
3. Smoke: login → create → toggle → edit → delete; second signed-in user sees
   the same rows; logged-out mutation fails.
