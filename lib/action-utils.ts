import { sileo } from "sileo"

export function onActionError({ error }: { error: { serverError?: string | null } }) {
  sileo.error({ title: error.serverError || "An unknown error occurred" })
}
