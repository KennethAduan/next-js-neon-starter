"use client"

import React from "react"
import { useForm } from "@tanstack/react-form"
import { useAction } from "next-safe-action/hooks"
import { useAtomValue, useSetAtom } from "jotai"
import { useRouter } from "nextjs-toploader/app"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PasswordFormField } from "@/components/forms/PasswordFormField"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/app.routes"
import { userAuthAtom } from "@/features/auth/atom/User.auth.atom"
import { changePasswordAction } from "@/features/auth/actions/account.action"
import {
  UserChangePasswordSchema,
  type UserChangePassword,
} from "@/features/users/schema/user.schema"
import { sileo } from "sileo"

const SecurityPage = () => {
  const router = useRouter()
  const user = useAtomValue(userAuthAtom)
  const setUserAuth = useSetAtom(userAuthAtom)

  const { executeAsync: changePassword, isExecuting } = useAction(
    changePasswordAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          setUserAuth(null)
          form.reset()
          sileo.success({ title: data.message })
          router.replace(ROUTES.LOGIN)
        } else {
          sileo.error({ title: data?.message ?? "Could not update password" })
        }
      },
      onError: ({ error }) => {
        sileo.error({
          title: error.serverError ?? "Could not update password",
        })
      },
    }
  )

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    } satisfies UserChangePassword,
    validators: {
      onSubmit: UserChangePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!user?.email) {
        sileo.error({ title: "Your session has expired. Please log in again." })
        setUserAuth(null)
        router.replace(ROUTES.LOGIN)
        return
      }

      await changePassword(value)
    },
  })

  const loading = form.state.isSubmitting || isExecuting

  return (
    <div className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password. After the update, your current session will be
            revoked and you will need to log in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={() => form.handleSubmit()}
            className="flex flex-col gap-6"
          >
            <form.Field name="currentPassword">
              {(field) => (
                <PasswordFormField
                  label="Current password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  isInvalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  errors={field.state.meta.errors}
                  placeholder="Enter your current password"
                />
              )}
            </form.Field>

            <form.Field name="newPassword">
              {(field) => (
                <PasswordFormField
                  label="New password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  isInvalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  errors={field.state.meta.errors}
                  placeholder="Enter your new password"
                />
              )}
            </form.Field>

            <form.Field name="confirmNewPassword">
              {(field) => (
                <PasswordFormField
                  label="Confirm new password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  isInvalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  errors={field.state.meta.errors}
                  placeholder="Confirm your new password"
                />
              )}
            </form.Field>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityPage
