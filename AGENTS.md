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

## Rules

- Use `/Users/kenneth/.agents/skills/caveman/SKILL.md` communication rules when responding in this repo.
- Keep technical substance exact; keep responses terse.
- Read relevant guides in `node_modules/next/dist/docs/` before changing Next.js APIs, conventions, or file structure.
- Heed Next.js deprecation notices. This project uses Next.js `16.2.6`.
- Keep Prisma, Better Auth, and R2 credentials server-side only.
- Do not reintroduce Firebase.
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

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
