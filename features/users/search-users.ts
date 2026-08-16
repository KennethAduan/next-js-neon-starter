"use server"

import { authActionClient } from "@/lib/safe.action"
import type { UserWithoutPassword } from "@/features/users/schema/user.schema"
import { mapUserToClient } from "@/features/users/server/map-user"
import { mergeById } from "@/lib/search/merge-by-id"
import { prefixBounds } from "@/lib/search/prefix-bounds"
import { throwSearchActionError } from "@/lib/search/throw-search-action-error"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@/generated/prisma/client"

const SearchUsersInputSchema = z.object({
  term: z.string().trim().min(1, { message: "Search term is required" }),
  role: z.string().trim().min(1).optional(),
  limit: z.number().int().positive().max(50).default(25),
})

export type SearchUsersInput = z.infer<typeof SearchUsersInputSchema>

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

  return Promise.all(users.map(mapUserToClient))
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
