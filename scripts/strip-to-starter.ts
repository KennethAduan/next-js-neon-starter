#!/usr/bin/env bun
/**
 * Strip test UI, docs route, and domain placeholder code from this template.
 * Also switches the database from local SQLite back to Neon PostgreSQL
 * (DATABASE_URL, @prisma/adapter-pg, String[] roles, fresh init migration).
 *
 * Usage:
 *   bun scripts/strip-to-starter.ts          # dry-run (default)
 *   bun scripts/strip-to-starter.ts --apply  # delete files and patch sources
 */

import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const APPLY = process.argv.includes("--apply")

const PATHS_TO_DELETE = [
  "app/(hidden)/test-ui",
  "app/api/test-ui",
  "app/(hidden)/docs",
  "features/docs",
  "app/(protected)/clients",
  "app/(protected)/investment",
  "features/clients",
  "lib/search/create-client-search-fields.ts",
  "app/page.tsx",
  "app/typeset.css",
  "app/testing-1",
  "app/react-query",
  "app/api/get-data",
  "dev.db",
  "dev.db-journal",
  "prisma/dev.db",
  "prisma/dev.db-journal",
]

const PRUNE_ROOTS = ["app", "features"] as const

const MIGRATIONS_DIR = "prisma/migrations"

const FILE_PATCHES: Record<string, string> = {
  "constants/app.routes.ts": `export const BASE_ROUTE = "/"

const HIDDEN_ROUTES = {
  REGISTER_ADMIN: "/register-admin",
}

const AUTH_ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  ACCOUNT: "/account",
  SECURITY: "/security",
}

const SIDEBAR_ROUTES = {
  HOME: BASE_ROUTE,
}

export const ROUTES = {
  HOME: BASE_ROUTE,
  LOGIN: AUTH_ROUTES.LOGIN,
  FORGOT_PASSWORD: AUTH_ROUTES.FORGOT_PASSWORD,
  ACCOUNT: AUTH_ROUTES.ACCOUNT,
  SECURITY: AUTH_ROUTES.SECURITY,
  REGISTER_ADMIN: HIDDEN_ROUTES.REGISTER_ADMIN,
}

/** Routes under \`app/(protected)\` — require a valid session in proxy/layout. */
export const PROTECTED_ROUTES = [
  ROUTES.HOME,
  ROUTES.ACCOUNT,
  ROUTES.SECURITY,
] as const

/** Public auth pages — redirect to home when already authenticated. */
export const PUBLIC_AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.FORGOT_PASSWORD,
] as const
`,
  "features/sidebar/sidebar-nav.config.ts": `import { ROUTES } from "@/constants"
import { IconLayoutGrid } from "@tabler/icons-react"
import type { NavMainGroup } from "./NavMain"

export const sidebarNavGroups: NavMainGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: ROUTES.HOME,
        icon: IconLayoutGrid,
      },
    ],
  },
]
`,
  "features/sidebar/BreadcrumbSidebar.tsx": `"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/constants/app.routes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbLabels } from "./BreadcrumbLabelContext"

const ROUTE_LABEL_MAP: Record<string, string> = {
  [ROUTES.HOME]: "Dashboard",
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const formatSegmentLabel = (segment: string) =>
  segment
    .split("-")
    .filter(Boolean)
    .map((word) => \`\${word.charAt(0).toUpperCase()}\${word.slice(1)}\`)
    .join(" ")

const BreadcrumbSidebar = () => {
  const pathname = usePathname()
  const { labels } = useBreadcrumbLabels()
  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length === 0) {
    return null
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = \`/\${pathSegments.slice(0, index + 1).join("/")}\`
    const isLast = index === pathSegments.length - 1

    const label =
      ROUTE_LABEL_MAP[href] ??
      labels.get(segment) ??
      (UUID_RE.test(segment) ? "…" : formatSegmentLabel(segment))

    return { href, isLast, label }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast ? <BreadcrumbSeparator /> : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbSidebar
`,
  "lib/schema.ts": `import { ROLES as UserROLES, UserSchema, type User, type UserWithoutPassword } from "@/features/users/schema/user.schema"
import { RoleSchema, type Role } from "@/features/users/schema/role.schema"

export const COLLECTIONS = {
  USERS: "users",
} as const

export type { User, UserWithoutPassword, Role }
export type ROLES = typeof UserROLES
export { UserROLES as ROLES_ENUM }
export { UserSchema, RoleSchema }
`,
  "prisma/schema.prisma": `// Prisma schema — Neon PostgreSQL + Better Auth core tables + app models.
// Run: bun run db:generate && bun run db:migrate

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  firstName       String   @default("")
  lastName        String   @default("")
  phoneNumber     String   @default("")
  roles           String[] @default([])
  searchFirstName String   @default("")
  searchLastName  String   @default("")
  searchFullName  String   @default("")
  searchEmail     String   @default("")

  sessions Session[]
  accounts Account[]

  @@index([searchFullName])
  @@index([searchEmail])
  @@index([searchFirstName])
  @@index([searchLastName])
  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
`,
  "prisma/seed.ts": `import { prisma } from "@/lib/prisma"

async function main() {
  console.log("Seed complete. No seed data configured.")
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
`,
  "lib/prisma.ts": `import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getConnectionString(connectionString: string): string {
  const databaseUrl = new URL(connectionString)

  // pg currently treats require as verify-full. Set that strict mode explicitly
  // so the behavior remains stable when pg 9 changes the require semantics.
  if (databaseUrl.searchParams.get("sslmode") === "require") {
    databaseUrl.searchParams.set("sslmode", "verify-full")
  }

  return databaseUrl.toString()
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Let Prisma own a pool from its bundled pg copy. Passing a Pool created by
  // another pg copy makes the adapter treat the Pool instance as configuration.
  const adapter = new PrismaPg({
    connectionString: getConnectionString(connectionString),
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
`,
  "prisma.config.ts": `// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
`,
  "features/users/server/user-roles.ts": `import type { Prisma } from "@/generated/prisma/client"

/** PostgreSQL stores roles as a native text[] column. */
export type UserRolesColumn = string[]

export function serializeRoles(roles: string[]): UserRolesColumn {
  return roles
}

export function parseRoles(roles: UserRolesColumn): string[] {
  return roles
}

export function rolesFilter(role: string): Prisma.UserWhereInput {
  return { roles: { has: role } }
}
`,
  "app/(protected)/page.tsx": `export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your admin dashboard.
      </p>
    </div>
  )
}
`,
}

