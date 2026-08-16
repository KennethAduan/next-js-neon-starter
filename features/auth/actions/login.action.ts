"use server"

import { actionClient, authActionClient } from "@/lib/safe.action"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/features/auth/server/auth"
import { deleteServerSession } from "@/features/auth/server/session.server"
import { prisma } from "@/lib/prisma"
import { mapUserToClient } from "@/features/users/server/map-user"
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message"

export const LoginAction = actionClient
  .metadata({ actionName: "login" })
  .inputSchema(
    z.object({
      email: z.email(),
      password: z.string().min(8),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const { email, password } = parsedInput
      const result = await auth.api.signInEmail({
        body: { email, password },
        headers: await headers(),
      })

      if (!result?.user) {
        return { success: false, message: "Invalid email or password" }
      }

      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
      })

      if (!user) {
        return { success: false, message: "User not found" }
      }

      return {
        success: true,
        message: "Login successful",
        user: await mapUserToClient(user),
      }
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error),
      }
    }
  })

function createDeleteSessionAction(actionName: string) {
  return authActionClient.metadata({ actionName }).action(async () => {
    try {
      const sessionCookie = await deleteServerSession()
      return {
        success: sessionCookie.success,
        message: sessionCookie.message,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  })
}

export const LogoutAction = createDeleteSessionAction("logout")

export const ClearCurrentSessionAction =
  createDeleteSessionAction("clearCurrentSession")
