# Technology Stack Guide

## Purpose

This document is the implementation guide for the project's agreed stack. Read
`docs/PROJECT_DOCS.md` first for product scope and current decisions, then read
this file before changing infrastructure, data, authentication, storage, or
deployment behavior.

`AGENTS.md` stays concise and repo-specific. It should point here; it should not
duplicate this operational detail.

## Locked Stack

- Framework: Next.js `16.3.1`
- Runtime and package manager: Bun
- Hosting: Vercel
- Database: Neon PostgreSQL
- ORM and migrations: Prisma
- Authentication: Better Auth
- Object storage: Cloudflare R2
- Validation: Zod
- Client UI state: Jotai
- UI components: shadcn/ui (`base-nova` style, Tabler icons)
- Language: TypeScript

Do not replace these choices without an explicit project decision.

## Non-Negotiable Next.js Rule

Before changing a Next.js API, routing convention, caching behavior, or file
structure, read the relevant local guide under `node_modules/next/dist/docs/`.
Next.js `16.3.1` has breaking changes from older releases. Follow its current
guidance and deprecation notices, not remembered patterns or web snippets.


### What is Next.js?

Next.js is the full-stack React framework used by this template. It provides
file-based routes, server rendering, server-only code boundaries, and API
endpoints in the same codebase. React is still the UI library. Next.js adds the
application runtime and conventions around it.

| Concern | React SPA only | This Next.js template |
| --- | --- | --- |
| Route definition | Client router configuration | Files under `app/` |
| First render | Usually browser JavaScript | Server Components by default |
| Secrets and database access | Needs a separate backend boundary | Server Components, Server Actions, and Route Handlers |
| Browser interaction | React client component | Add `"use client"` to the small interactive boundary |
| HTTP endpoint | Separate backend or service | `app/api/**/route.ts` Route Handler |

### Choose the right Next.js tool

| Use this | When it fits | Do not use it for |
| --- | --- | --- |
| Server Component | Reading data and rendering a page | Click handlers, `useState`, or browser APIs |
| Client Component | Forms, events, local state, browser APIs | Prisma, secrets, or direct authorization decisions |
| Server Action | A mutation started by this app's UI | Webhooks, mobile clients, or public HTTP contracts |
| Route Handler | Webhooks, third parties, mobile, or a public API | Internal form mutations by default |
| Jotai atom | Shared temporary browser UI state | Database records or server cache |

### Server Component first

Pages and layouts are Server Components unless a file starts with `"use client"`.
Keep database reads and secret-dependent work here. Pass only plain,
serializable data to an interactive child.

```tsx
// features/clients/pages/ClientsPage.tsx
import { prisma } from "@/lib/prisma"
import { ClientTable } from "@/features/clients/components/ClientTable"

export async function ClientsPage() {
  const clients = await prisma.client.findMany({
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: "asc" },
  })

  return <ClientTable clients={clients} />
}
```

### Add `"use client"` only at the interactive edge

Use a Client Component for event handlers, React state, effects, or browser
APIs. The directive makes the file and its imports part of the browser bundle,
so keep this boundary as small as practical.

```tsx
"use client"

import { useState } from "react"

export function ClientSearch() {
  const [query, setQuery] = useState("")

  return (
    <input
      aria-label="Search clients"
      onChange={(event) => setQuery(event.target.value)}
      value={query}
    />
  )
}
```

### Server Action versus Route Handler

Both run on the server. The caller decides the choice.

| | Server Action | Route Handler |
| --- | --- | --- |
| Called by | This app's React UI | Any HTTP client |
| Best for | Authenticated form or button mutation | Webhook, integration, mobile, or public API |
| Location | `features/<feature>/actions/` | `app/api/<endpoint>/route.ts` |
| Input | Typed action input plus server validation | `Request` body, query, or headers plus server validation |

```ts
// features/clients/actions/create-client.action.ts
"use server"

import { authActionClient } from "@/lib/safe.action"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const CreateClientSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
})

export const createClientAction = authActionClient
  .inputSchema(CreateClientSchema)
  .action(async ({ parsedInput }) => {
    const client = await prisma.client.create({ data: parsedInput })
    return { id: client.id }
  })
```

```ts
// app/api/integrations/provider/route.ts
import { z } from "zod"

const WebhookSchema = z.object({ event: z.string().min(1) })

export async function POST(request: Request) {
  const payload = WebhookSchema.safeParse(await request.json())

  if (!payload.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Verify the provider signature before trusting the webhook payload.
  return Response.json({ received: true })
}
```

### Shared browser state with Jotai

