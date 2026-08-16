import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"
import { env } from "@/config/env"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[auth] password reset for ${user.email}: ${url}`)
      }
      // Wire Elastic Email (or another provider) here when mail env is set.
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      phoneNumber: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      roles: {
        type: "string[]",
        required: false,
        defaultValue: [],
        input: false,
      },
      searchFirstName: {
        type: "string",
        required: false,
        defaultValue: "",
        input: false,
      },
      searchLastName: {
        type: "string",
        required: false,
        defaultValue: "",
        input: false,
      },
      searchFullName: {
        type: "string",
        required: false,
        defaultValue: "",
        input: false,
      },
      searchEmail: {
        type: "string",
        required: false,
        defaultValue: "",
        input: false,
      },
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL, env.APP_URL],
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
