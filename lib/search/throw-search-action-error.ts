import { ActionError } from "@/lib/safe.action"

/** Map search failures to ActionError. */
export function throwSearchActionError(
  error: unknown,
  fallbackMessage: string
): never {
  if (error instanceof ActionError) {
    throw error
  }
  throw new ActionError(
    error instanceof Error ? error.message : fallbackMessage
  )
}