type Replacement = { from: string; to: string }

/** Targeted edits for files that only differ by a line or two between SQLite and Neon. */
const FILE_REPLACEMENTS: Record<string, Replacement[]> = {
  "features/auth/server/auth.ts": [
    { from: 'provider: "sqlite"', to: 'provider: "postgresql"' },
  ],
  "config/env.ts": [
    {
      from: "DATABASE_URL: z.string().min(1).optional(),",
      to: "DATABASE_URL: z.string().min(1),",
    },
  ],
  "features/users/search-users.ts": [
    {
      from: "{ startsWith: start }",
      to: '{ startsWith: start, mode: "insensitive" }',
    },
  ],
  ".env.example": [
    {
      from: `# Database: local SQLite (prisma/dev.db), DATABASE_URL is unused until
# \`bun run strip-to-starter --apply\` switches back to Neon PostgreSQL.
# Neon: use the pooled URL for normal application requests.
# DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=verify-full"`,
      to: `# Neon / Prisma
# Use Neon's pooled URL for normal application requests.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=verify-full"`,
    },
  ],
}

const PACKAGE_DEPS_TO_REMOVE = [
  "react-markdown",
  "remark-gfm",
  "shiki",
  "@prisma/adapter-better-sqlite3",
] as const

const PACKAGE_DEPS_TO_ADD: Record<string, string> = {
  "@prisma/adapter-pg": "^7.10.1",
}

const PACKAGE_DEV_DEPS_TO_ADD: Record<string, string> = {
  "@types/pg": "^8.23.1",
}

const PACKAGE_SCRIPTS_TO_SET: Record<string, string> = {
  "db:seed": "bun prisma/seed.ts",
}

function rel(filePath: string): string {
  return path.relative(ROOT, filePath)
}

async function deletePath(targetPath: string): Promise<void> {
  const absolutePath = path.join(ROOT, targetPath)
  if (!existsSync(absolutePath)) {
    console.log(`  skip missing: ${targetPath}`)
    return
  }

  await rm(absolutePath, { recursive: true, force: true })
  console.log(`  deleted: ${targetPath}`)
}

async function collectEmptyDirectories(targetDir: string): Promise<string[]> {
  const absoluteDir = path.join(ROOT, targetDir)
  if (!existsSync(absoluteDir)) {
    return []
  }

  const emptyDirs: string[] = []

  async function walk(dir: string): Promise<void> {
    const items = await readdir(dir, { withFileTypes: true })

    for (const item of items) {
      if (!item.isDirectory()) {
        continue
      }

      const fullPath = path.join(dir, item.name)
      await walk(fullPath)

      const children = await readdir(fullPath)
      if (children.length === 0) {
        emptyDirs.push(rel(fullPath))
      }
    }
  }

  await walk(absoluteDir)

  const rootChildren = await readdir(absoluteDir)
  if (rootChildren.length === 0) {
    emptyDirs.push(targetDir)
  }

  return emptyDirs.sort()
}

