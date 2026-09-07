# AGENTS.md

## Project Context

Read `docs/PROJECT_DOCS.md` first for product scope and current decisions.
Read `docs/TECHNOLOGY_STACK.md` before changing infrastructure, data, auth,
storage, or deployment.

## Setup

- Install: `bun install`
- Dev: `bun dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- DB generate: `bun run db:generate`
- DB migrate: `bun run db:migrate`

## Architecture

This project uses feature-based architecture.

- Put feature code under `features/<feature-name>/`.
- Keep pages, actions, hooks, components, server code, state, utils, and route helpers inside the owning feature when possible.
- Use `features/auth/` as the reference feature shape:
  - `pages/` for feature screens.
  - `actions/` for server actions.
  - `hooks/` for client behavior.
  - `components/` for feature UI.
  - `server/` for server-only feature code.
  - `atom/` for feature state.
  - `utils/` for feature helpers.
  - `<feature>.docs.md` for feature documentation.

## UI patterns

Follow these defaults unless an existing feature already ships a different
approved pattern for the same surface.

- **Lists / tables:** Use `components/data-table/data-table.tsx` with
  `hooks/use-data-table.ts` (TanStack Table + nuqs URL state). Do not build
  one-off HTML tables for content lists.
- **Forms:** Use `components/ui/field.tsx` (and shared `components/forms/*`
  field helpers) with TanStack Form (`@tanstack/react-form`) and server
  actions for submit/mutate. Do not introduce alternate form libraries.
- **Table pagination / server-filtered lists:** Paginate, sort, and filter on
  the server. Client holds only page state (`page`, `perPage`, sort, filters
  via `use-data-table` / nuqs) and requests that page with TanStack Query
  (`@tanstack/react-query`) from versioned API routes under `app/api/`
  (paths from `ROUTES.API_*` in `constants/app.routes.ts`). Client calls use
  axios via `lib/api-client.ts` (`apiClient` — `withCredentials: true` for
  session cookies). Do not use raw `fetch` for those same-origin API routes.
  Do not load the full list (server component or otherwise) and slice it in
  the browser. Client-side pagination is only for a small, already-loaded,
  bounded set that cannot grow (not merchants, products, orders, or similar
  content lists).

## Rules

- Use `/Users/kenneth/.agents/skills/caveman/SKILL.md` communication rules when responding in this repo.
- Keep technical substance exact; keep responses terse.
- Read relevant guides in `node_modules/next/dist/docs/` before changing Next.js APIs, conventions, or file structure.
- Heed Next.js deprecation notices. This project uses Next.js `16.3.1`.
- Keep Prisma, Better Auth, and R2 credentials server-side only.
- Do not reintroduce Firebase.
- Client HTTP to `ROUTES.API_*` / `app/api/**`: use `apiClient` from
  `lib/api-client.ts` (axios). Raw `fetch` is fine only for non-app APIs
  (e.g. R2/presigned uploads).
- Follow existing feature patterns before adding new abstractions.

## After code changes

When done writing or changing code, always run both before considering work finished:

1. React Doctor — follow `/Users/kenneth/.claude/skills/react-doctor/SKILL.md`
   (project shortcut: `bun run doctor`; prefer `npx react-doctor@latest --verbose --diff` for changed-file regression checks).
2. Fallow — follow `/Users/kenneth/.claude/skills/fallow/SKILL.md`
   (project shortcut: `bun run fallow`).

Fix issues they report (or regressions) before stopping. Do not skip either step.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
