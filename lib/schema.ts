import { ROLES as UserROLES, UserSchema, type User, type UserWithoutPassword } from "@/features/users/schema/user.schema"
import { RoleSchema, type Role } from "@/features/users/schema/role.schema"

export const COLLECTIONS = {
  USERS: "users",
} as const

export type { User, UserWithoutPassword, Role }
export type ROLES = typeof UserROLES
export { UserROLES as ROLES_ENUM }
export { UserSchema, RoleSchema }
