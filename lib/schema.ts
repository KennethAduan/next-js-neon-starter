import { ROLES as UserROLES, UserSchema, type User, type UserWithoutPassword } from "@/features/users/schema/user.schema"
import { RoleSchema, type Role } from "@/features/users/schema/role.schema"
import { ClientSchema, type Client } from "@/features/clients/schema/clients.schema"

export const COLLECTIONS = {
  USERS: "users",
  CLIENTS: "clients",
} as const

export type { User, UserWithoutPassword, Role, Client }
export type ROLES = typeof UserROLES
export { UserROLES as ROLES_ENUM }
export { UserSchema, RoleSchema, ClientSchema }