Jotai is for UI state that more than one Client Component needs, such as a
dialog, temporary filter, or draft workflow. It is not the source of truth for
Prisma data.

```ts
// features/clients/atom/client-filter.atom.ts
import { atom } from "jotai"

export const clientFilterAtom = atom("")
```

```tsx
"use client"

import { useAtom } from "jotai"
import { clientFilterAtom } from "@/features/clients/atom/client-filter.atom"

export function ClientFilter() {
  const [filter, setFilter] = useAtom(clientFilterAtom)

  return <input onChange={(event) => setFilter(event.target.value)} value={filter} />
}
```

### UI components (shadcn/ui)

Base UI primitives live in `components/ui/` (`Button`, `Card`, `Input`,
`Tabs`, `Attachment`, and so on). They come from shadcn/ui, configured in
`components.json`:

- Style: `base-nova`, base color `neutral`, CSS variables enabled.
- Icon library: Tabler (`@tabler/icons-react`). Use this for every icon; do
  not add a second icon library.
- Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.

Add a new primitive with the shadcn CLI, not by hand-writing one:

```bash
bunx shadcn@latest add <component-name>
```

This writes into `components/ui/` following the same config. Before adding a
component that looks similar to an existing one, check `components/ui/`
first. Most common needs (buttons, cards, form fields, dialogs, tables) are
already there.

Components in `components/ui/` are already customized for this project's
visual language (radius, ring-based elevation instead of borders on `Card`,
the `font-heading` token, and so on). Read an existing component in that
folder before styling a new one, so new UI stays visually consistent instead
of reverting to shadcn's untouched defaults.

