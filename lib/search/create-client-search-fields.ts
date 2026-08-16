import type { ClientSearchFields } from "@/features/clients/schema/clients.schema"

export type ClientSearchInput = {
  fullName: string
  email?: string
  phone?: string
}

function optionalNormalized(
  value: string | undefined,
  normalize: (v: string) => string
): string | undefined {
  if (!value) return undefined
  const next = normalize(value)
  return next || undefined
}

export function createClientSearchFields(
  data: ClientSearchInput
): ClientSearchFields {
  const fullName = data.fullName.trim().toLowerCase()
  const email = optionalNormalized(data.email, (v) => v.trim().toLowerCase())
  const phone = optionalNormalized(data.phone, (v) => v.replace(/\D/g, ""))

  return {
    searchFullName: fullName,
    searchEmail: email,
    searchPhone: phone,
  }
}