async function pruneEmptyDirectories(targetDirs: readonly string[]): Promise<void> {
  for (const targetDir of targetDirs) {
    const emptyDirs = await collectEmptyDirectories(targetDir)

    for (const emptyDir of emptyDirs.sort(
      (left, right) => right.split(path.sep).length - left.split(path.sep).length
    )) {
      const absolutePath = path.join(ROOT, emptyDir)
      if (!existsSync(absolutePath)) {
        continue
      }

      const children = await readdir(absolutePath)
      if (children.length === 0) {
        await rm(absolutePath, { recursive: true, force: true })
        console.log(`  pruned empty: ${emptyDir}`)
      }
    }
  }
}

async function patchFile(relativePath: string, content: string): Promise<void> {
  const absolutePath = path.join(ROOT, relativePath)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, content, "utf8")
  console.log(`  wrote: ${relativePath}`)
}

async function patchGlobalsCss(): Promise<void> {
  const relativePath = "app/globals.css"
  const absolutePath = path.join(ROOT, relativePath)
  const current = await readFile(absolutePath, "utf8")
  const next = current.replace('@import "./typeset.css";\n\n', "")

  if (current === next) {
    console.log(`  skip unchanged: ${relativePath}`)
    return
  }

  await writeFile(absolutePath, next, "utf8")
  console.log(`  patched: ${relativePath}`)
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

function removeEntries(
  record: Record<string, string> | undefined,
  keys: readonly string[],
  label: string
): boolean {
  let changed = false

  for (const key of keys) {
    if (record?.[key]) {
      delete record[key]
      changed = true
      console.log(`  removed ${label}: ${key}`)
    }
  }

  return changed
}

function setEntries(
  record: Record<string, string> | undefined,
  entries: Record<string, string>,
  label: string
): { record: Record<string, string>; changed: boolean } {
  const next = { ...record }
  let changed = false

  for (const [key, value] of Object.entries(entries)) {
    if (next[key] !== value) {
      next[key] = value
      changed = true
      console.log(`  set ${label}: ${key}=${value}`)
    }
  }

  return { record: next, changed }
}

async function patchPackageJson(): Promise<void> {
  const relativePath = "package.json"
  const absolutePath = path.join(ROOT, relativePath)
  const packageJson = JSON.parse(await readFile(absolutePath, "utf8")) as PackageJson

  const dependencies = setEntries(
    packageJson.dependencies,
    PACKAGE_DEPS_TO_ADD,
    "dependency"
  )
  const devDependencies = setEntries(
    packageJson.devDependencies,
    PACKAGE_DEV_DEPS_TO_ADD,
    "devDependency"
  )
  const scripts = setEntries(packageJson.scripts, PACKAGE_SCRIPTS_TO_SET, "script")

  packageJson.dependencies = dependencies.record
  packageJson.devDependencies = devDependencies.record
  packageJson.scripts = scripts.record

  const removed = [
    removeEntries(packageJson.dependencies, PACKAGE_DEPS_TO_REMOVE, "dependency"),
    removeEntries(packageJson.scripts, ["strip-to-starter"], "script"),
  ]
  const changed =
    dependencies.changed ||
    devDependencies.changed ||
    scripts.changed ||
    removed.some(Boolean)

  if (!changed) {
    console.log(`  skip unchanged: ${relativePath}`)
    return
  }

  packageJson.dependencies = sortKeys(packageJson.dependencies)
  packageJson.devDependencies = sortKeys(packageJson.devDependencies)

  await writeFile(absolutePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8")
  console.log(`  patched: ${relativePath}`)
}

function sortKeys(record?: Record<string, string>): Record<string, string> | undefined {
  if (!record) {
    return record
  }

  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right))
  )
}

/** SQLite migrations do not run on PostgreSQL, so start a fresh history. */
async function resetMigrations(): Promise<void> {
  await rm(path.join(ROOT, MIGRATIONS_DIR), { recursive: true, force: true })
  await mkdir(path.join(ROOT, MIGRATIONS_DIR), { recursive: true })
  await writeFile(
    path.join(ROOT, MIGRATIONS_DIR, "migration_lock.toml"),
    `# Prisma Migrate lockfile
provider = "postgresql"
`,
    "utf8"
  )
  console.log(`  reset: ${MIGRATIONS_DIR} (postgresql lock, no migrations)`)
}

