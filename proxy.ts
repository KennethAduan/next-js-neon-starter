import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROUTES } from "@/constants/app.routes"
import {
  buildLoginUrl,
  isAuthPath,
  isProtectedPath,
} from "@/features/auth/auth.routes"
import { verifyProxySession } from "@/features/auth/server/verify-proxy-session"
import { getSessionCookie } from "better-auth/cookies"

type ProxySession = Awaited<ReturnType<typeof verifyProxySession>>

function clearSessionCookie(response: NextResponse): NextResponse {
  // Better Auth manages cookie names; delete common session cookie keys.
  response.cookies.delete("better-auth.session_token")
  response.cookies.delete("__Secure-better-auth.session_token")
  return response
}

function redirectUnauthenticated(
  request: NextRequest,
  pathname: string,
  sessionCookie: string | undefined,
  session: ProxySession
): NextResponse | null {
  if (!isProtectedPath(pathname) || session.valid) {
    return null
  }

  const loginUrl = buildLoginUrl(request.url, {
    sessionExpired: Boolean(sessionCookie && session.reason === "expired"),
  })

  return clearSessionCookie(NextResponse.redirect(loginUrl))
}

function redirectAuthenticated(
  request: NextRequest,
  pathname: string,
  session: ProxySession
): NextResponse | null {
  if (!isAuthPath(pathname) || !session.valid) {
    return null
  }

  return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
}

function clearStaleCookie(
  sessionCookie: string | undefined,
  session: ProxySession
): NextResponse | null {
  if (!sessionCookie || session.valid) {
    return null
  }

  return clearSessionCookie(NextResponse.next())
}

function buildProxyResponse(
  request: NextRequest,
  pathname: string,
  sessionCookie: string | undefined,
  session: ProxySession
): NextResponse {
  const unauthenticatedRedirect = redirectUnauthenticated(
    request,
    pathname,
    sessionCookie,
    session
  )
  if (unauthenticatedRedirect) {
    return unauthenticatedRedirect
  }

  const authenticatedRedirect = redirectAuthenticated(
    request,
    pathname,
    session
  )
  if (authenticatedRedirect) {
    return authenticatedRedirect
  }

  const staleCookieResponse = clearStaleCookie(sessionCookie, session)
  if (staleCookieResponse) {
    return staleCookieResponse
  }

  return NextResponse.next()
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request) ?? undefined
  const session = await verifyProxySession(request)

  return buildProxyResponse(request, pathname, sessionCookie, session)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
