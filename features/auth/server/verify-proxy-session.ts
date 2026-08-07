import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"

type ProxySessionResult =
  | { valid: true }
  | { valid: false; reason: "missing" | "expired" }

/**
 * Optimistic proxy check only — cookie presence, not cryptographic validation.
 * Authoritative checks stay in getServerSession / authActionClient.
 */
export async function verifyProxySession(
  request: NextRequest
): Promise<ProxySessionResult> {
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    return { valid: false, reason: "missing" }
  }

  return { valid: true }
}
