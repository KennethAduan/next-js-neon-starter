"use server"

import { authActionClient } from "@/lib/safe.action"
import type { UserWithoutPassword } from "@/features/users/schema/user.schema"
import { mergeById } from "@/lib/search/merge-by-id"
import { prefixBounds } from "@/lib/search/prefix-bounds"
import { throwSearchActionError } from "@/lib/search/throw-search-action-error"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@/generated/prisma/client"
import { extractObjectKey } from "@/lib/storage/object-path"
import { resolveObjectReadUrl } from "@/lib/storage/r2.server"

const SearchUsersInputSchema = z.object({
  term: z.string().trim().min(1, { message: "Search term is required" }),
  role: z.string().trim().min(1).optional(),
  limit: z.number().int().positive().max(50).default(25),
})

export type SearchUsersInput = z.infer<typeof SearchUsersInputSchema>

async function mapUser(user: {
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
  keywords: string[]
  createdAt: Date
  updatedAt: Date
}): Promise<UserWithoutPassword> {
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
    keywords: user.keywords,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

async function queryUsersByPrefixField(
  field:
    | "searchFullName"
    | "searchEmail"
    | "searchFirstName"
    | "searchLastName",
  start: string,
  limit: number,
  role?: string
) {
  const where: Prisma.UserWhereInput = {
    [field]: { startsWith: start, mode: "insensitive" },
    ...(role ? { roles: { has: role } } : {}),
  }

  const users = await prisma.user.findMany({
    where,
    take: limit,
    orderBy: { [field]: "asc" },
  })

  return Promise.all(users.map(mapUser))
}

/**
 * Prefix-search users across name/email fields, merge by id.
 */
export async function searchUsers(
  input: SearchUsersInput
): Promise<UserWithoutPassword[]> {
  const { term, role, limit } = SearchUsersInputSchema.parse(input)
  const { start } = prefixBounds(term)

  const fields = [
    "searchFullName",
    "searchEmail",
    "searchFirstName",
    "searchLastName",
  ] as const

  const batches = await Promise.all(
    fields.map((field) => queryUsersByPrefixField(field, start, limit, role))
  )

  return mergeById(batches, limit)
}

export const searchUsersAction = authActionClient
  .metadata({ actionName: "searchUsers" })
  .inputSchema(SearchUsersInputSchema)
  .action(async ({ parsedInput }) => {
    try {
      const users = await searchUsers(parsedInput)
      return { success: true as const, users }
    } catch (error) {
      throwSearchActionError(error, "Failed to search users")
    }
  })
