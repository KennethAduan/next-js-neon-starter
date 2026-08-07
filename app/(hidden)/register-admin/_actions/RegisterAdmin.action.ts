"use server"

import { actionClient } from "@/lib/safe.action"
import { prisma } from "@/lib/prisma"
import { isNull } from "@/lib/utils"
import { z } from "zod"
import { env } from "@/config/env"
import {
  UserClientWritableOmit,
  UserSchema,
  type UserWithoutPassword,
} from "@/features/users/schema/user.schema"
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message"
import { createUserSearchFields } from "@/lib/search/create-user-search-fields"
import { auth } from "@/features/auth/server/auth"
import { headers } from "next/headers"
import { extractObjectKey } from "@/lib/storage/object-path"
import { resolveObjectReadUrl } from "@/lib/storage/r2.server"

export const RegsiterAdminAction = actionClient
  .metadata({ actionName: "registerAdmin" })
  .inputSchema(
    UserSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      photoURL: true,
      phoneNumber: true,
      ...UserClientWritableOmit,
    })
      .extend({
        passcode: z.string().min(1),
        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters long" }),
      })
  )
  .action(async ({ parsedInput }) => {
    try {
      const { firstName, lastName, email, password, roles, passcode } =
        parsedInput
      if (passcode !== env.UNLOCK_PASSCODE) {
        return {
          success: false,
          message: "Invalid passcode",
        }
      }

      const search = createUserSearchFields({
        firstName,
        lastName,
        email,
        roles,
      })

      const signedUp = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
        },
        headers: await headers(),
      })

      if (isNull(signedUp?.user)) {
        return {
          success: false,
          message: "Failed to create admin authentication",
        }
      }

      const admin = await prisma.user.update({
        where: { id: signedUp.user.id },
        data: {
          firstName,
          lastName,
          phoneNumber: "",
          roles,
          emailVerified: true,
          ...search,
        },
      })

      const adminUser: UserWithoutPassword = {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        roles: admin.roles,
        phoneNumber: admin.phoneNumber,
        photoURL: extractObjectKey(admin.image)
          ? await resolveObjectReadUrl(extractObjectKey(admin.image)!)
          : null,
        searchFirstName: admin.searchFirstName,
        searchLastName: admin.searchLastName,
        searchFullName: admin.searchFullName,
        searchEmail: admin.searchEmail,
        keywords: admin.keywords,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString(),
      }

      return {
        success: true,
        admin: adminUser,
        message: "Admin registered successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error),
      }
    }
  })

export const UnlockRegisterAdminAction = actionClient
  .metadata({ actionName: "unlockRegisterAdmin" })
  .inputSchema(
    z.object({
      passcode: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const { passcode } = parsedInput
      if (passcode !== env.UNLOCK_PASSCODE) {
        return {
          success: false,
          message: "Invalid passcode",
        }
      }
      return {
        success: true,
        message: "Register admin form unlocked",
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  })
