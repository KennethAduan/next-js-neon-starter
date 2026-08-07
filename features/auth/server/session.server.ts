import { headers } from "next/headers"
import { auth } from "@/features/auth/server/auth"
import type { ROLES } from "@/features/users/schema/user.schema"

export interface SessionUser {
  id: string
  email: string
  emailVerified: boolean
  name?: string | null
  picture?: string | null
  firstName?: string
  lastName?: string
  phoneNumber?: string
  roles?: ROLES[] | string[]
}

export interface ServerSession {
  user: SessionUser
  expires: Date
}

export async function getServerSession(): Promise<ServerSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return null
    }

    const user = session.user as typeof session.user & {
      firstName?: string
      lastName?: string
      phoneNumber?: string
      roles?: string[]
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        picture: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        roles: user.roles ?? [],
      },
      expires: new Date(session.session.expiresAt),
    }
  } catch (error) {
    const isDynamicUsage =
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    if (isDynamicUsage) {
      throw error
    }
    console.error("Error getting session:", error)
    return null
  }
}

export async function deleteServerSession(): Promise<{
  success: boolean
  message: string
}> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
    return {
      success: true,
      message: "Session deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting session:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
