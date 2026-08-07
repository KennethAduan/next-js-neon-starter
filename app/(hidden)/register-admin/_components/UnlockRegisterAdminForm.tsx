"use client"
import React, { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAction } from "next-safe-action/hooks"
import { UnlockRegisterAdminAction } from "../_actions/RegisterAdmin.action"
import RegisterAdminForm from "./RegisterAdminForm"
import { sileo } from "sileo"
import { onActionError } from "@/lib/action-utils"
import PasswordInput from "@/components/PasswordInput"

const UnlockRegisterAdminForm = () => {
  const [unlockedPasscode, setUnlockedPasscode] = useState<string | null>(
    null
  )
  const form = useForm({
    defaultValues: {
      passcode: "",
    },
    validators: {
      onSubmit: z.object({
        passcode: z.string().min(1),
      }),
    },
    onSubmit: async ({ value }) => {
      await executeAsync({
        passcode: value.passcode,
      })
    },
  })

  const { executeAsync, isExecuting, isTransitioning, isPending } = useAction(
    UnlockRegisterAdminAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          sileo.success({ title: data.message })
          setUnlockedPasscode(form.getFieldValue("passcode"))
        } else {
          sileo.error({ title: data.message })
        }
      },
      onError: onActionError,
    }
  )
  const loading = isExecuting || isTransitioning || isPending
  return (
    <>
      {unlockedPasscode ? (
        <RegisterAdminForm passcode={unlockedPasscode} />
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Unlock Register Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={() => form.handleSubmit()}>
              <Field>
                <form.Field name="passcode">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Passcode</FieldLabel>
                        <FieldContent>
                          <PasswordInput
                            id={field.name}
                            name={field.name}
                            placeholder="********"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </FieldContent>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )
                  }}
                </form.Field>
                <Button type="submit" isLoading={loading}>
                  Unlock
                </Button>
              </Field>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default UnlockRegisterAdminForm
