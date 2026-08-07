"use server"

import { authActionClient } from "@/lib/safe.action"
import { type Client } from "@/features/clients/schema/clients.schema"
import { mergeById } from "@/lib/search/merge-by-id"
import { prefixBounds } from "@/lib/search/prefix-bounds"
import { throwSearchActionError } from "@/lib/search/throw-search-action-error"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@/generated/prisma/client"

const SEARCH_FIELDS = ["searchFullName", "searchEmail", "searchPhone"] as const

const SearchClientsInputSchema = z.object({
  term: z.string().trim().min(1, { message: "Search term is required" }),
  status: z.enum(["active", "inactive", "blacklisted"]).optional(),
  limit: z.number().int().positive().max(50).default(25),
})

export type SearchClientsInput = z.infer<typeof SearchClientsInputSchema>

function mapClient(client: {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  address: string | null
  nationality: string | null
  totalInvested: number
  totalActiveInvestments: number
  status: "active" | "inactive" | "blacklisted"
  searchFullName: string
  searchEmail: string | null
  searchPhone: string | null
  keywords: string[]
  notes: string | null
  createdAt: Date
  updatedAt: Date
}): Client {
  return {
    id: client.id,
    fullName: client.fullName,
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
    address: client.address ?? undefined,
    nationality: client.nationality ?? undefined,
    totalInvested: client.totalInvested,
    totalActiveInvestments: client.totalActiveInvestments,
    status: client.status,
    searchFullName: client.searchFullName,
    searchEmail: client.searchEmail ?? undefined,
    searchPhone: client.searchPhone ?? undefined,
    keywords: client.keywords,
    notes: client.notes ?? undefined,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  }
}

async function queryClientsByPrefixField(
  field: (typeof SEARCH_FIELDS)[number],
  start: string,
  limit: number,
  status?: SearchClientsInput["status"]
) {
  const where: Prisma.ClientWhereInput = {
    [field]: { startsWith: start, mode: "insensitive" },
    ...(status ? { status } : {}),
  }

  const clients = await prisma.client.findMany({
    where,
    take: limit,
    orderBy: { [field]: "asc" },
  })

  return clients.map(mapClient)
}

/**
 * Prefix-search clients across name/email/phone, merge by id.
 */
export async function searchClients(
  input: SearchClientsInput
): Promise<Client[]> {
  const { term, status, limit } = SearchClientsInputSchema.parse(input)
  const digitsOnly = term.replace(/\D/g, "")
  const { start } = prefixBounds(term)
  const phoneBounds = digitsOnly ? prefixBounds(digitsOnly) : null

  const batches = await Promise.all(
    SEARCH_FIELDS.map((field) => {
      if (field === "searchPhone") {
        if (!phoneBounds) return Promise.resolve([] as Client[])
        return queryClientsByPrefixField(
          field,
          phoneBounds.start,
          limit,
          status
        )
      }
      return queryClientsByPrefixField(field, start, limit, status)
    })
  )

  return mergeById(batches, limit)
}

export const searchClientsAction = authActionClient
  .metadata({ actionName: "searchClients" })
  .inputSchema(SearchClientsInputSchema)
  .action(async ({ parsedInput }) => {
    try {
      const clients = await searchClients(parsedInput)
      return { success: true as const, clients }
    } catch (error) {
      throwSearchActionError(error, "Failed to search clients")
    }
  })
