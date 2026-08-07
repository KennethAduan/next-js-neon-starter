# Technology Stack Guide

## Purpose

This document is the implementation guide for the project's agreed stack. Read
`docs/PROJECT_DOCS.md` first for product scope and current decisions, then read
this file before changing infrastructure, data, authentication, storage, or
deployment behavior.

`AGENTS.md` stays concise and repo-specific. It should point here; it should not
duplicate this operational detail.

## Locked Stack

- Framework: Next.js `16.2.6`
- Runtime and package manager: Bun
- Hosting: Vercel
- Database: Neon PostgreSQL
- ORM and migrations: Prisma
- Authentication: Better Auth
- Object storage: Cloudflare R2
- Validation: Zod
- Language: TypeScript

Do not replace these choices without an explicit project decision.

## Non-Negotiable Next.js Rule

Before changing a Next.js API, routing convention, caching behavior, or file
structure, read the relevant local guide under `node_modules/next/dist/docs/`.
Next.js `16.2.6` has breaking changes from older releases. Follow its current
guidance and deprecation notices, not remembered patterns or web snippets.

## Project Shape

Use feature-based architecture.

```text
features/
  <feature-name>/
    pages/          # feature screens
    actions/        # server actions
    hooks/          # client behavior
    components/     # feature UI
    server/         # server-only business and data code
    atom/           # feature-local UI state
    utils/          # feature helpers
    <feature>.docs.md
```

- Keep a feature's pages, actions, hooks, components, server code, state,
  utilities, and route helpers with that feature whenever practical.
- Use `features/auth/` as the reference feature shape.
- Add shared infrastructure outside a feature only when it is genuinely
  cross-cutting. Do not create a generic abstraction before an actual reuse
  need exists.
- Server components, route handlers, server actions, Prisma, Better Auth, and
  R2 credentials remain server-side. Client code gets only intentionally public
  `NEXT_PUBLIC_*` values.

## Local Setup

```bash
bun install
bun dev
bun run lint
bun run typecheck
bun run build
```

Use the repository scripts as the source of truth. Add only documented scripts;
do not substitute npm/yarn/pnpm commands in project instructions.

## Environment Variables

Create `.env.local` from `.env.example`. Never commit either real credentials or
provider connection strings.

```dotenv
# Neon / Prisma
# Use Neon's pooled URL for normal application requests.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
# Use an unpooled/direct URL only when the installed Prisma version or migration
# tooling requires a dedicated migration connection.
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="generate-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudflare R2: server-only S3-compatible credentials
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_PUBLIC_BASE_URL="https://assets.example.com"
```

- Set `BETTER_AUTH_URL` to the canonical production URL in Vercel Production,
  and the matching preview/local URL where a separate value is required.
- Generate `BETTER_AUTH_SECRET` with a cryptographically secure generator. It
  must be stable for an environment; changing it invalidates existing sessions.
- `R2_PUBLIC_BASE_URL` is optional. Use it only for a configured public custom
  domain. Do not use the `r2.dev` endpoint for production delivery.
- Configure required values in Vercel separately for Development, Preview, and
  Production. Preview must never point at production data unless that is an
  explicit, reviewed decision.

## Database and Prisma

- Neon PostgreSQL is the system of record for relational application data.
- Define schema, relations, constraints, and migrations in Prisma. Apply
  production migrations through the repository's reviewed deployment workflow;
  never run ad-hoc schema changes against production.
- Use a pooled Neon connection for request-heavy Vercel runtime paths to avoid
  connection exhaustion. Use a direct connection only for tooling that requires
  it.
- Keep database access in a feature's `server/` layer. Authorization belongs
  beside each query/mutation, not only in the UI.
- Validate all action and route input with Zod before database work. Use
  transactions for multi-record changes that must succeed or fail together.
- Add indexes based on real query paths and inspect query plans before claiming
  a database bottleneck.
- Treat migrations as release artifacts: review them, test them on a non-prod
  database, deploy, then verify the application path.

## Authentication and Authorization

- Use Better Auth for users, sessions, and supported sign-in flows. Follow the
  installed Better Auth version's official integration steps; do not hand-roll
  session cookies or password handling.
- Put the Better Auth server configuration and handler in the auth feature or a
  clearly named server-only auth boundary. Keep the browser client thin.
- Protect server actions, route handlers, and database mutations independently.
  A hidden button, middleware redirect, or client check is not authorization.
- Check ownership, organization membership, and role/permission rules at the
  resource boundary before reads, writes, downloads, or upload-signing.
- Restrict trusted origins/callback URLs to the local, preview, and production
  domains actually in use. Never use a broad wildcard in production.

## Cloudflare R2

- R2 stores binary objects; PostgreSQL stores metadata, ownership, visibility,
  content type, size, object key, and lifecycle state.
- Generate opaque, server-controlled object keys. Never use raw user filenames
  as keys or let a client choose another user's path.
