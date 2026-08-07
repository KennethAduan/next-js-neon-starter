# Sidebar

The sidebar is the primary navigation shell for authenticated pages under `app/(protected)`. It is built on [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) primitives and renders route-driven navigation, a collapsible icon mode, user account actions, and breadcrumbs in the top header.

## Where it is used

`AppSidebar` is mounted in the protected layout:

```tsx
// app/(protected)/layout.tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header>…<BreadcrumbSidebar />…</header>
  </SidebarInset>
</SidebarProvider>
```

Only routes inside `app/(protected)` use this shell. Auth pages (`/login`, `/forgot-password`) do not render the sidebar.

## File structure

| File | Role |
| --- | --- |
| `AppSidebar.tsx` | Root sidebar composition: header, nav, footer |
| `AppSidebarHeader.tsx` | Logo and app name; links to home |
| `AppSidebarFooter.tsx` | Reads auth state and renders `NavUser` |
| `NavUser.tsx` | User dropdown: Account, Security, Log out |
| `NavMain.tsx` | Renders grouped navigation from config |
| `NavMainMenuItem.tsx` | Single nav item; supports links and nested sub-menus |
| `sidebar-nav.config.ts` | **Source of truth for sidebar links** |
| `nav-main.utils.ts` | Active-state and collapsible open-state helpers |
| `is-route-active.ts` | Pathname matching for active nav items |
| `BreadcrumbSidebar.tsx` | Auto-generated breadcrumbs from the current path |
| `BreadcrumbLabelContext.tsx` | Optional dynamic labels for breadcrumb segments |

## Navigation config

All sidebar links are defined in `sidebar-nav.config.ts`. Each entry must use a route from `constants/app.routes.ts` — do not hardcode path strings.

```ts
export const sidebarNavGroups: NavMainGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: ROUTES.HOME,
        icon: IconLayoutGrid,
      },
    ],
  },
  // …
]
```

### Current nav groups

| Group | Items | Route constant |
| --- | --- | --- |
| Overview | Dashboard | `ROUTES.HOME` |
| Directory | Clients | `ROUTES.CLIENTS` |
| Operations | Investments, Payout schedules, Remittances, Contracts | `ROUTES.INVESTMENTS`, `ROUTES.PAYOUT_SCHEDULES`, `ROUTES.REMITTANCES`, `ROUTES.CONTRACTS` |
| Planning | Calendar, Reports | `ROUTES.CALENDAR`, `ROUTES.REPORTS` |
| Test UI *(dev only)* | Test UI | `ROUTES.TEST_UI` |

The **Test UI** group is appended only when `process.env.NODE_ENV === "development"`.

### Adding a new sidebar link

1. Add the path to `SIDEBAR_ROUTES` in `constants/app.routes.ts` and export it on `ROUTES`.
2. Create the page under `app/(protected)/…`.
3. Add an item to the appropriate group in `sidebar-nav.config.ts` with a [Tabler icon](https://tabler.io/icons).
4. If the route should require auth, add it to `PROTECTED_ROUTES` in `app.routes.ts`.

Account and Security are **not** in the main nav; they live in the user dropdown (`NavUser`) via `ROUTES.ACCOUNT` and `ROUTES.SECURITY`.

### Nested sub-menus

`NavMainItem` supports an optional `items` array for collapsible child links:

```ts
{
  title: "Clients",
  url: ROUTES.CLIENTS,
  icon: IconUsers,
  items: [
    { title: "All clients", url: ROUTES.CLIENTS },
    { title: "Archived", url: `${ROUTES.CLIENTS}/archived` },
  ],
}
```

When `items` is present, the parent becomes a collapsible trigger instead of a direct link. Sub-items are rendered as `SidebarMenuSubButton` links.

## Active route detection

`isRouteActive(pathname, href)` marks a nav item active when:

- `href` is `/` and `pathname === "/"`
- `pathname === href` or `pathname` starts with `` `${href}/` ``

This means `/clients/abc` highlights the **Clients** item linked to `/clients`.

`withActiveGroups()` in `nav-main.utils.ts` applies this to every item and sub-item before render. You can override detection per item by setting `isActive: true | false` on the config entry.

## Collapsible open state

For items with children, `resolveOpenByUrl()` keeps a sub-menu open when:

- The parent item is active, or
- Any child item is active, or
- The user manually toggled it open (`openByUrl` state in `NavMain`)

Otherwise the menu stays closed.

## Sidebar behavior

- **Collapsible mode:** `collapsible="icon"` on `AppSidebar` — the sidebar shrinks to icons and shows tooltips on hover.
- **Mobile:** shadcn `useSidebar()` in `NavUser` positions the user dropdown below the trigger on mobile.
- **Header trigger:** `SidebarTrigger` in the protected layout toggles collapse/expand.

## User footer

`AppSidebarFooter` reads the signed-in user from `userAuthAtom` (Jotai) and maps it to the shape expected by `NavUser`:

- `name` — `firstName` + `lastName`
- `email`
- `avatar` — `photoURL`, with a default fallback

The dropdown links to Account and Security pages and opens `LogoutDialog` for sign-out.

## Breadcrumbs

`BreadcrumbSidebar` builds crumbs from the current `pathname` segments.

**Label resolution order** (first match wins):

1. `ROUTE_LABEL_MAP` — static overrides (e.g. `/` → `"Home"`)
2. Dynamic labels from `BreadcrumbLabelContext` (keyed by URL segment)
3. UUID segments → `"…"`
4. Fallback — kebab-case segment formatted as title case (`payout-schedules` → `Payout Schedules`)

### Dynamic breadcrumb labels

For detail pages where the segment is an ID, register a human-readable label:

```tsx
import { BreadcrumbLabelSync } from "@/features/sidebar/BreadcrumbLabelContext"

// Inside a page component (requires BreadcrumbLabelProvider ancestor)
<BreadcrumbLabelSync segment={clientId} label={client.name} />
```

Wrap the protected layout (or app) with `BreadcrumbLabelProvider` if you use `BreadcrumbLabelSync` or `useBreadcrumbLabels`. Without the provider, dynamic labels are no-ops and crumbs fall back to formatted segment names.

## Types

Exported from `NavMain.tsx`:

```ts
type NavMainItem = {
  title: string
  url: string
  icon?: TablerIcon
  isActive?: boolean
  items?: { title: string; url: string; isActive?: boolean }[]
}

type NavMainGroup = {
  label: string
  items: NavMainItem[]
}
```

## Related constants

Sidebar-visible routes are grouped under `SIDEBAR_ROUTES` in `constants/app.routes.ts`. Keep sidebar config and route constants in sync — invalid `ROUTES.*` references will fail TypeScript checks.
