import type { UserWithoutPassword } from "@/features/users/schema/user.schema"
import { extractObjectKey } from "@/lib/storage/object-path"
import { resolveObjectReadUrl } from "@/lib/storage/r2.server"

export type UserRecordForMap = {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  image: string | null
  roles: string[]
  searchFirstName: string
  searchLastName: string
  searchFullName: string
  searchEmail: string
  createdAt: Date
  updatedAt: Date
}

export async function mapUserToClient(
  user: UserRecordForMap
): Promise<UserWithoutPassword> {
  const key = extractObjectKey(user.image)
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    photoURL: key ? await resolveObjectReadUrl(key) : null,
    roles: user.roles,
    searchFirstName: user.searchFirstName,
    searchLastName: user.searchLastName,
    searchFullName: user.searchFullName,
    searchEmail: user.searchEmail,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