Keep feature-specific composition (a component that combines several `ui/`
primitives for one feature's need) inside that feature's
`components/` folder, not in `components/ui/`. `components/ui/` stays
generic and reusable across features.

### Prisma compared with raw SQL

| Prisma | Raw SQL |
| --- | --- |
| Typed queries generated from `prisma/schema.prisma` | Direct SQL string or query builder |
| Default for application reads and writes in this template | Use only when Prisma cannot express a measured need |
| Migrations and schema history stay together | Still review query plans and migrations |

Use Prisma for normal feature work. Add an index only after identifying a real
query path and reviewing its query plan.

### Runnable examples in this repository

Open [/test-ui](/test-ui) during KT. Each pattern below has its own page: a
live demo paired with the real, current source code read straight off disk.

- [/test-ui/server-components](/test-ui/server-components): Server Component
  reading Prisma directly
- [/test-ui/server-actions](/test-ui/server-actions): `"use server"` action in
  `app/(hidden)/test-ui/_actions/stack-playground.action.ts`
- [/test-ui/route-handlers](/test-ui/route-handlers): Route Handler in
  `app/api/test-ui/route.ts`
- [/test-ui/client-state](/test-ui/client-state): `"use client"` component and
  Jotai atom
- [/test-ui/react-query](/test-ui/react-query): a Server Action used as a
  React Query `queryFn` from a Client Component
- [/test-ui/auth](/test-ui/auth): `getServerSession()` and the
  `authActionClient` middleware that rejects unauthenticated calls
- [/test-ui/file-upload](/test-ui/file-upload): R2 presigned upload flow

Read the source alongside the working page. Production features must still add
authorization and resource permission checks before every private read or write.

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

## KT Reference: Protected Feature Mutation

Use this as junior-developer reference when adding product behavior. Example
creates a `Client` record. Copy shape, then rename feature, schema, permission,
and Prisma model for product need.

Runnable companion: `/test-ui` has safe internal examples for `"use server"`,
Route Handlers, `"use client"` and Jotai, Server Components, React Query,
Better Auth, and R2 file upload. Use it for KT; use this document for
production rules and architecture.

### 1. Put code with owning feature

```text
features/clients/
  actions/create-client.action.ts
  schema/clients.schema.ts
  pages/ClientsPage.tsx
  clients.docs.md
```

Do not put feature queries or actions in `app/` or a generic `lib/` folder.
`lib/` is only for cross-feature infrastructure such as `lib/prisma.ts` and
`lib/safe.action.ts`.

### 2. Validate, authorize, then mutate on server

`features/clients/actions/create-client.action.ts`

```ts
"use server"

import { authActionClient } from "@/lib/safe.action"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const CreateClientSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.email().optional(),
  phone: z.string().trim().max(30).optional(),
})

export const createClientAction = authActionClient
  .metadata({ actionName: "createClient" })
  .inputSchema(CreateClientSchema)
  .action(async ({ parsedInput }) => {
    // authActionClient already requires a valid Better Auth session.
    // Add role, organization, or ownership checks here before this mutation.
    const client = await prisma.client.create({
      data: {
        fullName: parsedInput.fullName,
        email: parsedInput.email,
        phone: parsedInput.phone,
        searchFullName: parsedInput.fullName.toLowerCase(),
        searchEmail: parsedInput.email?.toLowerCase(),
        searchPhone: parsedInput.phone?.toLowerCase(),
      },
    })

    return { success: true as const, clientId: client.id }
  })
```

`"use server"` keeps Prisma and Better Auth session checks server-side.
`authActionClient` gets session through action `ctx`; do not accept a user id
from browser input as authorization proof. Add `ctx` to action callback for
ownership or organization checks when model needs them.

### 3. Call action from client UI

```tsx
"use client"

import { useAction } from "next-safe-action/hooks"
import { createClientAction } from "@/features/clients/actions/create-client.action"

export function CreateClientButton() {
  const { executeAsync, isExecuting } = useAction(createClientAction)

  async function createClient() {
    const result = await executeAsync({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    })

    if (result.data?.success) {
      // Refresh local data, close dialog, or navigate.
      console.log(result.data.clientId)
    }
  }

  return (
    <button disabled={isExecuting} onClick={createClient} type="button">
      {isExecuting ? "Creating..." : "Create client"}
    </button>
  )
}
```

Production form values come from existing form state, never hard-coded values.
Handle `result.serverError` and validation errors in component UI. Keep client
validation for UX; server Zod validation remains source of truth.

### 4. Upload private image, store key only

Use current R2 helper in client component after user selects a `File`:

```ts
import { uploadFile } from "@/lib/storage/client.storage"
import { updateAccountProfileAction } from "@/features/auth/actions/account.action"

const objectKey = await uploadFile(file, "unused-legacy-path", {
  compression: "avatar",
})

await updateAccountProfileAction({
  firstName: "Ada",
  lastName: "Lovelace",
  phoneNumber: "",
  photoURL: objectKey,
})
```

`uploadFile` asks authenticated server action for short-lived, user-scoped R2
upload URL, then browser `PUT`s file directly to R2. Persist returned
`objectKey` in Prisma. Never persist `uploadUrl`, signed download URL, or R2
credentials. Current helper owns R2 folder/key generation; second argument is a
legacy compatibility placeholder and does not control destination.

### Feature Checklist

1. Create feature folder and feature documentation.
2. Define Zod input schema beside feature.
3. Use `authActionClient` for protected actions; add resource permission check.
4. Read/write through Prisma in action or feature `server/` code.
5. Return minimal plain data. Never return secrets, passwords, signed URLs, or
   internal authorization data.
6. For files: upload through R2 intent, store key, authorize every download.
7. Add schema migration when Prisma model changes: `bun run db:generate`, then
   `bun run db:migrate` against non-production database first.
8. Run required checks before merge: `bun run lint`, `bun run typecheck`,
   `bun run doctor`, and `bun run fallow`.

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
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=verify-full"

# Better Auth
BETTER_AUTH_SECRET="generate-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudflare R2: server-only S3-compatible credentials
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
```

- Set `BETTER_AUTH_URL` to the canonical production URL in Vercel Production,
  and the matching preview/local URL where a separate value is required.
- Generate `BETTER_AUTH_SECRET` with a cryptographically secure generator. It
  must be stable for an environment; changing it invalidates existing sessions.
- Object reads use short-lived signed R2 GET URLs. Persist object keys in the
  database, not public CDN URLs.
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

Setup walkthrough: `docs/CLOUDFLARE_STORAGE_SETUP.md`.

- R2 stores binary objects; PostgreSQL stores metadata, ownership, visibility,
  content type, size, object key, and lifecycle state.
- Generate opaque, server-controlled object keys. Never use raw user filenames
  as keys or let a client choose another user's path.
- Preferred upload flow: authenticated client requests an upload intent ->
  server validates authorization, MIME type, and size -> server returns a
  short-lived, key-scoped presigned upload URL -> client uploads directly ->
  server verifies and records the object metadata.
- Preferred download flow: authorize on the server, then return a short-lived
  signed download URL. Persist object keys in PostgreSQL; do not store public
  CDN URLs.
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
  OAuth, database, and hosting services, not a Better Auth hosted-plan fee.

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
- [Cloudflare storage setup (this repo)](./CLOUDFLARE_STORAGE_SETUP.md)
- [Better Auth installation](https://better-auth.com/docs/installation)
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
