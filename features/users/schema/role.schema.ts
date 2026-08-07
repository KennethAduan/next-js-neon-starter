import { z } from "zod"

export const RoleSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  createdAt: z.string().min(1, { message: "Created at is required" }),
  updatedAt: z.string().min(1, { message: "Updated at is required" }),
})

export type Role = z.infer<typeof RoleSchema>
export type CreateRole = Omit<Role, "id" | "createdAt" | "updatedAt">
export type UpdateRole = Omit<Role, "createdAt" | "updatedAt">
