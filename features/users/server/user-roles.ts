import type { Prisma } from "@/generated/prisma/client"

/** SQLite has no scalar lists, so roles are stored as a JSON string. */
export type UserRolesColumn = string

export function serializeRoles(roles: string[]): UserRolesColumn {
  return JSON.stringify(roles)
}

export function parseRoles(roles: UserRolesColumn): string[] {
  try {
    const parsed: unknown = JSON.parse(roles)
    return Array.isArray(parsed)
      ? parsed.filter((role): role is string => typeof role === "string")
      : []
  } catch {
    return []
  }
}

export function rolesFilter(role: string): Prisma.UserWhereInput {
  return { roles: { contains: JSON.stringify(role) } }
}
