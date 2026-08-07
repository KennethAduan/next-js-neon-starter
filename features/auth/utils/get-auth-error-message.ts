const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_EMAIL_OR_PASSWORD": "Invalid email or password.",
  "USER_NOT_FOUND": "Invalid email or password.",
  "INVALID_PASSWORD": "Invalid email or password.",
  "EMAIL_NOT_VERIFIED": "Please verify your email before signing in.",
  "USER_ALREADY_EXISTS": "An account with this email already exists.",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
    "An account with this email already exists.",
  "PASSWORD_TOO_SHORT": "Password is too weak. Use at least 8 characters.",
  "PASSWORD_TOO_LONG": "Password is too long.",
  "INVALID_TOKEN": "This reset link is invalid or has expired. Request a new one.",
  "TOO_MANY_REQUESTS":
    "Too many attempts. Please wait a few minutes and try again.",
}

const DEFAULT_AUTH_ERROR_MESSAGE = "Something went wrong. Please try again."

const DEFAULT_UNKNOWN_ERROR_MESSAGE =
  "An unknown error occurred. Please try again."

function extractErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null
  const record = error as {
    code?: unknown
    message?: unknown
    body?: { code?: unknown; message?: unknown }
  }
  if (typeof record.code === "string") return record.code
  if (typeof record.body?.code === "string") return record.body.code
  if (typeof record.message === "string") return record.message
  if (typeof record.body?.message === "string") return record.body.message
  return null
}

export function getAuthErrorMessage(error: unknown): string {
  const code = extractErrorCode(error)
  if (!code) return DEFAULT_UNKNOWN_ERROR_MESSAGE

  const normalized = code.replace(/^AUTH_/i, "").toUpperCase()
  return (
    AUTH_ERROR_MESSAGES[normalized] ??
    AUTH_ERROR_MESSAGES[code] ??
    (typeof code === "string" && !code.includes(" ")
      ? DEFAULT_AUTH_ERROR_MESSAGE
      : code) ??
    DEFAULT_AUTH_ERROR_MESSAGE
  )
}
