# Authentication Feature Documentation

## Overview

Better Auth email/password with Prisma (Neon) session storage. Proxy does optimistic cookie presence check. Protected layout and `authActionClient` do authoritative session validation.

## File Structure

```
proxy.ts
features/auth/
├── auth.routes.ts
├── auth.docs.md
├── actions/
│   ├── login.action.ts
│   └── account.action.ts
├── atom/User.auth.atom.ts
├── client/auth-client.ts
├── components/
├── hooks/
├── pages/
└── server/
    ├── auth.ts                 # betterAuth config
    ├── session.server.ts       # getServerSession / deleteServerSession
    └── verify-proxy-session.ts # cookie presence for proxy
app/api/auth/[...all]/route.ts  # Better Auth handler
```

## Flows

### Login

1. `useLoginForm` submits email/password to `LoginAction`.
2. `LoginAction` calls `auth.api.signInEmail` (sets cookies via `nextCookies`).
3. Loads user profile from Prisma and returns to client atom.

### Logout

1. `LogoutDialog` calls `authClient.signOut` + `LogoutAction`.
2. Clears jotai atom and redirects.

### Password change

1. `changePasswordAction` uses `auth.api.changePassword` with `revokeOtherSessions`.
2. Signs out and forces re-login.

## Defense in depth

- Proxy: cookie presence only (`getSessionCookie`).
- Layout / DAL: `auth.api.getSession`.
- Mutations: `authActionClient` middleware.
