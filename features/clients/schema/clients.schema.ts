import { z } from "zod"

/** Server-generated only — never accept from client forms. */
export const ClientSearchFieldsSchema = z.object({
  searchFullName: z.string(),
  searchEmail: z.string().optional(),
  searchPhone: z.string().optional(),
  keywords: z.array(z.string()).default([]),
})

export const ClientSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(2, "Name is required"),
  email: z.email().optional(),
  phone: z.string().min(7).optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  totalInvested: z.number().nonnegative().default(0),
  totalActiveInvestments: z.number().int().nonnegative().default(0),
  status: z.enum(["active", "inactive", "blacklisted"]).default("active"),
  ...ClientSearchFieldsSchema.shape,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  notes: z.string().optional(),
})

export const ClientClientWritableOmit = {
  searchFullName: true,
  searchEmail: true,
  searchPhone: true,
  keywords: true,
} as const

export type ClientSearchFields = z.infer<typeof ClientSearchFieldsSchema>
export type Client = z.infer<typeof ClientSchema>
