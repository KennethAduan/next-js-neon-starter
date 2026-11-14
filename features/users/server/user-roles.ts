import type { Prisma } from "@/generated/prisma/client"

/** SQLite stores roles as a JSON-encoded string. */
export type UserRolesColumn = string

export function serializeRoles(roles: string[]): UserRolesColumn {
  return JSON.stringify(roles)
}

export function parseRoles(roles: UserRolesColumn): string[] {
  try {
    const parsed: unknown = JSON.parse(roles)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((role): role is string => typeof role === "string")
  } catch {
    return []
  }
}

export function rolesFilter(role: string): Prisma.UserWhereInput {
  return { roles: { contains: `"${role}"` } }
}
