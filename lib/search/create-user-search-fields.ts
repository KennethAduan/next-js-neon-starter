import type { UserSearchFields } from "@/features/users/schema/user.schema"

export type UserSearchInput = {
  firstName: string
  lastName: string
  email: string
}

export function createUserSearchFields(data: UserSearchInput): UserSearchFields {
  const first = data.firstName.trim().toLowerCase()
  const last = data.lastName.trim().toLowerCase()
  const email = data.email.trim().toLowerCase()
  const fullName = `${first} ${last}`.trim()

  return {
    searchFirstName: first,
    searchLastName: last,
    searchFullName: fullName,
    searchEmail: email,
  }
}
