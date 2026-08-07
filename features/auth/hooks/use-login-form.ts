"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "nextjs-toploader/app"
import { useSetAtom } from "jotai"
import { z } from "zod"
import { sileo } from "sileo"
import { UserWithoutPassword } from "@/features/users/schema/user.schema"
import { ROUTES } from "@/constants"
import { onActionError } from "@/lib/action-utils"
import { LoginAction } from "@/features/auth/actions/login.action"
import { userAuthAtom } from "@/features/auth/atom/User.auth.atom"
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message"

const LoginSchema = z.object({
  email: z.email().min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
})

export function useLoginForm() {
  const router = useRouter()
  const setUserAuth = useSetAtom(userAuthAtom)
  const [isLoading, setIsLoading] = useState(false)

  const { executeAsync: loginAction, isExecuting } = useAction(LoginAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        sileo.success({ title: data.message })
        setUserAuth(data?.user as UserWithoutPassword)
        form.reset()
        router.replace(ROUTES.HOME)
      } else {
        sileo.error({ title: data?.message ?? "Login failed" })
      }
    },
    onError: onActionError,
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true)
        await loginAction({
          email: value.email,
          password: value.password,
        })
      } catch (error) {
        sileo.error({ title: getAuthErrorMessage(error) })
      } finally {
        setIsLoading(false)
      }
    },
  })

  const loading = isExecuting || form.state.isSubmitting || isLoading

  return { form, loading }
}