async function readReplacementTarget(
  relativePath: string,
  replacements: Replacement[]
): Promise<string> {
  const current = await readFile(path.join(ROOT, relativePath), "utf8")

  for (const { from, to } of replacements) {
    if (!current.includes(from) && !current.includes(to)) {
      throw new Error(`${relativePath}: expected text not found:\n${from}`)
    }
  }

  return current
}

async function verifyReplacements(): Promise<void> {
  for (const [relativePath, replacements] of Object.entries(FILE_REPLACEMENTS)) {
    await readReplacementTarget(relativePath, replacements)
  }
}

async function applyReplacements(): Promise<void> {
  for (const [relativePath, replacements] of Object.entries(FILE_REPLACEMENTS)) {
    const current = await readReplacementTarget(relativePath, replacements)
    const next = replacements.reduce(
      (text, { from, to }) => (text.includes(from) ? text.replace(from, () => to) : text),
      current
    )

    if (next === current) {
      console.log(`  skip unchanged: ${relativePath}`)
      continue
    }

    await writeFile(path.join(ROOT, relativePath), next, "utf8")
    console.log(`  patched: ${relativePath}`)
  }
}

function printPlan(emptyDirs: string[]): void {
  console.log(APPLY ? "Applying strip-to-starter..." : "Dry run — strip-to-starter plan:")
  console.log("")
  console.log("Delete:")
  for (const target of PATHS_TO_DELETE) {
    console.log(`  - ${target}`)
  }
  console.log("")
  console.log("Prune empty directories under:")
  for (const target of PRUNE_ROOTS) {
    console.log(`  - ${target}/`)
  }
  if (emptyDirs.length > 0) {
    console.log("")
    console.log("Empty directories found now:")
    for (const emptyDir of emptyDirs) {
      console.log(`  - ${emptyDir}`)
    }
  }
  console.log("")
  console.log("Write / patch:")
  for (const filePath of Object.keys(FILE_PATCHES)) {
    console.log(`  - ${filePath}`)
  }
  for (const filePath of Object.keys(FILE_REPLACEMENTS)) {
    console.log(`  - ${filePath} (targeted edit)`)
  }
  console.log(`  - ${MIGRATIONS_DIR} (reset to a fresh PostgreSQL history)`)
  console.log("  - app/globals.css (remove typeset import)")
  console.log("  - package.json (docs-only deps out, SQLite adapter swapped for adapter-pg)")
  console.log("")
  console.log("Keeps:")
  console.log("  - auth, register-admin, account, security")
  console.log("  - data-table stack, R2 storage, users feature")
  console.log("  - docs/*.md (manual cleanup)")
  console.log("")

  if (!APPLY) {
    console.log("No files changed. Re-run with --apply to execute.")
    console.log("")
    console.log("After apply:")
    console.log("  bun install")
    console.log("  set DATABASE_URL to your Neon connection string in .env")
    console.log("  bun run db:generate")
    console.log("  bun run db:migrate   (name the migration \"init\")")
    console.log("  bun run typecheck")
  }
}

async function apply(): Promise<void> {
  console.log("Deleting paths...")
  for (const target of PATHS_TO_DELETE) {
    await deletePath(target)
  }

  console.log("")
  console.log("Pruning empty directories...")
  await pruneEmptyDirectories(PRUNE_ROOTS)

  console.log("")
  console.log("Writing patched files...")
  for (const [filePath, content] of Object.entries(FILE_PATCHES)) {
    await patchFile(filePath, content)
  }

  console.log("")
  console.log("Switching database to Neon PostgreSQL...")
  await applyReplacements()
  await resetMigrations()
  await patchGlobalsCss()
  await patchPackageJson()

  console.log("")
  console.log("Done. Next steps:")
  console.log("  bun install")
  console.log("  set DATABASE_URL to your Neon connection string in .env")
  console.log("  bun run db:generate")
  console.log("  bun run db:migrate   (name the migration \"init\")")
  console.log("  bun run typecheck")
}

async function main(): Promise<void> {
  const packageJsonPath = path.join(ROOT, "package.json")
  if (!existsSync(packageJsonPath)) {
    console.error("Run this script from the project root (package.json not found).")
    process.exit(1)
  }

  const emptyDirs = (
    await Promise.all(PRUNE_ROOTS.map((target) => collectEmptyDirectories(target)))
  ).flat()

  printPlan(emptyDirs)

  if (!APPLY) {
    return
  }

  await verifyReplacements()

  await apply()
}

main().catch((error: unknown) => {
  console.error("strip-to-starter failed:", error)
  process.exit(1)
})
