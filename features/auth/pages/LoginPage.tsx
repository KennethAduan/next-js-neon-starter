"use client"

import React from "react"
import Link from "next/link"
import { PasswordFormField } from "@/components/forms/PasswordFormField"
import { Button } from "@/components/ui/button"
import { EmailFormField } from "@/features/auth/components/EmailFormField"
import { stringFieldProps } from "@/lib/form-utils"
import { ROUTES } from "@/constants"
import { AuthFormCard } from "@/features/auth/components/AuthFormCard"
import { useExpiredSessionHandler } from "@/features/auth/hooks/use-expired-session-handler"
import { useLoginForm } from "@/features/auth/hooks/use-login-form"

const LoginPage = () => {
  useExpiredSessionHandler()
  const { form, loading } = useLoginForm()

  return (
    <AuthFormCard
      title="Welcome back"
      description="Sign in to Firebase Starter to continue"
      headerClassName="text-center"
      onSubmit={() => form.handleSubmit()}
    >
      <form.Field name="email">
        {(field) => <EmailFormField {...stringFieldProps(field)} />}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <PasswordFormField
            label="Password"
            placeholder="********"
            {...stringFieldProps(field)}
          />
        )}
      </form.Field>
      <Link
        className="text-right text-sm text-muted-foreground"
        href={ROUTES.FORGOT_PASSWORD}
      >
        Forgot password?
      </Link>
      <Button type="submit" isLoading={loading}>
        Login
      </Button>
    </AuthFormCard>
  )
}

export default LoginPage
