"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { authClient } from "@/features/auth/client/auth-client"
import BackButton from "@/components/BackButton"
import { sileo } from "sileo"
import { EmailFormField } from "@/features/auth/components/EmailFormField"
import { stringFieldProps } from "@/lib/form-utils"
import { AuthFormCard } from "@/features/auth/components/AuthFormCard"
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message"

const ForgotPasswordSchema = z.object({
  email: z.email().min(1, { message: "Email is required" }),
})
const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const [showResendLink, setShowResendLink] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const submittedEmailRef = React.useRef("")
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: ForgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await handleSubmit({ value })
    },
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const sendReset = async (email: string) => {
    setLoading(true)
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })
      if (error) {
        throw error
      }
      setCountdown(30)
      sileo.success({ title: "Password reset email sent" })
    } catch (error) {
      sileo.error({ title: getAuthErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async ({
    value,
  }: {
    value: z.infer<typeof ForgotPasswordSchema>
  }) => {
    submittedEmailRef.current = value.email
    setShowResendLink(true)
    await sendReset(value.email)
  }

  const handleResend = async () => {
    if (countdown > 0 || !submittedEmailRef.current) return
    await sendReset(submittedEmailRef.current)
  }

  if (showResendLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password Reset Email Sent</CardTitle>
          <CardDescription>
            Please check your email for a link to reset your password. If you
            don&apos;t see the email, please check your spam or junk folder. It
            may take a few minutes to arrive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleResend}
              disabled={countdown > 0 || loading}
              variant="outline"
            >
              {countdown > 0 ? `Resend Email (${countdown}s)` : "Resend Email"}
            </Button>
            <Button
              onClick={() => {
                setShowResendLink(false)
                setCountdown(0)
                submittedEmailRef.current = ""
              }}
              variant="ghost"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <AuthFormCard
      title="Forgot Password"
      description="Please enter your email and we will send you a link to reset your password."
      beforeHeader={
        <div className="mx-2">
          <BackButton variant="link" />
        </div>
      }
      onSubmit={() => form.handleSubmit()}
    >
      <form.Field name="email">
        {(field) => <EmailFormField {...stringFieldProps(field)} />}
      </form.Field>
      <Button type="submit" isLoading={loading}>
        Reset Password
      </Button>
    </AuthFormCard>
  )
}

export default ForgotPasswordPage
