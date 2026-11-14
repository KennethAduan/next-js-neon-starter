export const BASE_ROUTE = "/"

const HIDDEN_ROUTES = {
  REGISTER_ADMIN: "/register-admin",
}

const AUTH_ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  ACCOUNT: "/account",
  SECURITY: "/security",
}

const SIDEBAR_ROUTES = {
  HOME: BASE_ROUTE,
}

export const ROUTES = {
  HOME: BASE_ROUTE,
  LOGIN: AUTH_ROUTES.LOGIN,
  FORGOT_PASSWORD: AUTH_ROUTES.FORGOT_PASSWORD,
  ACCOUNT: AUTH_ROUTES.ACCOUNT,
  SECURITY: AUTH_ROUTES.SECURITY,
  REGISTER_ADMIN: HIDDEN_ROUTES.REGISTER_ADMIN,
}

/** Routes under `app/(protected)` — require a valid session in proxy/layout. */
export const PROTECTED_ROUTES = [
  ROUTES.HOME,
  ROUTES.ACCOUNT,
  ROUTES.SECURITY,
] as const

/** Public auth pages — redirect to home when already authenticated. */
export const PUBLIC_AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.FORGOT_PASSWORD,
] as const
