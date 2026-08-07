"use client"

import { useForm } from "@tanstack/react-form"
import {
  ROLES,
  UserClientWritableOmit,
  UserSchema,
} from "@/features/users/schema/user.schema"
import { z } from "zod"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PasswordInput from "@/components/PasswordInput"
import { RegsiterAdminAction } from "../_actions/RegisterAdmin.action"
import { useAction } from "next-safe-action/hooks"
import { useQueryState, parseAsString } from "nuqs"
import { sileo } from "sileo"
import { onActionError } from "@/lib/action-utils"

const AdminRegisterSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  phoneNumber: true,
  photoURL: true,
  ...UserClientWritableOmit,
})
  .extend({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long",
    }),
    confirmPassword: z.string().min(8, {
      message: "Confirm password must be at least 8 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

function AdminTextField({
  label,
  name,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
  placeholder?: string
}) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}

const RegisterAdminForm = ({ passcode }: { passcode: string }) => {
  const [role] = useQueryState(
    "roles",
    parseAsString.withDefault(ROLES.SUPER_ADMIN)
  )
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: [role ?? ROLES.SUPER_ADMIN] as string[],
    },
    validators: {
      onSubmit: AdminRegisterSchema,
    },
    onSubmit: async ({ value }) => {
      await executeAsync({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
        roles: value.roles as string[],
        passcode,
      })
    },
  })
  const { executeAsync, isExecuting, isTransitioning, isPending } = useAction(
    RegsiterAdminAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          sileo.success({ title: data.message })
        } else {
          sileo.error({ title: data.message })
        }
      },
      onError: onActionError,
      onSettled: () => {
        form.reset()
      },
    }
  )
  const loading = isExecuting || isTransitioning || isPending

  return (
    <Card>
      <CardContent>
        <form action={() => form.handleSubmit()}>
          <FieldGroup>
            <Field orientation="horizontal">
              <form.Field name="firstName">
                {(field) => (
                  <AdminTextField
                    label="First Name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    errors={field.state.meta.errors}
                    placeholder="John"
                  />
                )}
              </form.Field>
              <form.Field name="lastName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                      <InputGroup>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Doe"
                          aria-invalid={isInvalid}
                        />
                      </InputGroup>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </Field>
            <form.Field name="email">
              {(field) => (
                <AdminTextField
                  label="Email"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  isInvalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  errors={field.state.meta.errors}
                  placeholder="john@example.com"
                />
              )}
            </form.Field>
            {/* Password */}
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <PasswordInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="********"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            {/* Confirm Password */}
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
                    <PasswordInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="********"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            <Button type="submit" isLoading={loading} className="w-full">
              Register Admin
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterAdminForm
