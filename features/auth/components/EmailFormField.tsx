import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type EmailFormFieldProps = {
  name: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
}

export function EmailFormField({
  name,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
}: EmailFormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>Email</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          name={name}
          value={value}
          onBlur={onBlur}
          placeholder="john@example.com"
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={isInvalid}
        />
      </FieldContent>
      <FieldError errors={errors} />
    </Field>
  )
}
