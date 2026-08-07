import { z } from "zod"

export enum ROLES {
  SUPER_ADMIN = "super_admin",
}

/** Server-generated only — never accept from client forms. */
export const UserSearchFieldsSchema = z.object({
  searchFirstName: z.string(),
  searchLastName: z.string(),
  searchFullName: z.string(),
  searchEmail: z.string(),
  keywords: z.array(z.string()).default([]),
})

export const UserSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.email({ message: "Invalid email address" }),
  roles: z
    .array(
      z.string().trim().min(1, {
        message: "Invalid role",
      })
    )
    .min(1, {
      message: "At least one role is required",
    }),
  phoneNumber: z.string(),
  photoURL: z.string().optional().nullable().default(null),
  ...UserSearchFieldsSchema.shape,
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
})

/** Omit server-only search fields from create/register form input. */
export const UserClientWritableOmit = {
  searchFirstName: true,
  searchLastName: true,
  searchFullName: true,
  searchEmail: true,
  keywords: true,
} as const

/** Editable profile fields on the account page (no email, roles, or password). */
export const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phoneNumber: z.string(),
  photoURL: z.union([z.url({ message: "Invalid photo URL" }), z.null()]),
})

export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>
export type UserSearchFields = z.infer<typeof UserSearchFieldsSchema>
export type User = z.infer<typeof UserSchema>
export type UserWithoutPassword = User

export const UserChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmNewPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export type UserChangePassword = z.infer<typeof UserChangePasswordSchema>
