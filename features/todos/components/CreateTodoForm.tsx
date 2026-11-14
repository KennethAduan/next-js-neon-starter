"use client"

import { useForm } from "@tanstack/react-form"
import { useAction } from "next-safe-action/hooks"
import { sileo } from "sileo"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FieldError } from "@/components/ui/field"
import { onActionError } from "@/lib/action-utils"
import { CreateTodoSchema } from "@/features/todos/schema/todo.schema"
import { createTodoAction } from "@/features/todos/actions/todo.action"

export function CreateTodoForm() {
  const { executeAsync, isExecuting } = useAction(createTodoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        sileo.success({ title: "Todo added" })
        form.reset()
      }
    },
    onError: onActionError,
  })

  const form = useForm({
    defaultValues: { title: "" },
    validators: {
      onSubmit: CreateTodoSchema,
    },
    onSubmit: async ({ value }) => {
      await executeAsync({ title: value.title })
    },
  })

  const loading = isExecuting || form.state.isSubmitting

  return (
    <form
      className="flex flex-col gap-2"
      action={() => {
        void form.handleSubmit()
      }}
    >
      <form.Field name="title">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <div className="flex flex-col gap-2">
              <InputGroup>
                <label className="sr-only" htmlFor={field.name}>
                  New todo
                </label>
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  placeholder="What needs doing?"
                  aria-invalid={isInvalid}
                  disabled={loading}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    variant="brand"
                    size="sm"
                    isLoading={loading}
                  >
                    Add
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
            </div>
          )
        }}
      </form.Field>
    </form>
  )
}
