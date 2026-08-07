import {
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
  ROUTES,
} from "@/constants/app.routes"

/** Legacy name kept for docs; proxy uses better-auth getSessionCookie. */
export const SESSION_COOKIE_NAME = "better-auth.session_token"

export const SESSION_EXPIRED_REASON = "session_expired"
export const SESSION_EXPIRED_QUERY_PARAM = "reason"

function matchesRoute(pathname: string, route: string): boolean {
  if (route === ROUTES.HOME) {
    return pathname === "/"
  }

  return pathname === route || pathname.startsWith(`${route}/`)
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => matchesRoute(pathname, route))
}

export function isAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.some((route) => matchesRoute(pathname, route))
}

export function buildLoginUrl(
  baseUrl: string,
  options?: { sessionExpired?: boolean }
): URL {
  const loginUrl = new URL(ROUTES.LOGIN, baseUrl)

  if (options?.sessionExpired) {
    loginUrl.searchParams.set(
      SESSION_EXPIRED_QUERY_PARAM,
      SESSION_EXPIRED_REASON
    )
  }

  return loginUrl
}