- Preferred upload flow: authenticated client requests an upload intent ->
  server validates authorization, MIME type, and size -> server returns a
  short-lived, key-scoped presigned upload URL -> client uploads directly ->
  server verifies and records the object metadata.
- Preferred download flow: authorize on the server, then return a short-lived
  signed download URL for private files. Public assets may use the configured
  custom domain only when their public visibility is intentional.
- Enforce allowed types and byte limits both before signing and when recording
  completion. Scan or quarantine untrusted files before making them available
  where the product's risk requires it.
- Use lifecycle rules for temporary uploads and deleted-object cleanup. Delete
  the object and its database metadata through a recoverable, auditable flow.

## Security Baseline

- Never expose database URLs, `BETTER_AUTH_SECRET`, or R2 access keys to the
  browser, source control, logs, error messages, or documentation examples.
- Keep `.env*` secrets ignored; commit only a secret-free `.env.example`.
- Validate input with Zod at every trust boundary. Enforce maximum payload/file
  sizes and rate-limit sensitive actions such as sign-in, password reset,
  invitation, and upload-intent creation.
- Use least-privilege database and R2 credentials. Rotate credentials after a
  suspected leak and revoke old keys.
- Avoid logging access tokens, session IDs, credentials, personal data, or
  signed URLs. Use structured, redacted server logs.
- Keep dependencies current and run the project's lint, typecheck, build, and
  relevant feature tests before deployment.

## Vercel Deployment

- Connect the repository to Vercel and use Bun-compatible install/build
  settings from the repository scripts.
- Treat Preview deployments as integration environments: assign preview-safe
  environment variables and, when practical, a separate Neon branch/database
  and R2 prefix or bucket.
- Production deploys run only after reviewed migrations are ready. Apply the
  migration once, then deploy code compatible with both the old and new schema
  during a safe rollout.
- Set the canonical production domain and Better Auth trusted origins before
  enabling real users. Verify sign-in, protected reads/writes, upload, and
  private-download flows on the deployed URL.
- Use Vercel logs and provider dashboards for diagnostics, while preserving the
  redaction rules above.

## Free-Tier and Cost Guardrails

Provider allowances change; check the linked pricing pages before relying on
them for a launch budget.

- Vercel Hobby is $0 and intended for personal, non-commercial use. As of
  2026-08-07 it includes 1M Edge Requests, 100 GB Fast Data Transfer, 4 active
  CPU hours, 360 GB-hours of provisioned memory, and 1M function invocations
  per month. Hobby has usage caps rather than purchasable overages.
- Neon Free is $0 with no credit card required. As of 2026-08-07 it provides
  100 CU-hours and 0.5 GB storage per project monthly. Compute scales to zero
  when idle; do not treat it as a guaranteed production capacity commitment.
- Cloudflare R2 includes 10 GB-month of Standard storage, 1M Class A
  operations, and 10M Class B operations per month; R2 egress is free. An R2
  subscription/billing setup is still required even when usage stays included.
- Better Auth is an application library. Its costs are the selected email,
  OAuth, database, and hosting services—not a Better Auth hosted-plan fee.

Track usage from day one. Alert before limits, cap upload sizes, cache public
  assets, expire unused Neon branches, and delete abandoned R2 uploads. Upgrade
  before a production workload depends on a free-tier cap or needs commercial
  Vercel use.

## Scaling Path

1. Keep requests stateless and database connections pooled; move long-running
   work out of the request path.
2. Add pagination, selective fields, indexes, and caching based on measured
   traffic and queries.
3. Store and serve large files directly through R2 rather than routing bytes
   through Vercel functions.
4. Add background jobs/queues for retries, media work, mail, imports, and other
   slow operations. Make jobs idempotent and observable.
5. Use Neon branching for safe schema/testing workflows and scale Neon compute
   after measured demand shows it is necessary.
6. Add stronger rate limits, monitoring, backup/restore drills, and a paid
   hosting plan before traffic, commercial use, support, or compliance requires
   them.

## Definition of Done for Infrastructure Changes

- Relevant local Next.js `16.2.6` docs were read before changing Next.js
  conventions.
- Environment variables are documented without values and configured per
  environment.
- Zod validation and server-side authorization protect every new mutation.
- Prisma migration is reviewed and tested outside production.
- R2 access is key-scoped, short-lived where private, and never exposes server
  credentials.
- `bun run lint`, `bun run typecheck`, and `bun run build` pass, plus relevant
  feature tests and a deployed smoke test when the change affects runtime
  behavior.

## Reference Links

- [Next.js local docs](../node_modules/next/dist/docs/)
- [Vercel pricing](https://vercel.com/pricing)
- [Neon pricing](https://neon.com/pricing)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare R2 limits](https://developers.cloudflare.com/r2/platform/limits/)
- [Better Auth installation](https://better-auth.com/docs/installation)
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
