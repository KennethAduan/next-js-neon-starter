"use server"

import { ActionError, authActionClient } from "@/lib/safe.action"
import {
  UserChangePasswordSchema,
  UserProfileUpdateSchema,
  type UserWithoutPassword,
} from "@/features/users/schema/user.schema"
import { prisma } from "@/lib/prisma"
import { createUserSearchFields } from "@/lib/search/create-user-search-fields"
import { auth } from "@/features/auth/server/auth"
import { headers } from "next/headers"
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message"

const ACTION_NAME = {
  GET_ACCOUNT_PROFILE: "getAccountProfile",
  UPDATE_ACCOUNT_PROFILE: "updateAccountProfile",
  CHANGE_PASSWORD: "changePassword",
} as const

function mapUser(user: {
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
}): UserWithoutPassword {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    photoURL: user.image,
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

export const getAccountProfileAction = authActionClient
  .metadata({ actionName: ACTION_NAME.GET_ACCOUNT_PROFILE })
  .action(async ({ ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }
    const uid = ctx.session.user.id
    const user = await prisma.user.findUnique({ where: { id: uid } })

    if (!user) {
      return { success: false as const, message: "User not found" }
    }

    return { success: true as const, user: mapUser(user) }
  })

async function persistAccountProfileUpdate(
  uid: string,
  parsedInput: {
    firstName: string
    lastName: string
    phoneNumber: string
    photoURL: string | null
  }
) {
  const { firstName, lastName, phoneNumber, photoURL } = parsedInput
  const existing = await prisma.user.findUnique({ where: { id: uid } })
  if (!existing) {
    return { success: false as const, message: "User not found" }
  }

  const search = createUserSearchFields({
    firstName,
    lastName,
    email: existing.email,
    roles: existing.roles,
  })

  const updated = await prisma.user.update({
    where: { id: uid },
    data: {
      firstName,
      lastName,
      phoneNumber,
      image: photoURL,
      name: `${firstName} ${lastName}`.trim(),
      ...search,
    },
  })

  return {
    success: true as const,
    user: mapUser(updated),
    message: "Profile updated",
  }
}

export const updateAccountProfileAction = authActionClient
  .metadata({ actionName: ACTION_NAME.UPDATE_ACCOUNT_PROFILE })
  .inputSchema(UserProfileUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }
    return persistAccountProfileUpdate(ctx.session.user.id, parsedInput)
  })

export const changePasswordAction = authActionClient
  .metadata({ actionName: ACTION_NAME.CHANGE_PASSWORD })
  .inputSchema(UserChangePasswordSchema)
  .action(async ({ parsedInput }) => {
    try {
      await auth.api.changePassword({
        body: {
          currentPassword: parsedInput.currentPassword,
          newPassword: parsedInput.newPassword,
          revokeOtherSessions: true,
        },
        headers: await headers(),
      })

      await auth.api.signOut({
        headers: await headers(),
      })

      return {
        success: true as const,
        message: "Password updated. Please log in with your new password.",
      }
    } catch (error) {
      return {
        success: false as const,
        message: getAuthErrorMessage(error),
      }
    }
  })
